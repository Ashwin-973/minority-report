// shared/types/ClaimModel.js
// Plain JS object schema — acts as documentation + default factory

export const createClaimModel = (overrides = {}) => ({
  id: null,
  workerId: null,
  workerName: "Unknown Worker",
  submittedAt: new Date().toISOString(),

  // Telemetry snapshot at time of claim
  telemetry: {
    lat: 0,
    lng: 0,
    previousLat: null,
    previousLng: null,
    previousTimestamp: null,
    motionScore: 1.0,       // 0.0 (stationary) → 1.0 (high motion)
    connectivityType: "4G", // "WiFi" | "4G" | "3G" | "2G" | "offline"
    networkFingerprint: null,
    deviceId: null,
  },

  // Incident context
  incident: {
    weatherSeverity: 0,     // 0–5 per WEATHER_SEVERITY_LEVELS
    claimedSeverity: 0,     // what the worker reports
    incidentType: "RAIN_DAMAGE", // e.g. "RAIN_DAMAGE" | "ACCIDENT" | "THEFT"
    description: "",
    zoneId: null,
  },

  // Risk Engine output
  riskResult: {
    riskScore: 0,
    fraudSignals: [],
    claimStatus: "PENDING",
    signalBreakdown: {},
    processedAt: null,
  },

  ...overrides,
});