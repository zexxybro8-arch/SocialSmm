import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Service, ServiceCategory } from '../types/database';
import { useAuth } from '../auth/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { CreateOrderModal } from './CreateOrderModal';
import { 
  Layers, 
  Search, 
  Clock, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface ServicesCatalogProps {
  onOpenOrderModalWithService?: (serviceId: string) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = () => {
  const { customerProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [activeServiceId, setActiveServiceId] = useState<string>('');

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'instagram_management', label: 'Full Management' },
    { id: 'content_scheduling', label: 'Content & Scheduling' },
    { id: 'profile_optimization', label: 'Profile Optimization' },
    { id: 'analytics_reporting', label: 'Analytics & Audits' },
    { id: 'consulting_strategy', label: 'Consulting' },
  ];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const discountPercent = customerProfile?.customDiscountPercent || 0;

  const handleOrderClick = (serviceId: string) => {
    setActiveServiceId(serviceId);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Instagram Management Services
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Meta API compliant growth strategies, editorial calendars, profile audits, and content production.
          </p>
        </div>

        {discountPercent > 0 && (
          <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/40 px-3.5 py-2 text-xs text-emerald-300 flex items-center space-x-2 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              VIP Tier Active: <strong className="font-bold text-white">{discountPercent}% OFF</strong> all packages
            </span>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service packages..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((srv) => {
          const finalPrice = discountPercent > 0 ? srv.price * (1 - discountPercent / 100) : srv.price;
          return (
            <GlassCard
              key={srv.id}
              className="p-5 flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/60">
                    {srv.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{srv.deliveryTime}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {srv.shortDescription}
                </p>

                {/* Deliverables checklist */}
                {srv.deliverables && srv.deliverables.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Includes:
                    </div>
                    {srv.deliverables.slice(0, 4).map((d, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-lg font-bold text-white">${finalPrice.toFixed(2)}</span>
                    {discountPercent > 0 && (
                      <span className="text-xs text-zinc-400 line-through">
                        ${srv.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">{srv.unitLabel || 'Package'}</span>
                </div>

                <button
                  onClick={() => handleOrderClick(srv.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order</span>
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-800 text-xs text-zinc-400">
          No services match your search or filter.
        </div>
      )}

      {/* Order Flow Wizard Modal */}
      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        services={services}
        initialServiceId={activeServiceId}
        onOrderCreated={fetchServices}
      />
    </div>
  );
};
