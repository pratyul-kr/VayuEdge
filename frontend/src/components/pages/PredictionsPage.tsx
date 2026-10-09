import React from 'react';
import { PredictionsData } from '../../types';
import { Brain, Clock } from 'lucide-react';

interface PredictionsPageProps {
  data: PredictionsData;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({ data }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Pollution Predictions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Short-term probabilistic event forecasting calculated directly from local sensor trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border-2 border-slate-900 rounded-md shadow-[2px_2px_0px_#0f172a] text-xs">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Peak Risk Window</span>
            <span className="font-black text-slate-950">{data.peak_risk_window}</span>
          </div>
          <div className="p-2 bg-amber-100 border-2 border-slate-900 rounded-md shadow-[2px_2px_0px_#0f172a] text-xs">
            <span className="text-amber-900 font-bold block text-[10px] uppercase">Risk Index</span>
            <span className="font-black text-amber-950 text-base">{data.risk_index_score} / 100</span>
          </div>
        </div>
      </div>

      {/* Grid of Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.active_predictions.map((pred) => (
          <div
            key={pred.id}
            className="neo-card p-6 bg-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-900 mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                    {pred.id}
                  </span>
                  <h3 className="text-lg font-black text-slate-950 mt-0.5 m-0">
                    {pred.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-slate-950">
                    {pred.probability_pct}%
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    Probability
                  </span>
                </div>
              </div>

              {/* Time horizon pill */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-900 text-xs font-bold text-slate-900">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Horizon: {pred.time_horizon}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-amber-50 text-amber-900 border-amber-800">
                  {pred.confidence_level}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs font-medium text-slate-700 mb-3">
                <strong className="text-slate-900 block mb-0.5">Observed Evidence:</strong>
                {pred.evidence_summary}
              </div>

              <div className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-900">Expected Outcome:</strong>{' '}
                {pred.expected_impact}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Severity Tier: <strong>{pred.severity}</strong></span>
              <span>Local Model</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
