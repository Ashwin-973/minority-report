// server/src/services/premiumEngine.js
// Dynamic weekly premium calculation based on worker profile + real-time signals

import { PREMIUM_CONSTANTS } from "../../../shared/constants/riskThresholds.js";
import { getZoneWeather } from "../data/weatherHistory.js";
import { fetchZoneWeather } from "./weatherService.js";

/**
 * Compute dynamic weekly premium for a worker
 *
 * Formula:
 *   basePremium = avgWeeklyEarnings × BASE_RATE (3%)
 *   finalPremium = basePremium × zoneMultiplier × hoursMultiplier × cityDisruption × weatherForecast
 *   coverageAmount = avgWeeklyEarnings × COVERAGE_REPLACEMENT_RATIO (80%)
 *
 * @param {object} params - { zoneId, avgWeeklyEarnings, avgHoursPerWeek, riskTier }
 * @returns {object} premium calculation result
 */
export const calculatePremium = async (params) => {
    const {
        zoneId,
        avgWeeklyEarnings = 5000,
        avgHoursPerWeek = 40,
        riskTier = "MEDIUM",
    } = params;

    const { BASE_RATE, MIN_PREMIUM_INR, MAX_PREMIUM_INR, COVERAGE_REPLACEMENT_RATIO } = PREMIUM_CONSTANTS;

    // ── Base premium ──────────────────────────────────────────────────
    const basePremium = avgWeeklyEarnings * BASE_RATE;

    // ── Zone risk multiplier ──────────────────────────────────────────
    // Higher risk zones (flood-prone, high rainfall) = higher premium
    const zoneRiskMap = {
        ZONE_SOUTH_CHENNAI: 1.35,
        ZONE_CENTRAL_CHENNAI: 1.1,
        ZONE_NORTH_CHENNAI: 1.05,
        ZONE_WEST_CHENNAI: 0.85,
    };
    const zoneMultiplier = zoneRiskMap[zoneId] || 1.0;

    // ── Hours multiplier ──────────────────────────────────────────────
    // More hours = more exposure = higher premium
    let hoursMultiplier = 1.0;
    if (avgHoursPerWeek >= 50) hoursMultiplier = 1.25;
    else if (avgHoursPerWeek >= 40) hoursMultiplier = 1.1;
    else if (avgHoursPerWeek >= 30) hoursMultiplier = 1.0;
    else hoursMultiplier = 0.9;

    // ── City disruption frequency ─────────────────────────────────────
    // Chennai baseline: 1.05 (monsoon city with moderate-high disruptions)
    const cityDisruptionMultiplier = 1.05;

    // ── Weather forecast multiplier ───────────────────────────────────
    // Uses real-time weather data to adjust premium for upcoming week
    let weatherForecastMultiplier = 1.0;
    try {
        const liveWeather = await fetchZoneWeather(zoneId);
        const severity = liveWeather.severity || 0;
        // Higher current severity = higher risk this week
        if (severity >= 4) weatherForecastMultiplier = 1.5;
        else if (severity >= 3) weatherForecastMultiplier = 1.25;
        else if (severity >= 2) weatherForecastMultiplier = 1.1;
        else if (severity >= 1) weatherForecastMultiplier = 1.0;
        else weatherForecastMultiplier = 0.9;
    } catch {
        weatherForecastMultiplier = 1.0;
    }

    // ── Final premium ─────────────────────────────────────────────────
    const rawPremium = basePremium * zoneMultiplier * hoursMultiplier * cityDisruptionMultiplier * weatherForecastMultiplier;
    const premiumINR = Math.round(Math.max(MIN_PREMIUM_INR, Math.min(MAX_PREMIUM_INR, rawPremium)));

    // ── Coverage amount ───────────────────────────────────────────────
    const coverageAmountINR = Math.round(avgWeeklyEarnings * COVERAGE_REPLACEMENT_RATIO);

    return {
        premiumINR,
        coverageAmountINR,
        weeklyEarnings: avgWeeklyEarnings,
        riskTier,
        premiumBreakdown: {
            basePremium: Math.round(basePremium),
            zoneMultiplier: Math.round(zoneMultiplier * 100) / 100,
            hoursMultiplier: Math.round(hoursMultiplier * 100) / 100,
            cityDisruptionMultiplier: Math.round(cityDisruptionMultiplier * 100) / 100,
            weatherForecastMultiplier: Math.round(weatherForecastMultiplier * 100) / 100,
        },
        coverageDetails: {
            wageReplacement: `${COVERAGE_REPLACEMENT_RATIO * 100}%`,
            maxPayoutPerClaim: coverageAmountINR,
            coveredTriggers: [
                "EXTREME_HEAT", "HEAVY_RAIN", "FLOOD", "HIGH_AQI",
                "CURFEW", "STRIKE", "ZONE_CLOSURE", "APP_OUTAGE",
            ],
        },
        calculatedAt: new Date().toISOString(),
    };
};
