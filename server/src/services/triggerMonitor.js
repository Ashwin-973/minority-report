// server/src/services/triggerMonitor.js
// Parametric trigger monitoring — polls weather API and auto-creates claims

import { v4 as uuidv4 } from "uuid";
import { fetchZoneWeather, fetchZoneAQI, getZoneCoords } from "./weatherService.js";
import { addTriggerEvent, hasActiveTrigger } from "../data/triggerEventsStore.js";
import { getActivePoliciesByZone } from "../data/policiesStore.js";
import { addClaim, getRecentClaims, getAllClaims } from "../data/claimsStore.js";
import { aggregateRisk } from "./riskEngine/riskAggregator.js";
import { initiatePayout } from "./payoutService.js";
import { getWorkerById } from "../data/workersStore.js";
import {
    TRIGGER_THRESHOLDS,
    TRIGGER_TO_INCIDENT,
    TRIGGER_LABELS,
    CLAIM_STATUS,
} from "../../../shared/constants/riskThresholds.js";

/**
 * Check all zones for parametric trigger conditions
 * Called every 5 minutes by cron, or manually via /api/triggers/check
 */
export const checkAllTriggers = async () => {
    const zoneIds = Object.keys(getZoneCoords());
    const triggered = [];

    for (const zoneId of zoneIds) {
        const results = await checkZoneTriggers(zoneId);
        triggered.push(...results);
    }

    return triggered;
};

/**
 * Check a single zone for trigger conditions
 */
const checkZoneTriggers = async (zoneId) => {
    const triggered = [];

    try {
        const weather = await fetchZoneWeather(zoneId);
        const aqiData = await fetchZoneAQI(zoneId);

        // Check EXTREME_HEAT
        if (weather.temp >= TRIGGER_THRESHOLDS.EXTREME_HEAT.tempCelsius) {
            if (!hasActiveTrigger(zoneId, "EXTREME_HEAT")) {
                const event = await createTriggerEvent(zoneId, "EXTREME_HEAT", {
                    temp: weather.temp,
                    threshold: TRIGGER_THRESHOLDS.EXTREME_HEAT.tempCelsius,
                });
                triggered.push(event);
            }
        }

        // Check HEAVY_RAIN
        if (weather.rainMmPerHr >= TRIGGER_THRESHOLDS.HEAVY_RAIN.rainMmPerHr) {
            if (!hasActiveTrigger(zoneId, "HEAVY_RAIN")) {
                const event = await createTriggerEvent(zoneId, "HEAVY_RAIN", {
                    rainMmPerHr: weather.rainMmPerHr,
                    threshold: TRIGGER_THRESHOLDS.HEAVY_RAIN.rainMmPerHr,
                });
                triggered.push(event);
            }
        }

        // Check FLOOD
        if (
            weather.rainMmPerHr >= TRIGGER_THRESHOLDS.FLOOD.rainMmPerHr &&
            weather.windSpeed >= TRIGGER_THRESHOLDS.FLOOD.windSpeedKmh
        ) {
            if (!hasActiveTrigger(zoneId, "FLOOD")) {
                const event = await createTriggerEvent(zoneId, "FLOOD", {
                    rainMmPerHr: weather.rainMmPerHr,
                    windSpeed: weather.windSpeed,
                });
                triggered.push(event);
            }
        }

        // Check HIGH_AQI
        if (aqiData.aqi >= TRIGGER_THRESHOLDS.HIGH_AQI.aqi) {
            if (!hasActiveTrigger(zoneId, "HIGH_AQI")) {
                const event = await createTriggerEvent(zoneId, "HIGH_AQI", {
                    aqi: aqiData.aqi,
                    threshold: TRIGGER_THRESHOLDS.HIGH_AQI.aqi,
                });
                triggered.push(event);
            }
        }
    } catch (err) {
        console.error(`[TriggerMonitor] Error checking zone ${zoneId}:`, err.message);
    }

    return triggered;
};

/**
 * Create a trigger event and auto-generate claims for affected workers
 */
