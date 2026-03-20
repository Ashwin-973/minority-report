// server/src/routes/adminRoutes.js

import { Router } from "express";
import {
  listAllClaims,
  getClusters,
  getAnalytics,
} from "../controllers/adminController.js";

const router = Router();

router.get("/claims", listAllClaims);
router.get("/clusters", getClusters);
router.get("/analytics", getAnalytics);

export default router;