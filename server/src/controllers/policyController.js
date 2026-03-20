// server/src/controllers/policyController.js

import { v4 as uuidv4 } from "uuid";
import { addPolicy, getPolicyById, getPoliciesByWorker, getActivePolicyForWorker, getAllPolicies, updatePolicy } from "../data/policiesStore.js";
import { getWorkerById } from "../data/workersStore.js";
import { calculatePremium } from "../services/premiumEngine.js";

/**
 * POST /api/policies
 * Create a new weekly policy
 */
export const createPolicy = async (req, res) => {
    try {
        const { workerId } = req.body;
        if (!workerId) return res.status(400).json({ error: "workerId required" });

        const worker = getWorkerById(workerId);
        if (!worker) return res.status(404).json({ error: "Worker not found" });

        // Check for existing active policy
        const existing = getActivePolicyForWorker(workerId);
        if (existing) {
            return res.status(409).json({ error: "Worker already has an active policy", policy: existing });
        }

        // Calculate premium
        const premium = await calculatePremium({
            zoneId: worker.zoneId,
            avgWeeklyEarnings: worker.avgWeeklyEarnings,
            avgHoursPerWeek: worker.avgHoursPerWeek,
            riskTier: worker.riskProfile?.riskTier || "MEDIUM",
        });

        // Compute week boundaries
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const policy = {
            id: uuidv4(),
            workerId: worker.id,
            workerName: worker.name,
            zoneId: worker.zoneId,
            weekStart: monday.toISOString(),
            weekEnd: sunday.toISOString(),
            premiumINR: premium.premiumINR,
            coverageAmountINR: premium.coverageAmountINR,
            coveredTriggers: premium.coverageDetails.coveredTriggers,
            premiumBreakdown: premium.premiumBreakdown,
            status: "ACTIVE",
            claimsCount: 0,
            totalPayoutsINR: 0,
            createdAt: new Date().toISOString(),
        };

        addPolicy(policy);

        return res.status(201).json({ success: true, policy, premiumDetails: premium });
    } catch (err) {
        console.error("createPolicy error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/policies
 */
export const listPolicies = async (_req, res) => {
    try {
        const policies = getAllPolicies();
        return res.json({
            total: policies.length,
            active: policies.filter((p) => p.status === "ACTIVE").length,
            policies,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/policies/worker/:workerId
 */
export const getWorkerPolicies = async (req, res) => {
    try {
        const policies = getPoliciesByWorker(req.params.workerId);
        return res.json({ total: policies.length, policies });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/policies/:id
 */
export const getPolicy = async (req, res) => {
    try {
        const policy = getPolicyById(req.params.id);
        if (!policy) return res.status(404).json({ error: "Policy not found" });
        return res.json({ policy });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * POST /api/policies/:id/renew
 */
export const renewPolicy = async (req, res) => {
    try {
        const oldPolicy = getPolicyById(req.params.id);
        if (!oldPolicy) return res.status(404).json({ error: "Policy not found" });

        // Expire old policy
        updatePolicy(oldPolicy.id, { status: "EXPIRED" });

        // Create new policy for next week (reuse createPolicy logic via request)
        req.body = { workerId: oldPolicy.workerId };
        return createPolicy(req, res);
    } catch (err) {
        console.error("renewPolicy error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
