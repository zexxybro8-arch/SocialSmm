import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingBag, 
  Instagram, 
  Wallet, 
  Users 
} from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, onNavigate }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const customerTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'payments', label: 'Billing', icon: Wallet },
  ];

  const adminTabs = [
    { id: 'admin-dashboard', label: 'KPIs', icon: LayoutDashboard },
    { id: 'admin-orders', label: 'Orders', icon: ShoppingBag },
    { id: 'admin-services', label: 'Services', icon: Layers },
    { id: 'admin-customers', label: 'Clients', icon: Users },
    { id: 'admin-payments', label: 'Ledger', icon: Wallet },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-800 bg-zinc-950/95 px-2 backdrop-blur-xl md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center w-full py-1 text-[11px] transition-colors ${
              isActive
                ? isAdmin
                  ? 'text-amber-400 font-semibold'
                  : 'text-indigo-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
