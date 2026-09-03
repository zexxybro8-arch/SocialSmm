import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Copy, 
  Check, 
  Loader2, 
  Wallet, 
  AlertCircle,
  Plus,
  Star,
  Zap,
  ShieldCheck,
  Sparkles,
  Gauge,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Service, Customer, Order } from '../types/database';
import { BRANDING } from '../config/branding';
import { TopUpModal } from '../components/TopUpModal';
import { PlatformIcon } from '../components/PlatformIcon';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { api } from '../api/client';

interface CreateOrderPageProps {
  service: Service;
  customerProfile: Customer | null;
  onBack: () => void;
  onProceedToPayment?: (orderData: {
    service: Service;
    targetUrl: string;
    quantity: number;
    totalPrice: number;
    customerNotes: string;
  }) => void;
  onOrderSuccess?: (order: Order) => void;
  onRefreshBalance: () => void;
  onOpenTicket?: () => void;
}

export const CreateOrderPage: React.FC<CreateOrderPageProps> = ({
  service,
  customerProfile,
  onBack,
  onProceedToPayment,
  onOrderSuccess,
  onRefreshBalance,
}) => {
  const minQty = service.minQuantity || 100;
  const maxQty = service.maxQuantity || 1000000;
  const rate = service.ratePer1k || service.price || 0.45;
  const isPer1k = service.unitLabel?.toLowerCase().includes('1,000') || service.unitLabel?.toLowerCase().includes('1k') || minQty >= 10;

  // Form States
  const [quantity, setQuantity] = useState<number>(minQty);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isDripFeed, setIsDripFeed] = useState<boolean>(false);
  const [dripRuns, setDripRuns] = useState<number>(5);
  const [dripInterval, setDripInterval] = useState<number>(60);
  const [showDripInfo, setShowDripInfo] = useState<boolean>(false);
  
  // UI & Action States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [topUpModalOpen, setTopUpModalOpen] = useState<boolean>(false);
  const [copiedServiceId, setCopiedServiceId] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(service.isFavorite));
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false);

  const balance = customerProfile?.balance || 0;

  // Sync favorites on load
  useEffect(() => {
    let isMounted = true;
    api.getFavorites().then((favs) => {
      if (isMounted) {
        setIsFavorite(favs.includes(service.id) || Boolean(service.isFavorite));
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [service.id, service.isFavorite]);

  // Dynamic Price Calculation
  const totalPrice = useMemo(() => {
    const validQty = Math.max(0, quantity || 0);
    const raw = isPer1k ? (rate * validQty) / 1000 : rate * validQty;
    return Number(Math.max(0.01, raw).toFixed(2));
  }, [quantity, rate, isPer1k]);

  const hasEnoughBalance = balance >= totalPrice;
  const isFormValid = targetUrl.trim().length > 0 && quantity >= minQty && quantity <= maxQty;

  // Dynamic link placeholder based on service category / name
  const dynamicPlaceholder = useMemo(() => {
    if (service.linkType) {
      if (service.linkType.toLowerCase().includes('video') || service.linkType.toLowerCase().includes('reel')) {
        return 'Instagram Reel/Video Links Only';
      }
      return `${service.linkType} Only`;
    }

    const name = (service.name || '').toLowerCase();
    const cat = (service.category || service.categoryName || '').toLowerCase();

    if (name.includes('reel') || name.includes('video') || name.includes('view') || cat.includes('reel') || cat.includes('views')) {
      return 'Instagram Reel/Video Links Only';
    }
    if (name.includes('follower') || cat.includes('follower') || name.includes('profile')) {
      return 'Instagram Profile Link (e.g. https://instagram.com/username)';
    }
    if (name.includes('story')) {
      return 'Instagram Story Link (e.g. https://instagram.com/stories/...)';
    }
    if (name.includes('comment')) {
      return 'Instagram Post/Reel Link for Comments';
    }
    if (name.includes('like') || cat.includes('like')) {
      return 'Instagram Post/Reel Link Only';
    }
    if (cat.includes('youtube')) {
      return 'YouTube Video / Shorts Link Only';
    }
    if (cat.includes('telegram')) {
      return 'Telegram Channel / Post Link Only';
    }
    if (cat.includes('tiktok')) {
      return 'TikTok Video / Profile Link Only';
    }
    return 'Instagram Reel/Video Links Only';
  }, [service]);

  // Derived / Dynamic Service Details
  const displayServiceId = service.serviceId ? String(service.serviceId) : service.id.replace('srv_', '').replace('ig_', '');
  
  const speedTier = useMemo<'Fast' | 'Medium' | 'Slow'>(() => {
    if (service.speedTier) return service.speedTier;
    const s = (service.speed || service.deliveryTime || '').toLowerCase();
    if (s.includes('instant') || s.includes('1m') || s.includes('250k') || s.includes('500k') || s.includes('100k') || s.includes('50k')) {
      return 'Fast';
    }
    if (s.includes('slow') || s.includes('1k') || s.includes('300')) {
      return 'Slow';
    }
    return 'Medium';
  }, [service]);

  const featureBadges = useMemo<string[]>(() => {
    if (service.features && service.features.length > 0) {
      return service.features;
    }
    if (service.deliverables && service.deliverables.length > 0) {
      return service.deliverables;
    }
    return [
      'No drops',
      'Guarantee',
      'Real',
      'Cancel button',
      `Speed ${service.speed || '1M per day'}`
    ];
  }, [service]);

  const serviceInfo = useMemo(() => {
    return {
      link: service.linkType || 'Instagram Video Link',
      location: service.location || 'Global',
      startTime: service.startTime || service.deliveryTime || '0-2 Minutes',
      videoFormat: service.videoFormat || 'All Link | Video + Reels + IGTV'
    };
  }, [service]);

  const handleCopyServiceId = () => {
    navigator.clipboard.writeText(displayServiceId);
    setCopiedServiceId(true);
    setTimeout(() => setCopiedServiceId(false), 2000);
  };

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    const prev = isFavorite;
    setIsFavorite(!prev); // optimistic
    try {
      const res = await api.toggleFavorite(service.id);
      setIsFavorite(res.isFavorite);
    } catch {
      setIsFavorite(prev);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!targetUrl.trim()) {
      setErrorMessage('Please enter a valid link or target account.');
      return;
    }

    if (!quantity || quantity < minQty) {
      setErrorMessage(`Minimum order quantity for this service is ${minQty.toLocaleString()}.`);
      return;
    }

    if (quantity > maxQty) {
      setErrorMessage(`Maximum order quantity for this service is ${maxQty.toLocaleString()}.`);
      return;
    }

    if (isDripFeed) {
      if (dripRuns < 2 || dripRuns > 100) {
        setErrorMessage('Drip feed runs must be between 2 and 100.');
        return;
      }
      if (dripInterval < 10 || dripInterval > 1440) {
        setErrorMessage('Drip feed interval must be between 10 and 1440 minutes.');
        return;
      }
    }

    if (!hasEnoughBalance) {
      setErrorMessage(`Insufficient balance. Please add funds to place this order.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit directly to authoritative backend order endpoint
      const createdOrder = await api.createOrder({
        serviceId: service.id,
        targetUrl: targetUrl.trim(),
        targetAccount: targetUrl.trim(),
        quantity,
        customerNotes: isDripFeed 
          ? `Drip Feed: ${dripRuns} runs every ${dripInterval} min (~${Math.floor(quantity / dripRuns)}/run)` 
          : '',
        paymentMethod: 'balance'
      });

      if (createdOrder) {
        await onRefreshBalance();
        setSuccessOrder(createdOrder);
      } else {
        throw new Error('Could not create order. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create order. Please check your balance and connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-zinc-100 flex flex-col pb-28 selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-20 bg-[#070B14]/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          {/* Circular Back Button */}
          <button
            id="create-order-back-btn"
            type="button"
            onClick={onBack}
            className="h-9 w-9 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-zinc-800 shadow-sm z-10"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Centered Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-sm font-semibold text-zinc-300 tracking-tight">
              Creating order
            </h1>
          </div>

          {/* Wallet Balance Chip */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white shadow-sm z-10">
            <Wallet className="w-3.5 h-3.5 text-zinc-400" />
            <span>{BRANDING.CURRENCY_SYMBOL}{balance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      {/* Hero Service Information */}
      <div className="max-w-md w-full mx-auto px-4 pt-4 pb-2 flex flex-col items-center justify-center">
        {/* Instagram / Platform Icon */}
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-rose-500/20 to-amber-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-950/30 mb-2.5">
          <PlatformIcon platformOrIcon={service.category || service.categoryName || 'instagram'} className="w-5 h-5" />
        </div>

        {/* Selected Service Name as a large centered heading */}
        <h2 className="text-lg sm:text-xl font-bold text-white text-center leading-snug tracking-tight max-w-sm mx-auto break-words">
          {service.name}
        </h2>
      </div>

      {/* 2. ORDER FORM & 3. SUMMARY */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 space-y-3.5">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* 1. AMOUNT FIELD */}
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 space-y-2">
            <label htmlFor="order-amount-input" className="block text-xs font-bold text-zinc-300">
              Amount
            </label>
            <input
              id="order-amount-input"
              type="number"
              min={minQty}
              max={maxQty}
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white font-bold text-base sm:text-lg focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600"
              placeholder={`Enter amount (e.g. ${minQty})`}
              required
            />
            {/* Min / Max Badges */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-medium text-zinc-300">
                min {minQty.toLocaleString()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-medium text-zinc-300">
                max {maxQty.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 2. LINK FIELD */}
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 space-y-2">
            <label htmlFor="order-link-input" className="block text-xs font-bold text-zinc-300">
              Link
            </label>
            <input
              id="order-link-input"
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder={dynamicPlaceholder}
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600"
              required
            />
          </div>

          {/* 3. DRIP FEED */}
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-zinc-300">Drip feed</span>
                <button
                  type="button"
                  onClick={() => setShowDripInfo(!showDripInfo)}
                  className="text-zinc-400 hover:text-zinc-200 transition p-0.5"
                  title="Drip feed information"
                  aria-label="Drip feed information"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                id="drip-feed-toggle"
                onClick={() => setIsDripFeed(!isDripFeed)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  isDripFeed ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
                role="switch"
                aria-checked={isDripFeed}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDripFeed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Drip Feed Explainer */}
            {showDripInfo && (
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed animate-in fade-in">
                Drip-feed builds engagement gradually by dividing your order into smaller batches over intervals for natural, organic-looking growth.
              </div>
            )}

            {/* Drip Feed Sub-Controls */}
            {isDripFeed && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Runs</label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={dripRuns}
                    onChange={(e) => setDripRuns(parseInt(e.target.value, 10) || 2)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    ~{Math.floor((quantity || 0) / Math.max(1, dripRuns))} per run
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Interval (min)</label>
                  <input
                    type="number"
                    min={10}
                    max={1440}
                    value={dripInterval}
                    onChange={(e) => setDripInterval(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Every {dripInterval} minutes
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. ORDER SUMMARY */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-medium">Amount</span>
              <span className="text-white font-bold text-base">
                {Number(quantity || 0).toLocaleString()}
              </span>
            </div>

            <div className="h-px bg-zinc-800/60" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-medium">Price</span>
              <span className="text-emerald-400 font-black text-xl tracking-tight">
                {BRANDING.CURRENCY_SYMBOL}{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Low Balance Warning with 1-Tap Top-Up */}
          {!hasEnoughBalance && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs animate-in fade-in">
              <div className="space-y-0.5">
                <div className="text-amber-300 font-bold">Insufficient Balance</div>
                <div className="text-[11px] text-amber-400/80">
                  Need {BRANDING.CURRENCY_SYMBOL}{Math.max(0, totalPrice - balance).toFixed(2)} more to place order
                </div>
              </div>
              <button
                type="button"
                id="order-add-funds-btn"
                onClick={() => setTopUpModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs transition flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Funds</span>
              </button>
            </div>
          )}

          {/* 5. CREATE ORDER BUTTON */}
          <button
            id="create-order-submit-btn"
            type="submit"
            disabled={isSubmitting || !isFormValid || !hasEnoughBalance}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-black text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating order...</span>
              </>
            ) : (
              <span>Create order</span>
            )}
          </button>
        </form>

        {/* 6. SERVICE DETAILS */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-4 shadow-md mt-4">
          {/* Service ID Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Service ID</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-zinc-200 font-bold text-sm bg-zinc-800/90 px-2.5 py-0.5 rounded-lg border border-zinc-700/60">
                {displayServiceId}
              </span>
              <button
                type="button"
                id="copy-service-id-btn"
                onClick={handleCopyServiceId}
                className="p-1 hover:text-white rounded-md transition hover:bg-zinc-800 active:scale-90 text-zinc-400"
                title="Copy Service ID"
                aria-label="Copy Service ID"
              >
                {copiedServiceId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {copiedServiceId && (
                <span className="text-[10px] text-emerald-400 font-semibold animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-800/50" />

          {/* Premium Animated Speedometer Gauge */}
          <SpeedometerGauge
            speed={service.speed}
            speedTier={service.speedTier}
          />

          <div className="h-px bg-zinc-800/50" />

          {/* Feature Badges */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Features
            </span>
            <div className="flex flex-wrap gap-1.5">
              {featureBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800/70 border border-zinc-700/50 text-zinc-200 text-xs font-medium"
                >
                  <span className="text-emerald-400 text-xs">✓</span>
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-800/50" />

          {/* Service Information Grid */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-zinc-400">Link:</span>
              <span className="text-zinc-200 font-medium text-right">{serviceInfo.link}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-zinc-400">Location:</span>
              <span className="text-zinc-200 font-medium text-right">{serviceInfo.location}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-zinc-400">Start Time:</span>
              <span className="text-zinc-200 font-medium text-right">{serviceInfo.startTime}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-zinc-400">Video Format:</span>
              <span className="text-zinc-200 font-medium text-right">{serviceInfo.videoFormat}</span>
            </div>
          </div>
        </div>

        {/* 7. FAVORITE TOGGLE */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className={`w-4 h-4 transition-colors ${
                isFavorite ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'
              }`} />
              <span className="text-xs font-bold text-zinc-300">Favorite</span>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              id="favorite-service-toggle"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                isFavorite ? 'bg-amber-400' : 'bg-zinc-800'
              }`}
              role="switch"
              aria-checked={isFavorite}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isFavorite ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL / POPUP */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 text-center space-y-4 shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Order Created Successfully!</h3>
              <p className="text-xs text-zinc-400">
                Your order has been queued and is processing.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-3 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-mono text-zinc-200 font-bold">#{successOrder.id.replace('ORD-', '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Service:</span>
                <span className="text-zinc-200 font-medium truncate max-w-[180px]">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Amount:</span>
                <span className="text-white font-bold">{Number(quantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Paid:</span>
                <span className="text-emerald-400 font-bold">{BRANDING.CURRENCY_SYMBOL}{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="view-orders-after-success-btn"
                onClick={() => {
                  if (onOrderSuccess) {
                    onOrderSuccess(successOrder);
                  } else {
                    onBack();
                  }
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                View in Orders
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessOrder(null);
                  setTargetUrl('');
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
              >
                Create Another Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Balance Modal */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        suggestedAmount={Math.ceil(totalPrice - balance)}
        onSuccess={() => {
          onRefreshBalance();
          setTopUpModalOpen(false);
        }}
      />
    </div>
  );
};
