import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'RISING' | 'FALLING' | 'STABLE' | string;
  ratePct?: number;
  size?: 'sm' | 'md';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, ratePct, size = 'md' }) => {
  const norm = trend.toUpperCase();

  if (norm === 'RISING') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-red-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        <span>Rising {ratePct !== undefined && ratePct !== 0 ? `(+${Math.abs(ratePct)}%)` : ''}</span>
      </span>
    );
  }

  if (norm === 'FALLING') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-emerald-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
        <span>Falling {ratePct !== undefined && ratePct !== 0 ? `(-${Math.abs(ratePct)}%)` : ''}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-slate-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <ArrowRight className="w-4 h-4 stroke-[2]" />
      <span>Stable</span>
    </span>
  );
};
