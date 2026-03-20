// shared/types/WorkerModel.js
// Worker schema for food delivery gig workers

export const DELIVERY_PLATFORMS = {
    SWIGGY: "SWIGGY",
    ZOMATO: "ZOMATO",
    OTHER: "OTHER",
};

export const VEHICLE_TYPES = {
    BIKE: "BIKE",
    SCOOTER: "SCOOTER",
    CYCLE: "CYCLE",
    WALK: "WALK",
};

export const RISK_TIERS = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
};

export const createWorkerModel = (overrides = {}) => ({
    id: null,
    name: "",
    phone: "",
    email: "",
    deliveryPlatform: DELIVERY_PLATFORMS.SWIGGY,
    vehicleType: VEHICLE_TYPES.BIKE,
    zoneId: "ZONE_SOUTH_CHENNAI",
    avgWeeklyEarnings: 5000, // ₹
    avgHoursPerWeek: 40,
    registeredAt: new Date().toISOString(),

    // Computed by riskProfiler
    riskProfile: {
        riskTier: RISK_TIERS.MEDIUM,
        baseRiskScore: 50,
        factors: [],
    },

    ...overrides,
});
