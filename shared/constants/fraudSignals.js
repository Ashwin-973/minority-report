// shared/constants/fraudSignals.js

export const FRAUD_SIGNALS = {
  GPS_TELEPORT: "GPS_TELEPORT",
  GPS_STATIC_SPOOF: "GPS_STATIC_SPOOF",
  MOTION_MISMATCH: "MOTION_MISMATCH",
  WEATHER_MISMATCH: "WEATHER_MISMATCH",
  PEER_CLUSTER_ATTACK: "PEER_CLUSTER_ATTACK",
  NETWORK_CLUSTER: "NETWORK_CLUSTER",
  REPEATED_LOCATION: "REPEATED_LOCATION",
  IMPOSSIBLE_ROUTE: "IMPOSSIBLE_ROUTE",
};

export const SIGNAL_DESCRIPTIONS = {
  GPS_TELEPORT: "Device location jumped impossibly fast — possible GPS spoofing app detected.",
  GPS_STATIC_SPOOF: "GPS coordinates suspiciously static despite reported movement.",
  MOTION_MISMATCH: "Accelerometer data inconsistent with reported GPS movement.",
  WEATHER_MISMATCH: "Claimed weather severity does not match zone historical records.",
  PEER_CLUSTER_ATTACK: "Multiple claims originating from within 50m radius — coordinated fraud ring suspected.",
  NETWORK_CLUSTER: "Multiple devices sharing identical network fingerprint.",
  REPEATED_LOCATION: "Same GPS coordinates submitted in previous fraudulent claims.",
  IMPOSSIBLE_ROUTE: "Claimed delivery route geometrically impossible given timestamps.",
};