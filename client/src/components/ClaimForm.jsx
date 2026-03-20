import React, { useState } from "react";
import { submitClaim } from "../api/claimApi.js";
import RiskBadge from "./RiskBadge.jsx";
import { WEATHER_ZONES } from "../mock/weatherZones.js";

const INCIDENT_TYPES = [
  "RAIN_INCOME_LOSS",
  "HEAT_INCOME_LOSS",
  "FLOOD_INCOME_LOSS",
  "AQI_INCOME_LOSS",
  "CURFEW_INCOME_LOSS",
  "STRIKE_INCOME_LOSS",
];

const INCIDENT_LABELS = {
  RAIN_INCOME_LOSS: "Rain — Unable to Deliver",
  HEAT_INCOME_LOSS: "Extreme Heat — Unsafe Conditions",
  FLOOD_INCOME_LOSS: "Flooding — Roads Blocked",
  AQI_INCOME_LOSS: "Air Quality — Health Hazard",
  CURFEW_INCOME_LOSS: "Curfew — Movement Restricted",
  STRIKE_INCOME_LOSS: "Strike — Operations Halted",
};

const SCENARIOS = [
  {
    label: "LEGITIMATE — RAIN LOSS",
    color: "text-signal-green",
    description: "Worker can't deliver due to heavy rain — genuine income loss",
    preset: {
      workerId: "W001",
      workerName: "Arjun Mehta",
      telemetry: { lat: 13.0569, lng: 80.2425, previousLat: 13.052, previousLng: 80.238, previousTimestamp: new Date(Date.now() - 30 * 60000).toISOString(), motionScore: 0.78, connectivityType: "4G", networkFingerprint: "fp_legit_001", deviceId: "dev_legit" },
      incident: { claimedSeverity: 3, incidentType: "RAIN_INCOME_LOSS", description: "Heavy rainfall — unable to complete deliveries, lost 4 hours of income.", zoneId: "ZONE_SOUTH_CHENNAI" },
    },
  },
  {
    label: "GPS TELEPORT FRAUD",
    color: "text-signal-red",
    description: "Spoofed location — device jumps 350km in 10 min",
    preset: {
      workerId: "W011",
      workerName: "Demo Worker (Teleport)",
      telemetry: { lat: 13.0827, lng: 80.2707, previousLat: 12.9716, previousLng: 77.5946, previousTimestamp: new Date(Date.now() - 10 * 60000).toISOString(), motionScore: 0.09, connectivityType: "WiFi", networkFingerprint: "fp_spoof_hub_01", deviceId: "dev_teleport" },
      incident: { claimedSeverity: 5, incidentType: "RAIN_INCOME_LOSS", description: "Claims severe weather caused full-day income loss.", zoneId: "ZONE_CENTRAL_CHENNAI" },
    },
  },
  {
    label: "CLUSTER ATTACK",
    color: "text-signal-red",
    description: "Coordinated fraud — same GPS + shared WiFi fingerprint",
    preset: {
      workerId: "W012",
      workerName: "Demo Worker (Cluster)",
      telemetry: { lat: 13.0829, lng: 80.2705, previousLat: 13.083, previousLng: 80.2706, previousTimestamp: new Date(Date.now() - 15 * 60000).toISOString(), motionScore: 0.07, connectivityType: "WiFi", networkFingerprint: "fp_spoof_hub_01", deviceId: "dev_cluster_new" },
      incident: { claimedSeverity: 5, incidentType: "FLOOD_INCOME_LOSS", description: "Claims flood destroyed all delivery capability.", zoneId: "ZONE_CENTRAL_CHENNAI" },
    },
  },
];

