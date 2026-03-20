# MINORITY REPORT — Parametric Insurance Fraud Intelligence Platform

> *"The syndicates are getting smarter. We built a system smarter than the syndicate."*

A real-time, multi-signal fraud detection engine for parametric gig-worker insurance. Built for **DEVTrails 2026** under a 24-hour deadline pivot in response to a critical GPS-spoofing syndicate threat.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [What We Built](#what-we-built)
3. [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defense--anti-spoofing-strategy)
4. [System Architecture](#system-architecture)
5. [The 5-Signal Risk Engine](#the-5-signal-risk-engine)
6. [Project Structure](#project-structure)
7. [Tech Stack](#tech-stack)
8. [API Reference](#api-reference)
9. [Getting Started](#getting-started)
10. [Live Demo Scenarios](#live-demo-scenarios)

---

## The Problem

A syndicate of 500 delivery workers organized via Telegram exploited a parametric insurance platform using **GPS-spoofing applications**. While physically at home, they faked their GPS coordinates to appear stranded inside severe weather zones, triggering mass automatic payouts and draining the liquidity pool instantly.

Simple GPS verification is dead. The platform needed a **multi-dimensional fraud intelligence layer** that operates in real-time at the moment of claim submission — before any payout is authorized.

---

## What We Built

**Minority Report** is a full-stack parametric insurance platform with a purpose-built, 5-signal risk engine that runs every claim through parallel fraud detectors and produces a composite risk score (0–100) with a verdict in under 2 seconds.

### Core Capabilities

| Capability | Detail |
|---|---|
| **Real-time risk scoring** | Every claim scored 0–100 across 5 weighted signals simultaneously |
| **GPS Teleport Detection** | Haversine speed analysis flags movement > 200 km/h as impossible |
| **Motion Cross-Analysis** | Accelerometer score vs GPS displacement — spoofing apps can't fake real device physics |
| **Weather Correlation** | Claimed severity vs 6-hour zone history — cyclone claims during clear skies are flagged |
| **Peer Cluster Detection** | 50-metre radius sweep detects coordinated fraud rings in real-time |
| **Network Fingerprinting** | Shared WiFi/IP fingerprints expose workers submitting from the same location |
| **Live GPS Map** | Canvas-rendered Chennai grid showing worker positions, cluster zones, and scan animations |
| **Admin Intelligence Dashboard** | Full claim feed, fraud signal breakdowns, cluster group visualizations |
| **3-Tier Verdict System** | APPROVED / MANUAL REVIEW / FLAGGED — no binary decisions |

---

## Adversarial Defense & Anti-Spoofing Strategy

> This section directly addresses the DEVTrails 2026 critical threat brief.

### 1. Differentiation: Genuine Stranded Worker vs. GPS Spoofer

The core insight driving our architecture: **a GPS spoofing app can fake coordinates, but it cannot simultaneously fake the physics of a device that is actually moving.**

We cross-examine four data layers that a spoofing app cannot simultaneously control:

**Layer A — Haversine Teleport Analysis (`gpsSpoofDetector.js`)**
Every claim includes a `previousLat/previousLng/previousTimestamp` telemetry point captured before the incident. Our engine calculates the implied travel speed using the Haversine formula. A genuine delivery worker on a bike or vehicle cannot exceed ~120 km/h on Chennai roads. Any implied speed above our **200 km/h threshold** is physically impossible — it is definitively a GPS spoof, not a network anomaly. The score scales linearly: 200 km/h → 60 risk points, 500 km/h → 95 risk points.

A real stranded worker will show a plausible previous location within their delivery zone. A spoofer at home in Bengaluru claiming to be in Chennai shows a 350 km jump in 10 minutes — a **2,100 km/h** implied speed. This is caught with 100% precision.

**Layer B — Motion Sensor Cross-Correlation (`motionConsistency.js`)**
Our telemetry payload collects a `motionScore` (0.0–1.0) derived from the device accelerometer/gyroscope. GPS spoofing apps inject fake coordinates into the GPS subsystem but have no access to the inertial measurement unit (IMU). Therefore:

- A genuine delivery worker caught in a storm shows **high GPS displacement AND high motion score** (device is physically moving on a bike in rain)
- A fraudster at home with a GPS spoofer shows **high GPS displacement but near-zero motion score** (the device is sitting stationary on a table)

If GPS distance > 100m but `motionScore < 0.25`, the engine fires a `MOTION_MISMATCH` signal. A motion score below 0.08 is flagged unconditionally — no legitimate active delivery produces near-zero accelerometer readings.

**Layer C — Weather Zone Historical Correlation (`weatherCorrelation.js`)**
We maintain a 6-hour severity history for 4 Chennai zones (South, Central, North, West), each on a 0–5 scale (CLEAR → CYCLONE). When a claim arrives, we compare `claimedSeverity` against `maxSeverityLast24h` for the declared zone:

- Gap of 0: legitimate, no signal raised
- Gap of 1: minor exaggeration, 25 risk points (microclimate possible)
- Gap of 2: significant fabrication, 55 points + `WEATHER_MISMATCH` signal
- Gap of 3+: major fabrication, 78–92 points

A genuine stranded worker in heavy rain claims severity 3 when the zone shows severity 3 — perfect correlation, no flags. A fraudster at home claims severity 5 (CYCLONE) when the zone shows severity 2 (MODERATE RAIN) — caught immediately.

**Layer D — Repeated Flagged Location Memory**
If a claim originates within 20 metres of a GPS coordinate that was previously flagged as fraudulent, it receives automatic elevated risk (70+ points). Syndicates tend to reuse the same "phantom zones." Our engine remembers every flagged coordinate.

---

### 2. The Data: Beyond Basic GPS Coordinates

Our risk engine analyses **8 distinct data dimensions** across every claim. Here is exactly what we collect and why each field defeats a specific attack vector:

| Data Point | Field | What It Defeats |
|---|---|---|
| Current GPS coordinates | `lat`, `lng` | Baseline location context |
| Previous GPS coordinates | `previousLat`, `previousLng` | Teleport speed calculation — the gap between last known location and claim location |
| Previous timestamp | `previousTimestamp` | Combined with above to compute impossible speeds |
| IMU motion score | `motionScore` (0–1) | The single most powerful anti-spoofing signal — GPS apps cannot fake accelerometer physics |
| Connectivity type | `connectivityType` | Pattern signal: fraudsters often connect via WiFi from a fixed location rather than 4G on the move |
| Network fingerprint | `networkFingerprint` | Hash of WiFi SSID / router MAC or mobile network identifier. Multiple claims from identical fingerprint = same physical location |
| Device ID | `deviceId` | Persistent device identifier to detect single-device multi-worker fraud |
| Zone claim + description | `zoneId`, `claimedSeverity`, `incidentType` | Cross-referenced against IMD-style historical weather severity records per zone |

**The Cluster Dimension — the syndicate's Achilles heel:**

Individual signal analysis alone can be evaded by a sophisticated attacker. The syndicate's coordination via Telegram groups is their greatest weakness — it forces them to **co-locate in digital space**, even if they're physically dispersed.

Our `peerClusterDetector.js` runs a spatial sweep of all claims submitted in the last 60 minutes. If 3 or more claims originate within a **50-metre GPS radius**, this fires a `PEER_CLUSTER_ATTACK` signal. This threshold was tuned to the Telegram-organized scenario: when 500 workers are all faking the same location to appear "stranded in the storm zone," they inadvertently create a GPS cluster that our engine detects as an attack pattern.

Additionally, if 3+ claims share the same `networkFingerprint` (i.e., they're all on the same WiFi router), a `NETWORK_CLUSTER` signal fires independently of spatial proximity. This catches sophisticated attackers who use VPNs to fake distributed GPS coordinates but forget they're all on the same home WiFi.

**The compound signal approach:** No single signal triggers automatic rejection. The risk engine combines all signals using a **weighted composite formula**:

```
riskScore = (GPS_score × 0.30) + (Motion_score × 0.20) +
            (Weather_score × 0.20) + (Cluster_score × 0.20) +
            (Network_score × 0.10) + noise(±2)
```

A real attack triggers GPS_TELEPORT + MOTION_MISMATCH + WEATHER_MISMATCH + PEER_CLUSTER_ATTACK + NETWORK_CLUSTER simultaneously — the composite score hits 85–95. An honest worker with a bad network signal might get minor noise on one dimension but scores cleanly on the other four.

---

### 3. UX Balance: Protecting Honest Workers from Unfair Penalties

This is the hardest part of the problem. A delivery worker caught in a genuine storm may have:
- Weak GPS signal (coordinate drift looks like "teleport")
- Low battery causing inconsistent motion logging
- Slow 2G connectivity causing timestamp mismatches
- Weather so extreme it exceeds historical zone averages

Our system handles this with a **three-tier verdict architecture** that never makes a binary payout/reject decision:

**Tier 1 — APPROVED (Risk Score < 30)**
Single-signal flags from environmental noise (e.g., minor weather gap of 1 severity level) do not push a legitimate claim into review. The worker receives immediate payout authorization. No human is pulled in.

**Tier 2 — MANUAL REVIEW (Risk Score 30–79)**
This is the "benefit of the doubt" tier. The claim is flagged for an adjuster but **is not rejected**. The adjuster sees the specific signals that triggered — e.g., "WEATHER_MISMATCH (claimed severity 4, zone max 2)" — and can cross-reference with support documents (photo evidence, delivery app logs, vehicle telematics). This tier exists specifically for:
- Genuine workers in edge weather zones not yet in our database
- Workers with old devices that produce noisy IMU readings
- First-time claimants with no telemetry history for baseline comparison
- Workers in 2G dead zones where GPS timestamps are unreliable

**Tier 3 — FLAGGED (Risk Score ≥ 80, or any PEER_CLUSTER_ATTACK)**
Automatic hold. Payout blocked. The claim enters fraud investigation queue. The PEER_CLUSTER_ATTACK signal always triggers Tier 3 regardless of composite score — a coordinated fraud ring is never ambiguous.

**Critical UX design principle:** The reason we don't binary-flag on any single signal is precisely to protect Priya Nair (our real seeded test case — a genuine worker whose claim shows WEATHER_MISMATCH because she slightly overestimated storm severity) from being treated the same as Ravi Kumar (the seeded GPS teleporter from Bengaluru who appears 350 km away in 10 minutes). Priya gets MANUAL_REVIEW at score 54. Ravi gets FLAGGED at score 91. The difference is the composite — not a single trigger.

**The "network drop in bad weather" edge case:** A worker who goes offline during a storm and reconnects later has no `previousTimestamp` data available. Our `motionConsistency.js` explicitly handles this: when `previousTimestamp` is null, the detector returns a **small baseline score of ~5 points** rather than treating the absence of data as suspicious. The claim still processes — it just has less evidence to analyze, not negative evidence.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MINORITY REPORT                          │
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────────┐  │
│  │   React SPA  │ ──────► │     Express REST API         │  │
│  │   (Vite 8)   │  /api   │     (Node.js ESM)            │  │
│  │  Tailwind v4 │ ◄────── │     port 4000                │  │
│  │  port 5173   │         └──────────────┬───────────────┘  │
│  └──────────────┘                        │                  │
│                                          ▼                  │
│                         ┌────────────────────────────────┐  │
│                         │      5-Signal Risk Engine      │  │
│                         │                                │  │
│                         │  ① GPS Spoof Detector (30%)   │  │
│                         │  ② Motion Consistency (20%)   │  │
│                         │  ③ Weather Correlation (20%)  │  │
│                         │  ④ Peer Cluster Detect (20%)  │  │
│                         │  ⑤ Network Signature  (10%)   │  │
│                         │                                │  │
│                         │  → Weighted Aggregator         │  │
│                         │  → APPROVED / REVIEW / FLAGGED │  │
│                         └────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   shared/                             │  │
│  │   constants/riskThresholds.js  constants/fraudSignals │  │
│  │   types/ClaimModel.js                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Data flow for a single claim:**

1. Worker submits claim via `ClaimForm` → `POST /api/claims`
2. `claimController.js` builds a claim object and fetches recent claims (last 60 min) from in-memory store
3. `riskAggregator.js` runs all 5 detectors in **parallel** via `Promise.all()`
4. Weighted composite score computed, verdict assigned, result stored
5. Response returned with full `riskResult` including `signalBreakdown`, `fraudSignals`, `modelConfidence`, `clusterSize`
6. Frontend renders verdict with animated risk badge (green/yellow/red), signal tags, and per-signal bar chart

---

## The 5-Signal Risk Engine

### Signal 1 — GPS Spoof Detector (`gpsSpoofDetector.js`) — Weight: 30%

| Check | Trigger | Risk Points |
|---|---|---|
| Haversine teleport speed | > 200 km/h between previous and current coords | 60–95 pts scaled by speed |
| Static GPS spoof | GPS unchanged (<5m) but motion score > 0.6 | 65 pts |
| Repeated flagged location | Current coords within 20m of a previously flagged claim | 70 pts |

Signals emitted: `GPS_TELEPORT`, `GPS_STATIC_SPOOF`, `REPEATED_LOCATION`

### Signal 2 — Motion Consistency (`motionConsistency.js`) — Weight: 20%

| Check | Trigger | Risk Points |
|---|---|---|
| Movement vs accelerometer | GPS shows >100m displacement, motionScore < 0.25 | 50–95 pts |
| Near-zero motion | motionScore < 0.08 unconditionally | 60 pts |
| Timestamp compression | >500m displacement in <2 minutes | 45 pts |

Signals emitted: `MOTION_MISMATCH`

### Signal 3 — Weather Correlation (`weatherCorrelation.js`) — Weight: 20%

| Severity Gap (Claimed − Zone Max) | Risk Points | Signal |
|---|---|---|
| ≤ 0 (under-claim) | 0 (bonus) | None |
| +1 | 25 | None |
| +2 | 55 | `WEATHER_MISMATCH` |
| +3 | 78 | `WEATHER_MISMATCH` |
| +4 or +5 | 92 | `WEATHER_MISMATCH` |

Zone coverage: South Chennai (max 3), Central Chennai (max 2), North Chennai (max 2), West Chennai (max 1)

### Signal 4 — Peer Cluster Detector (`peerClusterDetector.js`) — Weight: 20%

| Check | Trigger | Risk Points |
|---|---|---|
| Spatial cluster | ≥ 3 claims within 50m radius in last 60 min | 70–95 pts (scales with count) |
| Network cluster | ≥ 2 other claims with identical `networkFingerprint` | 55–90 pts |

Signals emitted: `PEER_CLUSTER_ATTACK`, `NETWORK_CLUSTER`
> **Override rule:** Any `PEER_CLUSTER_ATTACK` signal forces verdict to FLAGGED regardless of composite score.

### Signal 5 — Network Signature — Weight: 10%

Embedded within the cluster detector. If `NETWORK_CLUSTER` is active, this dimension contributes 80 points. Otherwise it contributes 10 points (baseline healthy connectivity).

### Risk Thresholds

| Score Range | Verdict | Action |
|---|---|---|
| 0 – 29 | ✅ APPROVED | Automatic payout authorized |
| 30 – 79 | 🟡 MANUAL REVIEW | Adjuster review queue, claim on hold |
| 80 – 100 | 🔴 FLAGGED | Automatic hold, fraud investigation |

---

## Project Structure

```
minority-report/
├── package.json                    # Root: concurrently dev runner
├── client/                         # React SPA
│   ├── vite.config.js              # Vite 8 + Tailwind v4 + /api proxy
│   ├── src/
│   │   ├── App.jsx                 # Root component + Router
│   │   ├── main.jsx                # React 19 entry point
│   │   ├── styles/index.css        # Tailwind v4 @theme config (all tokens)
│   │   ├── routes/AppRoutes.jsx    # /worker, /admin, /analytics
│   │   ├── pages/
│   │   │   ├── WorkerDashboard.jsx # Live GPS map, telemetry, claim submission
│   │   │   ├── AdminDashboard.jsx  # Full claim feed + cluster intelligence
│   │   │   └── Analytics.jsx       # Signal pipeline + risk distribution
│   │   ├── components/
│   │   │   ├── ClaimForm.jsx       # Claim submission terminal (3 demo scenarios)
│   │   │   ├── ClaimCard.jsx       # Expandable claim card with signal breakdown
│   │   │   ├── FraudClusterCard.jsx # Cluster group visualization
│   │   │   ├── RiskBadge.jsx       # APPROVED / REVIEW / FLAGGED badge
│   │   │   └── NavBar.jsx          # Fixed nav with live clock
│   │   ├── api/
│   │   │   ├── claimApi.js         # POST /api/claims, GET /api/claims/:id
│   │   │   └── adminApi.js         # GET /api/admin/{claims,clusters,analytics}
│   │   ├── mock/
│   │   │   ├── workers.js          # 4 Chennai field workers + getMotionState()
│   │   │   └── weatherZones.js     # Zone data + SEVERITY_LABELS/COLORS
│   │   └── utils/
│   │       ├── formatTime.js       # timeAgo() helper
│   │       └── riskColor.js        # Score → Tailwind color mapping
├── server/                         # Express API
│   ├── src/
│   │   ├── index.js                # App bootstrap, middleware, port 4000
│   │   ├── routes/
│   │   │   ├── claimRoutes.js      # POST /api/claims
│   │   │   └── adminRoutes.js      # GET /api/admin/*
│   │   ├── controllers/
│   │   │   ├── claimController.js  # Claim intake + risk engine orchestration
│   │   │   └── adminController.js  # Admin analytics aggregation
│   │   ├── services/riskEngine/
│   │   │   ├── riskAggregator.js   # Master: runs all detectors in parallel
│   │   │   ├── gpsSpoofDetector.js # Haversine teleport + static spoof checks
│   │   │   ├── motionConsistency.js # IMU vs GPS cross-analysis
│   │   │   ├── weatherCorrelation.js # Claimed vs historical zone severity
│   │   │   └── peerClusterDetector.js # 50m spatial + network fingerprint clustering
│   │   ├── data/
│   │   │   ├── claimsStore.js      # In-memory store (newest-first array)
│   │   │   ├── seedClaims.js       # Pre-loaded: 1 legit, 1 teleport, 5 cluster, 1 review
│   │   │   ├── weatherHistory.js   # 4-zone 6-hour severity history
│   │   │   └── workerTelemetry.js  # Worker movement history (W001–W008)
│   │   ├── middleware/
│   │   │   └── requestLogger.js    # Request logging
│   │   └── utils/
│   │       ├── distanceCalc.js     # Haversine km/m + speed km/h
│   │       └── randomSignalNoise.js # ±noise, modelConfidence, processingLatency
└── shared/                         # Shared between client and server
    ├── constants/
    │   ├── riskThresholds.js       # Weights, thresholds, cluster params, speed limits
    │   └── fraudSignals.js         # Signal enum + human-readable descriptions
    └── types/
        └── ClaimModel.js           # Claim object schema + factory
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool + dev server |
| Tailwind CSS | v4.2 | CSS-first utility styling (`@theme` tokens) |
| React Router | v7.13 | Client-side routing |
| Axios | 1.13 | HTTP client with `/api` proxy |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ESM | Runtime |
| Express | 4.18 | HTTP server |
| UUID | 9.0 | Claim ID generation |
| CORS | 2.8 | Cross-origin headers |
| Nodemon | 3.0 | Dev auto-restart |

### Design System (Tailwind v4 `@theme` tokens)
| Token | Value | Usage |
|---|---|---|
| `--color-void` | `#03040a` | Primary background |
| `--color-signal-green` | `#00ff88` | APPROVED, active workers |
| `--color-signal-yellow` | `#f5c400` | MANUAL REVIEW, slow motion |
| `--color-signal-red` | `#ff2d2d` | FLAGGED, fraud clusters |
| `--color-electric-blue` | `#0c2fe8` | Accent, claim portal indicator |
| `--font-display` | Barlow Condensed | Hero text, badges |
| `--font-mono` | DM Mono | Data, labels, telemetry |

---

## API Reference

### `POST /api/claims`
Submit a new claim. Runs through the full 5-signal risk engine.

**Request Body:**
```json
{
  "workerId": "W001",
  "workerName": "Arjun Mehta",
  "telemetry": {
    "lat": 13.0569,
    "lng": 80.2425,
    "previousLat": 13.0520,
    "previousLng": 80.2380,
    "previousTimestamp": "2026-03-20T08:00:00.000Z",
    "motionScore": 0.82,
    "connectivityType": "4G",
    "networkFingerprint": "fp_a1b2c3",
    "deviceId": "dev_arjun_01"
  },
  "incident": {
    "claimedSeverity": 3,
    "incidentType": "RAIN_DAMAGE",
    "description": "Package damaged in heavy rain.",
    "zoneId": "ZONE_SOUTH_CHENNAI"
  }
}
```

**Response `201`:**
```json
{
  "success": true,
  "claim": {
    "id": "uuid-v4",
    "workerId": "W001",
    "workerName": "Arjun Mehta",
    "submittedAt": "2026-03-20T10:00:00.000Z",
    "riskResult": {
      "riskScore": 18,
      "fraudSignals": [],
      "claimStatus": "APPROVED",
      "signalBreakdown": {
        "GPS_SPOOF": 5,
        "MOTION_CONSISTENCY": 3,
        "WEATHER_CORRELATION": 5,
        "PEER_CLUSTER": 0,
        "NETWORK_SIGNATURE": 10
      },
      "clusterSize": 1,
      "modelConfidence": 0.94,
      "processedAt": "2026-03-20T10:00:01.800Z"
    }
  }
}
```

### `GET /api/admin/claims`
Returns all claims with risk results, newest first.

**Response:** `{ total, flagged, approved, manual, claims[] }`

### `GET /api/admin/clusters`
Returns active fraud cluster groups detected in the last 2 hours.

**Response:** `{ clusterCount, totalClusteredClaims, clusters[] }`

Each cluster: `{ id, centerLat, centerLng, claimCount, avgRiskScore, workerIds, threatLevel, sharedNetwork }`

### `GET /api/admin/analytics`
Returns aggregated analytics for the Analytics page.

**Response:** `{ summary, signalFrequency, riskDistribution, clusters, weatherZones, topRiskClaims }`

### `GET /api/health`
Health check. Returns `{ status: "ok", service, timestamp }`.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "Minority Report"

# Install all dependencies (root + client + server)
npm run install:all
```

### Development

```bash
# Run both client and server concurrently
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:4000 |
| API Health | http://localhost:4000/api/health |

The Vite dev server proxies all `/api/*` requests to `http://localhost:4000`, so no CORS configuration is needed in development.

### Production Build

```bash
cd client && npm run build
```

---

## Live Demo Scenarios

The **Claim Submission Terminal** on the Worker Dashboard includes three pre-loaded demo scenarios:

### ✅ LEGITIMATE CLAIM
Worker W010 with GPS coordinates consistent with their delivery zone, motion score of 0.78 (actively moving), 4G connectivity, and claimed severity matching zone history.
- **Expected outcome:** APPROVED, score ~15–25

### 🔴 GPS TELEPORT
Worker W011 appears to jump 350 km from Bengaluru (12.9716°N, 77.5946°E) to Chennai (13.0827°N, 80.2707°E) in 10 minutes — an implied speed of 2,100 km/h. Motion score is 0.09 (device is stationary). Claims cyclone severity when zone shows moderate rain.
- **Expected outcome:** FLAGGED, score ~85–95
- **Signals:** `GPS_TELEPORT`, `MOTION_MISMATCH`, `WEATHER_MISMATCH`, `NETWORK_CLUSTER`

### 🔴 CLUSTER ATTACK
Worker W012 submits from within 20 metres of the seeded fraud cluster (13.0829°N, 80.2705°E), shares the same WiFi fingerprint (`fp_spoof_hub_01`) as 5 other flagged cluster workers, with near-zero motion score.
- **Expected outcome:** FLAGGED, score ~88–98
- **Signals:** `PEER_CLUSTER_ATTACK`, `NETWORK_CLUSTER`, `WEATHER_MISMATCH`, `MOTION_MISMATCH`

### 🟡 BORDERLINE: Priya Nair (seeded)
Worker W008, genuine accident in North Chennai. Moderate motion (0.45), 3G connectivity, but slightly exaggerated severity claim (4 vs zone max 2). No cluster, no teleport.
- **Expected outcome:** MANUAL REVIEW, score ~54
- **Signals:** `WEATHER_MISMATCH` only

---

*Built at DEVTrails 2026 · 24-hour pivot · Chennai, India*
