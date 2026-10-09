import React from 'react';
import { StatusIndicator } from '../common/StatusIndicator';
import { Cpu, MapPin, Clock, Menu } from 'lucide-react';

interface HeaderProps {
  nodeName: string;
  location: string;
  isOnline: boolean;
  isSyncing: boolean;
  unsyncedCount: number;
  lastUpdated: string;
  onSync: () => void;
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nodeName,
  location,
  isOnline,
  isSyncing,
  unsyncedCount,
  lastUpdated,
  onSync,
  onMobileMenuToggle
}) => {
  return (
    <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-30">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & System Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 border border-slate-900 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-900" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-black text-sm border border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              Æ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-slate-950 text-base md:text-lg">
                  AetherEdge
                </span>
                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-900 rounded">
                  Arduino UNO Q
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                Edge Air Pollution Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Center: Current Node & Location Context */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-700 border-x border-slate-200 px-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-slate-900" />
            <span className="font-bold text-slate-950">{nodeName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        </div>

        {/* Right: Connectivity Status & Telemetry Time */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{lastUpdated}</span>
          </div>

          <StatusIndicator
            isOnline={isOnline}
            isSyncing={isSyncing}
            unsyncedCount={unsyncedCount}
            onSyncClick={onSync}
          />
        </div>
      </div>
    </header>
  );
};
