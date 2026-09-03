import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Package, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  LifeBuoy, 
  Settings, 
  ArrowLeft, 
  LogOut, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { BRANDING } from '../config/branding';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchToCustomerView: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onSwitchToCustomerView,
  onLogout,
  children,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'categories', label: 'Platforms & Categories', icon: Layers },
    { id: 'services', label: 'Services Catalog', icon: Package },
    { id: 'orders', label: 'Orders Fulfillment', icon: ShoppingBag },
    { id: 'customers', label: 'Users & Customers', icon: Users },
    { id: 'payments', label: 'Finance & Ledger', icon: CreditCard },
    { id: 'support', label: 'Support Queue', icon: LifeBuoy },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-950">
              ADM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  {BRANDING.BRAND_NAME} Admin Terminal
                </h1>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                  v2.4 Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Operations, Platform Categories & Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Switch to Customer View Button */}
            <button
              onClick={onSwitchToCustomerView}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition shadow-sm"
              title="Preview and use customer mobile interface"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Switch to Customer View</span>
              <span className="sm:hidden">Customer App</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs on Tablet/Mobile */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
