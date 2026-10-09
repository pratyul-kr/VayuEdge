import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface StatusIndicatorProps {
  isOnline: boolean;
  isSyncing?: boolean;
  unsyncedCount?: number;
  lastSyncDesc?: string;
  onSyncClick?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isOnline,
  isSyncing = false,
  unsyncedCount = 0,
  onSyncClick
}) => {
  if (isSyncing) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 border border-sky-900 text-sky-950 rounded text-xs font-bold shadow-[1px_1px_0px_#0f172a]">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Syncing</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 border border-amber-900 text-amber-950 rounded text-xs font-bold shadow-[1px_1px_0px_#0f172a]">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline</span>
          {unsyncedCount > 0 && (
            <span className="ml-1 px-1 bg-amber-200 border border-amber-900 rounded text-[10px]">
              {unsyncedCount} buffered
            </span>
          )}
        </div>
        {onSyncClick && (
          <button
            onClick={onSyncClick}
            className="text-xs px-2 py-1 bg-white border border-slate-900 font-semibold rounded hover:bg-slate-100 shadow-[1px_1px_0px_#0f172a] cursor-pointer"
            title="Flush local buffer"
          >
            Flush
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 border border-emerald-900 text-emerald-950 rounded text-xs font-bold shadow-[1px_1px_0px_#0f172a]">
      <Wifi className="w-3.5 h-3.5 text-emerald-800" />
      <span>Online</span>
    </div>
  );
};
