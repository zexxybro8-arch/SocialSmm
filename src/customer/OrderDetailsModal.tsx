import React from 'react';
import { Modal } from '../components/Modal';
import { Order } from '../types/database';
import { StatusBadge } from '../components/Badge';
import { 
  ShoppingBag, 
  Calendar, 
  Instagram, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Receipt,
  User,
  ExternalLink
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: ${order.id}`} maxWidth="lg">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400">Target Account</div>
            <div className="text-base font-bold text-white font-mono flex items-center space-x-1.5 mt-0.5">
              <Instagram className="w-4 h-4 text-indigo-400" />
              <span>{order.targetAccount}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">{order.serviceName}</div>
          </div>
          <div className="flex sm:flex-col items-start sm:items-end justify-between">
            <StatusBadge status={order.status} />
            <span className="text-xs text-zinc-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Timeline Tracker */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fulfillment Timeline</span>
          </h4>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
            {order.timeline && order.timeline.length > 0 ? (
              order.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-zinc-950 bg-indigo-500 shadow-sm" />
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center space-x-2">
                      <span>{event.title}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{event.description}</p>
                    <div className="text-[10px] text-zinc-500 mt-0.5">By: {event.updatedBy}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500">Order submitted and queued.</div>
            )}
          </div>
        </div>

        {/* Client Requirements Provided */}
        {order.requirements && Object.keys(order.requirements).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Project Brief & Specifications</span>
            </h4>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2 text-xs">
              {Object.entries(order.requirements).map(([key, val]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-zinc-800/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-zinc-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="text-zinc-300 font-normal sm:text-right max-w-xs">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Base Price:</span>
            <span>${(order.amount ?? 0).toFixed(2)}</span>
          </div>
          {(order.discountApplied ?? 0) > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>Customer Discount:</span>
              <span>-${(order.discountApplied ?? 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 font-bold text-white text-sm">
            <span>Total Paid:</span>
            <span className="text-emerald-400">${(order.finalAmount ?? order.totalPrice ?? order.amount ?? 0).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Notes from Admin */}
        {order.notes && (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs">
            <span className="font-semibold text-zinc-300">Management Notes: </span>
            <span className="text-zinc-400">{order.notes}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
};
