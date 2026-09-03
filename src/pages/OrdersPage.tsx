import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types/database';
import { BRANDING } from '../config/branding';
import { Header } from '../components/Header';
import { OrderCard } from '../components/OrderCard';
import { StatusBadge } from '../components/StatusBadge';
import { FloatingSupport } from '../components/FloatingSupport';

interface OrdersPageProps {
  orders: Order[];
  onOpenTicket: () => void;
  onRefreshOrders: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onOpenTicket,
  onRefreshOrders,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrderDetail, setActiveOrderDetail] = useState<Order | null>(null);

  const statusFilters: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      o.serviceName.toLowerCase().includes(term) ||
      (o.targetUrl && o.targetUrl.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-24 selection:bg-emerald-500 selection:text-zinc-950">
      <Header
        user={null}
        title="My Orders"
        subtitle={`${orders.length} total orders recorded`}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, service name, or handle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filter Pills - Horizontal Scrollable on Mobile */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {statusFilters.map((tab) => {
            const count = tab.id === 'all' 
              ? orders.length 
              : orders.filter((o) => o.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={(o) => setActiveOrderDetail(o)}
              />
            ))
          ) : (
            <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
              <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No orders found</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                {selectedStatus !== 'all'
                  ? `You have no ${selectedStatus.replace('_', ' ')} orders.`
                  : 'You have not placed any orders yet. Check the Create tab to browse services!'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {activeOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono text-zinc-400">
                  #{activeOrderDetail.id.replace('ord_', '')}
                </span>
                <h3 className="text-base font-bold text-white">Order Details</h3>
              </div>
              <button
                onClick={() => setActiveOrderDetail(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Status:</span>
                <StatusBadge status={activeOrderDetail.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Service:</span>
                <span className="font-bold text-white text-right">{activeOrderDetail.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Account / URL:</span>
                <span className="font-mono text-emerald-400">{activeOrderDetail.targetUrl || activeOrderDetail.targetAccount || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quantity / Units:</span>
                <span className="font-bold text-white">{activeOrderDetail.quantity ?? 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Price:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {BRANDING.CURRENCY_SYMBOL}{(activeOrderDetail.totalPrice ?? activeOrderDetail.finalAmount ?? activeOrderDetail.amount ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Date Ordered:</span>
                <span className="text-zinc-300">
                  {new Date(activeOrderDetail.createdAt).toLocaleString()}
                </span>
              </div>

              {activeOrderDetail.customerNotes && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 mt-2">
                  <span className="font-semibold text-zinc-400">Specifications & Notes:</span>
                  <p className="mt-1 text-zinc-300">{activeOrderDetail.customerNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex gap-2">
              <button
                onClick={() => {
                  setActiveOrderDetail(null);
                  onOpenTicket();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center space-x-2"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Support Inquiry for this Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingSupport onOpenTicket={onOpenTicket} />
    </div>
  );
};
