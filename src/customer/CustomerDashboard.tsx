import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { Order, Service, InstagramAccount } from '../types/database';
import { StatsCard } from '../components/StatsCard';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { CreateOrderModal } from './CreateOrderModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  Instagram, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenTopUp: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  onOpenTopUp,
}) => {
  const { user, customerProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [orderList, serviceList, igStatus] = await Promise.all([
        api.getOrders(),
        api.getServices(),
        api.getInstagramStatus(),
      ]);
      setOrders(orderList);
      setServices(serviceList);
      setInstagramAccount(igStatus.account || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 p-6 md:p-8 backdrop-blur-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-800/60 bg-indigo-950/40 px-3 py-1 text-xs text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Instagram Management Workspace</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, {user?.fullName}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-zinc-400 max-w-xl">
              Track campaign execution, review content deliverables, and monitor live account analytics with complete Meta API security.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </button>
            <button
              onClick={onOpenTopUp}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs md:text-sm font-semibold flex items-center space-x-2 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Add Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
        <StatsCard
          label="Account Balance"
          value={`$${(customerProfile?.balance || 0).toFixed(2)}`}
          subtext="Available for orders"
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
        />
        <StatsCard
          label="Total Orders"
          value={totalOrders}
          subtext="Lifetime placed"
          icon={<ShoppingBag className="w-4 h-4 text-indigo-400" />}
        />
        <StatsCard
          label="Pending"
          value={pendingOrders}
          subtext="Awaiting review"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
        />
        <StatsCard
          label="Processing"
          value={processingOrders}
          subtext="In production"
          icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
        />
        <StatsCard
          label="Completed"
          value={completedOrders}
          subtext="Fulfillments"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Instagram Official Integration Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-md">
              <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-white">
                <Instagram className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">
                  {instagramAccount ? `@${instagramAccount.username}` : 'Instagram Account Not Connected'}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    instagramAccount
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {instagramAccount ? 'Verified OAuth' : 'Setup Needed'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {instagramAccount
                  ? `${instagramAccount.name} • ${instagramAccount.followersCount.toLocaleString()} Followers`
                  : 'Link your Instagram via official Meta OAuth for live analytics and scheduled post delivery.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('instagram')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>{instagramAccount ? 'View Meta Permissions' : 'Connect via Meta'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {instagramAccount && (
              <button
                onClick={() => onNavigate('analytics')}
                className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition-colors cursor-pointer"
              >
                Analytics
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-sm md:text-base font-bold text-white">Recent Orders</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Latest campaigns and service fulfillment requests</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title="No orders placed yet"
            description="Explore our legitimate Instagram management packages and get started."
            actionText="Browse Services"
            onAction={() => onNavigate('services')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Service Package</th>
                  <th className="py-3 px-2">Target Account</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-2 font-mono font-semibold text-white">{order.id}</td>
                    <td className="py-3 px-2 font-medium text-zinc-200 max-w-xs truncate">
                      {order.serviceName}
                    </td>
                    <td className="py-3 px-2 font-mono text-indigo-400">{order.targetAccount}</td>
                    <td className="py-3 px-2 font-bold text-white">${(order.finalAmount ?? order.totalPrice ?? order.amount ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-2 text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => setSelectedOrderForModal(order)}
                        className="rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                      >
                        Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        services={services}
        onOrderCreated={loadData}
      />

      {/* Order Details / Timeline Modal */}
      <OrderDetailsModal
        order={selectedOrderForModal}
        isOpen={Boolean(selectedOrderForModal)}
        onClose={() => setSelectedOrderForModal(null)}
      />
    </div>
  );
};
