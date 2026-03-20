import React, { useState } from "react";
import { registerWorker } from "../api/workerApi.js";
import { calculatePremium } from "../api/policyApi.js";

const ZONES = [
    { id: "ZONE_SOUTH_CHENNAI", label: "South Chennai" },
    { id: "ZONE_CENTRAL_CHENNAI", label: "Central Chennai" },
    { id: "ZONE_NORTH_CHENNAI", label: "North Chennai" },
    { id: "ZONE_WEST_CHENNAI", label: "West Chennai" },
];

const PLATFORMS = ["SWIGGY", "ZOMATO", "OTHER"];
const VEHICLES = ["BIKE", "SCOOTER", "CYCLE"];

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "", phone: "", email: "",
        deliveryPlatform: "SWIGGY", vehicleType: "BIKE",
        zoneId: "ZONE_SOUTH_CHENNAI",
        avgWeeklyEarnings: 5000, avgHoursPerWeek: 40,
    });
    const [result, setResult] = useState(null);
    const [premium, setPremium] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const inp = "w-full bg-void/80 border border-white/10 rounded-sm px-3 py-2.5 font-mono text-sm text-white/80 focus:outline-none focus:border-electric-blue/50 transition-colors";

    const handleRegister = async () => {
        if (!form.name || !form.phone) { setError("Name and Phone are required"); return; }
        setLoading(true); setError(null);
        try {
            const res = await registerWorker(form);
            setResult(res.worker);
            // Auto-calculate premium
            const prem = await calculatePremium({ workerId: res.worker.id });
            setPremium(prem.premium);
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally { setLoading(false); }
    };

    const riskColor = (tier) =>
        tier === "HIGH" ? "text-signal-red" : tier === "LOW" ? "text-signal-green" : "text-signal-yellow";

    return (
        <div className="min-h-screen pt-20 px-4 md:px-10 pb-12 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">Worker Onboarding</p>
                <h1 className="display-text text-4xl md:text-5xl text-white">REGISTER & GET COVERED</h1>
                <p className="font-mono text-xs text-white/40 mt-2">Food delivery worker income protection — weekly parametric insurance</p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all ${step >= s ? "bg-electric-blue/20 border-electric-blue text-white" : "border-white/10 text-white/30"
                            }`}>{s}</div>
                        {s < 4 && <div className={`w-8 h-px ${step > s ? "bg-electric-blue" : "bg-white/10"}`} />}
                    </div>
                ))}
                <div className="ml-3 font-mono text-[10px] text-white/40 uppercase tracking-wider">
                    {step === 1 ? "Personal Info" : step === 2 ? "Delivery Profile" : step === 3 ? "Zone & Earnings" : "Risk Profile & Premium"}
                </div>
            </div>

            <div className="glass-card rounded-sm p-6">
                {/* Step 1 — Personal Info */}
                {step === 1 && (
                    <div className="space-y-4 animate-reveal-up">
                        <h2 className="display-text text-xl text-white mb-4">PERSONAL INFORMATION</h2>
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Full Name *</label>
                            <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your full name" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Phone *</label>
                                <input className={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
                            </div>
                            <div>
                                <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Email</label>
                                <input className={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="worker@email.com" />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full py-3 mt-2 bg-white text-void font-display font-900 text-lg uppercase tracking-widest rounded-sm hover:bg-white/90 transition-all">NEXT →</button>
                    </div>
                )}

                {/* Step 2 — Delivery Profile */}
                {step === 2 && (
                    <div className="space-y-4 animate-reveal-up">
                        <h2 className="display-text text-xl text-white mb-4">DELIVERY PROFILE</h2>
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-2">Platform</label>
                            <div className="flex gap-2">
                                {PLATFORMS.map(p => (
                                    <button key={p} onClick={() => setForm(f => ({ ...f, deliveryPlatform: p }))}
                                        className={`flex-1 py-3 px-4 rounded-sm font-mono text-xs uppercase tracking-wider border transition-all ${form.deliveryPlatform === p ? "bg-electric-blue/20 border-electric-blue text-white" : "border-white/10 text-white/40 hover:border-white/30"
                                            }`}>{p}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-2">Vehicle Type</label>
                            <div className="flex gap-2">
                                {VEHICLES.map(v => (
                                    <button key={v} onClick={() => setForm(f => ({ ...f, vehicleType: v }))}
                                        className={`flex-1 py-3 px-4 rounded-sm font-mono text-xs uppercase tracking-wider border transition-all ${form.vehicleType === v ? "bg-electric-blue/20 border-electric-blue text-white" : "border-white/10 text-white/40 hover:border-white/30"
                                            }`}>{v === "BIKE" ? "🏍️ Bike" : v === "SCOOTER" ? "🛵 Scooter" : "🚲 Cycle"}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 text-white/50 font-display font-700 text-sm uppercase tracking-widest rounded-sm hover:border-white/30 transition-all">← BACK</button>
                            <button onClick={() => setStep(3)} className="flex-1 py-3 bg-white text-void font-display font-900 text-sm uppercase tracking-widest rounded-sm hover:bg-white/90 transition-all">NEXT →</button>
                        </div>
                    </div>
                )}

                {/* Step 3 — Zone & Earnings */}
                {step === 3 && (
                    <div className="space-y-4 animate-reveal-up">
                        <h2 className="display-text text-xl text-white mb-4">ZONE & EARNINGS</h2>
                        <div>
                            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Operating Zone</label>
                            <select className={inp} value={form.zoneId} onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))}>
                                {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Avg Weekly Earnings (₹)</label>
                                <input className={inp} type="number" min="1000" max="25000" value={form.avgWeeklyEarnings}
                                    onChange={e => setForm(f => ({ ...f, avgWeeklyEarnings: parseInt(e.target.value) || 5000 }))} />
                            </div>
                            <div>
                                <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Avg Hours/Week</label>
                                <input className={inp} type="number" min="10" max="80" value={form.avgHoursPerWeek}
                                    onChange={e => setForm(f => ({ ...f, avgHoursPerWeek: parseInt(e.target.value) || 40 }))} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 border border-white/10 text-white/50 font-display font-700 text-sm uppercase tracking-widest rounded-sm hover:border-white/30 transition-all">← BACK</button>
                            <button onClick={handleRegister} disabled={loading}
                                className={`flex-1 py-3 font-display font-900 text-sm uppercase tracking-widest rounded-sm transition-all ${loading ? "bg-white/5 text-white/20 border border-white/8 cursor-wait" : "bg-signal-green text-void hover:bg-signal-green/90"
                                    }`}>{loading ? "PROCESSING…" : "REGISTER & PROFILE →"}</button>
                        </div>
                    </div>
                )}

                {/* Step 4 — Risk Profile & Premium */}
                {step === 4 && result && (
                    <div className="space-y-5 animate-reveal-up">
                        <div className="flex items-center justify-between">
                            <h2 className="display-text text-xl text-white">REGISTRATION COMPLETE</h2>
                            <span className="font-mono text-[10px] text-signal-green bg-signal-green/10 border border-signal-green/20 px-2 py-1 rounded-sm">✓ REGISTERED</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 border border-white/8 rounded-sm">
                                <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Worker ID</p>
                                <p className="font-mono text-lg text-white font-bold">{result.id}</p>
                            </div>
                            <div className="p-3 border border-white/8 rounded-sm">
                                <p className="font-mono text-[9px] text-white/30 uppercase mb-1">Risk Tier</p>
                                <p className={`font-mono text-lg font-bold ${riskColor(result.riskProfile?.riskTier)}`}>{result.riskProfile?.riskTier}</p>
                            </div>
                        </div>

                        {/* Risk Factors */}
                        <div>
                            <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">Risk Assessment Factors</p>
                            <div className="space-y-2">
                                {result.riskProfile?.factors?.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 border border-white/6 rounded-sm">
                                        <div>
                                            <p className="font-mono text-[10px] text-white/70">{f.name}</p>
                                            <p className="font-mono text-[9px] text-white/30">{f.detail}</p>
                                        </div>
                                        <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border ${f.impact === "HIGH" ? "text-signal-red border-signal-red/20 bg-signal-red/5" :
                                                f.impact === "LOW" ? "text-signal-green border-signal-green/20 bg-signal-green/5" :
                                                    "text-signal-yellow border-signal-yellow/20 bg-signal-yellow/5"
                                            }`}>{f.impact}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Premium Preview */}
                        {premium && (
                            <div className="border border-electric-blue/30 bg-electric-blue/5 rounded-sm p-4">
                                <p className="font-mono text-[9px] text-electric-blue uppercase tracking-widest mb-3">SUGGESTED WEEKLY PREMIUM</p>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="display-text text-4xl text-white">₹{premium.premiumINR}</span>
                                    <span className="font-mono text-[10px] text-white/40">/week</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-white/40 mb-3">
                                    <div>COVERAGE: ₹{premium.coverageAmountINR?.toLocaleString()}</div>
                                    <div>WAGE REPLACEMENT: {premium.coverageDetails?.wageReplacement}</div>
                                    <div>ZONE: ×{premium.premiumBreakdown?.zoneMultiplier}</div>
                                    <div>WEATHER: ×{premium.premiumBreakdown?.weatherForecastMultiplier}</div>
                                </div>
                                <p className="font-mono text-[9px] text-white/30 mb-3">Covers: Heat, Rain, Flood, AQI, Curfew, Strike, Closure, Outage</p>
                                <a href="/policy" className="block w-full py-3 bg-electric-blue text-white font-display font-900 text-sm uppercase tracking-widest rounded-sm text-center hover:bg-electric-blue/90 transition-all">
                                    BUY COVERAGE NOW →
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 border border-signal-red/40 bg-signal-red/5 rounded-sm">
                        <p className="font-mono text-[10px] text-signal-red">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
