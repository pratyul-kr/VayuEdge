import React, { useState } from 'react';
import { EventsData } from '../../types';
import { TriangleAlert, Filter } from 'lucide-react';

interface EventsPageProps {
  data: EventsData;
}

export const EventsPage: React.FC<EventsPageProps> = ({ data }) => {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const filteredEvents = filterActiveOnly
    ? data.events.filter(e => e.is_active)
    : data.events;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <TriangleAlert className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Pollution Event Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Historical and active event log triggered when particulate acceleration or air quality thresholds are breached.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`neo-button text-xs font-bold cursor-pointer ${
              filterActiveOnly ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterActiveOnly ? 'Showing Active Events Only' : 'Show Active Only'}</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className={`neo-card p-6 bg-white border-2 border-slate-900 transition-all ${
              evt.is_active ? 'border-rose-900 shadow-[4px_4px_0px_#991b1b]' : ''
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b-2 border-slate-900 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-100 border border-slate-900 rounded">
                    {evt.id}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Node: {evt.node_name}
                  </span>
                  {evt.is_active && (
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-950 mt-1 m-0">
                  {evt.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className={`px-2.5 py-1 rounded text-xs font-black border ${
                  evt.severity === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-950 border-rose-900'
                    : (evt.severity === 'WARNING'
                    ? 'bg-amber-100 text-amber-950 border-amber-900'
                    : 'bg-slate-100 text-slate-900 border-slate-800')
                }`}>
                  Severity: {evt.severity}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4">
              {evt.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Start Time</span>
                <span className="font-black text-slate-950">{evt.start_time}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Duration</span>
                <span className="font-black text-slate-950">{evt.duration_minutes} Minutes</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Peak Reading</span>
                <span className="font-black text-rose-700">{evt.peak_aqi} AQI (PM2.5: {evt.peak_pm25})</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Suspected Cause</span>
                <span className="font-bold text-slate-900 truncate block">{evt.suspected_source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
