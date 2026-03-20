import React, { useState, useEffect, useRef, useCallback } from "react";
import ClaimForm from "../components/ClaimForm.jsx";
import { listWorkers, getWorkerDashboard } from "../api/workerApi.js";

export default function WorkerDashboard() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  // Load workers list
  useEffect(() => {
    listWorkers().then((res) => {
      setWorkers(res.workers || []);
      if (res.workers?.length > 0) setSelectedWorkerId(res.workers[0].id);
    }).catch(() => { });
  }, []);

  // Load dashboard when worker changes
  const loadDashboard = useCallback(async () => {
    if (!selectedWorkerId) return;
    setLoading(true);
    try {
      const data = await getWorkerDashboard(selectedWorkerId);
      setDashboard(data);
    } catch { setDashboard(null); }
    finally { setLoading(false); }
  }, [selectedWorkerId]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // Canvas map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#03040a";
    ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Zone labels
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "9px monospace";
    ctx.fillText("SOUTH CHENNAI", 30, 220); ctx.fillText("CENTRAL CHENNAI", 160, 100);
    ctx.fillText("NORTH CHENNAI", 260, 50); ctx.fillText("WEST CHENNAI", 60, 120);
    // Worker dots
    const workerDots = [
      { x: 140, y: 200, id: "W001" }, { x: 200, y: 110, id: "W002" },
      { x: 280, y: 60, id: "W008" }, { x: 90, y: 130, id: "W009" },
      { x: 120, y: 210, id: "W015" },
    ];
    workerDots.forEach((w) => {
      const isSelected = w.id === selectedWorkerId;
      ctx.beginPath(); ctx.arc(w.x, w.y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#00ff88" : "rgba(0,255,136,0.4)";
      ctx.fill();
      if (isSelected) {
        ctx.beginPath(); ctx.arc(w.x, w.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,136,0.3)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#00ff88"; ctx.font = "bold 8px monospace";
        ctx.fillText(w.id, w.x + 10, w.y - 8);
      }
    });
  }, [selectedWorkerId]);

  const riskColor = (tier) => tier === "HIGH" ? "text-signal-red" : tier === "LOW" ? "text-signal-green" : "text-signal-yellow";

  return (
    <div className="min-h-screen pt-20 px-4 md:px-10 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">Worker Dashboard</p>
          <h1 className="display-text text-4xl md:text-5xl text-white">MY COVERAGE</h1>
        </div>
        {/* Worker Selector */}
        <div className="flex items-center gap-3">
          <label className="font-mono text-[9px] text-white/30 uppercase">Worker:</label>
          <select className="bg-void/80 border border-white/10 rounded-sm px-3 py-1.5 font-mono text-sm text-white/80 focus:outline-none focus:border-white/30"
            value={selectedWorkerId} onChange={e => setSelectedWorkerId(e.target.value)}>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id})</option>)}
          </select>
        </div>
      </div>

      {dashboard && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Risk Tier", value: dashboard.worker?.riskProfile?.riskTier || "—", accent: riskColor(dashboard.worker?.riskProfile?.riskTier) },
              { label: "Active Coverage", value: dashboard.stats?.activeCoverage ? `₹${dashboard.stats.activeCoverage.toLocaleString()}` : "None", accent: "text-signal-green" },
              { label: "Weekly Premium", value: dashboard.stats?.currentPremium ? `₹${dashboard.stats.currentPremium}` : "—", accent: "text-electric-blue" },
              { label: "Earnings Protected", value: `₹${dashboard.stats?.totalEarningsProtected?.toLocaleString() || 0}`, accent: "text-white" },
              { label: "Total Claims", value: dashboard.stats?.totalClaims || 0, accent: "text-white" },
            ].map(kpi => (
              <div key={kpi.label} className="glass-card rounded-sm p-3 text-center">
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className={`display-text text-xl ${kpi.accent}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Active Policy Card */}
          {dashboard.activePolicy && (
            <div className="glass-card rounded-sm p-5 mb-6 border border-signal-green/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                  <span className="font-mono text-[10px] text-signal-green uppercase tracking-widest">Active Policy</span>
                </div>
                <span className="font-mono text-[9px] text-white/30">
                  {new Date(dashboard.activePolicy.weekStart).toLocaleDateString()} — {new Date(dashboard.activePolicy.weekEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Premium</p>
                  <p className="display-text text-2xl text-white">₹{dashboard.activePolicy.premiumINR}/wk</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Max Coverage</p>
                  <p className="display-text text-2xl text-signal-green">₹{dashboard.activePolicy.coverageAmountINR?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Claims This Week</p>
                  <p className="display-text text-2xl text-white">{dashboard.activePolicy.claimsCount}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-mono text-[9px] text-white/20">Covers: Heat · Rain · Flood · AQI · Curfew · Strike · Closure · Outage</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Map + Recent Claims */}
        <div className="space-y-6">
          <div className="glass-card rounded-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
              <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">GPS Coverage Map</span>
            </div>
            <canvas ref={canvasRef} width={380} height={260} className="w-full rounded-sm border border-white/5" />
          </div>

          {/* Recent Payouts */}
          {dashboard?.payouts?.length > 0 && (
            <div className="glass-card rounded-sm p-5">
              <h3 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">Recent Payouts</h3>
              <div className="space-y-2">
                {dashboard.payouts.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 border border-white/6 rounded-sm">
                    <div>
                      <p className="font-mono text-[10px] text-white/60">{p.triggerDescription}</p>
                      <p className="font-mono text-[8px] text-white/25">{new Date(p.initiatedAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-signal-green">₹{p.amountINR?.toLocaleString()}</p>
                      <span className={`font-mono text-[8px] uppercase ${p.status === "COMPLETED" ? "text-signal-green" : "text-signal-yellow"}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Claim Form */}
        <div>
          <ClaimForm onClaimSubmitted={loadDashboard} />
        </div>
      </div>
    </div>
  );
}