// server/src/services/riskEngine/weatherCorrelation.js

import { getZoneWeather, getZoneForCoords } from "../../data/weatherHistory.js";
import { addNoise } from "../../utils/randomSignalNoise.js";

const SIGNAL = "WEATHER_MISMATCH";

/**
 * Weather Correlation Detector
 * Compares claimed weather severity against verified zone historical data
 * A severity claim of 5 (CYCLONE) when the zone only had severity 2 is fraud
 *
 * Returns: { score: 0–100, signals: string[] }
 */
export const detectWeatherMismatch = (incident, telemetry) => {
  let score = 0;
  const signals = [];

  const { claimedSeverity, zoneId } = incident;
  const { lat, lng } = telemetry;

  // Resolve zone: use explicit zoneId or fall back to coord-based lookup
  let zoneData = zoneId ? getZoneWeather(zoneId) : null;
  if (!zoneData && lat && lng) {
    const nearestZone = getZoneForCoords(lat, lng);
    zoneData = nearestZone || null;
  }

  if (!zoneData) {
    // Unknown zone — moderate suspicion
    return { score: addNoise(30, 5), signals: [] };
  }

  const actualSeverity = zoneData.currentSeverity;
  const maxSeverity = zoneData.maxSeverityLast24h;
  const severityGap = claimedSeverity - maxSeverity;

  // ── Core mismatch scoring ─────────────────────────────────────────
  if (severityGap <= 0) {
    // Claim is consistent with or below actual weather — legitimate
    score = Math.max(0, severityGap * -5); // slight bonus for under-claiming
  } else if (severityGap === 1) {
    score = 25; // minor exaggeration, could be microclimate
  } else if (severityGap === 2) {
    score = 55; // significant exaggeration
    signals.push(SIGNAL);
  } else if (severityGap === 3) {
    score = 78; // major fabrication
    signals.push(SIGNAL);
  } else {
    // severityGap >= 4: claiming cyclone when it was clear
    score = 92;
    signals.push(SIGNAL);
  }

  return {
    score: addNoise(score, 4),
    signals,
    meta: {
      claimedSeverity,
      actualSeverity,
      maxSeverity,
      zone: zoneData.label || zoneId,
    },
  };
};