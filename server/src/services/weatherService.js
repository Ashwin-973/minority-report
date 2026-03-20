// server/src/services/weatherService.js
// Real weather data from OpenWeatherMap API with caching

import axios from "axios";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const AIR_URL = "https://api.openweathermap.org/data/2.5/air_pollution";

// Zone coordinates for Chennai
const ZONE_COORDS = {
    ZONE_SOUTH_CHENNAI: { lat: 13.02, lon: 80.24, label: "South Chennai" },
    ZONE_CENTRAL_CHENNAI: { lat: 13.0827, lon: 80.2707, label: "Central Chennai" },
    ZONE_NORTH_CHENNAI: { lat: 13.12, lon: 80.29, label: "North Chennai" },
    ZONE_WEST_CHENNAI: { lat: 13.05, lon: 80.19, label: "West Chennai" },
};

// ── Cache ───────────────────────────────────────────────────────────
const cache = {
    weather: {},    // zoneId -> { data, timestamp }
    aqi: {},        // zoneId -> { data, timestamp }
};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const isCacheValid = (entry) =>
    entry && Date.now() - entry.timestamp < CACHE_TTL_MS;

// ── Fetch current weather for a zone ────────────────────────────────
export const fetchZoneWeather = async (zoneId) => {
    if (!API_KEY) return getFallbackWeather(zoneId);
    if (isCacheValid(cache.weather[zoneId])) return cache.weather[zoneId].data;

    const coords = ZONE_COORDS[zoneId];
    if (!coords) return getFallbackWeather(zoneId);

    try {
        const res = await axios.get(`${BASE_URL}/weather`, {
            params: { lat: coords.lat, lon: coords.lon, appid: API_KEY, units: "metric" },
            timeout: 5000,
        });

        const data = {
            zoneId,
            label: coords.label,
            temp: res.data.main.temp,
            feelsLike: res.data.main.feels_like,
            humidity: res.data.main.humidity,
            windSpeed: (res.data.wind?.speed || 0) * 3.6, // m/s → km/h
            rainMmPerHr: res.data.rain?.["1h"] || 0,
            weatherMain: res.data.weather?.[0]?.main || "Clear",
            weatherDesc: res.data.weather?.[0]?.description || "clear sky",
            icon: res.data.weather?.[0]?.icon || "01d",
            severity: computeSeverity(res.data),
            fetchedAt: new Date().toISOString(),
            source: "OPENWEATHERMAP_LIVE",
        };

        cache.weather[zoneId] = { data, timestamp: Date.now() };
        return data;
    } catch (err) {
        console.error(`[WeatherService] Failed to fetch weather for ${zoneId}:`, err.message);
        return getFallbackWeather(zoneId);
    }
};

// ── Fetch AQI for a zone ────────────────────────────────────────────
export const fetchZoneAQI = async (zoneId) => {
    if (!API_KEY) return getFallbackAQI(zoneId);
    if (isCacheValid(cache.aqi[zoneId])) return cache.aqi[zoneId].data;

    const coords = ZONE_COORDS[zoneId];
    if (!coords) return getFallbackAQI(zoneId);

    try {
        const res = await axios.get(AIR_URL, {
            params: { lat: coords.lat, lon: coords.lon, appid: API_KEY },
            timeout: 5000,
        });

        const aqiIndex = res.data.list?.[0]?.main?.aqi || 1; // 1-5 scale from OWM
        const components = res.data.list?.[0]?.components || {};

        // Convert OWM 1-5 scale to actual AQI approximation
        const aqiMap = { 1: 50, 2: 100, 3: 150, 4: 250, 5: 400 };
        const aqi = aqiMap[aqiIndex] || 50;

        const data = {
            zoneId,
            aqi,
            aqiIndex,
            pm25: components.pm2_5 || 0,
            pm10: components.pm10 || 0,
            no2: components.no2 || 0,
            fetchedAt: new Date().toISOString(),
            source: "OPENWEATHERMAP_LIVE",
        };

        cache.aqi[zoneId] = { data, timestamp: Date.now() };
        return data;
    } catch (err) {
        console.error(`[WeatherService] Failed to fetch AQI for ${zoneId}:`, err.message);
        return getFallbackAQI(zoneId);
    }
};

// ── Fetch all zones ─────────────────────────────────────────────────
export const fetchAllZonesWeather = async () => {
    const zoneIds = Object.keys(ZONE_COORDS);
    const results = await Promise.all(zoneIds.map((z) => fetchZoneWeather(z)));
    return results;
};

export const fetchAllZonesAQI = async () => {
    const zoneIds = Object.keys(ZONE_COORDS);
    const results = await Promise.all(zoneIds.map((z) => fetchZoneAQI(z)));
    return results;
};

// ── Compute weather severity (0–5) from API data ────────────────────
function computeSeverity(apiData) {
    const rain = apiData.rain?.["1h"] || 0;
    const wind = (apiData.wind?.speed || 0) * 3.6;
    const temp = apiData.main?.temp || 30;

    // Rain-based severity
    if (rain >= 80 || wind >= 80) return 5; // CYCLONE
    if (rain >= 50 || wind >= 60) return 4; // STORM
    if (rain >= 20) return 3;               // HEAVY_RAIN
    if (rain >= 5) return 2;                // MODERATE_RAIN
    if (rain >= 1) return 1;               // LIGHT_RAIN

    // Extreme heat also pushes severity
    if (temp >= 45) return 4;
    if (temp >= 42) return 3;

    return 0; // CLEAR
}

// ── Fallback data for when API key is not configured ────────────────
function getFallbackWeather(zoneId) {
    const fallbacks = {
        ZONE_SOUTH_CHENNAI: { severity: 3, temp: 32, rainMmPerHr: 25, windSpeed: 15 },
        ZONE_CENTRAL_CHENNAI: { severity: 2, temp: 33, rainMmPerHr: 8, windSpeed: 10 },
        ZONE_NORTH_CHENNAI: { severity: 2, temp: 31, rainMmPerHr: 6, windSpeed: 12 },
        ZONE_WEST_CHENNAI: { severity: 1, temp: 34, rainMmPerHr: 2, windSpeed: 8 },
    };
    const fb = fallbacks[zoneId] || fallbacks.ZONE_SOUTH_CHENNAI;
    return {
        zoneId,
        label: ZONE_COORDS[zoneId]?.label || zoneId,
        temp: fb.temp,
        feelsLike: fb.temp + 3,
        humidity: 75,
        windSpeed: fb.windSpeed,
        rainMmPerHr: fb.rainMmPerHr,
        weatherMain: fb.rainMmPerHr > 5 ? "Rain" : "Clouds",
        weatherDesc: fb.rainMmPerHr > 5 ? "moderate rain" : "partly cloudy",
        icon: fb.rainMmPerHr > 5 ? "10d" : "03d",
        severity: fb.severity,
        fetchedAt: new Date().toISOString(),
        source: "FALLBACK_STATIC",
    };
}

function getFallbackAQI(zoneId) {
    return {
        zoneId,
        aqi: 120,
        aqiIndex: 2,
        pm25: 45,
        pm10: 90,
        no2: 30,
        fetchedAt: new Date().toISOString(),
        source: "FALLBACK_STATIC",
    };
}

export const getZoneCoords = () => ZONE_COORDS;
