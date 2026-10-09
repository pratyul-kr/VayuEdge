# AetherEdge: Edge AI Air Pollution Intelligence Platform

> **"Don't just show pollution. Explain it, predict it, and help the user respond to it."**  
> An autonomous, offline-first Progressive Web App (PWA) and Edge AI system architected for the **Arduino UNO Q** dual-core hardware platform (STM32 Coprocessor + Linux Application SoC).

---

## 1. System Philosophy & Information Hierarchy

Traditional IoT monitors answer only one question: *"What is the AQI?"*  
**AetherEdge** delivers a complete closed-loop environmental intelligence cycle:

```
    DETECT ───► UNDERSTAND ───► PREDICT ───► RECOMMEND ───► ACT ───► RE-EVALUATE
```

The system answers five critical operational questions directly:
1. **What is happening?** → Real-time EPA AQI, category, dominant pollutant, and velocity trend.
2. **Why is it happening?** → Probabilistic multi-channel pollution source attribution (road dust, vehicle combustion, biomass, etc.).
3. **What is likely to happen next?** → Short-term forward forecast (+15m, +30m, +60m, +120m) with 90% confidence bands.
4. **Where is it happening?** → Hyperlocal spatial grid matrix and multi-node perimeter mapping.
5. **What should the user do?** → Contextual behavioral guidance, alternative safe transit corridors, and local HVAC relay commands.

---

## 2. Hardware Architecture: Arduino UNO Q Dual-Core Engine

The edge deployment targets the **Arduino UNO Q**, partitioning real-time control from complex machine intelligence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARDUINO UNO Q PLATFORM                          │
├───────────────────────────────────┬────────────────────────────────────┤
│   STM32 MICROCONTROLLER CORE      │     LINUX APPLICATION SOC CORE     │
│   (Real-Time Sensor Acquisition)  │       (Machine Intelligence)       │
├───────────────────────────────────┼────────────────────────────────────┤
│ • 100 Hz ADC & Optical Pulse Bus  │ • Kalman Noise Filtering           │
│ • Laser PM2.5 / PM10 (PMS5003)    │ • Thermal & Hygroscopic Swelling   │
│ • NDIR CO2 & Electrochemical CO   │   Calibration Matrix               │
│ • BME280 (Temp, Humidity, Baro)   │ • Multivariate Fingerprint Engine  │
│ • Local Actuator Relay Dispatch   │ • Autoregressive Time-Series Model │
│ • Hardware Watchdog & Failsafe    │ • Deterministic Decision Engine    │
│                                   │ • Local SQLite Store & FastAPI     │
└───────────────────────────────────┴────────────────────────────────────┘
                                     │ (Autonomous Edge Device)
                                     ▼
                         OFFLINE-FIRST PWA CLIENT
                   (IndexedDB Cache + Service Worker Shell)
```

- **Fully Autonomous Edge**: Core inference, source attribution, and safety dispatches run entirely on the local device.
- **Local Persistence & Buffer**: Telemetry is buffered in local flash storage and serviced directly to local network clients without remote dependencies.

---

## 3. UI/UX Design System: Professional Neo-Brutalism

- **Theme**: Crisp Light Theme with high-contrast surfaces (`#ffffff`, `#f8fafc`, `#0f172a`).
- **Structure**: 2px solid border hierarchy, subtle hard drop-shadows (`box-shadow: 3px 3px 0px #0f172a`), slightly rounded corners (`rounded-lg`), bold typography.
- **Semantic Environmental Palette**:
  - `GOOD`: Green (`#16a34a`)
  - `MODERATE`: Yellow/Amber (`#ca8a04`)
  - `POOR`: Orange (`#ea580c`)
  - `UNHEALTHY`: Red (`#dc2626`)
  - `CRITICAL`: Deep Crimson (`#991b1b`)
- **Accessibility & Cleanliness**: No generic gradients, no glassmorphism, no emojis; pure SVG Lucide iconography and readable contrast ratios.

---

## 4. Evaluation & Demo Scenarios (Judge Mode)

