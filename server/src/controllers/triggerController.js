// server/src/controllers/triggerController.js

import { getAllTriggerEvents, getActiveTriggers, getRecentTriggers } from "../data/triggerEventsStore.js";
import { checkAllTriggers, simulateTrigger } from "../services/triggerMonitor.js";
import { TRIGGER_LABELS, PARAMETRIC_TRIGGERS } from "../../../shared/constants/riskThresholds.js";

/**
 * GET /api/triggers
 */
export const listTriggers = async (_req, res) => {
    try {
        const events = getAllTriggerEvents();
        return res.json({
            total: events.length,
            active: events.filter((t) => t.active).length,
            events,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/triggers/active
 */
export const listActiveTriggers = async (_req, res) => {
    try {
        const active = getActiveTriggers();
        return res.json({ total: active.length, triggers: active });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * POST /api/triggers/check
 * Manually invoke the trigger check cycle
 */
export const runTriggerCheck = async (_req, res) => {
    try {
        const triggered = await checkAllTriggers();
        return res.json({
            checked: true,
            newTriggers: triggered.length,
            triggers: triggered,
        });
    } catch (err) {
        console.error("runTriggerCheck error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * POST /api/triggers/simulate
 * Manually force a trigger for demo
 * Body: { zoneId, triggerType, data? }
 */
export const simulateTriggerEvent = async (req, res) => {
    try {
        const { zoneId, triggerType, data } = req.body;

        if (!zoneId || !triggerType) {
            return res.status(400).json({ error: "zoneId and triggerType required" });
        }

        if (!PARAMETRIC_TRIGGERS[triggerType]) {
            return res.status(400).json({
                error: `Invalid triggerType. Valid types: ${Object.keys(PARAMETRIC_TRIGGERS).join(", ")}`,
            });
        }

        const event = await simulateTrigger(zoneId, triggerType, data || {});

        return res.status(201).json({
            success: true,
            message: `Simulated ${TRIGGER_LABELS[triggerType]} in ${zoneId}`,
            trigger: event,
        });
    } catch (err) {
        console.error("simulateTrigger error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
