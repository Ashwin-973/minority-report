// server/src/data/policiesStore.js
// In-memory policy store with seed active policies

import { v4 as uuidv4 } from "uuid";

const policies = [];

export const getAllPolicies = () => [...policies];
export const getPolicyById = (id) => policies.find((p) => p.id === id) || null;
export const getPoliciesByWorker = (workerId) => policies.filter((p) => p.workerId === workerId);

export const getActivePoliciesByWorker = (workerId) =>
    policies.filter((p) => p.workerId === workerId && p.status === "ACTIVE");

export const getActivePoliciesByZone = (zoneId) =>
    policies.filter((p) => p.status === "ACTIVE" && p.zoneId === zoneId);

export const getActivePolicyForWorker = (workerId) =>
    policies.find((p) => p.workerId === workerId && p.status === "ACTIVE") || null;

export const addPolicy = (policy) => {
    policies.push(policy);
    return policy;
};

export const updatePolicy = (id, updates) => {
    const idx = policies.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    policies[idx] = { ...policies[idx], ...updates };
    return policies[idx];
};

// ── Seed active policies for demo workers ───────────────────────────
const seedPolicies = () => {
    // Current week boundaries
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const demoPolicies = [
        {
            id: uuidv4(),
            workerId: "W001",
            workerName: "Arjun Mehta",
            zoneId: "ZONE_SOUTH_CHENNAI",
            weekStart: monday.toISOString(),
            weekEnd: sunday.toISOString(),
            premiumINR: 189,
            coverageAmountINR: 4800,
            coveredTriggers: ["EXTREME_HEAT", "HEAVY_RAIN", "FLOOD", "HIGH_AQI", "CURFEW", "STRIKE", "ZONE_CLOSURE", "APP_OUTAGE"],
            premiumBreakdown: {
                basePremium: 180,
                zoneMultiplier: 1.3,
                hoursMultiplier: 1.1,
                cityDisruptionMultiplier: 1.0,
                weatherForecastMultiplier: 0.95,
            },
            status: "ACTIVE",
            claimsCount: 0,
            totalPayoutsINR: 0,
            createdAt: new Date(monday.getTime() - 86400000).toISOString(),
        },
        {
            id: uuidv4(),
            workerId: "W008",
            workerName: "Priya Nair",
            zoneId: "ZONE_NORTH_CHENNAI",
            weekStart: monday.toISOString(),
            weekEnd: sunday.toISOString(),
            premiumINR: 119,
            coverageAmountINR: 3600,
            coveredTriggers: ["EXTREME_HEAT", "HEAVY_RAIN", "FLOOD", "HIGH_AQI", "CURFEW", "STRIKE", "ZONE_CLOSURE", "APP_OUTAGE"],
            premiumBreakdown: {
                basePremium: 135,
                zoneMultiplier: 1.1,
                hoursMultiplier: 0.95,
                cityDisruptionMultiplier: 1.0,
                weatherForecastMultiplier: 0.9,
            },
            status: "ACTIVE",
            claimsCount: 0,
            totalPayoutsINR: 0,
            createdAt: new Date(monday.getTime() - 86400000).toISOString(),
        },
        {
            id: uuidv4(),
            workerId: "W009",
            workerName: "Karan Sharma",
            zoneId: "ZONE_WEST_CHENNAI",
            weekStart: monday.toISOString(),
            weekEnd: sunday.toISOString(),
            premiumINR: 159,
            coverageAmountINR: 5600,
            coveredTriggers: ["EXTREME_HEAT", "HEAVY_RAIN", "FLOOD", "HIGH_AQI", "CURFEW", "STRIKE", "ZONE_CLOSURE", "APP_OUTAGE"],
            premiumBreakdown: {
                basePremium: 210,
                zoneMultiplier: 0.9,
                hoursMultiplier: 1.2,
                cityDisruptionMultiplier: 1.0,
                weatherForecastMultiplier: 0.85,
            },
            status: "ACTIVE",
            claimsCount: 0,
            totalPayoutsINR: 0,
            createdAt: new Date(monday.getTime() - 86400000).toISOString(),
        },
        {
            id: uuidv4(),
            workerId: "W015",
            workerName: "Deepa Lakshmi",
            zoneId: "ZONE_SOUTH_CHENNAI",
            weekStart: monday.toISOString(),
            weekEnd: sunday.toISOString(),
            premiumINR: 149,
            coverageAmountINR: 2800,
            coveredTriggers: ["EXTREME_HEAT", "HEAVY_RAIN", "FLOOD", "HIGH_AQI", "CURFEW", "STRIKE", "ZONE_CLOSURE", "APP_OUTAGE"],
            premiumBreakdown: {
                basePremium: 105,
                zoneMultiplier: 1.3,
                hoursMultiplier: 0.9,
                cityDisruptionMultiplier: 1.0,
                weatherForecastMultiplier: 1.1,
            },
            status: "ACTIVE",
            claimsCount: 0,
            totalPayoutsINR: 0,
            createdAt: new Date(monday.getTime() - 86400000).toISOString(),
        },
    ];

    demoPolicies.forEach((p) => policies.push(p));
};

seedPolicies();
