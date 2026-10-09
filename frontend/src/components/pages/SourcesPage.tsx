import React from 'react';
import { SourceAttributionData } from '../../types';
import { Search } from 'lucide-react';

interface SourcesPageProps {
  data: SourceAttributionData;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ data }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Pollution Source Attribution
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Multivariate fingerprint matching across PM10/PM2.5 ratios, CO, and VOC signals computed locally on device.
          </p>
        </div>

        <div className="neo-badge bg-amber-100 text-amber-950 border-amber-900">
          Estimated Source
        </div>
      </div>

      {/* Main Likely Source Card */}
      <section className="neo-card p-6 bg-white" aria-labelledby="heading-most-likely">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-900 mb-4">
          <div className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Likely Source
          </div>
          <div className="px-2.5 py-1 bg-amber-100 border border-slate-900 rounded font-black text-xs text-amber-950 shadow-[1px_1px_0px_#0f172a]">
            Confidence: {Math.round(data.confidence * 100)}%
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          {data.most_likely_source}
        </div>

        <p className="mt-3 text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-300">
          {data.explanation}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-mono text-slate-600">
          <strong>Sensor Fingerprint:</strong> {data.fingerprint_notes}
        </div>
      </section>

      {/* Two columns: Supporting Evidence Factors vs Competing Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supporting Evidence Breakdown */}
        <section className="neo-card p-5 bg-white" aria-labelledby="heading-supporting">
          <h2 id="heading-supporting" className="text-sm font-black text-slate-950 pb-3 border-b-2 border-slate-900 mb-4 m-0">
            Supporting Evidence
          </h2>
          <div className="space-y-3">
            {data.supporting_evidence.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-900 rounded-md shadow-[1px_1px_0px_#0f172a]"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-black text-slate-950">{factor.sensor_name} Sensor</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-900 border border-slate-800">
                    {factor.observed_level}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium mt-1">
                  {factor.impact_description}
                </div>
                <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Relative Factor Weight:</span>
                  <span className="font-bold text-slate-900">{Math.round(factor.weight_contribution * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Competing Candidates Likelihood */}
        <section className="neo-card p-5 bg-white" aria-labelledby="heading-competing">
          <h2 id="heading-competing" className="text-sm font-black text-slate-950 pb-3 border-b-2 border-slate-900 mb-4 m-0">
            Candidate Sources
          </h2>
          <div className="space-y-3">
            {data.competing_candidates.map((cand) => (
              <div
                key={cand.category_id}
                className={`p-3.5 rounded-md border-2 border-slate-900 ${
                  cand.is_primary ? 'bg-amber-50 shadow-[2px_2px_0px_#0f172a]' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-950">{cand.name}</span>
                    {cand.is_primary && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 bg-amber-400 text-slate-950 border border-slate-900 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-950">
                    {Math.round(cand.probability * 100)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-900 mb-2">
                  <div
                    className={`h-full ${cand.is_primary ? 'bg-amber-500' : 'bg-slate-700'}`}
                    style={{ width: `${Math.round(cand.probability * 100)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  {cand.evidence_match}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
