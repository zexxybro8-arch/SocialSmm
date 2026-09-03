import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { BRANDING } from '../config/branding';
import { api } from '../api/client';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  suggestedAmount?: number;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  suggestedAmount = 50,
}) => {
  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [method, setMethod] = useState<'card' | 'stripe' | 'crypto'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [100, 250, 500, 1000, 2500];

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.createPayment(amount, method, 'INR');
      if (res.newBalance !== undefined) {
        setSuccessMsg(`Successfully credited ${BRANDING.CURRENCY_SYMBOL}${amount.toFixed(2)} to your balance!`);
        setTimeout(() => {
          onSuccess(res.newBalance);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Balance</h3>
              <p className="text-xs text-zinc-400">Instant account replenishment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Payment Successful</h4>
            <p className="text-xs text-zinc-300">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleTopUp} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select or Enter Amount ({BRANDING.DEFAULT_CURRENCY})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">
                  {BRANDING.CURRENCY_SYMBOL}
                </span>
                <input
                  type="number"
                  min="5"
                  step="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-lg focus:outline-none focus:border-emerald-500 transition"
                  placeholder="50"
                  required
                />
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition ${
                      amount === q
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    +{BRANDING.CURRENCY_SYMBOL}{q}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                    method === 'card'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${method === 'card' ? 'text-emerald-400' : ''}`} />
                  <span className="text-xs font-semibold">Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('stripe')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                    method === 'stripe'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${method === 'stripe' ? 'text-emerald-400' : ''}`} />
                  <span className="text-xs font-semibold">Stripe Checkout</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || amount <= 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-zinc-950 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/60 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                ) : (
                  <span>Add ${amount.toFixed(2)} Instantly</span>
                )}
              </button>
              <p className="text-center text-[10px] text-zinc-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                256-bit SSL encrypted & authorized transaction
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
