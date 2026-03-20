export const WEATHER_ZONES = [
  { id: "ZONE_SOUTH_CHENNAI", label: "South Chennai", severity: 3, label_sev: "HEAVY RAIN" },
  { id: "ZONE_CENTRAL_CHENNAI", label: "Central Chennai", severity: 2, label_sev: "MODERATE RAIN" },
  { id: "ZONE_NORTH_CHENNAI", label: "North Chennai", severity: 2, label_sev: "MODERATE RAIN" },
  { id: "ZONE_WEST_CHENNAI", label: "West Chennai", severity: 1, label_sev: "LIGHT RAIN" },
];

export const SEVERITY_LABELS = {
  0: "CLEAR",
  1: "LIGHT RAIN",
  2: "MODERATE RAIN",
  3: "HEAVY RAIN",
  4: "STORM",
  5: "CYCLONE",
};

export const SEVERITY_COLORS = {
  0: "text-white/40",
  1: "text-blue-300",
  2: "text-blue-400",
  3: "text-signal-yellow",
  4: "text-orange-400",
  5: "text-signal-red",
};