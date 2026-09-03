import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight,
  Plus,
  Wallet,
  Sparkles
} from 'lucide-react';
import { User, Customer, PlatformCategory, Service, Order } from '../types/database';
import { BRANDING } from '../config/branding';
import { TopUpModal } from '../components/TopUpModal';
import { FloatingSupport } from '../components/FloatingSupport';
import { PlatformIcon, getPlatformMeta } from '../components/PlatformIcon';

interface CustomerDashboardProps {
  user: User | null;
  customerProfile: Customer | null;
  categories: PlatformCategory[];
  services: Service[];
  orders: Order[];
  onSelectCategory: (category: PlatformCategory) => void;
  onSelectService: (service: Service) => void;
  onNavigateToOrders: () => void;
  onRefreshProfile: () => void;
  onOpenNotifications: () => void;
  onOpenTicket: () => void;
  onSwitchRole?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  customerProfile,
  categories,
  services,
  orders,
  onSelectCategory,
  onSelectService,
  onNavigateToOrders,
  onRefreshProfile,
  onOpenNotifications,
  onOpenTicket,
  onSwitchRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  // Filter categories by search term
  const filteredCategories = categories.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesCategory = c.name.toLowerCase().includes(term) || (c.description && c.description.toLowerCase().includes(term));
    const hasMatchingService = services.some(
      (s) => (s.category === c.id || s.categoryName?.toLowerCase() === c.name.toLowerCase()) && 
             (s.name.toLowerCase().includes(term) || (s.serviceType && s.serviceType.toLowerCase().includes(term)))
    );
    return matchesCategory || hasMatchingService;
  });

  const balance = customerProfile?.balance ?? 0;
  const displayUsername = user?.username || customerProfile?.username || user?.fullName || '';
  const initialChar = (displayUsername.charAt(0) || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-[#070B14] text-zinc-100 flex flex-col pb-28 selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-20 bg-[#070B14]/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* User Account / Exact Username */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-zinc-950 shadow-md shadow-emerald-500/20 font-black text-base shrink-0">
              {initialChar}
            </div>
            <div className="min-w-0">
              <h1 
                id="header-user-display" 
                className="text-sm font-bold text-white tracking-tight leading-none truncate max-w-[150px] sm:max-w-[200px]"
                title={displayUsername}
              >
                {displayUsername}
              </h1>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Member
              </span>
            </div>
          </div>

          {/* User Wallet / Balance with Green '+' Button */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800/90 shadow-inner">
              <Wallet className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-bold text-white tracking-tight">
                {BRANDING.CURRENCY_SYMBOL}{balance.toFixed(2)}
              </span>
            </div>
            <button
              id="topup-header-button"
              onClick={() => setTopUpModalOpen(true)}
              aria-label="Add Balance"
              className="h-8 w-8 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 transition-all duration-150"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* Large Rounded Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            id="search-platforms-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-white px-1.5 py-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Section: Large List Rows */}
        <div className="space-y-1">
          <div className="px-1 py-1 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
              Categories
            </span>
            <span className="text-[11px] text-zinc-400">
              {filteredCategories.length} Available
            </span>
          </div>

          {/* Simple Large List Rows */}
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/80 divide-y divide-zinc-800/60 overflow-hidden shadow-xl">
            {filteredCategories.map((cat) => {
              const meta = getPlatformMeta(cat.id || cat.name);
              const availableServiceCount = services.filter(
                (s) => (s.category === cat.id || s.categoryName?.toLowerCase() === cat.name.toLowerCase()) && s.status === 'active'
              ).length;

              return (
                <button
                  key={cat.id}
                  id={`category-row-${cat.id}`}
                  onClick={() => onSelectCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-zinc-800/50 active:bg-zinc-800/80 transition-all duration-150 group text-left"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Round Platform Icon */}
                    <div 
                      className="h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: cat.bgColor || meta.bgColor,
                        color: cat.color || meta.color,
                      }}
                    >
                      <PlatformIcon 
                        platformOrIcon={cat.iconName || cat.id} 
                        className="w-5 h-5" 
                      />
                    </div>

                    {/* Platform Name */}
                    <div className="truncate">
                      <h2 className="text-sm sm:text-base font-semibold text-white group-hover:text-emerald-400 transition truncate">
                        {cat.name}
                      </h2>
                      <p className="text-[11px] text-zinc-400">
                        {availableServiceCount} services
                      </p>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition flex-shrink-0 ml-3" />
                </button>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="py-12 text-center p-6 space-y-2">
                <p className="text-xs text-zinc-400">No platforms match "{searchTerm}".</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Orders Teaser if any */}
        {orders.length > 0 && (
          <div className="pt-2">
            <button
              onClick={onNavigateToOrders}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-800/40 transition text-left"
            >
              <div className="flex items-center space-x-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-300">
                  {orders.filter(o => o.status === 'processing' || o.status === 'pending').length} Active Orders in Progress
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <span>View Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        onSuccess={() => {
          onRefreshProfile();
          setTopUpModalOpen(false);
        }}
      />

      {/* Floating Support Trigger */}
      <FloatingSupport onOpenTicket={onOpenTicket} />
    </div>
  );
};

