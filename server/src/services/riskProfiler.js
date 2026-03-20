// server/src/services/riskProfiler.js
// Compute worker risk tier based on zone, hours, vehicle, city disruption frequency

import { getZoneWeather } from "../data/weatherHistory.js";

const ZONE_RISK_SCORES = {
    ZONE_SOUTH_CHENNAI: 70,   // High flood/rain history
    ZONE_CENTRAL_CHENNAI: 50, // Moderate
    ZONE_NORTH_CHENNAI: 45,   // Moderate
    ZONE_WEST_CHENNAI: 30,    // Low
};

const VEHICLE_RISK = {
    CYCLE: 25,    // Highest vulnerability to weather
    BIKE: 15,
    SCOOTER: 12,
    WALK: 30,     // Walking deliveries most vulnerable
};

/**
 * Compute risk profile for a worker
 * @param {object} workerData - { zoneId, avgHoursPerWeek, vehicleType, avgWeeklyEarnings }
 * @returns {object} riskProfile
 */
export const computeRiskProfile = (workerData) => {
    const factors = [];
    let totalScore = 0;

    // Factor 1: Zone flood/heat risk history (weight: 40%)
    const zoneScore = ZONE_RISK_SCORES[workerData.zoneId] || 50;
    const zoneWeather = getZoneWeather(workerData.zoneId);
    const zoneImpact = zoneScore >= 60 ? "HIGH" : zoneScore >= 40 ? "MEDIUM" : "LOW";
    factors.push({
        name: "Zone Flood/Heat History",
        impact: zoneImpact,
        score: zoneScore,
        weight: 0.4,
        detail: `${zoneWeather?.label || workerData.zoneId} — ${zoneImpact === "HIGH" ? "high historical rainfall and flood risk" :
                zoneImpact === "MEDIUM" ? "moderate disruption history" :
                    "low historical disruption"
            }`,
    });
    totalScore += zoneScore * 0.4;

    // Factor 2: Hours worked per week (weight: 25%)
    const hours = workerData.avgHoursPerWeek || 40;
    const hoursScore = Math.min(100, Math.round((hours / 60) * 100));
    const hoursImpact = hours >= 45 ? "HIGH" : hours >= 30 ? "MEDIUM" : "LOW";
    factors.push({
        name: "Weekly Hours Exposure",
        impact: hoursImpact,
        score: hoursScore,
        weight: 0.25,
        detail: `${hours} hrs/week — ${hoursImpact === "HIGH" ? "above average road exposure" :
                hoursImpact === "MEDIUM" ? "standard exposure level" :
                    "below average exposure"
            }`,
    });
    totalScore += hoursScore * 0.25;

    // Factor 3: Vehicle type vulnerability (weight: 20%)
    const vehicleScore = VEHICLE_RISK[workerData.vehicleType] || 15;
    const vehicleNormalized = Math.round((vehicleScore / 30) * 100);
    const vehicleImpact = vehicleScore >= 20 ? "HIGH" : vehicleScore >= 12 ? "MEDIUM" : "LOW";
    factors.push({
        name: "Vehicle Weather Vulnerability",
        impact: vehicleImpact,
        score: vehicleNormalized,
        weight: 0.2,
        detail: `${workerData.vehicleType} — ${vehicleImpact === "HIGH" ? "high weather vulnerability" :
                "moderate weather vulnerability"
            }`,
    });
    totalScore += vehicleNormalized * 0.2;

    // Factor 4: City-level disruption frequency (weight: 15%)
    // Chennai has moderate-high disruption frequency (monsoon city)
    const cityScore = 55; // Fixed for Chennai — data-driven in production
    factors.push({
        name: "City Disruption Frequency",
        impact: "MEDIUM",
        score: cityScore,
        weight: 0.15,
        detail: "Chennai — moderate-high monsoon and heat disruption frequency",
    });
    totalScore += cityScore * 0.15;

    // Compute final tier
    const baseRiskScore = Math.round(totalScore);
    let riskTier = "MEDIUM";
    if (baseRiskScore >= 60) riskTier = "HIGH";
    else if (baseRiskScore < 40) riskTier = "LOW";

    return {
        riskTier,
        baseRiskScore,
        factors,
    };
};
