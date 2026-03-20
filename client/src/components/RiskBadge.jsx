import React from "react";

export default function RiskBadge({ score, status, size = "md" }) {
  const getConfig = () => {
    if (status === "APPROVED" || score < 30) {
      return {
        label: "APPROVED",
        bg: "bg-signal-green/10",
        border: "border-signal-green/40",
        text: "text-signal-green",
        dot: "bg-signal-green",
        glow: "shadow-[0_0_12px_rgba(0,255,136,0.3)]",
      };
    }
    if (status === "MANUAL_REVIEW" || (score >= 30 && score < 80)) {
      return {
        label: "REVIEW",
        bg: "bg-signal-yellow/10",
        border: "border-signal-yellow/40",
        text: "text-signal-yellow",
        dot: "bg-signal-yellow",
        glow: "shadow-[0_0_12px_rgba(245,196,0,0.3)]",
      };
    }
    return {
      label: "FLAGGED",
      bg: "bg-signal-red/10",
      border: "border-signal-red/40",
      text: "text-signal-red",
      dot: "bg-signal-red",
      glow: "shadow-[0_0_12px_rgba(255,45,45,0.4)]",
      pulse: true,
    };
  };

  const cfg = getConfig();
  const isLarge = size === "lg";

  return (
    <div className={`inline-flex items-center gap-2 border rounded-sm ${cfg.bg} ${cfg.border} ${cfg.glow} ${isLarge ? "px-4 py-2" : "px-2.5 py-1"}`}>
      <span className={`rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""} ${isLarge ? "w-2 h-2" : "w-1.5 h-1.5"}`} />
      <span className={`risk-badge ${cfg.text} ${isLarge ? "text-xs" : ""}`}>
        {cfg.label}
      </span>
      {score !== undefined && (
        <span className={`font-mono ${isLarge ? "text-sm" : "text-[10px]"} ${cfg.text} opacity-70`}>
          {score}
        </span>
      )}
    </div>
  );
}