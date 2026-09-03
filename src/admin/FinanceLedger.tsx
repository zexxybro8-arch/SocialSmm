import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Transaction } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Search, 
  ShieldCheck 
} from 'lucide-react';

export const FinanceLedger: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await api.getTransactions();
        setTransactions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalCredits = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const q = search.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.customerId.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Financial Ledger & Transaction Audit
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Complete ledger records of customer deposits, gateway checkout settlements, and automated refund debits.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Total Inflow / Deposits"
          value={`$${(totalCredits || 0).toFixed(2)}`}
          subtext="Verified client deposits"
          trend={{ positive: true, label: 'Secured' }}
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
        />
        <StatsCard
          label="Total Service Billings"
          value={`$${(totalDebits || 0).toFixed(2)}`}
          subtext="Order debits & fees"
          icon={<DollarSign className="w-4 h-4 text-indigo-400" />}
        />
        <GlassCard className="p-5 flex flex-col justify-between border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Gateway Standard
            </span>
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-white">Stripe Server-Side Architecture</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Encrypted API proxy. No raw payment credentials ever touch the local client.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'order_payment', label: 'Order Payments' },
            { id: 'refund', label: 'Refunds' },
            { id: 'admin_adjustment', label: 'Admin Adjustments' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === item.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, client, or memo..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Txn ID</th>
                <th className="py-3.5 px-4">Client ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Balance After</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((txn) => {
                const isCredit = txn.amount > 0;
                return (
                  <tr key={txn.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">{txn.id}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">{txn.customerId}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold uppercase text-[11px] text-zinc-300">
                        {txn.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 max-w-sm truncate">{txn.description}</td>
                    <td className={`py-3.5 px-4 font-bold ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
                      {isCredit ? `+$${(txn.amount || 0).toFixed(2)}` : `-$${Math.abs(txn.amount || 0).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      ${(txn.balanceAfter || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 text-right">
                      {new Date(txn.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
