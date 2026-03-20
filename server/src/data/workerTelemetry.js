// server/src/data/workerTelemetry.js
// Simulates live telemetry feed for workers

const telemetryHistory = {
  W001: [
    { lat: 13.0500, lng: 80.2350, ts: Date.now() - 120 * 60000, motionScore: 0.75 },
    { lat: 13.0520, lng: 80.2380, ts: Date.now() - 60 * 60000,  motionScore: 0.80 },
    { lat: 13.0545, lng: 80.2410, ts: Date.now() - 30 * 60000,  motionScore: 0.78 },
    { lat: 13.0569, lng: 80.2425, ts: Date.now() - 5 * 60000,   motionScore: 0.82 },
  ],
  W002: [
    { lat: 12.9716, lng: 77.5946, ts: Date.now() - 30 * 60000,  motionScore: 0.10 },
    { lat: 13.0827, lng: 80.2707, ts: Date.now() - 18 * 60000,  motionScore: 0.12 }, // teleport
  ],
  W008: [
    { lat: 13.0800, lng: 80.2700, ts: Date.now() - 60 * 60000,  motionScore: 0.60 },
    { lat: 13.0830, lng: 80.2730, ts: Date.now() - 30 * 60000,  motionScore: 0.50 },
    { lat: 13.0850, lng: 80.2740, ts: Date.now() - 15 * 60000,  motionScore: 0.45 },
    { lat: 13.0900, lng: 80.2785, ts: Date.now() - 2 * 60000,   motionScore: 0.45 },
  ],
};

export const getTelemetryHistory = (workerId) =>
  telemetryHistory[workerId] || [];

export const getLastTelemetry = (workerId) => {
  const history = telemetryHistory[workerId];
  if (!history || history.length === 0) return null;
  return history[history.length - 1];
};

export const addTelemetryPoint = (workerId, point) => {
  if (!telemetryHistory[workerId]) {
    telemetryHistory[workerId] = [];
  }
  telemetryHistory[workerId].push({ ...point, ts: Date.now() });
};

export const getAllWorkerIds = () => Object.keys(telemetryHistory);