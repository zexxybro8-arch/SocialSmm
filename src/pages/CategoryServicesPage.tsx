import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, ChevronRight, Sparkles, Clock, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { PlatformCategory, Service } from '../types/database';
import { PlatformIcon, getPlatformMeta } from '../components/PlatformIcon';
import { BRANDING } from '../config/branding';

interface CategoryServicesPageProps {
  category: PlatformCategory;
  services: Service[];
  onBack: () => void;
  onSelectService: (service: Service) => void;
  onOpenTicket?: () => void;
}

export const CategoryServicesPage: React.FC<CategoryServicesPageProps> = ({
  category,
  services,
  onBack,
  onSelectService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const meta = getPlatformMeta(category.id || category.name);

  // All services in this category
  const allCategoryServices = useMemo(() => {
    return services.filter(
      (s) => (s.category === category.id || s.categoryName?.toLowerCase() === category.name.toLowerCase()) && s.status === 'active'
    );
  }, [services, category]);

  // Extract distinct serviceTypes for this category (e.g. Instagram Views, Instagram Followers, Instagram Likes, etc.)
  const serviceTypes = useMemo(() => {
    const typesMap = new Map<string, { name: string; count: number; minPrice: number }>();
    allCategoryServices.forEach((s) => {
      const typeName = s.serviceType || s.name.split('[')[0].trim() || s.name;
      const existing = typesMap.get(typeName);
      const price = s.ratePer1k || s.price || 0;
      if (existing) {
        existing.count += 1;
        existing.minPrice = Math.min(existing.minPrice, price);
      } else {
        typesMap.set(typeName, { name: typeName, count: 1, minPrice: price });
      }
    });
    return Array.from(typesMap.values());
  }, [allCategoryServices]);

  // Filtered packages when searching or when a specific serviceType is selected
  const activePackages = useMemo(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return allCategoryServices.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.serviceType && s.serviceType.toLowerCase().includes(term)) ||
          (s.shortDescription && s.shortDescription.toLowerCase().includes(term)) ||
          (s.description && s.description.toLowerCase().includes(term))
      );
    }
    if (selectedServiceType) {
      return allCategoryServices.filter(
        (s) => (s.serviceType || s.name.split('[')[0].trim() || s.name) === selectedServiceType
      );
    }
    return [];
  }, [searchTerm, selectedServiceType, allCategoryServices]);

  return (
    <div className="min-h-screen bg-[#070B14] text-zinc-100 flex flex-col pb-28 selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-20 bg-[#070B14]/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              id="back-from-category-btn"
              onClick={() => {
                if (selectedServiceType && !searchTerm) {
                  setSelectedServiceType(null);
                } else {
                  onBack();
                }
              }}
              className="h-9 w-9 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition border border-zinc-800"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: category.bgColor || meta.bgColor,
                  color: category.color || meta.color,
                }}
              >
                <PlatformIcon platformOrIcon={category.iconName || category.id} className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                  {selectedServiceType && !searchTerm ? selectedServiceType : category.name}
                </h1>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {selectedServiceType && !searchTerm
                    ? `${activePackages.length} packages`
                    : `${allCategoryServices.length} services`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* Large Rounded Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            id="search-services-input"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) setSelectedServiceType(null);
            }}
            placeholder={`Search ${category.name} services...`}
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

        {/* VIEW 1: Service Types List (When no sub-type or search is active) */}
        {!selectedServiceType && !searchTerm && (
          <div className="space-y-1">
            <div className="px-1 py-1 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                {category.name} Services
              </span>
              <span className="text-[11px] text-zinc-400">
                {serviceTypes.length} Types
              </span>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/80 divide-y divide-zinc-800/60 overflow-hidden shadow-xl">
              {serviceTypes.map((type) => (
                <button
                  key={type.name}
                  id={`service-type-${type.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedServiceType(type.name)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-zinc-800/50 active:bg-zinc-800/80 transition-all duration-150 group text-left"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: category.bgColor || meta.bgColor,
                        color: category.color || meta.color,
                      }}
                    >
                      <PlatformIcon
                        platformOrIcon={category.iconName || category.id}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="truncate">
                      <h2 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition truncate">
                        {type.name}
                      </h2>
                      <p className="text-[11px] text-zinc-400">
                        From {BRANDING.CURRENCY_SYMBOL}{type.minPrice.toFixed(2)} / 1k • {type.count} {type.count === 1 ? 'package' : 'packages'}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition flex-shrink-0 ml-3" />
                </button>
              ))}

              {serviceTypes.length === 0 && (
                <div className="py-12 text-center p-6 text-zinc-400 text-xs">
                  No services configured for {category.name} yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Compact SMM Packages List (When a sub-type or search is active) */}
        {(selectedServiceType || searchTerm) && (
          <div className="space-y-3">
            <div className="px-1 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                {searchTerm ? `Search Results (${activePackages.length})` : `${selectedServiceType} Packages`}
              </span>
              {selectedServiceType && (
                <button
                  onClick={() => setSelectedServiceType(null)}
                  className="text-emerald-400 hover:underline text-[11px] font-medium"
                >
                  All {category.name} Types
                </button>
              )}
            </div>

            <div className="space-y-3">
              {activePackages.map((pkg) => {
                const rate = pkg.ratePer1k || pkg.price || 0;
                const min = pkg.minQuantity || 100;
                const max = pkg.maxQuantity || 1000000;

                return (
                  <div
                    key={pkg.id}
                    id={`package-card-${pkg.id}`}
                    onClick={() => onSelectService(pkg)}
                    className="cursor-pointer rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-4 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all duration-150 shadow-lg space-y-3 group"
                  >
                    {/* Top Row: Package Name & Rate */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                          ID: {pkg.id.replace('srv_', '')}
                        </span>
                        <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                          {pkg.name}
                        </h2>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-black text-emerald-400 tracking-tight">
                          {BRANDING.CURRENCY_SYMBOL}{rate.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-zinc-400">
                          {pkg.unitLabel || 'per 1,000'}
                        </p>
                      </div>
                    </div>

                    {/* Short Description */}
                    {(pkg.shortDescription || pkg.description) && (
                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                        {pkg.shortDescription || pkg.description}
                      </p>
                    )}

                    {/* Meta Badges: Min, Max, Speed, Refill */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center space-x-1.5 text-zinc-400 truncate">
                        <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">Speed: {pkg.speed || pkg.deliveryTime || 'Instant'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-zinc-400 truncate">
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{pkg.refill || 'Non-Drop Guarantee'}</span>
                      </div>
                      <div className="text-zinc-400 truncate">
                        Min: <span className="text-zinc-200 font-semibold">{min.toLocaleString()}</span>
                      </div>
                      <div className="text-zinc-400 truncate">
                        Max: <span className="text-zinc-200 font-semibold">{max.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        id={`select-btn-${pkg.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectService(pkg);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/40 active:scale-[0.98] transition"
                      >
                        <span>Select & Configure</span>
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {activePackages.length === 0 && (
                <div className="py-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-2">
                  <p className="text-xs text-zinc-400">No packages match your selection.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedServiceType(null);
                    }}
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    View All Services
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

