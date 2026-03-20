// server/src/index.js

import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import claimRoutes from "./routes/claimRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ──────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "minority-report-server",
    timestamp: new Date().toISOString(),
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
  console.log("  GET   /api/health");
  console.log("");
});

export default app;