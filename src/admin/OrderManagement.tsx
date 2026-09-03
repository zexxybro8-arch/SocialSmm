import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Order, OrderStatus } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { OrderDetailsModal } from '../customer/OrderDetailsModal';
import { 
  ShoppingBag, 
  Search, 
  Edit, 
  Eye, 
  Instagram, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  XCircle,
  FileText
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [adminNote, setAdminNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote(order.notes || '');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsLoading(true);
    try {
      await api.updateOrderStatus(selectedOrder.id, newStatus, adminNote);
      toast('success', `Order ${selectedOrder.id} transitioned to ${newStatus.toUpperCase()}`);
      setIsUpdateModalOpen(false);
      await fetchOrders();
    } catch (err: any) {
      toast('error', err.message || 'Failed to update order');
    } finally {
      setIsLoading(false);
    }
  };

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'paid', label: 'Paid' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
    { id: 'refunded', label: 'Refunded' },
  ];

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(q) ||
      o.targetAccount.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Order Processing & Dispatch Control
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Review client creative briefs, manage campaign milestones, and transition execution statuses.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 custom-scrollbar">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, handle, or service..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Client / Target</th>
                <th className="py-3.5 px-4">Service Package</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{order.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-indigo-400 font-semibold flex items-center space-x-1">
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{order.targetAccount}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Cust ID: {order.customerId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-200 font-medium max-w-xs truncate">
                    {order.serviceName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">${(order.finalAmount ?? order.totalPrice ?? order.amount ?? 0).toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openUpdateModal(order)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/40 text-amber-300 font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Process & Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Update Status & Timeline Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Manage Order: ${selectedOrder?.id}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Target Account:</span>
              <span className="font-mono text-indigo-300 font-bold">{selectedOrder?.targetAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Package:</span>
              <span className="text-white font-medium">{selectedOrder?.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Paid Amount:</span>
              <span className="text-emerald-400 font-bold">${(selectedOrder?.finalAmount ?? selectedOrder?.totalPrice ?? selectedOrder?.amount ?? 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Select Lifecycle Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="pending">PENDING (Awaiting Review)</option>
              <option value="paid">PAID (Fulfillment Scheduled)</option>
              <option value="processing">PROCESSING (Production Active)</option>
              <option value="completed">COMPLETED (Deliverables Delivered)</option>
              <option value="cancelled">CANCELLED (Auto-refunded)</option>
              <option value="refunded">REFUNDED (Auto-refund to customer ledger)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Status Event Note & Deliverable Links
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. 5 Approved Reels scheduled via Meta Content API. Insights review scheduled for Friday."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {newStatus === 'refunded' && (
            <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-3 text-xs text-rose-300">
              Selecting <strong>REFUNDED</strong> will automatically credit ${(selectedOrder?.finalAmount ?? selectedOrder?.totalPrice ?? selectedOrder?.amount ?? 0).toFixed(2)} USD back to the customer's balance ledger.
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-950/40"
            >
              {isLoading ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
