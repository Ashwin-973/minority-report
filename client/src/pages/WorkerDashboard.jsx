import React, { useState, useEffect, useRef } from "react";
import ClaimForm from "../components/ClaimForm.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { WORKERS, getMotionState } from "../mock/workers.js";
import { WEATHER_ZONES, SEVERITY_LABELS, SEVERITY_COLORS } from "../mock/weatherZones.js";
import { timeAgo } from "../utils/formatTime.js";

// ── Iridescent floating orb ───────────────────────────────────────────
function IrisOrb({ size, top, left, delay, opacity = 0.6 }) {
  return (
    <div
      className="absolute rounded-full iris-orb pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        opacity,
        animationDelay: delay,
        animation: `float 7s ease-in-out infinite ${delay}`,
        filter: "blur(2px)",
      }}
    />
  );
}

// ── Telemetry stat tile ───────────────────────────────────────────────
function StatTile({ label, value, sub, accent = "text-white", pulse = false }) {
  return (
    <div className="glass-card rounded-sm p-4 border border-white/6">
      <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">{label}</p>
      <div className={`display-text text-3xl ${accent} flex items-end gap-1`} style={{ lineHeight: 1 }}>
        {value}
        {pulse && <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse mb-1" />}
      </div>
      {sub && <p className="font-mono text-[9px] text-white/30 mt-1 uppercase">{sub}</p>}
    </div>
  );
}

// ── Live telemetry feed row ───────────────────────────────────────────
function TelemetryRow({ worker }) {
  const motion = getMotionState(worker.motionScore);
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/4 last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        worker.motionScore > 0.5 ? "bg-signal-green animate-pulse" : "bg-signal-yellow"
      }`} />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-white/70 truncate">{worker.name}</p>
        <p className="font-mono text-[9px] text-white/30">{worker.lat.toFixed(4)}, {worker.lng.toFixed(4)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-mono text-[9px] uppercase ${
          worker.motionScore > 0.5 ? "text-signal-green" : "text-signal-yellow"
        }`}>{motion.label}</p>
        <p className="font-mono text-[9px] text-white/30">{worker.connectivity}</p>
      </div>
    </div>
  );
}

