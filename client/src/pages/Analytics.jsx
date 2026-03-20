import React, { useState, useEffect, useCallback } from "react";
import { fetchAnalytics } from "../api/adminApi.js";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const d = await fetchAnalytics(); setData(d); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="font-mono text-sm text-white/30 animate-pulse">Loading analytics…</div>
    </div>
  );

  if (!data) return null;

  const s = data.summary || {};
  const signals = data.signalFrequency || {};
  const dist = data.riskDistribution || {};
  const tiers = data.riskTierDistribution || {};
  const pm = data.policyMetrics || {};
  const payM = data.payoutMetrics || {};

  const maxSignal = Math.max(...Object.values(signals), 1);
  const totalDist = (dist.low || 0) + (dist.medium || 0) + (dist.high || 0) + (dist.critical || 0) || 1;

  return (
    <div className="min-h-screen pt-20 px-4 md:px-10 pb-12">
      <div className="mb-6">
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">Platform Analytics</p>
        <h1 className="display-text text-4xl md:text-5xl text-white">RISK INTELLIGENCE</h1>
      </div>

      {/* Summary KPIs — 8 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Claims", value: s.totalClaims || 0, accent: "text-white" },
          { label: "Avg Risk Score", value: s.avgRiskScore || 0, accent: s.avgRiskScore > 50 ? "text-signal-red" : "text-signal-green" },
          { label: "Workers Registered", value: s.totalWorkers || 0, accent: "text-electric-blue" },
          { label: "Active Policies", value: s.activePolicies || 0, accent: "text-signal-green" },
          { label: "₹ Premiums", value: `₹${(s.totalPremiumsCollected || 0).toLocaleString()}`, accent: "text-signal-green" },
          { label: "₹ Payouts", value: `₹${(s.totalPayoutsDisbursed || 0).toLocaleString()}`, accent: "text-signal-yellow" },
          { label: "Loss Ratio", value: `${s.lossRatio || 0}%`, accent: (s.lossRatio || 0) > 80 ? "text-signal-red" : "text-signal-green" },
          { label: "Active Triggers", value: s.activeTriggers || 0, accent: s.activeTriggers > 0 ? "text-signal-red animate-pulse" : "text-white/30" },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card rounded-sm p-4 text-center">
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className={`display-text text-2xl ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Signal Frequency */}
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Fraud Signal Frequency</h2>
          {Object.keys(signals).length === 0 ? (
            <p className="font-mono text-[10px] text-white/20">No signals detected yet</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(signals).sort((a, b) => b[1] - a[1]).map(([signal, count]) => (
                <div key={signal}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-white/50 uppercase">{signal.replace(/_/g, " ")}</span>
                    <span className="font-mono text-[10px] text-white/70">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-signal-red/70 rounded-full transition-all duration-700" style={{ width: `${(count / maxSignal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Risk Score Distribution</h2>
          <div className="space-y-3">
            {[
              { label: "Low (<30)", count: dist.low || 0, color: "bg-signal-green/60" },
              { label: "Medium (30–59)", count: dist.medium || 0, color: "bg-signal-yellow/60" },
              { label: "High (60–79)", count: dist.high || 0, color: "bg-orange-500/60" },
              { label: "Critical (80+)", count: dist.critical || 0, color: "bg-signal-red/60" },
            ].map(b => (
              <div key={b.label}>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-[9px] text-white/50">{b.label}</span>
                  <span className="font-mono text-[10px] text-white/70">{b.count} ({Math.round((b.count / totalDist) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full transition-all duration-700`} style={{ width: `${(b.count / totalDist) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Worker Risk Tiers */}
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Worker Risk Tiers</h2>
          <div className="space-y-3">
            {[
              { tier: "LOW", count: tiers.LOW || 0, color: "text-signal-green", bg: "bg-signal-green/15" },
              { tier: "MEDIUM", count: tiers.MEDIUM || 0, color: "text-signal-yellow", bg: "bg-signal-yellow/15" },
              { tier: "HIGH", count: tiers.HIGH || 0, color: "text-signal-red", bg: "bg-signal-red/15" },
            ].map(t => (
              <div key={t.tier} className="flex items-center justify-between p-2 border border-white/6 rounded-sm">
                <span className={`font-mono text-[10px] uppercase ${t.color}`}>{t.tier}</span>
                <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-sm ${t.bg} ${t.color}`}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Metrics */}
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Policy Metrics</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border border-white/6 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Total Policies</span>
              <span className="font-mono text-sm text-white">{pm.total || 0}</span>
            </div>
            <div className="flex justify-between p-2 border border-white/6 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Active</span>
              <span className="font-mono text-sm text-signal-green">{pm.active || 0}</span>
            </div>
            <div className="flex justify-between p-2 border border-white/6 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Avg Premium</span>
              <span className="font-mono text-sm text-white">₹{pm.avgPremium || 0}/wk</span>
            </div>
          </div>
        </div>

        {/* Payout Pipeline */}
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Payout Pipeline</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border border-white/6 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Total Payouts</span>
              <span className="font-mono text-sm text-white">{payM.total || 0}</span>
            </div>
            <div className="flex justify-between p-2 border border-white/6 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Completed</span>
              <span className="font-mono text-sm text-signal-green">{payM.completed || 0}</span>
            </div>
            <div className="flex justify-between p-2 border border-white/6 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Pending</span>
              <span className="font-mono text-sm text-signal-yellow">{payM.pending || 0}</span>
            </div>
            <div className="flex justify-between p-2 border border-signal-green/10 rounded-sm">
              <span className="font-mono text-[10px] text-white/50">Total Disbursed</span>
              <span className="font-mono text-sm text-signal-green font-bold">₹{(payM.totalDisbursed || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Weather + AQI */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Live Weather by Zone</h2>
          <div className="space-y-2">
            {(data.liveWeather || []).map(w => (
              <div key={w.zoneId} className="flex items-center justify-between p-3 border border-white/6 rounded-sm">
                <div>
                  <p className="font-mono text-[10px] text-white/70">{w.label}</p>
                  <p className="font-mono text-[9px] text-white/30">{w.weatherDesc} • {w.source === "OPENWEATHERMAP_LIVE" ? "🔴 LIVE" : "📦 Static"}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-white">{w.temp}°C</p>
                  <p className="font-mono text-[9px] text-white/30">Rain: {w.rainMmPerHr}mm/hr • Wind: {Math.round(w.windSpeed)}km/h</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold ${w.severity >= 4 ? "bg-signal-red/20 text-signal-red" :
                    w.severity >= 2 ? "bg-signal-yellow/20 text-signal-yellow" :
                      "bg-signal-green/20 text-signal-green"
                  }`}>{w.severity}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Air Quality Index</h2>
          <div className="space-y-2">
            {(data.liveAQI || []).map(a => (
              <div key={a.zoneId} className="flex items-center justify-between p-3 border border-white/6 rounded-sm">
                <div>
                  <p className="font-mono text-[10px] text-white/70">{a.zoneId.replace(/ZONE_/g, "").replace(/_/g, " ")}</p>
                  <p className="font-mono text-[9px] text-white/30">{a.source === "OPENWEATHERMAP_LIVE" ? "🔴 LIVE" : "📦 Static"}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[9px] text-white/30">PM2.5: {a.pm25} • PM10: {a.pm10}</p>
                </div>
                <div className={`min-w-12 text-center px-2 py-1 rounded-sm font-mono text-xs font-bold ${a.aqi >= 300 ? "bg-signal-red/20 text-signal-red" :
                    a.aqi >= 150 ? "bg-signal-yellow/20 text-signal-yellow" :
                      "bg-signal-green/20 text-signal-green"
                  }`}>{a.aqi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Risk Claims */}
      {data.topRiskClaims?.length > 0 && (
        <div className="glass-card rounded-sm p-6">
          <h2 className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">Top Risk Claims</h2>
          <div className="space-y-2">
            {data.topRiskClaims.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 border border-white/6 rounded-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-white/20">#{i + 1}</span>
                  <span className="font-mono text-sm text-white/80">{c.workerName}</span>
                  {c.autoGenerated && <span className="font-mono text-[8px] text-electric-blue bg-electric-blue/10 border border-electric-blue/20 px-1 py-0.5 rounded-sm">AUTO</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {(c.fraudSignals || []).map(s => (
                      <span key={s} className="font-mono text-[8px] uppercase px-1.5 py-0.5 bg-signal-red/10 text-signal-red/60 rounded-sm">{s.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm ${c.riskScore >= 80 ? "bg-signal-red/15 text-signal-red" :
                      c.riskScore >= 60 ? "bg-signal-yellow/15 text-signal-yellow" :
                        "bg-signal-green/15 text-signal-green"
                    }`}>{c.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}