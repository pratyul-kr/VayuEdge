import React from 'react';
import { NavigationTab } from '../../types';
import { LayoutDashboard, Activity, TrendingUp, ShieldCheck, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

const PRIMARY_MOBILE_TABS: Array<{ id: NavigationTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'monitor', label: 'Monitor', icon: Activity },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'decisions', label: 'Decide', icon: ShieldCheck },
  { id: 'system', label: 'System', icon: Settings },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-900 z-40 px-2 py-1 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {PRIMARY_MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all cursor-pointer ${
              isActive
                ? 'text-slate-950 font-black'
                : 'text-slate-500 font-bold hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded ${isActive ? 'bg-amber-400 border border-slate-900 shadow-[1px_1px_0px_#0f172a]' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
