// server/src/utils/randomSignalNoise.js
// Adds realistic noise to signal scores so decisions look like ML inference

/**
 * Add Gaussian-like noise to a score, clamped to [0, 100]
 */
export const addNoise = (score, maxNoise = 5) => {
  const noise = (Math.random() - 0.5) * 2 * maxNoise;
  return Math.min(100, Math.max(0, Math.round(score + noise)));
};

/**
 * Simulate sensor jitter on GPS coordinates
 */
export const addGpsJitter = (lat, lng, maxMeters = 10) => {
  const degPerMeter = 1 / 111320;
  const jitter = maxMeters * degPerMeter;
  return {
    lat: lat + (Math.random() - 0.5) * 2 * jitter,
    lng: lng + (Math.random() - 0.5) * 2 * jitter,
  };
};

/**
 * Simulate motion sensor noise (accelerometer variance)
 */
export const simulateMotionNoise = (baseMotionScore) => {
  const noise = (Math.random() - 0.5) * 0.1;
  return Math.min(1.0, Math.max(0.0, baseMotionScore + noise));
};

/**
 * Returns a plausible looking confidence factor (0.85–0.99) for display
 */
export const modelConfidence = () =>
  parseFloat((0.85 + Math.random() * 0.14).toFixed(3));

/**
 * Tiny time variance to make processing times look real
 */
export const processingLatencyMs = () =>
  Math.floor(80 + Math.random() * 220);