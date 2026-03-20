// server/src/routes/premiumRoutes.js
import { Router } from "express";
import { calcPremium } from "../controllers/premiumController.js";

const router = Router();

router.post("/calculate", calcPremium);

export default router;
