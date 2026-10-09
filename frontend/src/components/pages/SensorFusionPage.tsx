import React from 'react';
import { SensorFusionData } from '../../types';
import { Gauge, ArrowDown, Layers } from 'lucide-react';

interface SensorFusionPageProps {
  data: SensorFusionData;
}

export const SensorFusionPage: React.FC<SensorFusionPageProps> = ({ data }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-slate-900" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
            Sensor Fusion Pipeline
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          How hardware sensor inputs pass through calibration, Kalman filtering, feature extraction, and local pattern matching on the Arduino UNO Q.
        </p>
      </div>

      {/* Signature & Context Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neo-card p-4 bg-white md:col-span-2">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
            Extracted Pollution Signature
          </div>
          <div className="text-xl font-black text-slate-950">
            {data.signature_type}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
            {Object.entries(data.fingerprint_vector).map(([key, val]) => (
              <span key={key} className="px-2 py-1 bg-slate-100 border border-slate-900 rounded font-bold">
                {key}: <span className="text-amber-800">{String(val)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="neo-card p-4 bg-slate-50">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
            Fusion Confidence
          </div>
          <div className="text-3xl font-black text-slate-950">
            {Math.round(data.confidence * 100)}%
          </div>
          <div className="text-xs text-slate-600 mt-2">
            Multivariate pattern similarity matched against local pollution fingerprint library.
          </div>
        </div>
      </div>

      {/* The 6-Stage Pipeline */}
      <div>
        <div className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-900" />
          <span>Edge Processing Pipeline</span>
        </div>

        <div className="space-y-4">
          {data.pipeline.map((stage, idx) => (
            <div key={stage.stage_number} className="relative">
              <div className="neo-card p-5 bg-white border-2 border-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded bg-slate-900 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                      0{stage.stage_number}
                    </span>
                    <h3 className="text-base font-black text-slate-950 m-0">
                      {stage.name}
                    </h3>
                  </div>
                  <span className="neo-badge bg-emerald-100 text-emerald-900 border-emerald-800 text-[10px]">
                    {stage.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium mb-3">
                  {stage.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Input Signals:</span>
                    <span className="font-semibold text-slate-900">{stage.input_signals.join(', ')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Stage Output:</span>
                    <span className="font-bold text-amber-900">{stage.output_result}</span>
                  </div>
                </div>
              </div>

              {idx < data.pipeline.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_#0f172a]">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-900" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
