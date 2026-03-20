import React, { useState, useEffect, useCallback } from "react";
import { listWorkers } from "../api/workerApi.js";
import { calculatePremium, createPolicy, listPolicies, renewPolicy, simulateTrigger, fetchTriggers, fetchPayouts } from "../api/policyApi.js";

const TRIGGER_TYPES = [
    { id: "HEAVY_RAIN", label: "Heavy Rain", icon: "🌧️" },
    { id: "EXTREME_HEAT", label: "Extreme Heat", icon: "🔥" },
    { id: "FLOOD", label: "Flood", icon: "🌊" },
    { id: "HIGH_AQI", label: "High AQI", icon: "😷" },
    { id: "CURFEW", label: "Curfew", icon: "🚫" },
    { id: "STRIKE", label: "Strike", icon: "✊" },
    { id: "ZONE_CLOSURE", label: "Zone Closure", icon: "🔒" },
    { id: "APP_OUTAGE", label: "App Outage", icon: "📱" },
];

const ZONES = [
    { id: "ZONE_SOUTH_CHENNAI", label: "South Chennai" },
    { id: "ZONE_CENTRAL_CHENNAI", label: "Central Chennai" },
    { id: "ZONE_NORTH_CHENNAI", label: "North Chennai" },
    { id: "ZONE_WEST_CHENNAI", label: "West Chennai" },
];

