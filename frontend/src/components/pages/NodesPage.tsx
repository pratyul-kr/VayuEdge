import React from 'react';
import { NodesData } from '../../types';
import { AQIBadge } from '../common/AQIBadge';
import { Network, Battery, Cpu, Clock } from 'lucide-react';

interface NodesPageProps {
  data: NodesData;
}

export const NodesPage: React.FC<NodesPageProps> = ({ data }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Edge Sensor Nodes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Mesh and perimeter status of deployed Arduino UNO Q sensor nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-900 text-emerald-950 rounded text-xs font-bold shadow-[1px_1px_0px_#0f172a]">
            {data.online_count} Online Nodes
          </div>
          <div className="px-3 py-1.5 bg-slate-100 border border-slate-900 text-slate-950 rounded text-xs font-bold shadow-[1px_1px_0px_#0f172a]">
            {data.total_nodes} Total Deployed
          </div>
        </div>
      </div>

      {/* Nodes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.nodes.map((node) => (
          <div key={node.id} className="neo-card p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black px-2 py-0.5 bg-slate-900 text-white rounded">
                    {node.id}
                  </span>
                  <span className="font-black text-base text-slate-950">{node.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                  node.status.includes('ONLINE')
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                    : 'bg-amber-100 text-amber-950 border-amber-900'
                }`}>
                  {node.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium mb-4">
                Location: <strong className="text-slate-900">{node.location}</strong>
              </div>

              {/* AQI big number */}
              <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-lg flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-4xl font-black text-slate-950">
                    {node.current_aqi}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">AQI</span>
                </div>
                <AQIBadge status={node.aqi_category} size="md" />
              </div>

              {/* Pollutants snapshot */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                {node.key_pollutants.map((kp) => (
                  <div key={kp.sensor_type} className="p-2 bg-slate-100 border border-slate-300 rounded">
                    <span className="text-[10px] font-bold text-slate-500 block">{kp.sensor_type}</span>
                    <span className="font-black text-slate-950 text-sm mt-0.5 block">{kp.value} {kp.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t-2 border-slate-900 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-slate-900" /> Battery:
                </span>
                <span className="font-bold text-slate-950">{node.battery_level}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-900" /> Platform:
                </span>
                <span className="font-bold text-slate-950">{node.hardware_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-900" /> Telemetry Status:
                </span>
                <span className="font-semibold text-slate-800">{node.last_sync_desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