The system features a **Judging / Demo Controller Bar** allowing evaluators to simulate real-world pollution incidents in real time:

| Scenario | Simulated Environmental Event | Edge AI System Response |
| :--- | :--- | :--- |
| **1. Road Dust Event** | PM10 surges to 126 µg/m³, PM2.5 at 82 µg/m³ (ratio 1.54); stable CO. | Attributed to *Road dust / traffic turbulence* (78% conf); forecast increases over 30m; recommends west perimeter route; throttles building air intake. |
| **2. Clean Ambient Baseline** | AQI 32; PM2.5: 14 µg/m³; all channels safe. | Clean dispersion; natural ventilation enabled; all outdoor activities permitted. |
| **3. Traffic Combustion** | Carbon monoxide rises to 4.8 ppm; PM2.5: 98 µg/m³; elevated VOC. | Attributed to *Vehicle exhaust / combustion* (88% conf); forecast rush hour escalation; alerts sensitive individuals. |
| **4. Rapid Spike Event** | PM2.5 surges to 165 µg/m³ (+38% in 15m). | Anomaly detector triggers *CRITICAL*; emergency building intake seal engaged. |
| **5. Forecast Worsening** | High humidity (85%), boundary layer stagnation. | Multi-step forecast model projects peak within 45 minutes. |
| **6. Offline Edge Mode** | Internet connectivity severed. | Status indicator switches to `OFFLINE (EDGE LOCAL)`; local telemetry buffers in queue; decision engine functions without interruption. |

---

## 5. Technology Stack

### Backend
- **Python 3.10+ / FastAPI**: High-performance asynchronous REST API and WebSocket server.
- **SQLAlchemy & SQLite**: Lightweight local transactional edge storage.
- **Pydantic v2**: Strict schema validation and data integrity.
- **Uvicorn**: High-throughput ASGI server.

### Frontend
- **React 19 + TypeScript**: Type-safe responsive component architecture.
- **Vite 6**: Instant HMR and optimized bundler.
- **Tailwind CSS v4**: Utility-driven Neo-Brutalist design tokens.
- **Recharts**: Responsive time-series charts with confidence interval visualization.
- **Lucide React**: Clean SVG iconography.
- **Progressive Web App (PWA)**: Custom Service Worker (`public/sw.js`) with cache-first static shell and network-first API fallback.

---

## 6. Project Directory Structure

```
Hackathon3/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI initialization & middleware
│   │   ├── api/routes/              # Clean modular REST route handlers
│   │   │   ├── overview.py          # Flagship Overview endpoint
│   │   │   ├── sensors.py           # Real-time sensors & fusion pipeline
│   │   │   ├── forecast.py          # Predictive trajectories & confidence
│   │   │   ├── sources.py           # Source attribution & fingerprints
│   │   │   ├── predictions.py       # Forward event horizons
│   │   │   ├── decisions.py         # Rule traces & actuator states
│   │   │   ├── events.py            # Detected event anomaly logs
│   │   │   ├── nodes.py             # Multi-node topology
│   │   │   ├── map.py               # Hyperlocal 3x3 spatial grid
│   │   │   └── system.py            # Hardware health, scenarios, offline toggle
│   │   ├── ai/                      # Modular Edge AI inference modules
│   │   │   ├── inference.py         # EPA AQI calculation & dominant driver
│   │   │   ├── source_attribution.py# Pollution fingerprint engine
│   │   │   ├── forecasting.py       # Autoregressive time-series model
│   │   │   ├── anomaly_detection.py # Velocity & threshold event detector
│   │   │   └── decision_engine.py   # Explainable rule evaluator & actuators
│   │   ├── core/                    # Config & structured logging
│   │   ├── db/                      # SQLAlchemy database engine
│   │   ├── models/                  # Database relational models
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── services/                # Business logic & simulation manager
│   │   └── websocket/               # Real-time telemetry streaming
│   ├── tests/                       # Pytest test suite (100% pass)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── sw.js                    # Service worker offline caching
│   │   └── icon.svg                 # Vector PWA application icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # AQIBadge, TrendIndicator, StatusIndicator, DemoBar
│   │   │   ├── layout/              # Header, Sidebar navigation
│   │   │   └── pages/               # All 10 application views
│   │   │       ├── OverviewPage.tsx # Primary intelligence experience
│   │   │       ├── LiveMonitorPage.tsx
│   │   │       ├── SensorFusionPage.tsx
│   │   │       ├── ForecastPage.tsx
│   │   │       ├── SourcesPage.tsx
│   │   │       ├── PredictionsPage.tsx
│   │   │       ├── DecisionsPage.tsx
│   │   │       ├── MapPage.tsx
│   │   │       ├── EventsPage.tsx
│   │   │       ├── NodesPage.tsx
│   │   │       └── SystemPage.tsx
│   │   ├── services/api.ts          # API client with localStorage offline fallback
│   │   ├── types/index.ts           # Shared TypeScript interfaces
│   │   ├── App.tsx                  # Main application controller
│   │   ├── index.css                # Neo-Brutalist design system tokens
│   │   └── main.tsx                 # Entrypoint & PWA registration
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 7. Setup & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Backend Setup
```bash
# In project root:
python -m venv venv

