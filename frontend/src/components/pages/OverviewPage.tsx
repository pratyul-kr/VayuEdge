import React from 'react';
import { OverviewData, NavigationTab } from '../../types';
import { AQIBadge } from '../common/AQIBadge';
import { AQISpectrumBar } from '../common/AQISpectrumBar';
import { TrendIndicator } from '../common/TrendIndicator';
import {
  ArrowRight,
  TrendingUp,
  Search,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Radio,
  ExternalLink
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface OverviewPageProps {
  data: OverviewData;
  onNavigate: (tab: NavigationTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ data, onNavigate }) => {
  const { air_quality, why_happening, what_happens_next, what_should_i_do, local_map, recent_events, quick_sensors } = data;

  // Chart data for forecast snippet
  const forecastChartData = what_happens_next.points.map(p => ({
    time: p.time_label,
    aqi: p.predicted_aqi,
    lower: p.lower_bound,
    upper: p.upper_bound
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* SECTION 1: WHAT IS HAPPENING? (CURRENT AIR QUALITY) */}
      <section className="neo-card p-6 sm:p-7 bg-white relative overflow-hidden" aria-labelledby="heading-air-quality">
        {/* Status header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-900 mb-6">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-slate-900 animate-pulse" />
            <h1 id="heading-air-quality" className="text-xs sm:text-sm font-black tracking-wider text-slate-700 m-0">
              Air Quality Overview
            </h1>
            <span className="neo-tag">
              {data.node_id} • {data.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="metric-live-badge">
              <span className="live-beacon"></span>
              Live (1 Hz)
            </span>
            <AQIBadge status={air_quality.status} size="lg" />
            <span className="neo-tag bg-slate-100 text-slate-700">
              {air_quality.data_freshness_desc}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dominant AQI Number block */}
          <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r-2 border-slate-900 pb-6 lg:pb-0 lg:pr-8">
            <div className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Current Air Quality Index
            </div>

            <div className="flex items-baseline gap-4 mt-1">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-950 tracking-tighter smooth-number">
                {air_quality.aqi}
              </span>
              <div>
                <span className="text-xl font-black text-slate-400 uppercase tracking-widest block">
                  AQI
                </span>
                <span className="neo-tag mt-0.5">
                  EPA Standard
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {air_quality.status.replace(/_/g, ' ')}
              </span>
              <TrendIndicator trend={air_quality.trend} ratePct={air_quality.trend_rate_pct} />
            </div>

            {/* Dominant Pollutant highlight */}
            <div className="mt-4 p-3 bg-amber-50 border border-slate-900 rounded-md shadow-[1.5px_1.5px_0px_#0f172a]">
              <div className="text-xs text-slate-800">
                <strong className="font-black text-slate-950 text-sm">
                  {air_quality.dominant_pollutant}
                </strong>{' '}
                is currently the dominant pollutant at{' '}
                <strong className="font-black text-slate-950">
                  {air_quality.dominant_pollutant_val} {air_quality.dominant_pollutant_unit}
                </strong>
                .
              </div>
            </div>

            {/* Visual AQI Spectrum Bar */}
            <AQISpectrumBar aqi={air_quality.aqi} />
          </div>

          {/* Quick Sensor Snapshot (SECTION 2) */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Current Sensor Readings
              </div>
              <button
                onClick={() => onNavigate('monitor')}
                className="text-xs font-bold text-slate-700 hover:text-slate-950 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Sensors</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quick_sensors.map((s) => (
                <div
                  key={s.sensor_type}
                  className="neo-card-sm p-3.5 bg-slate-50 hover:bg-white transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="font-bold truncate">{s.name}</span>
                    <span className="neo-tag text-[9px]">{s.sensor_type}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-black text-slate-950 smooth-number">
                      {s.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {s.unit}
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className={`font-black ${
                      s.status === 'CRITICAL' ? 'text-rose-700' : (s.status === 'HIGH' ? 'text-amber-700' : 'text-emerald-700')
                    }`}>
                      {s.status}
                    </span>
                    <span className="text-slate-500 text-[10px] font-semibold">{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: WHY IS THIS HAPPENING? & WHAT HAPPENS NEXT? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHY IS THIS HAPPENING? */}
        <section className="neo-card p-6 bg-white flex flex-col justify-between" aria-labelledby="heading-why">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-900" />
                <h2 id="heading-why" className="text-sm font-black tracking-wider text-slate-950 m-0">
                  Why is this happening?
                </h2>
              </div>
              <span className="neo-badge bg-amber-100 text-amber-950 border-amber-900">
                Source Attribution
              </span>
            </div>

            <div className="mb-4">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                Likely Cause
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                {why_happening.likely_source}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-bold text-xs">
                  Confidence: {Math.round(why_happening.confidence * 100)}%
                </span>
                <span className="text-xs text-slate-500 italic">
                  (Estimated from sensor signature)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-md border border-slate-300 mb-4">
              {why_happening.summary}
            </p>

            <div className="space-y-2 mb-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Supporting Evidence:
              </div>
              {why_happening.evidence_highlights.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-slate-900 mt-2">
            <button
              onClick={() => onNavigate('sources')}
              className="neo-button w-full text-xs font-black uppercase tracking-wider"
            >
              <span>View Source Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* WHAT HAPPENS NEXT? */}
        <section className="neo-card p-6 bg-white flex flex-col justify-between" aria-labelledby="heading-forecast">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-900" />
                <h2 id="heading-forecast" className="text-sm font-black tracking-wider text-slate-950 m-0">
                  What happens next?
                </h2>
              </div>
              <span className="neo-badge bg-sky-100 text-sky-950 border-sky-900">
                Forecast
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              {what_happens_next.points.map((p, idx) => (
                <div
                  key={p.time_label}
                  className={`p-2.5 rounded-lg border-2 border-slate-900 ${
                    idx === 0
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_#0f172a]'
                      : 'bg-slate-50 hover:bg-white transition-colors'
                  }`}
                >
                  <div className={`text-[10px] font-bold ${idx === 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.time_label}
                  </div>
                  <div className="text-xl font-black mt-0.5">
                    {p.predicted_aqi}
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${
                    idx === 0
                      ? 'text-amber-400'
                      : (p.predicted_aqi > air_quality.aqi ? 'text-rose-600' : 'text-emerald-600')
                  }`}>
                    {p.trend}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-300 mb-3">
              <div className="text-xs font-bold text-slate-900">
                Expected Trend:{' '}
                <span className="font-normal text-slate-700">
                  {what_happens_next.summary}
                </span>
              </div>
            </div>

            {/* Sparkline visualization */}
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#0f172a" fontSize={11} fontWeight={700} />
                  <YAxis stroke="#0f172a" fontSize={11} domain={['dataMin - 15', 'dataMax + 15']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '2px solid #0f172a',
                      borderRadius: '6px',
                      boxShadow: '3px 3px 0px #0f172a',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={{ fill: '#ea580c', stroke: '#0f172a', strokeWidth: 2, r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-slate-900 mt-2">
            <button
              onClick={() => onNavigate('forecast')}
              className="neo-button w-full text-xs font-black uppercase tracking-wider"
            >
              <span>View Full Forecast</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {/* SECTION 5: WHAT SHOULD I DO? (DECISION ENGINE & RECOMMENDATION) */}
      <section className="neo-card p-6 bg-amber-50/70 border-slate-900 relative" aria-labelledby="heading-recommendation">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-900 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
            <h2 id="heading-recommendation" className="text-sm font-black tracking-wider text-slate-950 m-0">
              What should I do?
            </h2>
          </div>
          <span className="neo-badge bg-rose-100 text-rose-950 border-rose-900">
            Action Guidance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-3">
            <div className="text-base font-bold text-slate-900">
              {what_should_i_do.advisory}
            </div>

            <div className="p-4 bg-white border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a]">
              <div className="text-xs font-black uppercase tracking-wider text-amber-800">
                Recommendation
              </div>
              <div className="text-lg font-black text-slate-950 mt-1">
                {what_should_i_do.recommendation}
              </div>
              <div className="mt-2 text-xs font-medium text-slate-600 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-900" />
                <span>Suggested Duration: <strong>{what_should_i_do.suggested_duration}</strong></span>
              </div>
            </div>

            {what_should_i_do.alternative_action && (
              <div className="p-3 bg-white/90 border border-slate-900 rounded text-xs font-semibold text-slate-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950">Alternative Route: </span>
                  {what_should_i_do.alternative_action}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-600 font-medium pt-1">
              <strong>Why?</strong> {what_should_i_do.rationale}
            </div>
          </div>

          <div className="md:col-span-4 bg-white border-2 border-slate-900 p-4 rounded-lg shadow-[2px_2px_0px_#0f172a] space-y-3">
            <div className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Local Actuator Control
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                Ventilation Actuator:
              </div>
              <div className="mt-1 font-mono text-xs font-black px-2.5 py-1.5 bg-slate-100 border border-slate-900 rounded text-slate-950 break-all">
                {what_should_i_do.actuator_action || 'VENTILATION_DAMPER_SEAL'}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-600">Hardware State:</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-800 rounded font-bold text-[11px]">
                {what_should_i_do.actuator_state || 'ENGAGED'}
              </span>
            </div>

            <button
              onClick={() => onNavigate('decisions')}
              className="neo-button w-full text-xs font-bold mt-2"
            >
              <span>View Decision Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: LOCAL POLLUTION MAP (WHERE IS IT HAPPENING?) */}
      <section className="neo-card p-6 bg-white" aria-labelledby="heading-map">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-900 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-900" />
            <h2 id="heading-map" className="text-sm font-black tracking-wider text-slate-950 m-0">
              Where is pollution happening?
            </h2>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Pollution Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {local_map.map((node) => (
            <div
              key={node.node_id}
              className={`p-4 rounded-lg border-2 border-slate-900 transition-all ${
                node.node_id === data.node_id
                  ? 'bg-amber-50 shadow-[3px_3px_0px_#0f172a]'
                  : 'bg-slate-50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-black text-slate-950">{node.node_id}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  node.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-900 border-emerald-800' : 'bg-slate-200 border-slate-600'
                }`}>
                  {node.status}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700 truncate">
                {node.name}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-950">
                    {node.aqi}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 ml-1">AQI</span>
                </div>
                <AQIBadge status={node.status === 'ONLINE' && node.aqi > 150 ? 'UNHEALTHY' : (node.aqi > 100 ? 'POOR' : 'GOOD')} size="sm" />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                PM2.5: <strong>{node.dominant_pm25} µg/m³</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 & 8: RECENT POLLUTION EVENTS & SENSOR STATUS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT EVENTS */}
        <section className="neo-card p-5 bg-white" aria-labelledby="heading-events">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-3">
            <h2 id="heading-events" className="text-xs font-black tracking-wider text-slate-950 m-0">
              Recent Pollution Events
            </h2>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {recent_events.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 bg-slate-50 border border-slate-900 rounded-md flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500">{evt.time_str}</span>
                    <span className="font-bold text-slate-950">{evt.title}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    Source: <span className="font-semibold">{evt.suspected_source}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${
                    evt.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-950 border-rose-900' : (evt.severity === 'WARNING' ? 'bg-amber-100 text-amber-950 border-amber-900' : 'bg-slate-100 border-slate-800')
                  }`}>
                    {evt.severity}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Peak AQI {evt.peak_aqi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE SENSOR SUMMARY */}
        <section className="neo-card p-5 bg-white" aria-labelledby="heading-sensors-summary">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-3">
            <h2 id="heading-sensors-summary" className="text-xs font-black tracking-wider text-slate-950 m-0">
              Sensor Health
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-900 rounded">
              {data.sensors_operational_ratio} Operational
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Hardware Target</span>
                <span className="font-black text-slate-950">Arduino UNO Q</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Local Latency</span>
                <span className="font-black text-slate-950">{data.system_latency_ms} ms</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('monitor')}
                className="neo-button w-full text-xs font-bold"
              >
                <span>Open Detailed Sensor Channels</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