const createTriggerEvent = async (zoneId, triggerType, data) => {
    const event = {
        id: `TRIG_${uuidv4().slice(0, 8).toUpperCase()}`,
        zoneId,
        triggerType,
        label: TRIGGER_LABELS[triggerType],
        data,
        active: true,
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
        autoClaimIds: [],
        affectedWorkers: 0,
    };

    addTriggerEvent(event);

    // Auto-create claims for all workers with active policies in this zone
    const activePolicies = getActivePoliciesByZone(zoneId);
    event.affectedWorkers = activePolicies.length;

    for (const policy of activePolicies) {
        try {
            const claimId = await autoCreateClaim(policy, triggerType, event.id, zoneId);
            if (claimId) event.autoClaimIds.push(claimId);
        } catch (err) {
            console.error(`[TriggerMonitor] Failed to auto-create claim for ${policy.workerId}:`, err.message);
        }
    }

    console.log(
        `\x1b[33m[TRIGGER]\x1b[0m ${TRIGGER_LABELS[triggerType]} in ${zoneId} — ${activePolicies.length} workers affected, ${event.autoClaimIds.length} auto-claims created`
    );

    return event;
};

/**
 * Auto-create a claim for a worker when a parametric trigger fires
 */
const autoCreateClaim = async (policy, triggerType, triggerId, zoneId) => {
    const worker = getWorkerById(policy.workerId);
    if (!worker) return null;

    const incidentType = TRIGGER_TO_INCIDENT[triggerType] || "RAIN_INCOME_LOSS";

    const claim = {
        id: uuidv4(),
        workerId: policy.workerId,
        workerName: policy.workerName || worker.name,
        submittedAt: new Date().toISOString(),
        autoGenerated: true,
        triggerId,
        policyId: policy.id,
        payoutAmount: policy.coverageAmountINR,
        telemetry: {
            lat: worker.zoneId === "ZONE_SOUTH_CHENNAI" ? 13.02 + Math.random() * 0.04 :
                worker.zoneId === "ZONE_CENTRAL_CHENNAI" ? 13.07 + Math.random() * 0.03 :
                    worker.zoneId === "ZONE_NORTH_CHENNAI" ? 13.11 + Math.random() * 0.02 :
                        13.04 + Math.random() * 0.02,
            lng: 80.19 + Math.random() * 0.1,
            previousLat: null,
            previousLng: null,
            previousTimestamp: null,
            motionScore: 0.6 + Math.random() * 0.3, // Genuine workers have real motion
            connectivityType: "4G",
            networkFingerprint: `fp_auto_${policy.workerId}_${Date.now()}`,
            deviceId: `dev_${policy.workerId}`,
        },
        incident: {
            weatherSeverity: triggerType === "EXTREME_HEAT" ? 3 :
                triggerType === "HIGH_AQI" ? 2 : 4,
            claimedSeverity: triggerType === "EXTREME_HEAT" ? 3 :
                triggerType === "HIGH_AQI" ? 2 : 4,
            incidentType,
            description: `Auto-triggered: ${TRIGGER_LABELS[triggerType]}. Worker unable to operate safely — income loss claim.`,
            zoneId,
        },
        riskResult: null,
    };

    // Run through risk engine — auto-generated legitimate claims should score LOW
    const recentClaims = getRecentClaims(60);
    const allClaims = getAllClaims();
    const riskResult = await aggregateRisk(claim, recentClaims, allClaims);
    claim.riskResult = riskResult;

    addClaim(claim);

    // If approved, auto-initiate payout
    if (riskResult.claimStatus === CLAIM_STATUS.APPROVED) {
        await initiatePayout({
            claimId: claim.id,
            policyId: policy.id,
            workerId: policy.workerId,
            workerName: claim.workerName,
            amountINR: policy.coverageAmountINR,
            triggerType,
            triggerDescription: `${TRIGGER_LABELS[triggerType]} — auto-payout`,
        });
    }

    return claim.id;
};

/**
 * Manually simulate a trigger (for demo purposes)
 */
export const simulateTrigger = async (zoneId, triggerType, data = {}) => {
    const event = await createTriggerEvent(zoneId, triggerType, data);
    return event;
};
