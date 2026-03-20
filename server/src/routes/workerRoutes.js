// server/src/routes/workerRoutes.js
import { Router } from "express";
import { registerWorker, listWorkers, getWorker, getWorkerDashboard } from "../controllers/workerController.js";

const router = Router();

router.post("/register", registerWorker);
router.get("/", listWorkers);
router.get("/:id", getWorker);
router.get("/:id/dashboard", getWorkerDashboard);

export default router;
