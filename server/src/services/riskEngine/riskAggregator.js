// server/src/services/riskEngine/riskAggregator.js

import { detectGpsSpoof } from "./gpsSpoofDetector.js";
import { detectMotionInconsistency } from "./motionConsistency.js";
import { detectWeatherMismatch } from "./weatherCorrelation.js";
import { detectPeerCluster } from "./peerClusterDetector.js";
import { addNoise, modelConfidence } from "../../utils/randomSignalNoise.js";
import {
  RISK_THRESHOLDS,
  CLAIM_STATUS,
  SIGNAL_WEIGHTS,
} from "../../../../shared/constants/riskThresholds.js";

/**
 * Master Risk Aggregator
 * Runs all signal detectors, applies weighted scoring, determines claim status
 *
 * @param {object} claim - incoming claim object
 * @param {object[]} recentClaims - recent claims from store (last 60 min)
 * @param {object[]} allClaims - all claims for repeat-location checks
 * @returns {object} riskResult
 */
export const aggregateRisk = async (claim, recentClaims = [], allClaims = []) => {
  const { telemetry, incident } = claim;

  // ── Run all signal detectors in parallel ─────────────────────────
  const [gpsResult, motionResult, weatherResult, clusterResult] =
    await Promise.all([
      Promise.resolve(detectGpsSpoof(telemetry, allClaims)),
      Promise.resolve(detectMotionInconsistency(telemetry)),
      Promise.resolve(detectWeatherMismatch(incident, telemetry)),
      Promise.resolve(detectPeerCluster(claim, recentClaims)),
    ]);

  // ── Network signature — embedded in cluster detector ─────────────
  // (network cluster signals already come from peerClusterDetector)

  // ── Weighted aggregation ──────────────────────────────────────────
  const rawWeighted =
    gpsResult.score * SIGNAL_WEIGHTS.GPS_SPOOF +
    motionResult.score * SIGNAL_WEIGHTS.MOTION_CONSISTENCY +
    weatherResult.score * SIGNAL_WEIGHTS.WEATHER_CORRELATION +
    clusterResult.score * SIGNAL_WEIGHTS.PEER_CLUSTER +
    // network signature score — approximate from cluster net signal strength
    (clusterResult.signals.includes("NETWORK_CLUSTER") ? 80 : 10) *
      SIGNAL_WEIGHTS.NETWORK_SIGNATURE;

  // Final score with small realistic noise
  const riskScore = Math.min(100, Math.max(0, Math.round(addNoise(rawWeighted, 2))));

  // ── Collect all signals ───────────────────────────────────────────
  const fraudSignals = [
    ...new Set([
      ...gpsResult.signals,
      ...motionResult.signals,
      ...weatherResult.signals,
      ...clusterResult.signals,
    ]),
  ];

  // ── Determine claim status ────────────────────────────────────────
  let claimStatus;
  if (riskScore >= RISK_THRESHOLDS.HIGH) {
    claimStatus = CLAIM_STATUS.FLAGGED;
  } else if (riskScore >= RISK_THRESHOLDS.LOW) {
    claimStatus = CLAIM_STATUS.MANUAL_REVIEW;
  } else {
    claimStatus = CLAIM_STATUS.APPROVED;
  }

  // Override: cluster attack always flags
  if (fraudSignals.includes("PEER_CLUSTER_ATTACK")) {
    claimStatus = CLAIM_STATUS.FLAGGED;
  }

  return {
    riskScore,
    fraudSignals,
    claimStatus,
    signalBreakdown: {
      GPS_SPOOF: gpsResult.score,
      MOTION_CONSISTENCY: motionResult.score,
      WEATHER_CORRELATION: weatherResult.score,
      PEER_CLUSTER: clusterResult.score,
      NETWORK_SIGNATURE: clusterResult.signals.includes("NETWORK_CLUSTER") ? 80 : 10,
    },
    clusterSize: clusterResult.clusterSize,
    weatherMeta: weatherResult.meta || null,
    modelConfidence: modelConfidence(),
    processedAt: new Date().toISOString(),
  };
};