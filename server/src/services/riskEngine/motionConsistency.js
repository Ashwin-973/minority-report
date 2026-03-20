// server/src/services/riskEngine/motionConsistency.js

import { haversineDistanceMeters } from "../../utils/distanceCalc.js";
import { addNoise } from "../../utils/randomSignalNoise.js";
import { MOTION_MISMATCH_THRESHOLD } from "../../../../shared/constants/riskThresholds.js";

const SIGNAL = "MOTION_MISMATCH";

/**
 * Motion Consistency Detector
 * Cross-checks accelerometer/gyro motion score vs GPS displacement
 * A GPS spoofing app moves coordinates but can't fake real device motion
 *
 * Returns: { score: 0–100, signals: string[] }
 */
export const detectMotionInconsistency = (telemetry) => {
  let score = 0;
  const signals = [];

  const {
    lat,
    lng,
    previousLat,
    previousLng,
    previousTimestamp,
    motionScore,
  } = telemetry;

  if (previousLat == null || previousLng == null || !previousTimestamp) {
    // No previous point — can't evaluate, assign small baseline risk
    return { score: addNoise(5, 3), signals: [] };
  }

  const timeDiffMs = Date.now() - new Date(previousTimestamp).getTime();
  const distMeters = haversineDistanceMeters(previousLat, previousLng, lat, lng);
  const expectedMotion = distMeters > 100 ? 0.5 : distMeters > 20 ? 0.25 : 0.1;

  // ── Primary check: moved far but device barely moved ─────────────
  if (distMeters > 100 && motionScore < MOTION_MISMATCH_THRESHOLD) {
    // Strong mismatch: GPS shows movement, accelerometer says stationary
    const mismatchRatio = expectedMotion / Math.max(motionScore, 0.01);
    const rawScore = Math.min(95, 50 + mismatchRatio * 15);
    score = Math.max(score, rawScore);
    signals.push(SIGNAL);
  }

  // ── Secondary: extremely low motion score during claimed incident ─
  if (motionScore < 0.08) {
    score = Math.max(score, 60);
    if (!signals.includes(SIGNAL)) signals.push(SIGNAL);
  }

  // ── Tertiary: time window too short for claimed displacement ──────
  if (distMeters > 500 && timeDiffMs < 2 * 60 * 1000) {
    // Physically possible only by vehicle but suspicious in delivery context
    score = Math.max(score, 45);
  }

  return {
    score: addNoise(score, 5),
    signals,
  };
};