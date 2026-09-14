import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Transaction, FixedDepositOption } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatsCard } from '../components/StatsCard';
import { useToast } from '../components/Toast';
import { 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Search, 
  ShieldCheck,
  Plus,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Check,
  X
} from 'lucide-react';

export const FinanceLedger: React.FC = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fixed Deposit Form State
  const [fixedDepositOptions, setFixedDepositOptions] = useState<FixedDepositOption[]>([]);
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isActiveStatus, setIsActiveStatus] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSavingDeposit, setIsSavingDeposit] = useState<boolean>(false);

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

  const fetchFixedDeposits = async () => {
    try {
      const options = await api.getFixedDepositOptions();
      setFixedDepositOptions(options);
    } catch (e) {
      console.error('Fetch fixed deposit options error:', e);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchFixedDeposits();
  }, []);

  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow empty string for clearing
    if (rawVal === '') {
      setDepositAmountInput('');
      setValidationError(null);
      return;
    }

    // Reject non-digit characters (no decimals, negative numbers, or non-numeric characters)
    if (!/^\d*$/.test(rawVal)) {
      setValidationError('Enter an amount between ₹1 and ₹10,00,000.');
      return;
    }

    const numericVal = parseInt(rawVal, 10);

    // Validate integer range between 1 and 1,000,000 (10 lakh)
    if (isNaN(numericVal) || numericVal < 1 || numericVal > 1000000) {
      setValidationError('Enter an amount between ₹1 and ₹10,00,000.');
    } else {
      setValidationError(null);
    }

    setDepositAmountInput(rawVal);
  };

  const handleSaveFixedDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!depositAmountInput || depositAmountInput.trim() === '') {
      setValidationError('Enter an amount between ₹1 and ₹10,00,000.');
      return;
    }

    const parsed = Number(depositAmountInput);

    // Strict validation: whole integer between 1 and 1,000,000 (10 lakh)
    if (
      isNaN(parsed) ||
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > 1000000 ||
      depositAmountInput.includes('.')
    ) {
      setValidationError('Enter an amount between ₹1 and ₹10,00,000.');
      return;
    }

    setValidationError(null);
    setIsSavingDeposit(true);

    try {
      const saved = await api.saveFixedDepositOption({
        amount: parsed,
        active: isActiveStatus,
        qrImageUrl: qrImageUrl.trim(),
      });

      toast('success', `Fixed deposit amount ₹${parsed.toLocaleString('en-IN')} saved successfully!`);
      
      // Reset form
      setDepositAmountInput('');
      setQrImageUrl('');
      setIsActiveStatus(true);
      
      // Refresh list
      fetchFixedDeposits();
    } catch (err: any) {
      console.error('Failed to save fixed deposit:', err);
      toast('error', err.message || 'Failed to save deposit amount.');
    } finally {
      setIsSavingDeposit(false);
    }
  };

  const handleToggleOptionStatus = async (opt: FixedDepositOption) => {
    try {
      await api.saveFixedDepositOption({
        amount: opt.amount,
        active: !opt.active,
        qrImageUrl: opt.qrImageUrl || '',
      });
      fetchFixedDeposits();
      toast('info', `Fixed deposit amount ₹${opt.amount} updated.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOption = async (id: string, amount: number) => {
    try {
      await api.deleteFixedDepositOption(id);
      fetchFixedDeposits();
      toast('success', `Fixed deposit amount ₹${amount} removed.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQrUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImageUrl(reader.result as string);
        toast('success', 'QR Code image loaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

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
          Financial Ledger & Fixed Deposit Management
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Configure fixed deposit packages, payment QR codes, and audit customer transaction inflow ledger.
        </p>
      </div>

      {/* Fixed Deposit Management Form */}
      <GlassCard className="p-5 border-zinc-800 space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Add New Fixed Deposit Amount</h3>
            <p className="text-xs text-zinc-400">
              Create fixed INR deposit options with payment QR codes for customer wallet top-ups.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveFixedDeposit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deposit Amount (INR) Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Deposit Amount (INR) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={depositAmountInput}
                  onChange={handleDepositAmountChange}
                  placeholder="e.g. 5200"
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border text-sm font-mono font-bold text-white placeholder-zinc-600 focus:outline-none transition ${
                    validationError
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-zinc-800 focus:border-amber-500'
                  }`}
                />
              </div>
              {validationError ? (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{validationError}</span>
                </p>
              ) : (
                <p className="text-[10px] text-zinc-500">
                  Enter an amount between ₹1 and ₹10,00,000 (whole integers only).
                </p>
              )}
            </div>

            {/* Payment QR Code URL / Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Payment QR Code (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  placeholder="Paste QR Image URL or upload..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition"
                />
                <label className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer flex items-center space-x-1.5 transition">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUploadMock}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Active Status Toggle & Submit */}
            <div className="flex items-end justify-between space-x-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Active Status
                </label>
                <button
                  type="button"
                  onClick={() => setIsActiveStatus(!isActiveStatus)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    isActiveStatus
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isActiveStatus ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                  <span>{isActiveStatus ? 'Active' : 'Inactive'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingDeposit || !!validationError || !depositAmountInput}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                {isSavingDeposit ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Save Amount</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Existing Fixed Deposit Amounts List */}
        <div className="pt-3 border-t border-zinc-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Active Fixed Deposit Amounts Configuration ({fixedDepositOptions.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {fixedDepositOptions.map((opt) => (
              <div
                key={opt.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                  opt.active
                    ? 'bg-zinc-900/90 border-zinc-700/80 hover:border-amber-500/60'
                    : 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400 font-mono">
                    ₹{opt.amount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      opt.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {opt.active ? 'Active' : 'Off'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => handleToggleOptionStatus(opt)}
                    className="text-[10px] text-zinc-400 hover:text-white transition"
                    title="Toggle active status"
                  >
                    {opt.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(opt.id, opt.amount)}
                    className="text-zinc-500 hover:text-rose-400 transition"
                    title="Delete deposit amount"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Total Inflow / Deposits"
          value={`₹${(totalCredits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtext="Verified client deposits"
          trend={{ positive: true, label: 'Secured' }}
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
        />
        <StatsCard
          label="Total Service Billings"
          value={`₹${(totalDebits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
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
            <div className="text-xs font-semibold text-white">Encrypted INR Deposit System</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Supports amounts from ₹1 to ₹10,00,000 with real-time Firestore database verification.
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
                      {isCredit ? `+₹${(txn.amount || 0).toFixed(2)}` : `-₹${Math.abs(txn.amount || 0).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      ₹{(txn.balanceAfter || 0).toFixed(2)}
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
