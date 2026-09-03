import React from 'react';
import { GlassCard } from './GlassCard';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    positive: boolean;
    label: string;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
}) => {
  return (
    <GlassCard className="p-5 flex flex-col justify-between border-zinc-800 hover:border-zinc-700/80 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        <div className="p-2.5 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
        {(subtext || trend) && (
          <div className="mt-1.5 flex items-center space-x-2 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.label}
              </span>
            )}
            {subtext && <span className="text-zinc-400">{subtext}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
