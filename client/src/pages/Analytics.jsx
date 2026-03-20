import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchAnalytics } from "../api/adminApi.js";
import FraudClusterCard from "../components/FraudClusterCard.jsx";
import { SEVERITY_LABELS } from "../mock/weatherZones.js";

// ── Signal bar chart ──────────────────────────────────────────────────
function SignalBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-white/4 last:border-0">
      <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider w-40 shrink-0">
        {label.replace(/_/g, " ")}
      </span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-white/50 w-6 text-right">{value}</span>
    </div>
  );
}

// ── Distribution donut ────────────────────────────────────────────────
function DistributionDonut({ distribution }) {
  const canvasRef = useRef(null);
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 70;
    const ir = 46;

    const segments = [
      { key: "low", label: "Low", color: "#00ff88", value: distribution.low },
      { key: "medium", label: "Review", color: "#f5c400", value: distribution.medium },
      { key: "high", label: "High", color: "#fb923c", value: distribution.high },
      { key: "critical", label: "Critical", color: "#ff2d2d", value: distribution.critical },
    ].filter((s) => s.value > 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;
    segments.forEach((seg, i) => {
      const sweep = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Subtle gap
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, ir - 1, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = "#03040a";
      ctx.globalAlpha = 1;
      ctx.fill();

      // Glow on critical
      if (seg.key === "critical" && seg.value > 0) {
        ctx.save();
        ctx.shadowColor = "#ff2d2d";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 2, startAngle, startAngle + sweep);
        ctx.arc(cx, cy, ir + 2, startAngle + sweep, startAngle, true);
        ctx.closePath();
        ctx.strokeStyle = "rgba(255,45,45,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      startAngle += sweep;
    });

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, ir, 0, Math.PI * 2);
    ctx.fillStyle = "#03040a";
    ctx.globalAlpha = 1;
    ctx.fill();

    // Center text
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "bold 22px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 6);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "9px 'DM Mono', monospace";
    ctx.fillText("TOTAL", cx, cy + 12);
  }, [distribution, total]);

  const segments = [
    { label: "Low Risk", color: "bg-signal-green", key: "low" },
    { label: "Medium Risk", color: "bg-signal-yellow", key: "medium" },
    { label: "High Risk", color: "bg-orange-400", key: "high" },
    { label: "Critical", color: "bg-signal-red", key: "critical" },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas ref={canvasRef} width={180} height={180} />
      <div className="w-full space-y-2">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="font-mono text-[9px] text-white/40 uppercase">{s.label}</span>
            </div>
            <span className="font-mono text-[10px] text-white/60">{distribution[s.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Weather zone card ──────────────────────────────────────────────────
function WeatherZoneCard({ zone }) {
  const sev = zone.currentSeverity;
  const color = sev >= 4 ? "text-signal-red" : sev >= 3 ? "text-signal-yellow" : sev >= 2 ? "text-blue-400" : "text-white/50";
  return (
    <div className="glass-card border border-white/6 rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">{zone.label}</span>
        <span className={`font-mono text-[9px] uppercase ${color}`}>{SEVERITY_LABELS[sev] || "UNKNOWN"}</span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {(zone.history || []).map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <div
              className={`rounded-sm transition-all ${
                h.severity >= 4 ? "bg-signal-red" : h.severity >= 3 ? "bg-signal-yellow" : h.severity >= 2 ? "bg-blue-400" : "bg-white/15"
              }`}
              style={{ height: `${Math.max(4, (h.severity / 5) * 40)}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-[8px] text-white/20">-6h</span>
        <span className="font-mono text-[8px] text-white/20">NOW</span>
      </div>
    </div>
  );
}

// ── Top risk claim row ────────────────────────────────────────────────
function TopRiskRow({ claim, rank }) {
  const isFlagged = claim.claimStatus === "FLAGGED";
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/4 last:border-0">
      <span className="font-mono text-[10px] text-white/20 w-4">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-white/70 truncate">{claim.workerName}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {(claim.fraudSignals || []).slice(0, 3).map((s) => (
            <span key={s} className="font-mono text-[8px] text-signal-red/60 uppercase">{s.replace(/_/g, " ")}</span>
          ))}
        </div>
      </div>
      <div
        className={`font-mono text-lg font-bold ${
          isFlagged ? "text-signal-red" : claim.claimStatus === "MANUAL_REVIEW" ? "text-signal-yellow" : "text-signal-green"
        }`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
      >
        {claim.riskScore}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await fetchAnalytics();
      setData(d);
    } catch (e) {
      console.error("Analytics load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const signalFreq = data?.signalFrequency || {};
  const maxSignalCount = Math.max(...Object.values(signalFreq), 1);
  const SIGNAL_COLORS = {
    GPS_TELEPORT: "bg-signal-red",
    GPS_STATIC_SPOOF: "bg-red-400",
    MOTION_MISMATCH: "bg-signal-yellow",
    WEATHER_MISMATCH: "bg-blue-400",
    PEER_CLUSTER_ATTACK: "bg-orange-400",
    NETWORK_CLUSTER: "bg-purple-400",
    REPEATED_LOCATION: "bg-pink-400",
    IMPOSSIBLE_ROUTE: "bg-red-300",
  };

  return (
    <div className="min-h-screen bg-void noise-overlay relative">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 60% at 80% 0%, rgba(232,23,12,0.10) 0%, transparent 65%), radial-gradient(ellipse 80% 50% at 10% 100%, rgba(12,47,232,0.08) 0%, transparent 60%), #03040a",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="display-text text-white/[0.015] select-none"
            style={{ fontSize: "clamp(70px,13vw,190px)", whiteSpace: "nowrap" }}
          >
            SIGNAL INTELLIGENCE
          </span>
        </div>
        <div className="relative px-6 md:px-12 z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse" />
            <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">Fraud Analytics Engine</span>
          </div>
          <h1
            className="display-text text-white"
            style={{ fontSize: "clamp(48px, 8vw, 100px)", lineHeight: 0.88 }}
          >
            SIGNAL<br />
            <span className="text-gradient-red-blue">ANALYTICS</span>
          </h1>
        </div>
      </section>

      <div className="sep" />

      <div className="px-6 md:px-12 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Processing intelligence data…</span>
          </div>
        ) : (
          <>
            {/* ── Summary KPIs ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: "Total Claims", value: data?.summary?.totalClaims || 0, color: "text-white" },
                { label: "Cluster Groups", value: data?.summary?.clusterCount || 0, color: "text-signal-red" },
                { label: "Avg Risk Score", value: data?.summary?.avgRiskScore || 0, color: (data?.summary?.avgRiskScore || 0) > 60 ? "text-signal-red" : "text-signal-yellow" },
                { label: "Liquidity Saved", value: `₹${((data?.summary?.savedLiquidityINR || 0)).toLocaleString("en-IN")}`, color: "text-signal-green" },
              ].map((k) => (
                <div key={k.label} className="glass-card rounded-sm border border-white/6 p-5">
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">{k.label}</p>
                  <p className={`display-text ${k.color}`} style={{ fontSize: "clamp(28px,3.5vw,44px)", lineHeight: 1 }}>
                    {k.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Main 2-col layout ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Signal breakdown — 2 cols wide */}
              <div className="lg:col-span-2 glass-card border border-white/6 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="display-text text-white/30 text-xs tracking-widest">01</span>
                  <div className="h-px flex-1 bg-white/6" />
                  <span className="display-text text-white text-xl">SIGNAL FREQUENCY</span>
                </div>
                {Object.keys(signalFreq).length === 0 ? (
                  <p className="font-mono text-[10px] text-white/20 text-center py-12">No fraud signals detected yet</p>
                ) : (
                  <div>
                    {Object.entries(signalFreq)
                      .sort((a, b) => b[1] - a[1])
                      .map(([key, val]) => (
                        <SignalBar
                          key={key}
                          label={key}
                          value={val}
                          max={maxSignalCount}
                          color={SIGNAL_COLORS[key] || "bg-white/40"}
                        />
                      ))}
                  </div>
                )}

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-white/6">
                  <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-3">Signal Descriptions</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      { key: "GPS_TELEPORT", desc: "Device jumped impossible distance" },
                      { key: "MOTION_MISMATCH", desc: "Accelerometer vs GPS inconsistency" },
                      { key: "WEATHER_MISMATCH", desc: "Severity claim vs zone history" },
                      { key: "PEER_CLUSTER_ATTACK", desc: "Coordinated ring within 50m" },
                      { key: "NETWORK_CLUSTER", desc: "Shared WiFi/IP fingerprint" },
                    ].map((s) => (
                      <div key={s.key} className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${SIGNAL_COLORS[s.key] || "bg-white/30"}`} />
                        <div>
                          <p className="font-mono text-[9px] text-white/50 uppercase">{s.key.replace(/_/g, " ")}</p>
                          <p className="font-mono text-[8px] text-white/25">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk distribution donut — 1 col */}
              <div className="glass-card border border-white/6 rounded-sm p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="display-text text-white/30 text-xs tracking-widest">02</span>
                  <div className="h-px flex-1 bg-white/6" />
                  <span className="display-text text-white text-xl">DISTRIBUTION</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  {data?.riskDistribution && (
                    <DistributionDonut distribution={data.riskDistribution} />
                  )}
                </div>

                {/* Liquidity risk meter */}
                <div className="mt-6 pt-4 border-t border-white/6">
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">Liquidity Risk</p>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ((data?.summary?.liquidityRiskINR || 0) / 100000) * 100)}%`,
                        background: "linear-gradient(90deg, #f5c400, #ff2d2d)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-mono text-[8px] text-white/20">₹0</span>
                    <span className="font-mono text-[9px] text-signal-red">
                      ₹{(data?.summary?.liquidityRiskINR || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="font-mono text-[8px] text-white/20">₹1L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Top risk claims ────────────────────────────────────── */}
            {data?.topRiskClaims?.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="glass-card border border-white/6 rounded-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="display-text text-white/30 text-xs tracking-widest">03</span>
                    <div className="h-px flex-1 bg-white/6" />
                    <span className="display-text text-white text-xl">TOP RISK CLAIMS</span>
                  </div>
                  {data.topRiskClaims.map((claim, i) => (
                    <TopRiskRow key={claim.id} claim={claim} rank={i + 1} />
                  ))}
                </div>

                {/* Weather zone status */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="display-text text-white/30 text-xs tracking-widest">04</span>
                    <div className="h-px flex-1 bg-white/6" />
                    <span className="display-text text-white text-xl">WEATHER ZONES</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(data?.weatherZones || []).map((z) => (
                      <WeatherZoneCard key={z.id} zone={z} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Cluster cards ──────────────────────────────────────── */}
            {data?.clusters?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="display-text text-white/30 text-xs tracking-widest">05</span>
                  <div className="h-px flex-1 bg-white/6" />
                  <span className="display-text text-white text-xl">FRAUD CLUSTER MAP</span>
                  <span className="font-mono text-[10px] text-signal-red/60 border border-signal-red/25 px-2 py-0.5 rounded-sm">
                    {data.clusters.length} ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.clusters.map((c) => (
                    <FraudClusterCard key={c.id} cluster={c} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Intelligence footer ────────────────────────────────── */}
            <div className="mt-16 pt-8 border-t border-white/6">
              <div className="flex items-start justify-between flex-wrap gap-8">
                <div className="max-w-sm">
                  <h3 className="display-text text-white text-3xl mb-3">
                    STOP FRAUD<br />
                    <span className="text-gradient-red-blue">BEFORE PAYOUT</span>
                  </h3>
                  <p className="font-body text-sm text-white/35 leading-relaxed">
                    The Minority Report risk engine analyses 5 independent signals in real-time, combining GPS physics, device telemetry, weather data, and network forensics into a single fraud score before any payout is authorised.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Signal Weight GPS", val: "30%" },
                    { label: "Signal Weight Cluster", val: "20%" },
                    { label: "Cluster Radius", val: "50m" },
                    { label: "Teleport Threshold", val: "200 km/h" },
                    { label: "Auto-flag Threshold", val: "Score ≥ 80" },
                    { label: "Review Threshold", val: "Score ≥ 30" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="font-mono text-[8px] text-white/20 uppercase tracking-wider">{s.label}</p>
                      <p className="font-mono text-sm text-white/60 mt-0.5">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}