# Windows activate:
.\venv\Scripts\activate

# Install dependencies:
pip install -r backend\requirements.txt

# Run test suite:
pytest backend\tests\test_api.py

# Launch FastAPI server:
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*API documentation is automatically available at `http://127.0.0.1:8000/docs`.*

### Step 2: Frontend Setup
```bash
# In frontend directory:
cd frontend
npm install
npm run build     # Verify TypeScript & production bundle
npm run dev       # Starts Vite on http://127.0.0.1:5173/
```

Open `http://127.0.0.1:5173/` in any browser to interact with the platform.

### Connect an Arduino UNO Q

The backend accepts live sensor values at `POST /api/v1/hardware/telemetry` and the Live Sensor Monitor reports whether telemetry has arrived in the last 30 seconds. The UNO Q and the computer hosting the backend must be on the same network. Start the backend on a LAN interface so the board can reach it:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Replace `192.168.1.20` below with the backend computer's LAN IP. For a quick connection check, send one JSON sample from any machine on the network:

```bash
curl -X POST http://192.168.1.20:8000/api/v1/hardware/telemetry \
  -H "Content-Type: application/json" \
  -d '{"node_id":"NODE-01","sensors":{"PM2.5":12.4,"PM10":18.2,"Temperature":25.1,"Humidity":48.0}}'
```

#### MQ-7 + MQ-135 + DHT22 App Lab example

The provided example files assume **MQ-7 AO → A0**, **MQ-135 AO → A1**, and **DHT22 DATA → D2**. Connect all sensor grounds to UNO Q GND. If your wiring uses different pins, edit the constants at the top of `hardware/uno_q_sketch.ino` to match it. In Arduino App Lab, put that file in the Sketch editor, put `hardware/uno_q_app_main.py` in the Python editor, and add **DHT sensor library by Adafruit** to the app's sketch libraries. Change `192.168.1.20` in the Python file to the backend computer's LAN IP.

**Check analog voltage before connecting MQ AO:** the UNO Q ADC range is 0–3.3 V. Many MQ modules are powered at 5 V and can output more than 3.3 V; use a suitable voltage divider or level-conditioning circuit if the module's AO can exceed 3.3 V. Do not connect an over-voltage analog output directly to A0/A1. Power the DHT22 according to its module, use a common ground, and keep its data signal within the UNO Q's 3.3 V logic range.

Start the backend with `--host 0.0.0.0`, run the App Lab app, then open **Live Sensor Monitor**. It should show `MQ-7 Raw Signal`, `MQ-135 Raw Signal`, `Temperature`, and `Humidity`; the hardware status should stay connected while samples arrive. The MQ channels are displayed as raw ADC counts. They are not ppm readings until the particular modules are warmed up and calibrated. The UNO Q's [official manual](https://docs.arduino.cc/tutorials/uno-q/user-manual/) documents the 3.3 V ADC and the Linux/STM32 Bridge used by these files.
