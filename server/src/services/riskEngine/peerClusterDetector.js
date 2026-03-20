// server/src/services/riskEngine/peerClusterDetector.js

import { haversineDistanceMeters } from "../../utils/distanceCalc.js";
import { addNoise } from "../../utils/randomSignalNoise.js";
import {
  CLUSTER_RADIUS_METERS,
  CLUSTER_MIN_CLAIMS,
} from "../../../../shared/constants/riskThresholds.js";

const SIGNAL = "PEER_CLUSTER_ATTACK";
const NET_SIGNAL = "NETWORK_CLUSTER";

/**
 * Peer Cluster Detector
 * Finds coordinated fraud rings: many claims from the same tight radius
 * Also checks for shared network fingerprints (same WiFi hub / VPN)
 *
 * Returns: { score: 0–100, signals: string[], clusterSize: number }
 */
export const detectPeerCluster = (currentClaim, recentClaims) => {
  let score = 0;
  const signals = [];

  const { lat, lng, networkFingerprint } = currentClaim.telemetry;

  // ── Spatial cluster check ─────────────────────────────────────────
  const nearbyCount = recentClaims.filter((c) => {
    if (c.id === currentClaim.id) return false;
    if (!c.telemetry?.lat || !c.telemetry?.lng) return false;
    const dist = haversineDistanceMeters(lat, lng, c.telemetry.lat, c.telemetry.lng);
    return dist <= CLUSTER_RADIUS_METERS;
  }).length;

  if (nearbyCount >= CLUSTER_MIN_CLAIMS) {
    // Scale: 3 claims → 70, 5+ claims → 95
    const clusterScore = Math.min(95, 70 + (nearbyCount - CLUSTER_MIN_CLAIMS) * 8);
    score = Math.max(score, clusterScore);
    signals.push(SIGNAL);
  }

  // ── Network fingerprint cluster check ─────────────────────────────
  if (networkFingerprint) {
    const sameNetworkCount = recentClaims.filter(
      (c) =>
        c.id !== currentClaim.id &&
        c.telemetry?.networkFingerprint === networkFingerprint
    ).length;

    if (sameNetworkCount >= 2) {
      const netScore = Math.min(90, 55 + sameNetworkCount * 10);
      score = Math.max(score, netScore);
      signals.push(NET_SIGNAL);
    }
  }

  return {
    score: addNoise(score, 3),
    signals,
    clusterSize: nearbyCount + 1, // include current
  };
};

/**
 * Build cluster groups from all claims — for admin cluster view
 */
export const buildClusterGroups = (claims) => {
  const visited = new Set();
  const clusters = [];

  for (const claim of claims) {
    if (visited.has(claim.id)) continue;
    if (!claim.telemetry?.lat) continue;

    const group = [claim];
    visited.add(claim.id);

    for (const other of claims) {
      if (visited.has(other.id)) continue;
      if (!other.telemetry?.lat) continue;

      const dist = haversineDistanceMeters(
        claim.telemetry.lat,
        claim.telemetry.lng,
        other.telemetry.lat,
        other.telemetry.lng
      );

      if (dist <= CLUSTER_RADIUS_METERS) {
        group.push(other);
        visited.add(other.id);
      }
    }

    if (group.length >= CLUSTER_MIN_CLAIMS) {
      const totalRisk = group.reduce((s, c) => s + (c.riskResult?.riskScore || 0), 0);
      clusters.push({
        id: `cluster_${claim.id.slice(0, 8)}`,
        centerLat: claim.telemetry.lat,
        centerLng: claim.telemetry.lng,
        claimCount: group.length,
        avgRiskScore: Math.round(totalRisk / group.length),
        workerIds: group.map((c) => c.workerId),
        claimIds: group.map((c) => c.id),
        detectedAt: new Date().toISOString(),
        threatLevel: group.length >= 5 ? "CRITICAL" : group.length >= 3 ? "HIGH" : "MEDIUM",
        sharedNetwork: group[0].telemetry?.networkFingerprint || null,
      });
    }
  }

  return clusters;
};