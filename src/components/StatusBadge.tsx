import React from 'react';
import { OrderStatus } from '../types/database';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Completed
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          In Progress
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Pending
        </span>
      );
    case 'cancelled':
    case 'refunded':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          {status === 'refunded' ? 'Refunded' : 'Cancelled'}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
