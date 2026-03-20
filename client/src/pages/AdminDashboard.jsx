import React, { useState, useEffect, useCallback } from "react";
import { fetchAllClaims, fetchClusters } from "../api/adminApi.js";
import ClaimCard from "../components/ClaimCard.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import FraudClusterCard from "../components/FraudClusterCard.jsx";
import { timeAgo } from "../utils/formatTime.js";

// ── Big stat number ────────────────────────────────────────────────────
function KpiCard({ label, value, accent, sub, blink }) {
  return (
    <div className="glass-card rounded-sm border border-white/6 p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${
            accent === "red" ? "#ff2d2d" : accent === "yellow" ? "#f5c400" : accent === "green" ? "#00ff88" : "#0c2fe8"
          }, transparent)`,
        }}
      />
      <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2 relative z-10">{label}</p>
      <div
        className={`display-text relative z-10 ${
          accent === "red" ? "text-signal-red" : accent === "yellow" ? "text-signal-yellow" : accent === "green" ? "text-signal-green" : "text-white"
        } ${blink ? "animate-flicker" : ""}`}
        style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && <p className="font-mono text-[9px] text-white/25 mt-1 uppercase relative z-10">{sub}</p>}
    </div>
  );
}

// ── Filter pill ────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-all duration-200 ${
        active
          ? color === "red"
            ? "bg-signal-red/15 border-signal-red/50 text-signal-red"
            : color === "yellow"
            ? "bg-signal-yellow/15 border-signal-yellow/50 text-signal-yellow"
            : color === "green"
            ? "bg-signal-green/15 border-signal-green/50 text-signal-green"
            : "bg-white/10 border-white/30 text-white"
          : "bg-transparent border-white/10 text-white/35 hover:border-white/25 hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("TIME");
  const [refreshAt, setRefreshAt] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const [claimsData, clusterData] = await Promise.all([
        fetchAllClaims(),
        fetchClusters(),
      ]);
      setData(claimsData);
      setClusters(clusterData.clusters || []);
    } catch (e) {
      console.error("Admin load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshAt]);

  // Auto-refresh every 15s
  useEffect(() => {
    const id = setInterval(() => setRefreshAt(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const filteredClaims = (data?.claims || []).filter((c) => {
    if (filter === "ALL") return true;
    return c.riskResult?.claimStatus === filter;
  }).sort((a, b) => {
    if (sortBy === "RISK") return (b.riskResult?.riskScore || 0) - (a.riskResult?.riskScore || 0);
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  return (
    <div className="min-h-screen bg-void noise-overlay relative">
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% -10%, rgba(12,47,232,0.12) 0%, transparent 70%), #03040a",
          }}
        />
        {/* Ghost headline */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="display-text text-white/[0.018] select-none"
            style={{ fontSize: "clamp(80px,14vw,200px)", whiteSpace: "nowrap" }}
          >
            ADMIN CONTROL
          </span>
        </div>

        <div className="relative px-6 md:px-12 z-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse" />
                <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">Intelligence Command</span>
              </div>
              <h1 className="display-text text-white" style={{ fontSize: "clamp(48px, 8vw, 100px)", lineHeight: 0.88 }}>
                ADMIN<br />
                <span className="text-gradient-red-blue">DASHBOARD</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => { setLoading(true); setRefreshAt(Date.now()); }}
                className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-white/15 rounded-sm hover:border-white/35 transition-colors text-white/50 hover:text-white/80"
              >
                ↻ REFRESH
              </button>
              <div className="font-mono text-[10px] text-white/25 uppercase">
                Last: {timeAgo(new Date(refreshAt).toISOString())}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sep" />

      <div className="px-6 md:px-12 py-10">
        {/* ── KPI row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <KpiCard
            label="Total Claims"
            value={loading ? "…" : data?.total || 0}
            accent="blue"
            sub="All time"
          />
          <KpiCard
            label="Flagged"
            value={loading ? "…" : data?.flagged || 0}
            accent="red"
            sub="High risk"
            blink={(data?.flagged || 0) > 0}
          />
          <KpiCard
            label="Manual Review"
            value={loading ? "…" : data?.manual || 0}
            accent="yellow"
            sub="Borderline"
          />
          <KpiCard
            label="Approved"
            value={loading ? "…" : data?.approved || 0}
            accent="green"
            sub="Low risk"
          />
        </div>

        {/* ── Cluster alert strip ──────────────────────────────────────── */}
        {clusters.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
              <span className="display-text text-signal-red text-2xl tracking-wider">ACTIVE FRAUD CLUSTERS</span>
              <span className="font-mono text-[10px] text-signal-red/60 border border-signal-red/30 px-2 py-0.5 rounded-sm">
                {clusters.length} DETECTED
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clusters.map((c) => (
                <FraudClusterCard key={c.id} cluster={c} />
              ))}
            </div>
          </div>
        )}

        <div className="sep mb-8" />

        {/* ── Claims table header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="display-text text-white/30 text-xs tracking-widest">03</span>
            <div className="h-px w-8 bg-white/8" />
            <span className="display-text text-white text-2xl">ALL CLAIMS</span>
            {!loading && (
              <span className="font-mono text-[10px] text-white/25">
                ({filteredClaims.length} SHOWING)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filters */}
            <FilterPill label="ALL" active={filter === "ALL"} onClick={() => setFilter("ALL")} color="default" />
            <FilterPill label="FLAGGED" active={filter === "FLAGGED"} onClick={() => setFilter("FLAGGED")} color="red" />
            <FilterPill label="REVIEW" active={filter === "MANUAL_REVIEW"} onClick={() => setFilter("MANUAL_REVIEW")} color="yellow" />
            <FilterPill label="APPROVED" active={filter === "APPROVED"} onClick={() => setFilter("APPROVED")} color="green" />
            <div className="w-px h-5 bg-white/10 mx-1" />
            {/* Sort */}
            <FilterPill label="SORT: TIME" active={sortBy === "TIME"} onClick={() => setSortBy("TIME")} color="default" />
            <FilterPill label="SORT: RISK" active={sortBy === "RISK"} onClick={() => setSortBy("RISK")} color="default" />
          </div>
        </div>

        {/* ── Claims grid ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Loading intelligence data…</span>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <span className="display-text text-white/15 text-6xl mb-3">CLEAR</span>
            <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">No claims match this filter</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClaims.map((claim, i) => (
              <ClaimCard key={claim.id} claim={claim} index={i} />
            ))}
          </div>
        )}

        {/* ── Liquidity risk footer ────────────────────────────────────── */}
        {data && (
          <div className="mt-12 border border-white/6 rounded-sm p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: "linear-gradient(135deg, rgba(232,23,12,0.05) 0%, rgba(12,47,232,0.05) 100%)" }}
            />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
              <div>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Total Liquidity At Risk</p>
                <p className="display-text text-signal-red" style={{ fontSize: "clamp(28px,4vw,48px)" }}>
                  ₹{((data.flagged + data.manual) * 5000).toLocaleString("en-IN")}
                </p>
                <p className="font-mono text-[9px] text-white/25 mt-1">Based on ₹5,000 avg payout × flagged + review claims</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Intercepted (Saved)</p>
                <p className="display-text text-signal-green" style={{ fontSize: "clamp(28px,4vw,48px)" }}>
                  ₹{(data.flagged * 5000).toLocaleString("en-IN")}
                </p>
                <p className="font-mono text-[9px] text-white/25 mt-1">From {data.flagged} auto-flagged claims</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">System Accuracy</p>
                <p className="display-text text-white" style={{ fontSize: "clamp(28px,4vw,48px)" }}>
                  {data.total > 0 ? Math.round(((data.flagged + data.approved) / data.total) * 100) : 0}%
                </p>
                <p className="font-mono text-[9px] text-white/25 mt-1">Definitive decisions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}