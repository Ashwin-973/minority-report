// server/src/data/seedClaims.js
import { v4 as uuidv4 } from "uuid";

// Cluster attack coordinates — Chennai, India
const CLUSTER_LAT = 13.0827;
const CLUSTER_LNG = 80.2707;

const jitter = (val, range = 0.0002) =>
  val + (Math.random() - 0.5) * range;

export const seedDemoClaims = (claimsArray) => {
  const now = Date.now();

  // ── Legitimate claim ──────────────────────────────────────────────
  claimsArray.push({
    id: uuidv4(),
    workerId: "W001",
    workerName: "Arjun Mehta",
    submittedAt: new Date(now - 25 * 60000).toISOString(),
    telemetry: {
      lat: 13.0569,
      lng: 80.2425,
      previousLat: 13.0520,
      previousLng: 80.2380,
      previousTimestamp: new Date(now - 40 * 60000).toISOString(),
      motionScore: 0.82,
      connectivityType: "4G",
      networkFingerprint: "fp_a1b2c3",
      deviceId: "dev_arjun_01",
    },
    incident: {
      weatherSeverity: 3,
      claimedSeverity: 3,
      incidentType: "RAIN_DAMAGE",
      description: "Package damaged due to heavy rain during delivery.",
      zoneId: "ZONE_SOUTH_CHENNAI",
    },
    riskResult: {
      riskScore: 18,
      fraudSignals: [],
      claimStatus: "APPROVED",
      signalBreakdown: {
        GPS_SPOOF: 5,
        MOTION_CONSISTENCY: 3,
        WEATHER_CORRELATION: 5,
        PEER_CLUSTER: 0,
        NETWORK_SIGNATURE: 5,
      },
      processedAt: new Date(now - 24 * 60000).toISOString(),
    },
  });

  // ── GPS Teleport fraud ────────────────────────────────────────────
  claimsArray.push({
    id: uuidv4(),
    workerId: "W002",
    workerName: "Ravi Kumar",
    submittedAt: new Date(now - 18 * 60000).toISOString(),
    telemetry: {
      lat: 13.0827,
      lng: 80.2707,
      previousLat: 12.9716,  // Bengaluru! 350km away 10 min ago
      previousLng: 77.5946,
      previousTimestamp: new Date(now - 28 * 60000).toISOString(),
      motionScore: 0.15,
      connectivityType: "WiFi",
      networkFingerprint: "fp_spoof_hub_01",
      deviceId: "dev_ravi_01",
    },
    incident: {
      weatherSeverity: 4,
      claimedSeverity: 5,
      incidentType: "RAIN_DAMAGE",
      description: "Storm caused complete package loss.",
      zoneId: "ZONE_CENTRAL_CHENNAI",
    },
    riskResult: {
      riskScore: 91,
      fraudSignals: ["GPS_TELEPORT", "MOTION_MISMATCH", "WEATHER_MISMATCH", "NETWORK_CLUSTER"],
      claimStatus: "FLAGGED",
      signalBreakdown: {
        GPS_SPOOF: 95,
        MOTION_CONSISTENCY: 88,
        WEATHER_CORRELATION: 70,
        PEER_CLUSTER: 85,
        NETWORK_SIGNATURE: 90,
      },
      processedAt: new Date(now - 17 * 60000).toISOString(),
    },
  });

  // ── Cluster attack — 5 fake workers ──────────────────────────────
  const clusterWorkers = [
    { id: "W003", name: "Fake Agent Alpha" },
    { id: "W004", name: "Fake Agent Beta" },
    { id: "W005", name: "Fake Agent Gamma" },
    { id: "W006", name: "Fake Agent Delta" },
    { id: "W007", name: "Fake Agent Epsilon" },
  ];

  clusterWorkers.forEach((worker, i) => {
    claimsArray.push({
      id: uuidv4(),
      workerId: worker.id,
      workerName: worker.name,
      submittedAt: new Date(now - (10 - i) * 60000).toISOString(),
      telemetry: {
        lat: jitter(CLUSTER_LAT),
        lng: jitter(CLUSTER_LNG),
        previousLat: jitter(CLUSTER_LAT, 0.001),
        previousLng: jitter(CLUSTER_LNG, 0.001),
        previousTimestamp: new Date(now - (20 - i) * 60000).toISOString(),
        motionScore: 0.1 + Math.random() * 0.15,
        connectivityType: "WiFi",
        networkFingerprint: "fp_spoof_hub_01", // SAME hub fingerprint
        deviceId: `dev_cluster_0${i + 1}`,
      },
      incident: {
        weatherSeverity: 2,
        claimedSeverity: 5,
        incidentType: "RAIN_DAMAGE",
        description: "Cyclone damaged all deliveries.",
        zoneId: "ZONE_CENTRAL_CHENNAI",
      },
      riskResult: {
        riskScore: 85 + Math.floor(Math.random() * 10),
        fraudSignals: ["PEER_CLUSTER_ATTACK", "NETWORK_CLUSTER", "WEATHER_MISMATCH", "MOTION_MISMATCH"],
        claimStatus: "FLAGGED",
        signalBreakdown: {
          GPS_SPOOF: 30 + Math.floor(Math.random() * 20),
          MOTION_CONSISTENCY: 75 + Math.floor(Math.random() * 15),
          WEATHER_CORRELATION: 90,
          PEER_CLUSTER: 98,
          NETWORK_SIGNATURE: 95,
        },
        processedAt: new Date(now - (9 - i) * 60000).toISOString(),
      },
    });
  });

  // ── Manual review borderline case ────────────────────────────────
  claimsArray.push({
    id: uuidv4(),
    workerId: "W008",
    workerName: "Priya Nair",
    submittedAt: new Date(now - 5 * 60000).toISOString(),
    telemetry: {
      lat: 13.0900,
      lng: 80.2785,
      previousLat: 13.0850,
      previousLng: 80.2740,
      previousTimestamp: new Date(now - 20 * 60000).toISOString(),
      motionScore: 0.45,
      connectivityType: "3G",
      networkFingerprint: "fp_d4e5f6",
      deviceId: "dev_priya_01",
    },
    incident: {
      weatherSeverity: 2,
      claimedSeverity: 4,
      incidentType: "ACCIDENT",
      description: "Minor accident during heavy rain, bike damaged.",
      zoneId: "ZONE_NORTH_CHENNAI",
    },
    riskResult: {
      riskScore: 54,
      fraudSignals: ["WEATHER_MISMATCH"],
      claimStatus: "MANUAL_REVIEW",
      signalBreakdown: {
        GPS_SPOOF: 10,
        MOTION_CONSISTENCY: 40,
        WEATHER_CORRELATION: 75,
        PEER_CLUSTER: 5,
        NETWORK_SIGNATURE: 10,
      },
      processedAt: new Date(now - 4 * 60000).toISOString(),
    },
  });
};