// ── Animated GPS map placeholder ─────────────────────────────────────
function GpsMapPanel({ recentClaim }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;

    // Seed dots from workers
    const dots = WORKERS.map((w, i) => ({
      x: 60 + (w.lng - 80.18) * 1800,
      y: 300 - (w.lat - 13.02) * 1800,
      r: 4,
      alpha: 1,
      ring: 0,
      color: w.motionScore > 0.5 ? "#00ff88" : "#f5c400",
      label: w.name.split(" ")[0],
    }));

    // Cluster attack dot
    dots.push({
      x: 60 + (80.2707 - 80.18) * 1800,
      y: 300 - (13.0827 - 13.02) * 1800,
      r: 7,
      alpha: 1,
      ring: 0,
      color: "#ff2d2d",
      label: "CLUSTER",
    });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Zone rings
      const cx = 60 + (80.2707 - 80.18) * 1800;
      const cy = 300 - (13.0827 - 13.02) * 1800;
      const pulse = Math.sin(t * 0.05) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 30 + pulse * 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,45,45,${0.15 + pulse * 0.2})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(cx, cy, 55 + pulse * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,45,45,${0.06 + pulse * 0.08})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw dots
      dots.forEach((d) => {
        // Glow
        const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        grd.addColorStop(0, d.color + "60");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 9px 'DM Mono', monospace";
        ctx.fillText(d.label, d.x + d.r + 4, d.y + 3);
      });

      // Scan line
      const scanY = (t * 1.2) % canvas.height;
      const scanGrd = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrd.addColorStop(0, "transparent");
      scanGrd.addColorStop(0.5, "rgba(0,255,136,0.08)");
      scanGrd.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrd;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      t++;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="glass-card rounded-sm border border-white/6 overflow-hidden relative">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
          <span className="font-mono text-[9px] text-white/35 uppercase tracking-widest">Live GPS Feed — Chennai Grid</span>
        </div>
        <span className="font-mono text-[9px] text-white/20">4 ACTIVE WORKERS</span>
      </div>
      <canvas
        ref={canvasRef}
        width={460}
        height={220}
        className="w-full"
        style={{ display: "block" }}
      />
      <div className="px-4 pb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-signal-green" />
          <span className="font-mono text-[9px] text-white/35">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-signal-yellow" />
          <span className="font-mono text-[9px] text-white/35">SLOW</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-signal-red" />
          <span className="font-mono text-[9px] text-white/35">CLUSTER</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  const [recentClaim, setRecentClaim] = useState(null);

  const handleClaimSubmitted = (claim) => {
    setRecentClaim(claim);
  };

  // Pick a "current worker" for the live telemetry hero
  const activeWorker = WORKERS[0];
  const activeZone = WEATHER_ZONES[0];

  return (
    <div className="min-h-screen bg-void noise-overlay relative">
      {/* ── Hero section ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 20%, rgba(12,47,232,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(232,23,12,0.12) 0%, transparent 70%), #03040a",
          }}
        />

        {/* Iridescent orbs */}
        <IrisOrb size="320px" top="8%" left="55%" delay="0s" opacity={0.3} />
        <IrisOrb size="180px" top="30%" left="15%" delay="2.5s" opacity={0.2} />
        <IrisOrb size="240px" top="55%" left="72%" delay="1.2s" opacity={0.18} />

        {/* Decorative large text in background */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <span
            className="display-text text-white/[0.025]"
            style={{ fontSize: "clamp(120px, 20vw, 260px)", whiteSpace: "nowrap" }}
          >
            MINORITY CLAIM
          </span>
        </div>

        {/* Top meta bar */}
        <div
          className="absolute top-14 left-0 right-0 flex items-start justify-between px-6 md:px-12 pt-8"
          style={{ zIndex: 2 }}
        >
          <div>
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
              MINORITY CLAIM SYSTEM<br />v2.4 — ACTIVE
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
              PARAMETRIC INSURANCE<br />FRAUD INTELLIGENCE
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
              SCROLL TO SUBMIT<br />A CLAIM
            </p>
          </div>
        </div>

        {/* Hero headline */}
        <div className="relative px-6 md:px-12 pb-16 z-10">
          <div
            className="display-text text-white animate-reveal-up"
            style={{ fontSize: "clamp(64px, 12vw, 160px)", lineHeight: 0.85 }}
          >
            PREDICT
            <br />
            <span className="text-gradient-red-blue italic">FRAUD</span>
            <br />
            BEFORE
            <br />
            <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)", WebkitTextFillColor: "transparent" }}>
              PAYOUT
            </span>
          </div>

          <div className="flex items-end gap-8 mt-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
              <span className="font-mono text-xs text-white/50">5-SIGNAL RISK ENGINE ACTIVE</span>
            </div>
            <div className="h-px flex-1 bg-white/10 max-w-48" />
            <span className="font-mono text-xs text-white/30">GPS · MOTION · WEATHER · CLUSTER · NETWORK</span>
          </div>
        </div>

        {/* Scroll chevron */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce z-10">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
          <span className="font-mono text-[9px] text-white/20">SCROLL</span>
        </div>
      </section>

      {/* ── Marquee ticker ─────────────────────────────────────────────── */}
      <div className="border-t border-b border-white/6 py-3 overflow-hidden relative bg-abyss/50">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-0">
              {["GPS SPOOF DETECTED", "CLUSTER ATTACK INTERCEPTED", "5 SIGNALS ACTIVE", "PRE-CRIME INTELLIGENCE", "PARAMETRIC INSURANCE", "FRAUD RING IDENTIFIED", "MOTION MISMATCH FLAGGED", "WEATHER CORRELATION FAIL"].map((t, j) => (
                <span key={j} className="flex items-center gap-6 mr-6">
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest whitespace-nowrap">{t}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 py-16 relative z-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatTile label="Active Workers" value="4" sub="Chennai Region" accent="text-signal-green" pulse />
          <StatTile label="Weather Severity" value={activeZone.severity} sub={activeZone.label_sev} accent="text-signal-yellow" />
          <StatTile
            label="Connectivity"
            value={activeWorker.connectivity}
            sub="Primary network"
            accent="text-white/80"
          />
          <StatTile
            label="Motion Index"
            value={`${(activeWorker.motionScore * 100).toFixed(0)}%`}
            sub={getMotionState(activeWorker.motionScore).label}
            accent="text-signal-green"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — telemetry + map */}
          <div className="flex flex-col gap-6">
            {/* Section label */}
            <div className="flex items-center gap-3">
              <span className="display-text text-white/30 text-xs tracking-widest">01</span>
              <div className="h-px flex-1 bg-white/8" />
              <span className="display-text text-white text-xl">LIVE TELEMETRY</span>
            </div>

            {/* GPS Map */}
            <GpsMapPanel />

            {/* Worker list */}
            <div className="glass-card rounded-sm border border-white/6 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[9px] text-white/35 uppercase tracking-widest">Field Workers</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
                  <span className="font-mono text-[9px] text-white/35">LIVE</span>
                </div>
              </div>
              {WORKERS.map((w) => (
                <TelemetryRow key={w.id} worker={w} />
              ))}
            </div>

            {/* Weather zones */}
            <div className="glass-card rounded-sm border border-white/6 p-5">
              <p className="font-mono text-[9px] text-white/35 uppercase tracking-widest mb-4">Zone Weather Status</p>
              <div className="grid grid-cols-2 gap-3">
                {WEATHER_ZONES.map((z) => (
                  <div key={z.id} className="border border-white/6 rounded-sm p-3">
                    <p className="font-mono text-[9px] text-white/30 mb-1">{z.label}</p>
                    <p className={`font-mono text-xs font-500 uppercase ${SEVERITY_COLORS[z.severity]}`}>
                      {z.label_sev}
                    </p>
                    <div className="flex gap-0.5 mt-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full ${
                            i < z.severity ? (z.severity >= 4 ? "bg-signal-red" : z.severity >= 3 ? "bg-signal-yellow" : "bg-blue-400") : "bg-white/8"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — claim form */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="display-text text-white/30 text-xs tracking-widest">02</span>
              <div className="h-px flex-1 bg-white/8" />
              <span className="display-text text-white text-xl">CLAIM PORTAL</span>
            </div>

            <ClaimForm onClaimSubmitted={handleClaimSubmitted} />

            {/* Recent claim result ticker */}
            {recentClaim && (
              <div className="glass-card border border-white/6 rounded-sm p-4 animate-reveal-up">
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">Latest Submission</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="display-text text-white text-xl">{recentClaim.workerName}</p>
                    <p className="font-mono text-[9px] text-white/30 mt-0.5">{timeAgo(recentClaim.submittedAt)}</p>
                  </div>
                  <RiskBadge
                    score={recentClaim.riskResult?.riskScore}
                    status={recentClaim.riskResult?.claimStatus}
                    size="lg"
                  />
                </div>
              </div>
            )}

            {/* Intelligence explainer cards */}
            <div>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">Signal Pipeline</p>
              <div className="space-y-2">
                {[
                  { n: "01", name: "GPS SPOOF DETECTOR", desc: "Haversine teleport analysis, static coordinates, repeat location check", w: "30%" },
                  { n: "02", name: "MOTION CONSISTENCY", desc: "Accelerometer vs GPS displacement cross-analysis", w: "20%" },
                  { n: "03", name: "WEATHER CORRELATION", desc: "Claimed severity vs zone historical records", w: "20%" },
                  { n: "04", name: "PEER CLUSTER", desc: "50m radius coordinated fraud ring detection", w: "20%" },
                  { n: "05", name: "NETWORK SIGNATURE", desc: "Shared IP/WiFi fingerprint clustering", w: "10%" },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3 p-3 border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                    <span className="font-mono text-[9px] text-white/20 pt-0.5 shrink-0">{s.n}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">{s.name}</span>
                        <span className="font-mono text-[9px] text-white/25 shrink-0">WT {s.w}</span>
                      </div>
                      <p className="font-mono text-[9px] text-white/30 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}