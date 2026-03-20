// server/src/data/weatherHistory.js
// Zone-based weather severity history (0–5 scale)

// WEATHER_SEVERITY_LEVELS: CLEAR=0, LIGHT_RAIN=1, MODERATE_RAIN=2, HEAVY_RAIN=3, STORM=4, CYCLONE=5

const weatherHistory = {
  ZONE_SOUTH_CHENNAI: {
    label: "South Chennai",
    centerLat: 13.0200,
    centerLng: 80.2400,
    currentSeverity: 3,
    history: [
      { hour: -6, severity: 1 },
      { hour: -5, severity: 2 },
      { hour: -4, severity: 3 },
      { hour: -3, severity: 3 },
      { hour: -2, severity: 3 },
      { hour: -1, severity: 3 },
      { hour: 0,  severity: 3 },
    ],
    maxSeverityLast24h: 3,
    avgSeverityLast24h: 2.4,
  },

  ZONE_CENTRAL_CHENNAI: {
    label: "Central Chennai",
    centerLat: 13.0827,
    centerLng: 80.2707,
    currentSeverity: 2,
    history: [
      { hour: -6, severity: 1 },
      { hour: -5, severity: 1 },
      { hour: -4, severity: 2 },
      { hour: -3, severity: 2 },
      { hour: -2, severity: 2 },
      { hour: -1, severity: 2 },
      { hour: 0,  severity: 2 },
    ],
    maxSeverityLast24h: 2,
    avgSeverityLast24h: 1.7,
  },

  ZONE_NORTH_CHENNAI: {
    label: "North Chennai",
    centerLat: 13.1200,
    centerLng: 80.2900,
    currentSeverity: 2,
    history: [
      { hour: -6, severity: 0 },
      { hour: -5, severity: 1 },
      { hour: -4, severity: 2 },
      { hour: -3, severity: 2 },
      { hour: -2, severity: 2 },
      { hour: -1, severity: 2 },
      { hour: 0,  severity: 2 },
    ],
    maxSeverityLast24h: 2,
    avgSeverityLast24h: 1.5,
  },

  ZONE_WEST_CHENNAI: {
    label: "West Chennai",
    centerLat: 13.0500,
    centerLng: 80.1900,
    currentSeverity: 1,
    history: [
      { hour: -6, severity: 0 },
      { hour: -5, severity: 0 },
      { hour: -4, severity: 1 },
      { hour: -3, severity: 1 },
      { hour: -2, severity: 1 },
      { hour: -1, severity: 1 },
      { hour: 0,  severity: 1 },
    ],
    maxSeverityLast24h: 1,
    avgSeverityLast24h: 0.7,
  },
};

export const getZoneWeather = (zoneId) => weatherHistory[zoneId] || null;

export const getAllZones = () => Object.entries(weatherHistory).map(([id, data]) => ({
  id,
  ...data,
}));

export const getZoneForCoords = (lat, lng) => {
  // Find nearest zone center
  let nearest = null;
  let minDist = Infinity;

  for (const [id, zone] of Object.entries(weatherHistory)) {
    const dist = Math.sqrt(
      Math.pow(lat - zone.centerLat, 2) + Math.pow(lng - zone.centerLng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = { id, ...zone };
    }
  }

  return nearest;
};