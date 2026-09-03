import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Transaction } from '../types/database';
import { useAuth } from '../auth/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { TopUpModal } from '../components/TopUpModal';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Plus, 
  Receipt,
  Clock
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { customerProfile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Billing & Ledger</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Manage your balance, review past deposit invoices, and audit order payment debits.
          </p>
        </div>
        <button
          onClick={() => setIsTopUpOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Funds to Balance</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between border-emerald-900/50 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Available Balance
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">
              ${(customerProfile?.balance || 0).toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-zinc-400">Ready for instant order checkout</p>
          </div>
        </GlassCard>

        <StatsCard
          label="Total Lifetime Spent"
          value={`$${(customerProfile?.spent || 0).toFixed(2)}`}
          subtext="Processed management campaigns"
          icon={<Receipt className="w-4 h-4 text-indigo-400" />}
        />

        <GlassCard className="p-5 flex flex-col justify-between border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Security Protocol
            </span>
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-xs font-semibold text-zinc-200">Zero Credential Storage</div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Cardholder data is tokenized via Stripe. No CVVs, PINs, or raw PANs are stored on our servers.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Transactions Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white">Transaction History</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Audit log of credits, debits, and balance updates</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No transactions found on your account.
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Balance After</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {transactions.map((txn) => {
                  const isCredit = txn.amount > 0;
                  return (
                    <tr key={txn.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-zinc-300 font-semibold">
                        {txn.id}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${
                            isCredit
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                          )}
                          <span>{txn.type.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-zinc-300 font-medium max-w-sm truncate">
                        {txn.description}
                      </td>
                      <td className={`py-3.5 px-3 font-bold ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
                        {isCredit ? `+$${(txn.amount || 0).toFixed(2)}` : `-$${Math.abs(txn.amount || 0).toFixed(2)}`}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-zinc-400">
                        ${(txn.balanceAfter || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-zinc-500 text-right">
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
        )}
      </GlassCard>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={() => {
          refreshProfile();
          fetchTransactions();
        }}
      />
    </div>
  );
};
