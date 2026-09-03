import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Customer } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { 
  Users, 
  Plus, 
  Search, 
  Wallet, 
  Instagram, 
  Edit, 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  Sparkles,
  DollarSign
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // New Customer Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('Client@123456');
  const [instagramHandle, setInstagramHandle] = useState<string>('@');
  const [initialBalance, setInitialBalance] = useState<number>(100);
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Edit Customer Form State
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [balanceAdjustment, setBalanceAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Administrative manual adjustment');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCustomers = async () => {
    try {
      const data = await api.getAdminCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.createCustomer({
        fullName,
        email,
        password,
        instagramHandle: instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`,
        initialBalance,
        customDiscountPercent: customDiscount,
      });
      toast('success', `Customer account provisioned for ${email}`);
      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      setInstagramHandle('@');
      setInitialBalance(100);
      setCustomDiscount(0);
      await fetchCustomers();
    } catch (err: any) {
      toast('error', err.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (c: Customer) => {
    setSelectedCustomer(c);
    setEditStatus(c.status);
    setEditDiscount(c.customDiscountPercent);
    setBalanceAdjustment(0);
    setAdjustmentReason('Administrative manual adjustment');
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsLoading(true);
    try {
      await api.updateCustomer(selectedCustomer.id, {
        status: editStatus,
        customDiscountPercent: editDiscount,
        balanceAdjustment: Number(balanceAdjustment) || 0,
        adjustmentReason,
      });
      toast('success', `Customer ${selectedCustomer.id} updated`);
      setIsEditModalOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      toast('error', err.message || 'Failed to update customer');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.id.toLowerCase().includes(s) ||
      (c.fullName && c.fullName.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.instagramHandle && c.instagramHandle.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Customer Accounts Directory
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Enterprise provisioned client workspaces with individual ledger controls and custom VIP pricing.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs md:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-amber-950/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Customer</span>
        </button>
      </div>

      {/* Search & Statistics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or handle..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="text-xs text-zinc-400 self-end sm:self-center">
          Active Accounts: <strong className="text-white">{customers.filter((c) => c.status === 'active').length}</strong> of {customers.length}
        </div>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Client Name & Email</th>
                <th className="py-3.5 px-4">Target Handle</th>
                <th className="py-3.5 px-4">Ledger Balance</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">VIP Discount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{c.fullName || 'Client'}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{c.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 font-mono text-indigo-400 font-medium">
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{c.instagramHandle || 'Unset'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    ${(c.balance || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-300">
                    ${(c.spent || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.customDiscountPercent > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/80">
                        {c.customDiscountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-zinc-500">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                      title="Edit customer balance and settings"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Provision New Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Customer Account"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jordan Hayes"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@clientbrand.com"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Initial Temporary Password *
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Primary Instagram Handle
            </label>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="@brandname"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Initial Balance ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={initialBalance}
                onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                VIP Discount Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-950/40"
            >
              {isLoading ? 'Creating...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Customer: ${selectedCustomer?.fullName || selectedCustomer?.id}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Current Ledger Balance:</span>
            <span className="text-base font-bold text-emerald-400">
              ${(selectedCustomer?.balance || 0).toFixed(2)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Account Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="active">Active (Full access)</option>
              <option value="suspended">Suspended (Blocked from ordering)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              VIP Discount Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={editDiscount}
              onChange={(e) => setEditDiscount(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Manual Balance Adjustment (+/- USD)
            </label>
            <input
              type="number"
              step="5"
              value={balanceAdjustment}
              onChange={(e) => setBalanceAdjustment(parseFloat(e.target.value) || 0)}
              placeholder="e.g. +50 to credit or -20 to debit"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Enter positive value to add funds, negative to deduct.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Adjustment Audit Note
            </label>
            <input
              type="text"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-950/40"
            >
              {isLoading ? 'Saving...' : 'Save Customer Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
