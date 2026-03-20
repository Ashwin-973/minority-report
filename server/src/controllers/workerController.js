// server/src/controllers/workerController.js

import { v4 as uuidv4 } from "uuid";
import { addWorker, getWorkerById, getAllWorkers } from "../data/workersStore.js";
import { computeRiskProfile } from "../services/riskProfiler.js";
import { getActivePolicyForWorker, getPoliciesByWorker } from "../data/policiesStore.js";
import { getPayoutsByWorker } from "../data/payoutsStore.js";
import { getClaimsByWorker } from "../data/claimsStore.js";

/**
 * POST /api/workers/register
 */
export const registerWorker = async (req, res) => {
    try {
        const { name, phone, email, deliveryPlatform, vehicleType, zoneId, avgWeeklyEarnings, avgHoursPerWeek } = req.body;

        if (!name || !phone || !zoneId) {
            return res.status(400).json({ error: "Missing required fields: name, phone, zoneId" });
        }

        const riskProfile = computeRiskProfile({ zoneId, avgHoursPerWeek: avgHoursPerWeek || 40, vehicleType: vehicleType || "BIKE" });

        const worker = {
            id: `W${String(100 + Math.floor(Math.random() * 900))}`,
            name,
            phone,
            email: email || "",
            deliveryPlatform: deliveryPlatform || "SWIGGY",
            vehicleType: vehicleType || "BIKE",
            zoneId,
            avgWeeklyEarnings: avgWeeklyEarnings || 5000,
            avgHoursPerWeek: avgHoursPerWeek || 40,
            registeredAt: new Date().toISOString(),
            riskProfile,
        };

        addWorker(worker);

        return res.status(201).json({ success: true, worker });
    } catch (err) {
        console.error("registerWorker error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/workers
 */
export const listWorkers = async (_req, res) => {
    try {
        const workers = getAllWorkers();
        return res.json({ total: workers.length, workers });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/workers/:id
 */
export const getWorker = async (req, res) => {
    try {
        const worker = getWorkerById(req.params.id);
        if (!worker) return res.status(404).json({ error: "Worker not found" });
        return res.json({ worker });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/workers/:id/dashboard
 * Worker's personal dashboard — policy, claims, payouts, earnings protected
 */
export const getWorkerDashboard = async (req, res) => {
    try {
        const workerId = req.params.id;
        const worker = getWorkerById(workerId);
        if (!worker) return res.status(404).json({ error: "Worker not found" });

        const activePolicy = getActivePolicyForWorker(workerId);
        const allPolicies = getPoliciesByWorker(workerId);
        const claims = getClaimsByWorker(workerId);
        const payouts = getPayoutsByWorker(workerId);

        const totalEarningsProtected = payouts
            .filter((p) => p.status === "COMPLETED")
            .reduce((sum, p) => sum + p.amountINR, 0);

        const totalPremiumsPaid = allPolicies.reduce((sum, p) => sum + p.premiumINR, 0);

        return res.json({
            worker,
            activePolicy,
            totalPolicies: allPolicies.length,
            claims: claims.slice(0, 20), // Last 20
            payouts: payouts.slice(0, 20),
            stats: {
                totalEarningsProtected,
                totalPremiumsPaid,
                totalClaims: claims.length,
                approvedClaims: claims.filter((c) => c.riskResult?.claimStatus === "APPROVED").length,
                activeCoverage: activePolicy ? activePolicy.coverageAmountINR : 0,
                currentPremium: activePolicy ? activePolicy.premiumINR : 0,
            },
        });
    } catch (err) {
        console.error("getWorkerDashboard error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