export default function ClaimForm({ onClaimSubmitted }) {
  const [form, setForm] = useState({
    workerId: "W001",
    workerName: "Arjun Mehta",
    lat: "13.0900",
    lng: "80.2785",
    motionScore: "0.75",
    connectivityType: "4G",
    claimedSeverity: "3",
    incidentType: "RAIN_INCOME_LOSS",
    description: "",
    zoneId: "ZONE_SOUTH_CHENNAI",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const applyScenario = (scenario) => {
    const p = scenario.preset;
    setForm({
      workerId: p.workerId,
      workerName: p.workerName,
      lat: String(p.telemetry.lat),
      lng: String(p.telemetry.lng),
      motionScore: String(p.telemetry.motionScore),
      connectivityType: p.telemetry.connectivityType,
      claimedSeverity: String(p.incident.claimedSeverity),
      incidentType: p.incident.incidentType,
      description: p.incident.description,
      zoneId: p.incident.zoneId,
      _preset: p,
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const preset = form._preset;
      const payload = preset
        ? { ...preset }
        : {
          workerId: form.workerId,
          workerName: form.workerName,
          telemetry: {
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
            motionScore: parseFloat(form.motionScore),
            connectivityType: form.connectivityType,
            networkFingerprint: `fp_${form.workerId}_${Date.now()}`,
            deviceId: `dev_${form.workerId}`,
          },
          incident: {
            claimedSeverity: parseInt(form.claimedSeverity),
            incidentType: form.incidentType,
            description: form.description,
            zoneId: form.zoneId,
          },
        };

      const data = await submitClaim(payload);
      setResult(data.claim.riskResult);
      if (onClaimSubmitted) onClaimSubmitted(data.claim);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-void/80 border border-white/10 rounded-sm px-3 py-2 font-mono text-sm text-white/80 focus:outline-none focus:border-white/30 transition-colors";

  return (
    <div className="glass-card rounded-sm">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse" />
          <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">Income Loss Claim Terminal</span>
        </div>
        <h2 className="display-text text-3xl text-white">FILE CLAIM</h2>
      </div>

      <div className="p-6">
        {/* Quick scenario buttons */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-2">Quick Scenarios</p>
          <div className="flex flex-col gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => applyScenario(s)}
                className={`text-left px-3 py-2 border border-white/8 rounded-sm hover:border-white/20 transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] uppercase tracking-wider font-500 ${s.color}`}>{s.label}</span>
                  <span className="font-mono text-[8px] text-white/20 group-hover:text-white/40">LOAD →</span>
                </div>
                <p className="font-mono text-[9px] text-white/30 mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="sep mb-6" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Worker ID</label>
              <input className={inp} value={form.workerId} onChange={e => setForm(f => ({ ...f, workerId: e.target.value, _preset: null }))} />
            </div>
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Worker Name</label>
              <input className={inp} value={form.workerName} onChange={e => setForm(f => ({ ...f, workerName: e.target.value, _preset: null }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Latitude</label>
              <input className={inp} value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value, _preset: null }))} />
            </div>
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Longitude</label>
              <input className={inp} value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value, _preset: null }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Motion Score (0–1)</label>
              <input className={inp} type="number" step="0.01" min="0" max="1" value={form.motionScore} onChange={e => setForm(f => ({ ...f, motionScore: e.target.value, _preset: null }))} />
            </div>
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Connectivity</label>
              <select className={inp} value={form.connectivityType} onChange={e => setForm(f => ({ ...f, connectivityType: e.target.value, _preset: null }))}>
                {["4G", "3G", "WiFi", "2G"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Impact Severity (0–5)</label>
              <input className={inp} type="number" min="0" max="5" value={form.claimedSeverity} onChange={e => setForm(f => ({ ...f, claimedSeverity: e.target.value, _preset: null }))} />
            </div>
            <div>
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Income Loss Type</label>
              <select className={inp} value={form.incidentType} onChange={e => setForm(f => ({ ...f, incidentType: e.target.value, _preset: null }))}>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{INCIDENT_LABELS[t] || t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Weather Zone</label>
            <select className={inp} value={form.zoneId} onChange={e => setForm(f => ({ ...f, zoneId: e.target.value, _preset: null }))}>
              {WEATHER_ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
            </select>
          </div>

          <div>
            <label className="font-mono text-[9px] text-white/35 uppercase tracking-wider block mb-1">Description</label>
            <textarea className={`${inp} resize-none h-16`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value, _preset: null }))} placeholder="Describe how the disruption caused income loss…" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-display font-900 text-lg uppercase tracking-widest transition-all duration-300 rounded-sm
              ${loading
                ? "bg-white/5 text-white/20 border border-white/8 cursor-wait"
                : "bg-white text-void hover:bg-white/90 border border-white"
              }`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            {loading ? "ANALYSING SIGNALS…" : "SUBMIT TO RISK ENGINE →"}
          </button>
        </form>

        {/* Result panel */}
        {result && (
          <div className={`mt-5 p-4 rounded-sm border ${result.claimStatus === "FLAGGED" ? "border-signal-red/40 bg-signal-red/5" :
              result.claimStatus === "MANUAL_REVIEW" ? "border-signal-yellow/40 bg-signal-yellow/5" :
                "border-signal-green/40 bg-signal-green/5"
            }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] text-white/35 uppercase tracking-widest">Engine Decision</span>
              <RiskBadge score={result.riskScore} status={result.claimStatus} size="lg" />
            </div>

            {result.claimStatus === "APPROVED" && (
              <p className="font-mono text-[10px] text-signal-green mb-2">✓ Income loss claim approved — payout will be initiated automatically</p>
            )}

            {result.fraudSignals?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {result.fraudSignals.map(s => (
                  <span key={s} className="font-mono text-[9px] uppercase px-2 py-0.5 bg-signal-red/15 text-signal-red border border-signal-red/20 rounded-sm">
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-white/40">
              <div>CONFIDENCE: {((result.modelConfidence || 0) * 100).toFixed(1)}%</div>
              <div>PROCESSED: {result.processedAt ? new Date(result.processedAt).toLocaleTimeString("en-US", { hour12: false }) : "—"}</div>
            </div>
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