import React from 'react';
import { DecisionsPageData } from '../../types';
import { ShieldCheck, GitBranch, AlertOctagon } from 'lucide-react';

interface DecisionsPageProps {
  data: DecisionsPageData;
}

export const DecisionsPage: React.FC<DecisionsPageProps> = ({ data }) => {
  const { primary_decision, active_recommendations, rule_evaluation_traces } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Decision Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Deterministic rule engine converting sensor observations into recommended actions and actuator commands.
          </p>
        </div>

        <div className="neo-badge bg-emerald-100 text-emerald-950 border-emerald-900">
          Local Rule Evaluation
        </div>
      </div>

      {/* Primary Decision Banner */}
      <section className="neo-card p-6 bg-white border-2 border-slate-900" aria-labelledby="heading-active-decision">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-900 mb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h2 id="heading-active-decision" className="text-sm font-black text-slate-950 m-0">
              Active Decision
            </h2>
          </div>
          <span className="neo-badge bg-rose-100 text-rose-950 border-rose-900">
            Priority: {primary_decision.priority}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Triggered Condition
              </span>
              <div className="text-lg font-black text-slate-950 mt-0.5">
                {primary_decision.condition}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Action Mandate
              </span>
              <div className="text-base font-black text-slate-900 bg-amber-50 p-3 rounded border border-slate-900 mt-1 shadow-[2px_2px_0px_#0f172a]">
                {primary_decision.action}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Rationale
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                {primary_decision.reason}
              </p>
            </div>
          </div>

          {/* Actuator Relay Card */}
          <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-900 space-y-4 shadow-[2px_2px_0px_#0f172a]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <span className="text-xs font-black uppercase text-slate-900">
                Arduino UNO Q Actuator Relay
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-800 text-[10px] font-bold">
                {primary_decision.actuator_status}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Relay Command</span>
              <div className="font-mono text-xs font-black px-3 py-2 bg-white border border-slate-900 rounded mt-1 text-slate-950 break-all">
                {primary_decision.actuator_action}
              </div>
            </div>

            <div className="text-xs text-slate-600 font-medium">
              <strong>Audit:</strong> {primary_decision.explainability_notes}
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations & Rule Traces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Behavioral Recommendations */}
        <section className="neo-card p-5 bg-white" aria-labelledby="heading-advisories">
          <h2 id="heading-advisories" className="text-sm font-black text-slate-950 pb-3 border-b-2 border-slate-900 mb-4 m-0">
            Target Group Advisories
          </h2>
          <div className="space-y-4">
            {active_recommendations.map((rec) => (
              <div key={rec.id} className="p-4 bg-slate-50 border border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-black text-slate-950">{rec.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 border border-slate-800 text-slate-900">
                    {rec.category}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-2">
                  {rec.advisory}
                </div>
                {rec.alternative_route && (
                  <div className="text-xs text-emerald-800 font-semibold mt-2 pt-2 border-t border-slate-200">
                    Safe Alternative: <strong>{rec.alternative_route}</strong>
                  </div>
                )}
                <div className="text-[10px] text-slate-500 italic mt-2">
                  {rec.medical_disclaimer}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rule Evaluation Traces */}
        <section className="neo-card p-5 bg-white" aria-labelledby="heading-rules">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-900 mb-4">
            <GitBranch className="w-4 h-4 text-slate-900" />
            <h2 id="heading-rules" className="text-sm font-black text-slate-950 m-0">
              Evaluated Rule Traces
            </h2>
          </div>
          <div className="space-y-3">
            {rule_evaluation_traces.map((trace) => (
              <div key={trace.rule_id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-700">{trace.rule_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                    trace.threshold_met ? 'bg-rose-100 text-rose-950 border-rose-900' : 'bg-slate-200 text-slate-700 border-slate-400'
                  }`}>
                    {trace.threshold_met ? 'Met' : 'False'}
                  </span>
                </div>
                <div className="text-slate-800 font-medium">
                  <strong>Condition:</strong> {trace.condition_evaluated}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Detail: {trace.trigger_detail}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
