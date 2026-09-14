import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Order, OrderStatus, Service } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { BRANDING } from '../config/branding';
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
  FileText,
  Plus,
  Calendar,
  User,
  DollarSign,
  ExternalLink,
  Layers,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface CustomerOption {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  walletBalance: number;
}

export const OrderManagement: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Order Details Modal
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Update Status Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [adminNote, setAdminNote] = useState<string>('');
  const [providerOrderId, setProviderOrderId] = useState<string>('');
  const [refundCustomer, setRefundCustomer] = useState<boolean>(false);

  // Manual Order Creation Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualCustomerId, setManualCustomerId] = useState<string>('');
  const [manualServiceId, setManualServiceId] = useState<string>('');
  const [manualQuantity, setManualQuantity] = useState<number>(1000);
  const [manualLink, setManualLink] = useState<string>('');
  const [manualChargeCustomer, setManualChargeCustomer] = useState<boolean>(true);
  const [manualProviderMode, setManualProviderMode] = useState<'automatic' | 'manual'>('manual');
  const [manualProviderOrderId, setManualProviderOrderId] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<string>('processing');
  const [manualNotes, setManualNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [srvs, custs] = await Promise.all([
        api.getServices(),
        api.searchAdminCustomers(),
      ]);
      setServices(srvs);
      setCustomers(custs);
      if (custs.length > 0 && !manualCustomerId) {
        setManualCustomerId(custs[0].id);
      }
      if (srvs.length > 0 && !manualServiceId) {
        setManualServiceId(srvs[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAuxiliaryData();
  }, []);

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote(order.notes || '');
    setProviderOrderId(order.providerOrderId || '');
    setRefundCustomer(false);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsLoading(true);
    try {
      await api.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        adminNote,
        providerOrderId,
        refundCustomer
      );
      toast('success', `Order #${selectedOrder.id} updated successfully.`);
      setIsUpdateModalOpen(false);
      await fetchOrders();
    } catch (err: any) {
      toast('error', err.message || 'Failed to update order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerId) {
      toast('error', 'Please select a customer');
      return;
    }
    if (!manualServiceId) {
      toast('error', 'Please select a service');
      return;
    }
    if (!manualLink.trim()) {
      toast('error', 'Please enter Instagram target link');
      return;
    }

    setIsLoading(true);
    try {
      const newOrd = await api.createManualOrder({
        targetUserId: manualCustomerId,
        serviceId: manualServiceId,
        quantity: manualQuantity,
        link: manualLink.trim(),
        chargeCustomer: manualChargeCustomer,
        providerMode: manualProviderMode,
        providerOrderId: manualProviderOrderId,
        status: manualStatus,
        notes: manualNotes,
      });

      toast('success', `Manual order #${newOrd.id} created successfully!`);
      setIsManualModalOpen(false);
      setManualLink('');
      setManualNotes('');
      setManualProviderOrderId('');
      await fetchOrders();
    } catch (err: any) {
      toast('error', err.message || 'Failed to create manual order');
    } finally {
      setIsLoading(false);
    }
  };

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
    { id: 'partial', label: 'Partial' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'failed', label: 'Failed' },
  ];

  // Filtering Logic (Status, Search, Date)
  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    // Search
    const q = search.toLowerCase().trim();
    let matchesSearch = true;
    if (q) {
      matchesSearch =
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.username && o.username.toLowerCase().includes(q)) ||
        (o.targetAccount && o.targetAccount.toLowerCase().includes(q)) ||
        (o.serviceName && o.serviceName.toLowerCase().includes(q)) ||
        (o.providerOrderId && o.providerOrderId.toLowerCase().includes(q));
    }

    // Date Range
    let matchesDate = true;
    if (dateRange !== 'all' && o.createdAt) {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateRange === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateRange === 'yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        matchesDate = orderDate.toDateString() === yest.toDateString();
      } else if (dateRange === '7days') {
        const d7 = new Date(now);
        d7.setDate(d7.getDate() - 7);
        matchesDate = orderDate >= d7;
      } else if (dateRange === '30days') {
        const d30 = new Date(now);
        d30.setDate(d30.getDate() - 30);
        matchesDate = orderDate >= d30;
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Order Management Command Terminal
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Search, manage, process status transitions, and issue refunds across all customer orders.
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition cursor-pointer flex items-center space-x-2 shadow-lg shadow-amber-950/40 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Manual Order</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
            {statuses.map((st) => {
              const count = st.id === 'all' 
                ? orders.length 
                : orders.filter((o) => o.status === st.id).length;

              return (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {st.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, username, email, service name, or link..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 w-full sm:w-auto"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Service & Link</th>
                <th className="py-3.5 px-4">Qty & Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Provider ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.length > 0 ? (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Order ID & Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-xs">{order.id}</div>
                      {order.creationType === 'manual' && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-bold mt-0.5">
                          Manual
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{order.customerName || order.username || 'Customer'}</div>
                      <div className="text-[10px] text-zinc-400">{order.customerEmail}</div>
                    </td>

                    {/* Service & Link */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-zinc-200 font-medium truncate">{order.serviceName}</div>
                      <div className="font-mono text-emerald-400 text-[11px] truncate mt-0.5 flex items-center space-x-1">
                        <Instagram className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{order.targetUrl || order.targetAccount || order.link}</span>
                      </div>
                    </td>

                    {/* Qty & Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{(order.quantity ?? 1).toLocaleString()} units</div>
                      <div className="text-emerald-400 font-extrabold">{BRANDING.CURRENCY_SYMBOL}{(order.finalAmount ?? order.totalPrice ?? order.amount ?? 0).toFixed(2)}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Provider Order ID */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                      {order.providerOrderId ? (
                        <span className="text-indigo-300 font-semibold">#{order.providerOrderId}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openUpdateModal(order)}
                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/40 text-amber-300 font-semibold text-[11px] transition cursor-pointer"
                      >
                        Action / Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="font-medium text-xs">No orders match your current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* VIEW ORDER DETAILS MODAL */}
      {viewOrder && (
        <Modal
          isOpen={Boolean(viewOrder)}
          onClose={() => setViewOrder(null)}
          title={`Order Details: #${viewOrder.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-mono text-white font-bold">{viewOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Status:</span>
                <StatusBadge status={viewOrder.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Customer Name:</span>
                <span className="text-white font-semibold">{viewOrder.customerName || viewOrder.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Customer Email:</span>
                <span className="text-zinc-300">{viewOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Service:</span>
                <span className="text-white font-bold text-right">{viewOrder.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Target Link / Handle:</span>
                <span className="font-mono text-emerald-400 text-right">{viewOrder.targetUrl || viewOrder.link || viewOrder.targetAccount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Quantity:</span>
                <span className="text-white font-bold">{viewOrder.quantity?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Price:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{BRANDING.CURRENCY_SYMBOL}{(viewOrder.finalAmount ?? viewOrder.totalPrice ?? viewOrder.amount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Creation Type:</span>
                <span className="capitalize font-semibold text-zinc-200">{viewOrder.creationType || 'customer'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Provider Order ID:</span>
                <span className="font-mono text-indigo-300">{viewOrder.providerOrderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Date Created:</span>
                <span className="text-zinc-300">{new Date(viewOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {viewOrder.notes && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-semibold text-zinc-400">Admin Notes:</span>
                <p className="text-zinc-300">{viewOrder.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewOrder(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* UPDATE STATUS & REFUND MODAL */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Order: #${selectedOrder?.id}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Customer:</span>
              <span className="text-white font-semibold">{selectedOrder?.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Package:</span>
              <span className="text-zinc-200">{selectedOrder?.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Price:</span>
              <span className="text-emerald-400 font-bold">{BRANDING.CURRENCY_SYMBOL}{(selectedOrder?.finalAmount ?? selectedOrder?.totalPrice ?? selectedOrder?.amount ?? 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Order Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => {
                const s = e.target.value as OrderStatus;
                setNewStatus(s);
                if (s === 'refunded') {
                  setRefundCustomer(true);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="pending">PENDING (Awaiting Execution)</option>
              <option value="processing">PROCESSING (Campaign Active)</option>
              <option value="completed">COMPLETED (Successfully Delivered)</option>
              <option value="partial">PARTIAL (Partially Completed)</option>
              <option value="cancelled">CANCELLED (Cancelled Order)</option>
              <option value="refunded">REFUNDED (Wallet Balance Credited)</option>
              <option value="failed">FAILED (Execution Failed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Provider Order ID
            </label>
            <input
              type="text"
              value={providerOrderId}
              onChange={(e) => setProviderOrderId(e.target.value)}
              placeholder="e.g. 98451203"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Management Notes / Timeline Event
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Dispatched to SMM provider. Views delivered."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Refund Toggle Checkbox */}
          {(newStatus === 'cancelled' || newStatus === 'refunded' || newStatus === 'failed') && (
            <label className="flex items-center space-x-2 p-3 rounded-xl border border-rose-900/60 bg-rose-950/20 text-xs text-rose-300 cursor-pointer">
              <input
                type="checkbox"
                checked={refundCustomer || newStatus === 'refunded'}
                onChange={(e) => setRefundCustomer(e.target.checked)}
                className="rounded border-rose-800 text-amber-600 focus:ring-amber-500"
              />
              <span>Refund {BRANDING.CURRENCY_SYMBOL}{(selectedOrder?.finalAmount ?? selectedOrder?.totalPrice ?? selectedOrder?.amount ?? 0).toFixed(2)} to customer's wallet balance.</span>
            </label>
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
              {isLoading ? 'Updating...' : 'Save Order Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE MANUAL ORDER MODAL */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Create Manual Order (Admin Override)"
        maxWidth="md"
      >
        <form onSubmit={handleCreateManualOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Select Customer
            </label>
            <select
              value={manualCustomerId}
              onChange={(e) => setManualCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.username} ({c.email}) - Wallet: {BRANDING.CURRENCY_SYMBOL}{c.walletBalance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Select Service Package
            </label>
            <select
              value={manualServiceId}
              onChange={(e) => setManualServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {BRANDING.CURRENCY_SYMBOL}{(s.ratePer1k || s.price || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Instagram Target URL / Link
            </label>
            <input
              type="text"
              value={manualLink}
              onChange={(e) => setManualLink(e.target.value)}
              placeholder="e.g. https://instagram.com/p/..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Provider Order ID (Optional)
            </label>
            <input
              type="text"
              value={manualProviderOrderId}
              onChange={(e) => setManualProviderOrderId(e.target.value)}
              placeholder="e.g. 849201"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Admin Notes
            </label>
            <textarea
              rows={2}
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="Optional order notes..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <label className="flex items-center space-x-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={manualChargeCustomer}
              onChange={(e) => setManualChargeCustomer(e.target.checked)}
              className="rounded border-zinc-800 text-amber-600 focus:ring-amber-500"
            />
            <span>Charge customer wallet balance for this manual order.</span>
          </label>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-950/40"
            >
              {isLoading ? 'Creating...' : 'Create Manual Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

