// shared/types/PolicyModel.js
// Weekly parametric insurance policy schema

export const POLICY_STATUS = {
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
    PENDING: "PENDING",
};

export const createPolicyModel = (overrides = {}) => ({
    id: null,
    workerId: null,
    workerName: "",

    // Coverage period — always one week
    weekStart: null, // ISO string — Monday 00:00
    weekEnd: null,   // ISO string — Sunday 23:59

    // Pricing
    premiumINR: 0,
    coverageAmountINR: 0,

    // What triggers are covered
    coveredTriggers: [
        "EXTREME_HEAT",
        "HEAVY_RAIN",
        "FLOOD",
        "HIGH_AQI",
        "CURFEW",
        "STRIKE",
        "ZONE_CLOSURE",
        "APP_OUTAGE",
    ],

    // Breakdown of how premium was calculated
    premiumBreakdown: {
        basePremium: 0,
        zoneMultiplier: 1.0,
        hoursMultiplier: 1.0,
        cityDisruptionMultiplier: 1.0,
        weatherForecastMultiplier: 1.0,
    },

    status: POLICY_STATUS.ACTIVE,
    claimsCount: 0,
    totalPayoutsINR: 0,
    createdAt: new Date().toISOString(),

    ...overrides,
});
