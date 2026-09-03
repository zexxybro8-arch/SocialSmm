import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Order, Customer, Service } from '../types/database';
import { StatsCard } from '../components/StatsCard';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ordersData, customersData, servicesData] = await Promise.all([
          api.getAdminOrders(),
          api.getAdminCustomers(),
          api.getServices(),
        ]);
        setOrders(ordersData);
        setCustomers(customersData);
        setServices(servicesData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' && o.status !== 'refunded' ? sum + o.finalAmount : sum), 0);
  const activeOrders = orders.filter((o) => o.status === 'processing' || o.status === 'pending' || o.status === 'paid').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalCustomers = customers.length;

  return (
    <div className="space-y-6">
      {/* Admin Top Banner */}
      <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-r from-zinc-950 via-amber-950/20 to-zinc-950 p-6 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Operations & Compliance Terminal</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Instagram SMM Command Center
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Real-time control over customer balances, editorial fulfillment workflows, and authorized Meta Graph API services.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('admin-customers')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Customer</span>
          </button>
          <button
            onClick={() => onNavigate('admin-services')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md shadow-amber-950/40"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Catalog</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        <StatsCard
          label="Total Gross Volume"
          value={`$${(totalRevenue || 0).toFixed(2)}`}
          subtext="Net delivered billings"
          trend={{ positive: true, label: '+14.2%' }}
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <StatsCard
          label="Active Queue"
          value={activeOrders}
          subtext="Pending & Processing"
          trend={{ positive: false, label: `${activeOrders} queued` }}
          icon={<Clock className="w-4 h-4 text-amber-400" />}
        />
        <StatsCard
          label="Completed Campaigns"
          value={completedOrders}
          subtext="Delivered deliverables"
          trend={{ positive: true, label: '100% verified' }}
          icon={<CheckCircle2 className="w-4 h-4 text-indigo-400" />}
        />
        <StatsCard
          label="Managed Accounts"
          value={totalCustomers}
          subtext="Authorized clients"
          icon={<Users className="w-4 h-4 text-purple-400" />}
        />
      </div>

      {/* Live Order Queue Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white">Live Execution Queue</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Orders requiring dispatch or status updates</p>
          </div>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>Open All Orders ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Target Handle</th>
                <th className="py-3 px-3">Service Package</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-white">{order.id}</td>
                  <td className="py-3.5 px-3 font-mono text-indigo-400 font-medium">
                    {order.targetAccount}
                  </td>
                  <td className="py-3.5 px-3 text-zinc-200 max-w-xs truncate">{order.serviceName}</td>
                  <td className="py-3.5 px-3 font-bold text-white">${(order.finalAmount ?? order.totalPrice ?? order.amount ?? 0).toFixed(2)}</td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('admin-orders')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
