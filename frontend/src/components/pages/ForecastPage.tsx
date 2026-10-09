import React from 'react';
import { ForecastDetailData } from '../../types';
import { TrendingUp, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ForecastPageProps {
  data: ForecastDetailData;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ data }) => {
  const chartData = data.trajectory.map(pt => ({
    time: pt.relative_time,
    timestamp: pt.timestamp,
    historical: pt.actual_value,
    predicted: pt.predicted_value,
    lower: pt.lower_bound,
    upper: pt.upper_bound,
    isHistorical: pt.is_historical
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Pollution Forecast
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Short-term forecasting model running on the Arduino UNO Q Linux processor.
          </p>
        </div>

        {data.is_demonstration_data && (
          <div className="neo-badge bg-amber-100 text-amber-950 border-amber-900">
            Demonstration Forecast
          </div>
        )}
      </div>

      {/* Primary Forecast Chart with Uncertainty Band */}
      <section className="neo-card p-6 bg-white" aria-labelledby="heading-trajectory">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-900 mb-6">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Historical vs Forecasted AQI
            </div>
            <h2 id="heading-trajectory" className="text-xl font-black text-slate-950 m-0 mt-0.5">
              {data.target_pollutant}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-900"></span>
              <span>Historical Readings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Predicted Value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-200 border border-amber-500"></span>
              <span>Confidence Interval</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#0f172a" fontSize={11} fontWeight={700} />
              <YAxis stroke="#0f172a" fontSize={11} domain={['dataMin - 15', 'dataMax + 20']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #0f172a',
                  borderRadius: '6px',
                  boxShadow: '3px 3px 0px #0f172a',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine x="Now" stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Current', position: 'top', fill: '#dc2626', fontSize: 10, fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#fef3c7" fillOpacity={0.8} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
              <Line type="monotone" dataKey="historical" stroke="#0f172a" strokeWidth={3} dot={{ fill: '#0f172a', r: 4 }} />
              <Line type="monotone" dataKey="predicted" stroke="#d97706" strokeWidth={3} strokeDasharray="5 3" dot={{ fill: '#d97706', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Drivers & Horizon Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-900">
          <div className="p-3 bg-slate-50 border border-slate-300 rounded">
            <span className="text-[10px] font-black uppercase text-slate-500 block">Forecast Horizon</span>
            <span className="text-lg font-black text-slate-950">{data.forecast_horizon}</span>
            <span className="text-xs text-slate-600 block mt-1">Short-term prediction</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-300 rounded">
            <span className="text-[10px] font-black uppercase text-slate-500 block">Projected Peak</span>
            <span className="text-lg font-black text-rose-700">{data.expected_peak_value} AQI</span>
            <span className="text-xs text-slate-600 block mt-1">Expected at {data.expected_peak_time}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-300 rounded">
            <span className="text-[10px] font-black uppercase text-slate-500 block">Model Confidence</span>
            <span className="text-lg font-black text-slate-950">{Math.round(data.confidence_score * 100)}%</span>
            <span className="text-xs text-slate-600 block mt-1">Local variance score</span>
          </div>
        </div>
      </section>

      {/* Model Metadata & Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neo-card p-5 bg-white">
          <h3 className="text-sm font-black text-slate-950 pb-2 border-b border-slate-200 mb-3 m-0">
            Microclimate Drivers
          </h3>
          <div className="space-y-2">
            {data.drivers.map((drv, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800 p-2 bg-slate-50 rounded border border-slate-200">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{drv}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="neo-card p-5 bg-white">
          <h3 className="text-sm font-black text-slate-950 pb-2 border-b border-slate-200 mb-3 m-0">
            Model Information
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Model:</span>
              <span className="font-bold text-slate-950">{data.model_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Firmware Build:</span>
              <span className="font-mono text-slate-950">{data.model_version}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Runtime:</span>
              <span className="font-bold text-emerald-800">Arduino UNO Q</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-semibold text-slate-600">Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-800 font-bold text-[10px]">
                {data.model_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
