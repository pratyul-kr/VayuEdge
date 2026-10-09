import React from 'react';
import { AirQualityStatus } from '../../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

interface AQIBadgeProps {
  status: AirQualityStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const normStatus = status.toUpperCase().replace(/\s+/g, '_');

  let bg = 'bg-slate-100 text-slate-900 border-slate-900';
  let label = status;
  let Icon = AlertCircle;

  switch (normStatus) {
    case 'GOOD':
      bg = 'bg-emerald-100 text-emerald-950 border-emerald-900';
      label = 'GOOD';
      Icon = ShieldCheck;
      break;
    case 'MODERATE':
      bg = 'bg-amber-100 text-amber-950 border-amber-900';
      label = 'MODERATE';
      Icon = AlertCircle;
      break;
    case 'POOR':
      bg = 'bg-orange-100 text-orange-950 border-orange-900';
      label = 'POOR';
      Icon = AlertTriangle;
      break;
    case 'UNHEALTHY':
      bg = 'bg-red-100 text-red-950 border-red-900';
      label = 'UNHEALTHY';
      Icon = Flame;
      break;
    case 'VERY_UNHEALTHY':
    case 'CRITICAL':
    case 'CRITICAL_THRESHOLD':
      bg = 'bg-rose-200 text-rose-950 border-rose-950 font-black';
      label = 'CRITICAL';
      Icon = ShieldAlert;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-bold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-black px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <span className={`inline-flex items-center border-[1.5px] rounded tracking-wide ${sizeClasses} ${bg}`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};
