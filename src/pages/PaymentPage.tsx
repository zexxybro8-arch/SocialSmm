import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Service, Customer, Order } from '../types/database';
import { BRANDING } from '../config/branding';
import { Header } from '../components/Header';
import { TopUpModal } from '../components/TopUpModal';
import { api } from '../api/client';
import { FloatingSupport } from '../components/FloatingSupport';

interface PaymentPageProps {
  orderData: {
    service: Service;
    targetUrl: string;
    quantity: number;
    totalPrice: number;
    customerNotes: string;
  };
  customerProfile: Customer | null;
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
  onRefreshProfile: () => void;
  onOpenTicket?: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  orderData,
  customerProfile,
  onBack,
  onOrderSuccess,
  onRefreshProfile,
  onOpenTicket,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card'>('balance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const balance = customerProfile?.balance || 0;
  const isBalanceSufficient = balance >= orderData.totalPrice;

  const handlePay = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      if (paymentMethod === 'card') {
        // If paying with card directly, automatically credit and process
        await api.createPayment(orderData.totalPrice, 'card', 'USD');
        await onRefreshProfile();
      }

      // Create the order via API
      const createdOrder = await api.createOrder({
        serviceId: orderData.service.id,
        targetUrl: orderData.targetUrl,
        quantity: orderData.quantity,
        customerNotes: orderData.customerNotes,
      });

      if (createdOrder) {
        setCompletedOrder(createdOrder);
        onRefreshProfile();
      } else {
        throw new Error('Order creation did not return confirmation.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-24 selection:bg-emerald-500 selection:text-zinc-950">
      <Header
        user={null}
        title="Checkout & Payment"
        subtitle="Review & authorize order"
        showBack={!completedOrder}
        onBack={onBack}
      />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 space-y-4">
        {completedOrder ? (
          /* Order Success Screen */
          <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900/95 p-6 sm:p-8 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                Order Placed Successfully
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Order In Delivery Queue
              </h2>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto">
                Your order has been submitted to the dispatch queue and will begin delivering automatically.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order Reference:</span>
                <span className="font-mono font-bold text-white">#{completedOrder.id.replace('ord_', '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Service:</span>
                <span className="font-medium text-white truncate max-w-[180px]">{completedOrder.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Account:</span>
                <span className="font-medium text-emerald-400 font-mono truncate max-w-[180px]">{completedOrder.targetUrl || completedOrder.targetAccount || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quantity:</span>
                <span className="font-medium text-white">{completedOrder.quantity ?? 1} package(s)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm">
                <span className="font-bold text-white">Total Paid:</span>
                <span className="font-black text-emerald-400">{BRANDING.CURRENCY_SYMBOL}{(completedOrder.totalPrice ?? completedOrder.finalAmount ?? completedOrder.amount ?? 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              id="view-placed-order-btn"
              onClick={() => onOrderSuccess(completedOrder)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/60"
            >
              <span>Track in Orders Tab</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        ) : (
          /* Payment Selection Screen */
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Review Card */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Order Summary
              </h3>

              <div className="flex justify-between items-start pt-1">
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {orderData.service.name}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Target: {orderData.targetUrl}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">
                    {BRANDING.CURRENCY_SYMBOL}{(orderData.service?.price || 0).toFixed(2)} × {orderData.quantity || 1}
                  </span>
                </div>
              </div>

              {orderData.customerNotes && (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                  <span className="font-semibold text-zinc-400">Notes: </span>
                  {orderData.customerNotes}
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="text-xs font-semibold text-zinc-400">Total Payable:</span>
                <span className="text-xl font-black text-emerald-400">
                  {BRANDING.CURRENCY_SYMBOL}{(orderData.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Select Payment Method
              </h3>

              {/* Option 1: Account Balance */}
              <div
                onClick={() => isBalanceSufficient && setPaymentMethod('balance')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'balance'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Account Balance</span>
                        {isBalanceSufficient ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                            Ready
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-semibold">
                            Insufficient
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Current: ${(balance || 0).toFixed(2)} USD
                      </p>
                    </div>
                  </div>

                  {!isBalanceSufficient && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTopUpModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add ${Math.ceil(orderData.totalPrice - balance)}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Option 2: Credit Card / Instant Pay */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Credit Card / Debit Card</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Instant charge & dispatch via Stripe processing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              id="confirm-pay-order-btn"
              onClick={handlePay}
              disabled={isProcessing || (paymentMethod === 'balance' && !isBalanceSufficient)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:scale-[0.98] text-zinc-950 font-black text-sm flex items-center justify-center space-x-2 transition shadow-xl shadow-emerald-950/60 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="inline-block h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
              ) : (
                <span>Pay & Authorize Order ({BRANDING.CURRENCY_SYMBOL}{(orderData.totalPrice || 0).toFixed(2)})</span>
              )}
            </button>

            <p className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              Encrypted transaction. In compliance with platform service guidelines.
            </p>
          </div>
        )}
      </main>

      {/* Top Up Modal if needed */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        suggestedAmount={Math.ceil(orderData.totalPrice - balance)}
        onSuccess={() => {
          onRefreshProfile();
          setTopUpModalOpen(false);
          setPaymentMethod('balance');
        }}
      />

      <FloatingSupport onOpenTicket={onOpenTicket} />
    </div>
  );
};
