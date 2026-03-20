// server/src/utils/distanceCalc.js

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — returns distance in kilometers between two GPS coords
 */
export const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Returns distance in meters
 */
export const haversineDistanceMeters = (lat1, lng1, lat2, lng2) =>
  haversineDistanceKm(lat1, lng1, lat2, lng2) * 1000;

/**
 * Given two coords and time diff (ms), returns speed in km/h
 */
export const calcSpeedKmh = (lat1, lng1, lat2, lng2, timeDiffMs) => {
  if (!timeDiffMs || timeDiffMs <= 0) return 0;
  const distKm = haversineDistanceKm(lat1, lng1, lat2, lng2);
  const timeHours = timeDiffMs / (1000 * 60 * 60);
  return distKm / timeHours;
};