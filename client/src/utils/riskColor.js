export const getRiskColor = (score) => {
  if (score < 30) return { text: "text-signal-green", hex: "#00ff88" };
  if (score < 80) return { text: "text-signal-yellow", hex: "#f5c400" };
  return { text: "text-signal-red", hex: "#ff2d2d" };
};

export const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED": return { text: "text-signal-green", hex: "#00ff88" };
    case "MANUAL_REVIEW": return { text: "text-signal-yellow", hex: "#f5c400" };
    case "FLAGGED": return { text: "text-signal-red", hex: "#ff2d2d" };
    default: return { text: "text-white/40", hex: "#ffffff40" };
  }
};