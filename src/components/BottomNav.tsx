import React from 'react';
import { ShoppingBag, Plus, Menu as MenuIcon, Layers } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'orders' | 'create' | 'menu';
  onChangeTab?: (tab: 'orders' | 'create' | 'menu') => void;
  onTabChange?: (tab: 'orders' | 'create' | 'menu') => void;
  pendingOrdersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onTabChange,
  pendingOrdersCount = 0,
}) => {
  const handleSelect = (tab: 'orders' | 'create' | 'menu') => {
    if (onTabChange) {
      onTabChange(tab);
    } else if (onChangeTab) {
      onChangeTab(tab);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-6 py-2 pb-safe md:hidden shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Orders Tab */}
        <button
          id="nav-tab-orders"
          onClick={() => handleSelect('orders')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'text-emerald-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : ''}`} />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Orders</span>
        </button>

        {/* 2. Center EMPHASIZED Create Button */}
        <div className="relative -top-3">
          <button
            id="nav-tab-create"
            onClick={() => handleSelect('create')}
            aria-label="Create Order / Browse Services"
            className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-zinc-950 shadow-lg shadow-emerald-500/30 border-4 border-zinc-950 hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
          <div className="text-center mt-0.5">
            <span
              className={`text-[11px] font-semibold tracking-tight ${
                activeTab === 'create' ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              Create
            </span>
          </div>
        </div>

        {/* 3. Menu Tab */}
        <button
          id="nav-tab-menu"
          onClick={() => handleSelect('menu')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            activeTab === 'menu'
              ? 'text-emerald-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <MenuIcon className={`w-5 h-5 ${activeTab === 'menu' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
};
