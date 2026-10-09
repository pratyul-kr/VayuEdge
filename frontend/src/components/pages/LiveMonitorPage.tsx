import React, { useEffect, useState } from 'react';
import { SensorDetail } from '../../types';
import { TrendIndicator } from '../common/TrendIndicator';
import { Activity, Clock, SlidersHorizontal, Wifi, WifiOff } from 'lucide-react';
import { api } from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface LiveMonitorPageProps {
  sensors: SensorDetail[];
  onSelectSensor?: (sensorType: string) => void;
}

export const LiveMonitorPage: React.FC<LiveMonitorPageProps> = ({ sensors }) => {
  const [timeRange, setTimeRange] = useState<'5m' | '30m' | '1h' | '6h' | '24h'>('1h');
  const [selectedSensorType, setSelectedSensorType] = useState<string>('PM2.5');
  const [hardwareStatus, setHardwareStatus] = useState<{ connected: boolean; source: string; age_seconds: number | null } | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const status = await api.getHardwareStatus();
        if (active) setHardwareStatus(status);
      } catch {
        if (active) setHardwareStatus(null);
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const activeSensor = sensors.find(s => s.sensor_type === selectedSensorType) || sensors[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Activity className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Live Sensor Monitor
            </h1>
            <span className="metric-live-badge">
              <span className="live-beacon"></span>
              Live Telemetry (1 Hz)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Real-time telemetry stream updating continuously with smooth state transitions.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white border-2 border-slate-900 rounded-md shadow-[2px_2px_0px_#0f172a]">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Range:
          </span>
          {(['5m', '30m', '1h', '6h', '24h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                timeRange === r
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex items-center justify-between gap-3 border-2 border-slate-900 rounded-md px-4 py-3 shadow-[2px_2px_0px_#0f172a] ${hardwareStatus?.connected ? 'bg-emerald-50' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          {hardwareStatus?.connected ? <Wifi className="w-5 h-5 text-emerald-700" /> : <WifiOff className="w-5 h-5 text-slate-500" />}
          <div>
            <div className="text-sm font-black text-slate-950">Arduino UNO Q: {hardwareStatus?.connected ? 'Connected' : 'Live Demo Simulation'}</div>
            <div className="text-xs text-slate-600">{hardwareStatus?.connected ? `Hardware readings · updated ${Math.floor(hardwareStatus.age_seconds ?? 0)}s ago` : 'Real-time multi-harmonic edge sensor simulator actively streaming'}</div>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-1 border border-slate-900 rounded ${hardwareStatus?.source === 'hardware' ? 'bg-emerald-200' : 'bg-amber-100'}`}>{hardwareStatus?.source ?? 'demo'}</span>
      </div>

      {/* Primary Highlight Chart for selected sensor */}
      {activeSensor && (
        <section className="neo-card p-6 bg-white" aria-labelledby="heading-active-sensor">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-900 mb-6">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Channel
              </div>
              <h2 id="heading-active-sensor" className="text-xl sm:text-2xl font-black text-slate-950 m-0">
                {activeSensor.display_name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-950 smooth-number">
                {activeSensor.current_value} {activeSensor.unit}
              </span>
              <TrendIndicator trend={activeSensor.trend} ratePct={activeSensor.rate_of_change_15m} />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeSensor.history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="timestamp" stroke="#0f172a" fontSize={11} fontWeight={600} />
                <YAxis stroke="#0f172a" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #0f172a',
                    borderRadius: '6px',
                    boxShadow: '3px 3px 0px #0f172a',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} ${activeSensor.unit}`, activeSensor.sensor_type]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={3}
                  dot={{ fill: '#0284c7', stroke: '#0f172a', strokeWidth: 2, r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-900" />
              <span>Last reading: <strong>{activeSensor.last_reading_time}</strong></span>
            </div>
            <div>
              Sensor range: <strong>{activeSensor.min_threshold} – {activeSensor.max_threshold} {activeSensor.unit}</strong>
            </div>
          </div>
        </section>
      )}

      {/* Grid of all sensor channels */}
      <div>
        <div className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3">
          All Hardware Channels
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => {
            const isSelected = sensor.sensor_type === selectedSensorType;
            return (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensorType(sensor.sensor_type)}
                className={`neo-card p-4 bg-white cursor-pointer transition-all ${
                  isSelected ? 'border-amber-500 shadow-[4px_4px_0px_#ca8a04]' : 'hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-600 truncate">{sensor.display_name}</span>
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-900 rounded">
                    {sensor.sensor_type}
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-2">
                  <span className="text-3xl font-black text-slate-950 smooth-number">
                    {sensor.current_value}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {sensor.unit}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <TrendIndicator trend={sensor.trend} ratePct={sensor.rate_of_change_15m} size="sm" />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                    sensor.status === 'SIMULATED'
                      ? 'bg-amber-100 text-amber-950 border-amber-700'
                      : sensor.status.includes('CRITICAL')
                      ? 'bg-rose-100 text-rose-950 border-rose-900'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-900'
                  }`}>
                    {sensor.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
