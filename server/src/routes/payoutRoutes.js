// server/src/routes/payoutRoutes.js
import { Router } from "express";
import { listPayouts, getWorkerPayouts, getPayout, triggerProcess } from "../controllers/payoutController.js";

const router = Router();

router.get("/", listPayouts);
router.get("/worker/:workerId", getWorkerPayouts);
router.get("/:id", getPayout);
router.post("/:id/process", triggerProcess);

export default router;
