import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Service } from '../types/database';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Instagram, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  initialServiceId?: string;
  onOrderCreated?: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  services,
  initialServiceId,
  onOrderCreated,
}) => {
  const { customerProfile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'service' | 'details' | 'review' | 'success'>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || (services[0]?.id ?? ''));
  const [instagramHandle, setInstagramHandle] = useState<string>(customerProfile?.instagramHandle || '@');
  const [brandGoals, setBrandGoals] = useState<string>('');
  const [contentThemes, setContentThemes] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'stripe'>('balance');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const discountPercent = customerProfile?.customDiscountPercent || 0;
  const basePrice = selectedService?.price || 0;
  const discountAmount = Number(((basePrice * discountPercent) / 100).toFixed(2));
  const finalPrice = Number((basePrice - discountAmount).toFixed(2));
  const hasEnoughBalance = (customerProfile?.balance || 0) >= finalPrice;

  const handleNextToDetails = () => {
    if (!selectedService) {
      toast('error', 'Please select a service');
      return;
    }
    setStep('details');
  };

  const handleNextToReview = () => {
    if (!instagramHandle || instagramHandle.trim() === '@' || instagramHandle.length < 3) {
      toast('error', 'Please enter a valid Instagram handle');
      return;
    }
    setStep('review');
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      if (paymentMethod === 'balance' && !hasEnoughBalance) {
        toast('error', 'Insufficient balance. Please deposit funds or choose Stripe.');
        setIsSubmitting(false);
        return;
      }

      const order = await api.createOrder({
        serviceId: selectedService.id,
        targetAccount: instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`,
        requirements: {
          brandGoals: brandGoals || 'Improve engagement and brand clarity',
          contentThemes: contentThemes || 'Lifestyle & Educational',
          specialNotes: specialNotes || 'None'
        },
        paymentMethod
      });

      setCreatedOrderId(order.id);
      await refreshProfile();
      setStep('success');
      toast('success', `Order ${order.id} placed successfully!`);
      if (onOrderCreated) onOrderCreated();
    } catch (err: any) {
      toast('error', err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('service');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New SMM Order" maxWidth="lg">
      {step === 'service' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Select a legitimate social media management package for your Instagram account.
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedServiceId(srv.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedServiceId === srv.id
                    ? 'bg-indigo-950/30 border-indigo-500 shadow-md shadow-indigo-950/40'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-white">{srv.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{srv.shortDescription}</div>
                  <div className="mt-1.5 flex items-center space-x-2 text-[11px] text-zinc-400">
                    <span>Est. Delivery: {srv.deliveryTime}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">{srv.unitLabel || 'Package'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-base font-bold text-white">${srv.price.toFixed(2)}</div>
                  {discountPercent > 0 && (
                    <div className="text-[10px] text-emerald-400 font-medium">
                      VIP: ${(srv.price * (1 - discountPercent / 100)).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={handleNextToDetails}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Next: Account Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Target Instagram Handle *
            </label>
            <div className="relative">
              <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              We never require your password. Management is conducted via authorized Meta Graph API.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Key Objectives & Conversion Goals
            </label>
            <input
              type="text"
              value={brandGoals}
              onChange={(e) => setBrandGoals(e.target.value)}
              placeholder="e.g. Increase qualified DM inquiries, launch summer course, improve bio SEO"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Brand Tone & Content Pillars
            </label>
            <input
              type="text"
              value={contentThemes}
              onChange={(e) => setContentThemes(e.target.value)}
              placeholder="e.g. Authoritative fitness, clean typography, luxury minimal aesthetics"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Special Instructions / Links to Asset Folders
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Any Google Drive links, raw footage, or specific brand guidelines..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('service')}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextToReview}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2"
            >
              <span>Review & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          {/* Order Summary Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-400">Service:</span>
              <span className="text-xs font-bold text-white">{selectedService?.name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-400">Target Account:</span>
              <span className="text-xs font-mono font-bold text-indigo-400">{instagramHandle}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Standard Price:</span>
              <span className="text-zinc-200">${basePrice.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                <span>VIP Customer Discount ({discountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-white">
              <span>Total Due:</span>
              <span className="text-base text-emerald-400">${finalPrice.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('balance')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all cursor-pointer ${
                  paymentMethod === 'balance'
                    ? 'border-indigo-500 bg-indigo-950/20 text-white'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold">Account Balance</div>
                  <div className="text-[11px] text-zinc-400">
                    Available: ${(customerProfile?.balance || 0).toFixed(2)}
                  </div>
                  {!hasEnoughBalance && (
                    <div className="text-[10px] text-rose-400 font-medium mt-0.5">
                      Need ${(finalPrice - (customerProfile?.balance || 0)).toFixed(2)} more
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all cursor-pointer ${
                  paymentMethod === 'stripe'
                    ? 'border-indigo-500 bg-indigo-950/20 text-white'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold">Stripe / Card</div>
                  <div className="text-[11px] text-zinc-400">Instant checkout session</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting || (paymentMethod === 'balance' && !hasEnoughBalance)}
              onClick={handleConfirmOrder}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <span>{isSubmitting ? 'Processing Order...' : `Confirm & Pay $${finalPrice.toFixed(2)}`}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="py-8 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white">Order Confirmed & Active</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Your management order for <span className="font-mono text-indigo-300">{instagramHandle}</span> has been dispatched to our editorial team.
          </p>
          <div className="text-[11px] font-mono text-zinc-300 bg-zinc-900 py-1.5 px-3 rounded-lg inline-block border border-zinc-800">
            Order Reference: {createdOrderId}
          </div>
          <div className="pt-4 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
