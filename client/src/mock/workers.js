export const WORKERS = [
  { id: "W001", name: "Arjun Mehta", lat: 13.0569, lng: 80.2425, motionScore: 0.82, connectivity: "4G" },
  { id: "W002", name: "Ravi Kumar", lat: 13.0827, lng: 80.2707, motionScore: 0.12, connectivity: "WiFi" },
  { id: "W008", name: "Priya Nair", lat: 13.0900, lng: 80.2785, motionScore: 0.45, connectivity: "3G" },
  { id: "W009", name: "Karan Sharma", lat: 13.1100, lng: 80.2600, motionScore: 0.70, connectivity: "4G" },
];

export const CONNECTIVITY_TYPES = ["4G", "3G", "WiFi", "2G"];

export const MOTION_STATES = {
  HIGH: { label: "HIGH MOTION", min: 0.7, color: "signal-green" },
  MEDIUM: { label: "MODERATE", min: 0.3, color: "signal-yellow" },
  LOW: { label: "STATIONARY", min: 0, color: "signal-red" },
};

export const getMotionState = (score) => {
  if (score >= 0.7) return MOTION_STATES.HIGH;
  if (score >= 0.3) return MOTION_STATES.MEDIUM;
  return MOTION_STATES.LOW;
};