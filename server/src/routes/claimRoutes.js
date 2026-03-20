// server/src/routes/claimRoutes.js

import { Router } from "express";
import { submitClaim, getClaimById } from "../controllers/claimController.js";

const router = Router();

router.post("/", submitClaim);
router.get("/:id", getClaimById);

export default router;