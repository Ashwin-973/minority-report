// server/src/routes/policyRoutes.js
import { Router } from "express";
import { createPolicy, listPolicies, getWorkerPolicies, getPolicy, renewPolicy } from "../controllers/policyController.js";

const router = Router();

router.post("/", createPolicy);
router.get("/", listPolicies);
router.get("/worker/:workerId", getWorkerPolicies);
router.get("/:id", getPolicy);
router.post("/:id/renew", renewPolicy);

export default router;
