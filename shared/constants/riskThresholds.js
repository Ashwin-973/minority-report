// shared/constants/riskThresholds.js

export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 80,
};

export const CLAIM_STATUS = {
  APPROVED: "APPROVED",
  FLAGGED: "FLAGGED",
  MANUAL_REVIEW: "MANUAL_REVIEW",
};

export const SIGNAL_WEIGHTS = {
  GPS_SPOOF: 0.30,
  MOTION_CONSISTENCY: 0.20,
  WEATHER_CORRELATION: 0.20,
  PEER_CLUSTER: 0.20,
  NETWORK_SIGNATURE: 0.10,
};

export const CLUSTER_RADIUS_METERS = 50;
export const CLUSTER_MIN_CLAIMS = 3;

export const TELEPORT_THRESHOLD_KMH = 200;
export const MOTION_MISMATCH_THRESHOLD = 0.25;

export const WEATHER_SEVERITY_LEVELS = {
  CLEAR: 0,
  LIGHT_RAIN: 1,
  MODERATE_RAIN: 2,
  HEAVY_RAIN: 3,
  STORM: 4,
  CYCLONE: 5,
};

// ── Parametric Trigger Types ────────────────────────────────────────
export const PARAMETRIC_TRIGGERS = {
  EXTREME_HEAT: "EXTREME_HEAT",
  HEAVY_RAIN: "HEAVY_RAIN",
  FLOOD: "FLOOD",
  HIGH_AQI: "HIGH_AQI",
  CURFEW: "CURFEW",
  STRIKE: "STRIKE",
  ZONE_CLOSURE: "ZONE_CLOSURE",
  APP_OUTAGE: "APP_OUTAGE",
};

// Thresholds that auto-trigger claims (objective, externally verifiable)
export const TRIGGER_THRESHOLDS = {
  EXTREME_HEAT: { tempCelsius: 42 },
  HEAVY_RAIN: { rainMmPerHr: 50 },
  FLOOD: { rainMmPerHr: 80, windSpeedKmh: 60 },
  HIGH_AQI: { aqi: 300 },
  CURFEW: { active: true },   // manually triggered / API
  STRIKE: { active: true },
  ZONE_CLOSURE: { active: true },
  APP_OUTAGE: { active: true },
};

export const TRIGGER_LABELS = {
  EXTREME_HEAT: "Extreme Heat (≥42°C)",
  HEAVY_RAIN: "Heavy Rainfall (≥50mm/hr)",
  FLOOD: "Flood Conditions",
  HIGH_AQI: "Severe Air Pollution (AQI ≥300)",
  CURFEW: "Unplanned Curfew",
  STRIKE: "Local Strike",
  ZONE_CLOSURE: "Zone/Market Closure",
  APP_OUTAGE: "Delivery App Outage",
};

// ── Income Loss Incident Types ──────────────────────────────────────
export const INCIDENT_TYPES = {
  HEAT_INCOME_LOSS: "HEAT_INCOME_LOSS",
  RAIN_INCOME_LOSS: "RAIN_INCOME_LOSS",
  FLOOD_INCOME_LOSS: "FLOOD_INCOME_LOSS",
  AQI_INCOME_LOSS: "AQI_INCOME_LOSS",
  CURFEW_INCOME_LOSS: "CURFEW_INCOME_LOSS",
  STRIKE_INCOME_LOSS: "STRIKE_INCOME_LOSS",
  CLOSURE_INCOME_LOSS: "CLOSURE_INCOME_LOSS",
  OUTAGE_INCOME_LOSS: "OUTAGE_INCOME_LOSS",
  // Legacy types kept for backward compat
  RAIN_DAMAGE: "RAIN_DAMAGE",
  ACCIDENT: "ACCIDENT",
  THEFT: "THEFT",
  FLOOD_DAMAGE: "FLOOD_DAMAGE",
};

// Maps triggers to their income-loss incident type
export const TRIGGER_TO_INCIDENT = {
  EXTREME_HEAT: "HEAT_INCOME_LOSS",
  HEAVY_RAIN: "RAIN_INCOME_LOSS",
  FLOOD: "FLOOD_INCOME_LOSS",
  HIGH_AQI: "AQI_INCOME_LOSS",
  CURFEW: "CURFEW_INCOME_LOSS",
  STRIKE: "STRIKE_INCOME_LOSS",
  ZONE_CLOSURE: "CLOSURE_INCOME_LOSS",
  APP_OUTAGE: "OUTAGE_INCOME_LOSS",
};

// ── Premium Calculation Constants ───────────────────────────────────
export const PREMIUM_CONSTANTS = {
  BASE_RATE: 0.03,                  // 3% of weekly earnings
  MIN_PREMIUM_INR: 29,
  MAX_PREMIUM_INR: 499,
  COVERAGE_REPLACEMENT_RATIO: 0.80, // 80% wage replacement
  ZONE_MULTIPLIER_RANGE: [0.8, 1.5],
  HOURS_MULTIPLIER_RANGE: [0.9, 1.3],
  CITY_DISRUPTION_RANGE: [0.9, 1.4],
  WEATHER_FORECAST_RANGE: [0.85, 1.6],
};

// ── Payout Constants ────────────────────────────────────────────────
export const PAYOUT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

export const POLICY_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  PENDING: "PENDING",
};