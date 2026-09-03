import React from 'react';
import { Calendar, Hash, ExternalLink, ChevronRight } from 'lucide-react';
import { Order } from '../types/database';
import { StatusBadge } from './StatusBadge';
import { BRANDING } from '../config/branding';

interface OrderCardProps {
  order: Order;
  onClick?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      onClick={() => onClick && onClick(order)}
      className={`rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-4 shadow-lg shadow-black/30 transition-all ${
        onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-850 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-zinc-400 font-mono">
            #{order.id.replace('ord_', '')}
          </span>
          <span className="text-xs text-zinc-500">•</span>
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-500" />
            {formattedDate}
          </span>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      <div className="mt-2.5">
        <h4 className="text-sm font-bold text-white tracking-tight">
          {order.serviceName}
        </h4>

        {(order.targetUrl || order.targetAccount) && (
          <p className="mt-1 text-xs text-zinc-400 flex items-center gap-1">
            <span className="text-zinc-500">Target:</span>
            <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[200px]">
              {order.targetUrl || order.targetAccount}
            </span>
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800/70 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-zinc-400 font-medium">
            Qty: {order.quantity ?? 1}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-extrabold text-white">
            {BRANDING.CURRENCY_SYMBOL}{(order.totalPrice ?? order.finalAmount ?? order.amount ?? 0).toFixed(2)}
          </span>
          {onClick && <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </div>
      </div>
    </div>
  );
};
