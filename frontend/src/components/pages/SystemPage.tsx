import React from 'react';
import { SystemStatusData } from '../../types';
import { Settings, Cpu, Thermometer, WifiOff, RefreshCw, Zap, Server } from 'lucide-react';

interface SystemPageProps {
  data: SystemStatusData;
  onSelectScenario: (scenarioId: string) => void;
  onToggleOffline: () => void;
  onSync: () => void;
}

const SCENARIOS = [
  { id: 'road_dust', title: '1. Road Dust Event', desc: 'PM10 elevated (126 µg/m³), PM2.5 at 82 µg/m³, mechanical abrasion' },
  { id: 'normal', title: '2. Normal Air Quality', desc: 'AQI 32, clean ambient baseline across all parameters' },
  { id: 'traffic', title: '3. Vehicle Combustion', desc: 'High CO (4.8 ppm), elevated PM2.5 (98 µg/m³), fine aerosol' },
  { id: 'spike', title: '4. Rapid Spike Event', desc: 'Threshold exceedance, HVAC isolation relay engaged' },
  { id: 'forecast_worsening', title: '5. Worsening Trend', desc: 'Atmospheric inversion stagnation, rising 45-min forecast' },
  { id: 'offline', title: '6. Standalone Offline', desc: 'Autonomous edge operation with local buffer storage' },
];

export const SystemPage: React.FC<SystemPageProps> = ({
  data,
  onSelectScenario,
  onToggleOffline,
  onSync
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              System Diagnostics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Arduino UNO Q hardware telemetry, dual-core partitioning, and edge inference benchmarks.
          </p>
        </div>

        <div className="neo-badge bg-emerald-100 text-emerald-950 border-emerald-900">
          Mode: {data.edge_mode}
        </div>
      </div>

      {/* Hardware Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="neo-card p-4 bg-white">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase">
            <Cpu className="w-3.5 h-3.5 text-slate-900" /> CPU Load
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
            {data.cpu_usage_pct}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">ARM Cortex Linux Core</div>
        </div>

        <div className="neo-card p-4 bg-white">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase">
            <Server className="w-3.5 h-3.5 text-slate-900" /> RAM Used
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
            {data.memory_usage_mb} MB
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Linux Runtime Footprint</div>
        </div>

        <div className="neo-card p-4 bg-white">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase">
            <Thermometer className="w-3.5 h-3.5 text-slate-900" /> SoC Temp
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
            {data.temperature_c}°C
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Passive Thermal Dissipation</div>
        </div>

        <div className="neo-card p-4 bg-white">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase">
            <Zap className="w-3.5 h-3.5 text-slate-900" /> Latency
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
            {data.inference_latency_ms} ms
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">On-Device Inference</div>
        </div>
      </div>

      {/* Arduino UNO Q Dual-Core Hardware Partitioning */}
      <section className="neo-card p-6 bg-white" aria-labelledby="heading-arch">
        <h2 id="heading-arch" className="text-sm font-black text-slate-950 pb-3 border-b-2 border-slate-900 mb-4 m-0">
          Arduino UNO Q Dual-Core Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <span className="font-black text-slate-950 text-sm">
                STM32 Microcontroller Core
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-800 text-[10px] font-bold">
                Hardware Acquisition
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-700 font-medium">
              <li>• Real-time sampling of optical dust counter, CO, and BME280</li>
              <li>• Direct digital GPIO and relay triggers for physical actuators</li>
              <li>• Hardware watchdog and autonomous fault-recovery loop</li>
              <li>• Low-latency UART/SPI communications with Linux SoC</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50/70 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <span className="font-black text-slate-950 text-sm">
                Linux Application SoC Core
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-900 text-[10px] font-bold">
                Edge AI
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-700 font-medium">
              <li>• Kalman noise filtering and hygroscopic swelling compensation</li>
              <li>• Pollution fingerprint extraction and source attribution</li>
              <li>• Short-term time-series forecasting (Edge Holt-Winters/ARIMA)</li>
              <li>• Deterministic decision engine and local SQLite storage</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Offline-First Resilience & Local Storage */}
      <section className="neo-card p-6 bg-white" aria-labelledby="heading-offline-controls">
        <h2 id="heading-offline-controls" className="text-sm font-black text-slate-950 pb-3 border-b-2 border-slate-900 mb-4 m-0">
          Autonomous Operation and Local Storage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-sm font-bold text-slate-900">
              Network Status:{' '}
              <span className={data.is_internet_connected ? 'text-emerald-700' : 'text-amber-700'}>
                {data.is_internet_connected ? 'Network Connected' : 'Offline (Autonomous)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              When network link is unavailable, telemetry accumulates in local flash memory (SQLite/IndexedDB).
              Sensor fusion, forecasting, and actuator dispatches continue without interruption.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-500">
              Buffered records in local flash: <strong>{data.unsynced_readings_queued}</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onToggleOffline}
              className={`neo-button text-xs font-bold cursor-pointer ${
                !data.is_internet_connected ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-800'
              }`}
            >
              <WifiOff className="w-4 h-4" />
              <span>{data.is_internet_connected ? 'Disconnect Network' : 'Connect Network'}</span>
            </button>

            <button
              onClick={onSync}
              className="neo-button text-xs font-bold bg-white text-slate-800 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Flush Buffer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Demo Scenarios Palette */}
      <section className="neo-card p-6 bg-white" aria-labelledby="heading-scenarios">
        <h2 id="heading-scenarios" className="text-sm font-black text-slate-950 pb-3 border-b-2 border-slate-900 mb-4 m-0">
          Evaluation Presets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className="p-3.5 bg-slate-50 hover:bg-amber-50 border-2 border-slate-900 rounded-lg text-left transition-all cursor-pointer shadow-[2px_2px_0px_#0f172a] hover:translate-x-0.5"
            >
              <div className="font-black text-xs text-slate-950">
                {sc.title}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-1">
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
