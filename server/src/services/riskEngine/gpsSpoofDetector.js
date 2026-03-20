// server/src/services/riskEngine/gpsSpoofDetector.js

import { calcSpeedKmh, haversineDistanceMeters } from "../../utils/distanceCalc.js";
import { addNoise } from "../../utils/randomSignalNoise.js";
import { TELEPORT_THRESHOLD_KMH } from "../../../../shared/constants/riskThresholds.js";

const FRAUD_SIGNALS_LOCAL = {
  GPS_TELEPORT: "GPS_TELEPORT",
  GPS_STATIC_SPOOF: "GPS_STATIC_SPOOF",
  REPEATED_LOCATION: "REPEATED_LOCATION",
  IMPOSSIBLE_ROUTE: "IMPOSSIBLE_ROUTE",
};

/**
 * GPS Spoof Detector
 * Analyses movement speed, static coords, and known spoofed location fingerprints
 *
 * Returns: { score: 0–100, signals: string[] }
 */
export const detectGpsSpoof = (telemetry, pastClaims = []) => {
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

  // ── 1. Teleport check ─────────────────────────────────────────────
  if (previousLat != null && previousLng != null && previousTimestamp) {
    const timeDiffMs = Date.now() - new Date(previousTimestamp).getTime();
    const speedKmh = calcSpeedKmh(previousLat, previousLng, lat, lng, timeDiffMs);

    if (speedKmh > TELEPORT_THRESHOLD_KMH) {
      // Scale: 200 km/h → 60pts, 500 km/h → 95pts
      const teleportScore = Math.min(95, 60 + ((speedKmh - 200) / 300) * 35);
      score = Math.max(score, teleportScore);
      signals.push(FRAUD_SIGNALS_LOCAL.GPS_TELEPORT);
    }
  }

  // ── 2. Static GPS while claiming movement ────────────────────────
  if (previousLat != null && previousLng != null) {
    const distMeters = haversineDistanceMeters(previousLat, previousLng, lat, lng);
    // GPS hasn't moved but motion sensor shows moderate movement → suspicious
    if (distMeters < 5 && motionScore > 0.6) {
      score = Math.max(score, 65);
      signals.push(FRAUD_SIGNALS_LOCAL.GPS_STATIC_SPOOF);
    }
  }

  // ── 3. Repeated location check against past flagged claims ────────
  const flaggedLocations = pastClaims
    .filter((c) => c.riskResult?.claimStatus === "FLAGGED")
    .map((c) => ({ lat: c.telemetry?.lat, lng: c.telemetry?.lng }));

  for (const fl of flaggedLocations) {
    if (!fl.lat || !fl.lng) continue;
    const dist = haversineDistanceMeters(lat, lng, fl.lat, fl.lng);
    if (dist < 20) {
      score = Math.max(score, 70);
      signals.push(FRAUD_SIGNALS_LOCAL.REPEATED_LOCATION);
      break;
    }
  }

  return {
    score: addNoise(score, 4),
    signals,
  };
};