export default function PolicyDashboard() {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");
    const [premium, setPremium] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [triggers, setTriggers] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // Simulation state
    const [simZone, setSimZone] = useState("ZONE_SOUTH_CHENNAI");
    const [simTrigger, setSimTrigger] = useState("HEAVY_RAIN");
    const [simResult, setSimResult] = useState(null);

    const load = useCallback(async () => {
        try {
            const [w, p, t, pay] = await Promise.all([
                listWorkers(), listPolicies(), fetchTriggers(), fetchPayouts(),
            ]);
            setWorkers(w.workers || []);
            setPolicies(p.policies || []);
            setTriggers(t.events || []);
            setPayouts(pay.payouts || []);
        } catch { }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCalcPremium = async () => {
        if (!selectedWorker) return;
        setLoading(true);
        try {
            const res = await calculatePremium({ workerId: selectedWorker });
            setPremium(res.premium);
        } catch (err) { setMsg({ type: "error", text: err.response?.data?.error || err.message }); }
        finally { setLoading(false); }
    };

    const handleBuyPolicy = async () => {
        if (!selectedWorker) return;
        setLoading(true); setMsg(null);
        try {
            await createPolicy(selectedWorker);
            setMsg({ type: "success", text: "Policy purchased successfully!" });
            await load();
        } catch (err) { setMsg({ type: "error", text: err.response?.data?.error || err.message }); }
        finally { setLoading(false); }
    };

    const handleSimulate = async () => {
        setLoading(true); setSimResult(null); setMsg(null);
        try {
            const res = await simulateTrigger(simZone, simTrigger);
            setSimResult(res);
            setMsg({ type: "success", text: res.message });
            setTimeout(load, 3000); // Reload after payouts process
        } catch (err) { setMsg({ type: "error", text: err.response?.data?.error || err.message }); }
        finally { setLoading(false); }
    };

    const activePolicies = policies.filter(p => p.status === "ACTIVE");
    const completedPayouts = payouts.filter(p => p.status === "COMPLETED");
    const totalDisbursed = completedPayouts.reduce((s, p) => s + p.amountINR, 0);

    return (
        <div className="min-h-screen pt-20 px-4 md:px-10 pb-12">
            <div className="mb-6">
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">Policy Management</p>
                <h1 className="display-text text-4xl md:text-5xl text-white">COVERAGE & PAYOUTS</h1>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: "Active Policies", value: activePolicies.length, accent: "text-signal-green" },
                    { label: "Total Triggers", value: triggers.length, accent: "text-signal-yellow" },
                    { label: "Total Payouts", value: completedPayouts.length, accent: "text-electric-blue" },
                    { label: "₹ Disbursed", value: `₹${totalDisbursed.toLocaleString()}`, accent: "text-white" },
                ].map((kpi) => (
                    <div key={kpi.label} className="glass-card rounded-sm p-4 text-center">
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">{kpi.label}</p>
                        <p className={`display-text text-2xl ${kpi.accent}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Buy Coverage */}
                <div className="glass-card rounded-sm p-6">
                    <h2 className="display-text text-lg text-white mb-4">BUY WEEKLY COVERAGE</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Select Worker</label>
                            <select className="w-full bg-void/80 border border-white/10 rounded-sm px-3 py-2 font-mono text-sm text-white/80 focus:outline-none focus:border-white/30"
                                value={selectedWorker} onChange={e => { setSelectedWorker(e.target.value); setPremium(null); }}>
                                <option value="">— Choose worker —</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id}) — {w.deliveryPlatform}</option>)}
                            </select>
                        </div>
                        <button onClick={handleCalcPremium} disabled={!selectedWorker || loading}
                            className="w-full py-2.5 border border-electric-blue/40 text-electric-blue font-mono text-xs uppercase tracking-wider rounded-sm hover:bg-electric-blue/10 transition-all disabled:opacity-30">
                            CALCULATE PREMIUM
                        </button>
                        {premium && (
                            <div className="border border-electric-blue/20 bg-electric-blue/5 rounded-sm p-4 animate-reveal-up">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="display-text text-3xl text-white">₹{premium.premiumINR}</span>
                                    <span className="font-mono text-[10px] text-white/40">/week</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-white/35 mb-3">
                                    <div>Coverage: ₹{premium.coverageAmountINR?.toLocaleString()}</div>
                                    <div>Replacement: {premium.coverageDetails?.wageReplacement}</div>
                                    <div>Zone: ×{premium.premiumBreakdown?.zoneMultiplier}</div>
                                    <div>Hours: ×{premium.premiumBreakdown?.hoursMultiplier}</div>
                                    <div>City: ×{premium.premiumBreakdown?.cityDisruptionMultiplier}</div>
                                    <div>Weather: ×{premium.premiumBreakdown?.weatherForecastMultiplier}</div>
                                </div>
                                <button onClick={handleBuyPolicy} disabled={loading}
                                    className="w-full py-2.5 bg-signal-green text-void font-display font-900 text-sm uppercase tracking-widest rounded-sm hover:bg-signal-green/90 transition-all disabled:opacity-50">
                                    {loading ? "PROCESSING…" : "PURCHASE POLICY →"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Simulate Trigger */}
                <div className="glass-card rounded-sm p-6">
                    <h2 className="display-text text-lg text-white mb-4">SIMULATE DISRUPTION</h2>
                    <p className="font-mono text-[9px] text-white/30 mb-3">Trigger a parametric event to see auto-claims + instant payouts in action</p>
                    <div className="space-y-3">
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Zone</label>
                            <select className="w-full bg-void/80 border border-white/10 rounded-sm px-3 py-2 font-mono text-sm text-white/80 focus:outline-none focus:border-white/30"
                                value={simZone} onChange={e => setSimZone(e.target.value)}>
                                {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-2">Trigger Type</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {TRIGGER_TYPES.map(t => (
                                    <button key={t.id} onClick={() => setSimTrigger(t.id)}
                                        className={`text-left px-2 py-2 rounded-sm font-mono text-[10px] border transition-all ${simTrigger === t.id ? "bg-signal-red/10 border-signal-red/40 text-signal-red" : "border-white/8 text-white/40 hover:border-white/20"
                                            }`}>{t.icon} {t.label}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleSimulate} disabled={loading}
                            className="w-full py-3 bg-signal-red text-white font-display font-900 text-sm uppercase tracking-widest rounded-sm hover:bg-signal-red/90 transition-all disabled:opacity-50">
                            {loading ? "TRIGGERING…" : "⚡ SIMULATE TRIGGER"}
                        </button>
                        {simResult && (
                            <div className="border border-signal-yellow/30 bg-signal-yellow/5 rounded-sm p-3 animate-reveal-up">
                                <p className="font-mono text-[10px] text-signal-yellow mb-1">✓ {simResult.message}</p>
                                <p className="font-mono text-[9px] text-white/30">
                                    {simResult.trigger?.affectedWorkers} workers affected · {simResult.trigger?.autoClaimIds?.length} auto-claims created
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Policies Table */}
            <div className="mt-8 glass-card rounded-sm p-6">
                <h2 className="display-text text-lg text-white mb-4">ACTIVE POLICIES ({activePolicies.length})</h2>
                {activePolicies.length === 0 ? (
                    <p className="font-mono text-[10px] text-white/30">No active policies. Purchase coverage above.</p>
                ) : (
                    <div className="space-y-2">
                        {activePolicies.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 border border-white/6 rounded-sm hover:border-white/12 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-[10px] text-signal-green bg-signal-green/10 border border-signal-green/20 px-2 py-0.5 rounded-sm">ACTIVE</span>
                                    <div>
                                        <p className="font-mono text-sm text-white/80">{p.workerName} <span className="text-white/30">({p.workerId})</span></p>
                                        <p className="font-mono text-[9px] text-white/30">{new Date(p.weekStart).toLocaleDateString()} — {new Date(p.weekEnd).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm text-white">₹{p.premiumINR}/wk</p>
                                    <p className="font-mono text-[9px] text-white/30">Coverage: ₹{p.coverageAmountINR?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Payouts */}
            {payouts.length > 0 && (
                <div className="mt-6 glass-card rounded-sm p-6">
                    <h2 className="display-text text-lg text-white mb-4">RECENT PAYOUTS ({payouts.length})</h2>
                    <div className="space-y-2">
                        {payouts.slice(0, 10).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 border border-white/6 rounded-sm">
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border ${p.status === "COMPLETED" ? "text-signal-green border-signal-green/20 bg-signal-green/5" :
                                            p.status === "PROCESSING" ? "text-signal-yellow border-signal-yellow/20 bg-signal-yellow/5" :
                                                p.status === "FAILED" ? "text-signal-red border-signal-red/20 bg-signal-red/5" :
                                                    "text-white/40 border-white/10"
                                        }`}>{p.status}</span>
                                    <div>
                                        <p className="font-mono text-sm text-white/80">{p.workerName}</p>
                                        <p className="font-mono text-[9px] text-white/30">{p.triggerDescription}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm text-signal-green">₹{p.amountINR?.toLocaleString()}</p>
                                    <p className="font-mono text-[9px] text-white/20">{p.transactionRef}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message */}
            {msg && (
                <div className={`mt-4 p-3 rounded-sm border ${msg.type === "error" ? "border-signal-red/40 bg-signal-red/5" : "border-signal-green/40 bg-signal-green/5"}`}>
                    <p className={`font-mono text-[10px] ${msg.type === "error" ? "text-signal-red" : "text-signal-green"}`}>{msg.text}</p>
                </div>
            )}
        </div>
    );
}
