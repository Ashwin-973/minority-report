// server/src/controllers/claimController.js

import { v4 as uuidv4 } from "uuid";
import { addClaim, getAllClaims, getRecentClaims } from "../data/claimsStore.js";
import { aggregateRisk } from "../services/riskEngine/riskAggregator.js";
import { addTelemetryPoint } from "../data/workerTelemetry.js";
import { processingLatencyMs } from "../utils/randomSignalNoise.js";

/**
 * POST /api/claims
 * Submit a new insurance claim — runs it through the full risk engine
 */
export const submitClaim = async (req, res) => {
  try {
    const { workerId, workerName, telemetry, incident } = req.body;

    if (!workerId || !telemetry || !incident) {
      return res.status(400).json({
        error: "Missing required fields: workerId, telemetry, incident",
      });
    }

    // Build claim object
    const claim = {
      id: uuidv4(),
      workerId,
      workerName: workerName || `Worker ${workerId}`,
      submittedAt: new Date().toISOString(),
      telemetry: {
        lat: telemetry.lat,
        lng: telemetry.lng,
        previousLat: telemetry.previousLat || null,
        previousLng: telemetry.previousLng || null,
        previousTimestamp: telemetry.previousTimestamp || null,
        motionScore: telemetry.motionScore ?? 0.5,
        connectivityType: telemetry.connectivityType || "4G",
        networkFingerprint: telemetry.networkFingerprint || `fp_${uuidv4().slice(0, 8)}`,
        deviceId: telemetry.deviceId || `dev_${workerId}`,
      },
      incident: {
        weatherSeverity: incident.weatherSeverity ?? 0,
        claimedSeverity: incident.claimedSeverity ?? incident.weatherSeverity ?? 0,
        incidentType: incident.incidentType || "RAIN_DAMAGE",
        description: incident.description || "",
        zoneId: incident.zoneId || null,
      },
      riskResult: null,
    };

    // Get recent claims for cluster detection
    const recentClaims = getRecentClaims(60);
    const allClaims = getAllClaims();

    // Simulate slight processing delay (looks like ML inference)
    await new Promise((resolve) => setTimeout(resolve, processingLatencyMs()));

    // Run risk engine
    const riskResult = await aggregateRisk(claim, recentClaims, allClaims);
    claim.riskResult = riskResult;

    // Persist to store
    addClaim(claim);

    // Update telemetry history
    addTelemetryPoint(workerId, { lat: telemetry.lat, lng: telemetry.lng });

    return res.status(201).json({
      success: true,
      claim: {
        id: claim.id,
        workerId: claim.workerId,
        workerName: claim.workerName,
        submittedAt: claim.submittedAt,
        riskResult: claim.riskResult,
      },
    });
  } catch (err) {
    console.error("submitClaim error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/claims/:id
 * Fetch a single claim by ID
 */
export const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const all = getAllClaims();
    const claim = all.find((c) => c.id === id);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    return res.json({ claim });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};