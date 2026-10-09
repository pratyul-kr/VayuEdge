import React, { useState } from 'react';
import { Sliders, Check, WifiOff, RefreshCw } from 'lucide-react';

interface DemoScenarioBarProps {
  currentScenario: string;
  onSelectScenario: (id: string) => void;
  isOnline: boolean;
  onToggleOffline: () => void;
  onSync: () => void;
}

const SCENARIOS = [
  { id: 'road_dust', label: '1. Road Dust Event', desc: 'PM10 elevated (126 µg/m³), mechanical friction' },
  { id: 'normal', label: '2. Normal Air Quality', desc: 'AQI 32, nominal baseline' },
  { id: 'traffic', label: '3. Traffic Combustion', desc: 'High CO (4.8 ppm), fine particulates (PM2.5: 98 µg/m³)' },
  { id: 'spike', label: '4. Rapid Pollution Spike', desc: 'Sudden particulate surge, actuator trigger' },
  { id: 'forecast_worsening', label: '5. Worsening Trend', desc: 'Inversion stagnation, rising 45-min forecast' },
  { id: 'offline', label: '6. Standalone Offline', desc: 'Autonomous edge operation with local buffer' }
];

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  currentScenario,
  onSelectScenario,
  isOnline,
  onToggleOffline,
  onSync
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-amber-50 border-b-2 border-slate-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-bold border border-slate-900 rounded text-[10px]">
            Demo Scenarios
          </span>
          <span className="text-slate-700 font-semibold hidden sm:inline">
            Active:
          </span>
          <span className="font-bold text-slate-950">
            {SCENARIOS.find(s => s.id === currentScenario)?.label || currentScenario}
          </span>
          <span className="text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-900 flex items-center gap-1.5 font-bold shadow-[1px_1px_0px_#0f172a]">
            <span className="live-beacon"></span>
            Real-Time Demo Stream (1 Hz)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-900 px-2.5 py-1 rounded font-bold text-slate-900 shadow-[1px_1px_0px_#0f172a] hover:bg-slate-50 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Select Scenario</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white border-2 border-slate-900 rounded-lg shadow-[4px_4px_0px_#0f172a] z-50 p-2">
                <div className="text-[11px] font-black text-slate-500 uppercase px-2 py-1 border-b border-slate-200 mb-1">
                  Preset Edge Scenarios
                </div>
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      onSelectScenario(sc.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded mb-1 text-xs transition-colors flex items-start justify-between cursor-pointer ${
                      currentScenario === sc.id
                        ? 'bg-amber-100 border border-slate-900 font-bold text-slate-950'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{sc.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{sc.desc}</div>
                    </div>
                    {currentScenario === sc.id && <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleOffline}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border border-slate-900 shadow-[1px_1px_0px_#0f172a] cursor-pointer transition-colors ${
              !isOnline ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-800 hover:bg-slate-100'
            }`}
            title="Toggle network connectivity"
          >
            <WifiOff className="w-3 h-3" />
            <span>{isOnline ? 'Disconnect Network' : 'Connect Network'}</span>
          </button>

          <button
            onClick={onSync}
            className="inline-flex items-center gap-1 bg-white border border-slate-900 px-2.5 py-1 rounded font-bold text-slate-900 shadow-[1px_1px_0px_#0f172a] hover:bg-slate-50 cursor-pointer"
            title="Flush queued edge telemetry"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Flush Buffer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
