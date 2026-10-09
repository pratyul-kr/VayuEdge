import React from 'react';

interface AQISpectrumBarProps {
  aqi: number;
}

export const AQISpectrumBar: React.FC<AQISpectrumBarProps> = ({ aqi }) => {
  // Clamp percentage between 0 and 100 for aqi 0 to 500
  const pct = Math.min(100, Math.max(0, (aqi / 500) * 100));

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        <span>0 Good</span>
        <span>50 Mod</span>
        <span>100 Poor</span>
        <span>150 Unhealthy</span>
        <span>200+ Severe</span>
        <span>500 Max</span>
      </div>

      {/* Spectrum Bar Container */}
      <div className="relative h-4 rounded-md border-2 border-slate-900 bg-slate-100 overflow-hidden flex">
        {/* Segments */}
        <div style={{ width: '10%' }} className="bg-emerald-400 border-r border-slate-900/40" title="Good (0-50)" />
        <div style={{ width: '10%' }} className="bg-amber-400 border-r border-slate-900/40" title="Moderate (51-100)" />
        <div style={{ width: '10%' }} className="bg-orange-500 border-r border-slate-900/40" title="Poor (101-150)" />
        <div style={{ width: '10%' }} className="bg-red-500 border-r border-slate-900/40" title="Unhealthy (151-200)" />
        <div style={{ width: '20%' }} className="bg-rose-700 border-r border-slate-900/40" title="Very Unhealthy (201-300)" />
        <div style={{ width: '40%' }} className="bg-red-950" title="Critical (301-500)" />
      </div>

      {/* Needle marker */}
      <div className="relative h-3 w-full">
        <div
          className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
          style={{ left: `${pct}%` }}
        >
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-slate-950" />
          <span className="text-[9px] font-black font-mono px-1 py-0.2 bg-slate-900 text-white rounded">
            {aqi}
          </span>
        </div>
      </div>
    </div>
  );
};
