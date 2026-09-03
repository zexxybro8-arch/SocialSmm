import React from 'react';
import { Plus, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import { BRANDING } from '../config/branding';

interface BalanceCardProps {
  balance: number;
  spent?: number;
  userName?: string;
  onAddBalance: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  spent = 0,
  userName = 'Creator',
  onAddBalance,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-5 shadow-xl">
      {/* Subtle green ambient background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Account Balance
            </span>
          </div>

          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {BRANDING.CURRENCY_SYMBOL}{(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-emerald-400 ml-1">
              {BRANDING.DEFAULT_CURRENCY}
            </span>
          </div>

          {(spent || 0) > 0 && (
            <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-zinc-400">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Total spent: {BRANDING.CURRENCY_SYMBOL}{(spent || 0).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Small "Add Balance" button with green styling */}
        <button
          id="btn-add-balance-card"
          onClick={onAddBalance}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition shadow-sm hover:scale-102 active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Balance</span>
        </button>
      </div>
    </div>
  );
};
