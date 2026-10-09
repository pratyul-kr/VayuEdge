import React from 'react';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Activity,
  Gauge,
  Map,
  TrendingUp,
  Search,
  Brain,
  ShieldCheck,
  TriangleAlert,
  Network,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'Monitoring',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'monitor', label: 'Live Monitor', icon: Activity },
      { id: 'sensors', label: 'Sensor Fusion', icon: Gauge },
      { id: 'map', label: 'Pollution Map', icon: Map },
    ]
  },
  {
    groupName: 'Intelligence',
    items: [
      { id: 'forecast', label: 'Forecast', icon: TrendingUp },
      { id: 'sources', label: 'Source Attribution', icon: Search },
      { id: 'predictions', label: 'Predictions', icon: Brain },
      { id: 'decisions', label: 'Decision Engine', icon: ShieldCheck },
      { id: 'events', label: 'Event Log', icon: TriangleAlert },
    ]
  },
  {
    groupName: 'Hardware & System',
    items: [
      { id: 'nodes', label: 'Edge Nodes', icon: Network },
      { id: 'system', label: 'System & Diagnostics', icon: Settings },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-100 border-r-2 border-slate-900 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              Æ
            </div>
            <span className="font-black text-sm tracking-wide text-slate-950">
              AetherEdge
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded hover:bg-slate-100 border border-slate-900"
          >
            <X className="w-4 h-4 text-slate-900" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupName}>
              <div className="text-[10px] font-bold text-slate-500 px-3 mb-1.5">
                {group.groupName}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] translate-x-0.5'
                          : 'text-slate-700 hover:bg-white hover:text-slate-950 border border-transparent hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: Hardware & Model specs badge */}
        <div className="p-3 border-t-2 border-slate-900 bg-white">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-300 text-[11px]">
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>Platform</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded font-bold border border-emerald-800">
                Edge
              </span>
            </div>
            <div className="text-slate-700 font-mono text-[10px]">
              Arduino UNO Q
            </div>
            <div className="text-slate-500 text-[10px] mt-0.5">
              STM32 + Linux SoC
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
