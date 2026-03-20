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

export const TELEPORT_THRESHOLD_KMH = 200; // impossible speed = spoofing
export const MOTION_MISMATCH_THRESHOLD = 0.25; // low motion score while moving

export const WEATHER_SEVERITY_LEVELS = {
  CLEAR: 0,
  LIGHT_RAIN: 1,
  MODERATE_RAIN: 2,
  HEAVY_RAIN: 3,
  STORM: 4,
  CYCLONE: 5,
};