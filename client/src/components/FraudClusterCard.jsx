import React, { useState } from "react";
import RiskBadge from "./RiskBadge.jsx";

const SIGNAL_LABELS = {
  GPS_TELEPORT: "GPS Teleport",
  GPS_STATIC_SPOOF: "Static Spoof",
  MOTION_MISMATCH: "Motion Mismatch",
  WEATHER_MISMATCH: "Weather Mismatch",
  PEER_CLUSTER_ATTACK: "Cluster Attack",
  NETWORK_CLUSTER: "Network Cluster",
  REPEATED_LOCATION: "Repeated Location",
  IMPOSSIBLE_ROUTE: "Impossible Route",
};

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export default function ClaimCard({ claim, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const { riskResult, workerName, workerId, submittedAt, incident, telemetry } = claim;
  const isFlagged = riskResult?.claimStatus === "FLAGGED";
  const isReview = riskResult?.claimStatus === "MANUAL_REVIEW";

  return (
    <div
      className={`claim-card-inner relative overflow-hidden rounded-sm border transition-all duration-300 cursor-pointer
        ${isFlagged
          ? "border-signal-red/40 animate-blink-border bg-signal-red/5"
          : isReview
          ? "border-signal-yellow/30 bg-signal-yellow/5"
          : "border-white/8 bg-white/3"
        }`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          isFlagged ? "bg-signal-red" : isReview ? "bg-signal-yellow" : "bg-signal-green"
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
                {workerId}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="font-mono text-[10px] text-white/35">{formatTime(submittedAt)}</span>
            </div>
            <h3
              className="display-text text-xl text-white truncate"
              style={{ lineHeight: 1 }}
            >
              {workerName}
            </h3>
            <p className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-wider">
              {incident?.incidentType?.replace("_", " ")} — ZONE {incident?.zoneId?.replace("ZONE_", "").replace(/_/g, " ")}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <RiskBadge score={riskResult?.riskScore} status={riskResult?.claimStatus} />
            {/* Risk score ring */}
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="22" cy="22" r="18" fill="none"
                  stroke={isFlagged ? "#ff2d2d" : isReview ? "#f5c400" : "#00ff88"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(riskResult?.riskScore || 0) * 1.131} 113.1`}
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-500
                ${isFlagged ? "text-signal-red" : isReview ? "text-signal-yellow" : "text-signal-green"}`}>
                {riskResult?.riskScore || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Signals row */}
        {riskResult?.fraudSignals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {riskResult.fraudSignals.map((sig) => (
              <span
                key={sig}
                className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-signal-red/15 text-signal-red/80 border border-signal-red/20"
              >
                {SIGNAL_LABELS[sig] || sig}
              </span>
            ))}
          </div>
        )}

        {/* Expanded breakdown */}
        {expanded && riskResult?.signalBreakdown && (
          <div className="mt-4 pt-4 border-t border-white/6">
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">Signal Breakdown</p>
            <div className="space-y-2">
              {Object.entries(riskResult.signalBreakdown).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-white/40 w-36 shrink-0 uppercase">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        val > 70 ? "bg-signal-red" : val > 40 ? "bg-signal-yellow" : "bg-signal-green"
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-white/40 w-6 text-right">{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[9px] font-mono text-white/35">
              <div>LAT: {telemetry?.lat?.toFixed(4)}, LNG: {telemetry?.lng?.toFixed(4)}</div>
              <div>MOTION: {((telemetry?.motionScore || 0) * 100).toFixed(0)}%</div>
              <div>NET: {telemetry?.connectivityType}</div>
              <div>FP: {telemetry?.networkFingerprint?.slice(0,12)}…</div>
            </div>
          </div>
        )}

        {/* Expand hint */}
        <div className="mt-3 flex justify-end">
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
            {expanded ? "▲ COLLAPSE" : "▼ EXPAND"}
          </span>
        </div>
      </div>
    </div>
  );
}