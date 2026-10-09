import React, { useState } from 'react';
import { LocalMapData, MapGridCell } from '../../types';
import { AQIBadge } from '../common/AQIBadge';
import { Map, Wind, Compass } from 'lucide-react';

interface MapPageProps {
  data: LocalMapData;
}

export const MapPage: React.FC<MapPageProps> = ({ data }) => {
  const [selectedCell, setSelectedCell] = useState<MapGridCell | null>(data.cells[0]);

  const getCellBg = (aqi: number) => {
    if (aqi >= 200) return 'bg-rose-200 border-rose-950 text-rose-950';
    if (aqi >= 150) return 'bg-red-200 border-red-950 text-red-950';
    if (aqi >= 100) return 'bg-amber-200 border-amber-950 text-amber-950';
    if (aqi >= 50) return 'bg-yellow-100 border-yellow-900 text-yellow-950';
    return 'bg-emerald-100 border-emerald-950 text-emerald-950';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">
              Pollution Map
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Local spatial grid mapping air quality intensity across deployed nodes and area cells.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-900 rounded">
            Good (0-50)
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-900 rounded">
            Moderate (51-100)
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-900 rounded">
            Unhealthy (151+)
          </span>
        </div>
      </div>

      {/* Main Grid View & Selected Zone Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Grid representation */}
        <div className="lg:col-span-8 neo-card p-6 bg-white">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-6">
            <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
              Campus Area Grid
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Compass className="w-4 h-4 text-slate-900" />
              <span>North-Oriented Grid</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {data.cells.map((cell) => {
              const isSelected = selectedCell?.zone_name === cell.zone_name;
              const colorClass = getCellBg(cell.intensity_aqi);
              return (
                <div
                  key={`${cell.grid_x}-${cell.grid_y}`}
                  onClick={() => setSelectedCell(cell)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${colorClass} ${
                    isSelected ? 'ring-3 ring-slate-950 shadow-[4px_4px_0px_#0f172a]' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-[10px] font-bold">
                      [{cell.grid_x},{cell.grid_y}]
                    </span>
                    {cell.assigned_node_id && (
                      <span className="px-1.5 py-0.5 rounded bg-white/90 border border-slate-900 text-[10px] font-black text-slate-950">
                        {cell.assigned_node_id}
                      </span>
                    )}
                  </div>

                  <div className="font-black text-xs truncate mb-2">
                    {cell.zone_name}
                  </div>

                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-900/30">
                    <span className="text-3xl font-black">
                      {cell.intensity_aqi}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {cell.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meteorological dispersion notes */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Wind className="w-4 h-4 text-slate-900" />
              <span>Dispersion Vector: <strong>{data.spread_direction}</strong></span>
            </div>
            <div className="text-slate-600">
              Assessment: <strong>{data.dispersion_assessment}</strong>
            </div>
          </div>
        </div>

        {/* Selected Zone Detail Panel */}
        <div className="lg:col-span-4 neo-card p-6 bg-slate-50 flex flex-col justify-between">
          {selectedCell ? (
            <div>
              <div className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                Zone Telemetry
              </div>
              <h2 className="text-xl font-black text-slate-950 m-0">
                {selectedCell.zone_name}
              </h2>

              <div className="mt-4 p-4 bg-white border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-4xl font-black text-slate-950">
                      {selectedCell.intensity_aqi}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1">AQI</span>
                  </div>
                  <AQIBadge status={selectedCell.category} size="md" />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Assigned Node:</span>
                  <span className="font-bold text-slate-950">
                    {selectedCell.assigned_node_id || 'Spatial Interpolation Cell'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-semibold">Status:</span>
                  <span className="font-bold text-emerald-800">{selectedCell.status}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600 font-semibold">Grid Coordinates:</span>
                  <span className="font-mono font-bold text-slate-950">
                    Row {selectedCell.grid_y}, Column {selectedCell.grid_x}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Select a grid cell to inspect</div>
          )}

          <div className="p-3 bg-white border border-slate-300 rounded text-xs text-slate-600 mt-4">
            <span className="font-bold text-slate-900 block mb-0.5">Spatial Model:</span>
            Hardware grid coordinates mapped directly into topological zone matrix.
          </div>
        </div>
      </div>
    </div>
  );
};
