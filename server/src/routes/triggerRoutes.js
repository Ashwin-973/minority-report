// server/src/routes/triggerRoutes.js
import { Router } from "express";
import { listTriggers, listActiveTriggers, runTriggerCheck, simulateTriggerEvent } from "../controllers/triggerController.js";

const router = Router();

router.get("/", listTriggers);
router.get("/active", listActiveTriggers);
router.post("/check", runTriggerCheck);
router.post("/simulate", simulateTriggerEvent);

export default router;
