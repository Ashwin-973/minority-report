// server/src/controllers/premiumController.js

import { calculatePremium } from "../services/premiumEngine.js";
import { getWorkerById } from "../data/workersStore.js";

/**
 * POST /api/premiums/calculate
 * Calculate premium for a worker profile (preview before purchase)
 */
export const calcPremium = async (req, res) => {
    try {
        const { workerId, zoneId, avgWeeklyEarnings, avgHoursPerWeek, riskTier } = req.body;

        let params;
        if (workerId) {
            const worker = getWorkerById(workerId);
            if (!worker) return res.status(404).json({ error: "Worker not found" });
            params = {
                zoneId: worker.zoneId,
                avgWeeklyEarnings: worker.avgWeeklyEarnings,
                avgHoursPerWeek: worker.avgHoursPerWeek,
                riskTier: worker.riskProfile?.riskTier || "MEDIUM",
            };
        } else {
            if (!zoneId || !avgWeeklyEarnings) {
                return res.status(400).json({ error: "Provide workerId OR (zoneId + avgWeeklyEarnings)" });
            }
            params = { zoneId, avgWeeklyEarnings, avgHoursPerWeek: avgHoursPerWeek || 40, riskTier: riskTier || "MEDIUM" };
        }

        const result = await calculatePremium(params);
        return res.json({ success: true, premium: result });
    } catch (err) {
        console.error("calcPremium error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
