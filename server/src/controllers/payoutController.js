// server/src/controllers/payoutController.js

import { getAllPayouts, getPayoutsByWorker, getPayoutById, getTotalPayoutsINR } from "../data/payoutsStore.js";
import { processPayout } from "../services/payoutService.js";

/**
 * GET /api/payouts
 */
export const listPayouts = async (_req, res) => {
    try {
        const payouts = getAllPayouts();
        return res.json({
            total: payouts.length,
            completed: payouts.filter((p) => p.status === "COMPLETED").length,
            pending: payouts.filter((p) => p.status === "PENDING").length,
            totalDisbursedINR: getTotalPayoutsINR(),
            payouts,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/payouts/worker/:workerId
 */
export const getWorkerPayouts = async (req, res) => {
    try {
        const payouts = getPayoutsByWorker(req.params.workerId);
        const totalINR = payouts.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amountINR, 0);
        return res.json({ total: payouts.length, totalDisbursedINR: totalINR, payouts });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/payouts/:id
 */
export const getPayout = async (req, res) => {
    try {
        const payout = getPayoutById(req.params.id);
        if (!payout) return res.status(404).json({ error: "Payout not found" });
        return res.json({ payout });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * POST /api/payouts/:id/process
 */
export const triggerProcess = async (req, res) => {
    try {
        const result = await processPayout(req.params.id);
        if (!result) return res.status(404).json({ error: "Payout not found or already processed" });
        return res.json({ success: true, payout: result });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
