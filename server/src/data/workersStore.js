// server/src/data/workersStore.js
// In-memory worker store with seed food delivery workers

import { v4 as uuidv4 } from "uuid";

const workers = [];

export const getAllWorkers = () => [...workers];
export const getWorkerById = (id) => workers.find((w) => w.id === id) || null;
export const getWorkersByZone = (zoneId) => workers.filter((w) => w.zoneId === zoneId);

export const addWorker = (worker) => {
    workers.push(worker);
    return worker;
};

export const updateWorker = (id, updates) => {
    const idx = workers.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    workers[idx] = { ...workers[idx], ...updates };
    return workers[idx];
};

// ── Seed demo workers ───────────────────────────────────────────────
const seedWorkers = () => {
    const demoWorkers = [
        {
            id: "W001",
            name: "Arjun Mehta",
            phone: "9876543210",
            email: "arjun@demo.com",
            deliveryPlatform: "SWIGGY",
            vehicleType: "BIKE",
            zoneId: "ZONE_SOUTH_CHENNAI",
            avgWeeklyEarnings: 6000,
            avgHoursPerWeek: 45,
            registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            riskProfile: {
                riskTier: "MEDIUM",
                baseRiskScore: 55,
                factors: [
                    { name: "Zone Flood History", impact: "HIGH", detail: "South Chennai — high historical rainfall" },
                    { name: "Hours Per Week", impact: "MEDIUM", detail: "45 hrs — above average exposure" },
                    { name: "Vehicle Type", impact: "LOW", detail: "Bike — moderate weather vulnerability" },
                ],
            },
        },
        {
            id: "W002",
            name: "Ravi Kumar",
            phone: "9876543211",
            email: "ravi@demo.com",
            deliveryPlatform: "ZOMATO",
            vehicleType: "SCOOTER",
            zoneId: "ZONE_CENTRAL_CHENNAI",
            avgWeeklyEarnings: 5500,
            avgHoursPerWeek: 40,
            registeredAt: new Date(Date.now() - 25 * 86400000).toISOString(),
            riskProfile: {
                riskTier: "MEDIUM",
                baseRiskScore: 48,
                factors: [
                    { name: "Zone Flood History", impact: "MEDIUM", detail: "Central Chennai — moderate risk" },
                    { name: "Hours Per Week", impact: "MEDIUM", detail: "40 hrs — standard exposure" },
                    { name: "Vehicle Type", impact: "LOW", detail: "Scooter — moderate vulnerability" },
                ],
            },
        },
        {
            id: "W008",
            name: "Priya Nair",
            phone: "9876543212",
            email: "priya@demo.com",
            deliveryPlatform: "SWIGGY",
            vehicleType: "SCOOTER",
            zoneId: "ZONE_NORTH_CHENNAI",
            avgWeeklyEarnings: 4500,
            avgHoursPerWeek: 35,
            registeredAt: new Date(Date.now() - 20 * 86400000).toISOString(),
            riskProfile: {
                riskTier: "LOW",
                baseRiskScore: 35,
                factors: [
                    { name: "Zone Flood History", impact: "MEDIUM", detail: "North Chennai — moderate risk" },
                    { name: "Hours Per Week", impact: "LOW", detail: "35 hrs — below average" },
                    { name: "Vehicle Type", impact: "LOW", detail: "Scooter — moderate vulnerability" },
                ],
            },
        },
        {
            id: "W009",
            name: "Karan Sharma",
            phone: "9876543213",
            email: "karan@demo.com",
            deliveryPlatform: "ZOMATO",
            vehicleType: "BIKE",
            zoneId: "ZONE_WEST_CHENNAI",
            avgWeeklyEarnings: 7000,
            avgHoursPerWeek: 50,
            registeredAt: new Date(Date.now() - 15 * 86400000).toISOString(),
            riskProfile: {
                riskTier: "LOW",
                baseRiskScore: 30,
                factors: [
                    { name: "Zone Flood History", impact: "LOW", detail: "West Chennai — low historical rainfall" },
                    { name: "Hours Per Week", impact: "HIGH", detail: "50 hrs — high exposure" },
                    { name: "Vehicle Type", impact: "LOW", detail: "Bike — moderate vulnerability" },
                ],
            },
        },
        {
            id: "W015",
            name: "Deepa Lakshmi",
            phone: "9876543214",
            email: "deepa@demo.com",
            deliveryPlatform: "SWIGGY",
            vehicleType: "CYCLE",
            zoneId: "ZONE_SOUTH_CHENNAI",
            avgWeeklyEarnings: 3500,
            avgHoursPerWeek: 30,
            registeredAt: new Date(Date.now() - 10 * 86400000).toISOString(),
            riskProfile: {
                riskTier: "HIGH",
                baseRiskScore: 72,
                factors: [
                    { name: "Zone Flood History", impact: "HIGH", detail: "South Chennai — high historical rainfall" },
                    { name: "Hours Per Week", impact: "LOW", detail: "30 hrs — below average" },
                    { name: "Vehicle Type", impact: "HIGH", detail: "Cycle — high weather vulnerability" },
                ],
            },
        },
    ];

    demoWorkers.forEach((w) => workers.push(w));
};

seedWorkers();
