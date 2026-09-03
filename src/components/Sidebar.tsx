import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingBag, 
  Wallet, 
  Instagram, 
  BarChart3, 
  LifeBuoy, 
  Users, 
  Settings, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const customerNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Services Catalog', icon: Layers },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'payments', label: 'Billing & Balance', icon: Wallet },
    { id: 'instagram', label: 'Instagram Connect', icon: Instagram },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'support', label: 'Support Desk', icon: LifeBuoy },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Analytics & KPIs', icon: LayoutDashboard },
    { id: 'admin-orders', label: 'Order Processing', icon: ShoppingBag },
    { id: 'admin-services', label: 'Services Management', icon: Layers },
    { id: 'admin-customers', label: 'Customer Accounts', icon: Users },
    { id: 'admin-payments', label: 'Finance & Ledger', icon: Wallet },
    { id: 'admin-support', label: 'Support Queue', icon: LifeBuoy },
    { id: 'admin-settings', label: 'Security & Meta Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-950/40">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-white flex items-center space-x-1 text-sm">
                <span>InstaPanel</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {isAdmin ? 'Admin' : 'SaaS'}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">Meta API Compliant</div>
            </div>
          </div>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Portal Tag */}
        <div className="px-2">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 text-xs text-zinc-400 flex items-center justify-between">
            <span>Portal Scope:</span>
            <span className={`font-semibold ${isAdmin ? 'text-amber-400' : 'text-indigo-400'}`}>
              {isAdmin ? 'Operations Admin' : 'Customer Workspace'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`group flex w-full items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/90 text-white font-semibold border border-zinc-700 shadow-md shadow-black/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? isAdmin
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                      : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance / Safety Guarantee footer */}
      <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 text-[11px] text-zinc-400 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Meta API Guard Active</span>
        </div>
        <p className="leading-snug text-zinc-400">
          Strictly zero bots, zero password harvesting, and zero rate-limit bypasses.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col shrink-0 border-r border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-zinc-950 border-r border-zinc-800 shadow-2xl h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
