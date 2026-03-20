// server/src/index.js

import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { requestLogger } from "./middleware/requestLogger.js";
import claimRoutes from "./routes/claimRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import premiumRoutes from "./routes/premiumRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import triggerRoutes from "./routes/triggerRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import { checkAllTriggers } from "./services/triggerMonitor.js";
import { fetchAllZonesWeather } from "./services/weatherService.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/premiums", premiumRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/triggers", triggerRoutes);
app.use("/api/payouts", payoutRoutes);

// ── Health check ──────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "minority-report-server",
    timestamp: new Date().toISOString(),
    weatherApiConfigured: !!process.env.OPENWEATHERMAP_API_KEY,
  });
});

// ── 404 handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("\x1b[31m[ERROR]\x1b[0m", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\x1b[36m");
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║       MINORITY REPORT — Risk Engine API       ║");
  console.log(`║       Listening on http://localhost:${PORT}      ║`);
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\x1b[0m");
  console.log("  Routes:");
  console.log("  POST  /api/claims");
  console.log("  GET   /api/admin/claims");
  console.log("  GET   /api/admin/clusters");
  console.log("  GET   /api/admin/analytics");
  console.log("  POST  /api/workers/register");
  console.log("  GET   /api/workers");
  console.log("  GET   /api/workers/:id/dashboard");
  console.log("  POST  /api/premiums/calculate");
  console.log("  POST  /api/policies");
  console.log("  GET   /api/policies");
  console.log("  POST  /api/triggers/simulate");
  console.log("  POST  /api/triggers/check");
  console.log("  GET   /api/payouts");
  console.log("  GET   /api/health");
  console.log("");

  // ── Cron: check parametric triggers every 5 minutes ───────────────
  cron.schedule("*/5 * * * *", async () => {
    console.log("\x1b[33m[CRON]\x1b[0m Checking parametric triggers...");
    try {
      const triggered = await checkAllTriggers();
      if (triggered.length > 0) {
        console.log(`\x1b[33m[CRON]\x1b[0m ${triggered.length} new trigger(s) detected!`);
      }
    } catch (err) {
      console.error("\x1b[31m[CRON ERROR]\x1b[0m", err.message);
    }
  });

  // Initial weather fetch on boot
  fetchAllZonesWeather().then(() => {
    console.log("\x1b[32m[BOOT]\x1b[0m Initial weather data loaded");
  }).catch(() => {
    console.log("\x1b[33m[BOOT]\x1b[0m Weather API not configured — using fallback data");
  });
});

export default app;