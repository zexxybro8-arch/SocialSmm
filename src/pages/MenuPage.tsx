import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  CreditCard, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Shield, 
  ExternalLink,
  Plus,
  AtSign
} from 'lucide-react';
import { User as UserType, Customer } from '../types/database';
import { BRANDING } from '../config/branding';
import { Header } from '../components/Header';
import { TopUpModal } from '../components/TopUpModal';
import { FloatingSupport } from '../components/FloatingSupport';

interface MenuPageProps {
  user: UserType | null;
  customerProfile: Customer | null;
  onLogout: () => void;
  onOpenTopUp: () => void;
  onOpenPayments: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onGoToAdmin?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  user,
  customerProfile,
  onLogout,
  onOpenTopUp,
  onOpenPayments,
  onOpenSupport,
  onOpenSettings,
  onGoToAdmin,
}) => {
  const [topUpOpen, setTopUpOpen] = useState(false);

  const balance = customerProfile?.balance || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-24 selection:bg-emerald-500 selection:text-zinc-950">
      <Header
        user={user}
        title="Account & Menu"
        subtitle="Settings, balance, and help"
      />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-5 shadow-xl flex items-center space-x-3.5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-full border-2 border-emerald-500/40 object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-zinc-800 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-lg text-emerald-400">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-white truncate">
                {user?.fullName || 'Creator'}
              </h3>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            {customerProfile?.instagramHandle && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-mono">
                <AtSign className="w-3 h-3" />
                <span>{customerProfile.instagramHandle.replace('@', '')}</span>
              </p>
            )}
          </div>
        </div>

        {/* Balance Mini-Card */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Available Balance
            </span>
            <div className="text-2xl font-black text-white">
              {BRANDING.CURRENCY_SYMBOL}{(balance || 0).toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-950 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Funds</span>
          </button>
        </div>

        {/* Menu Navigation Group */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 divide-y divide-zinc-800/80 overflow-hidden shadow-lg">
          {/* Top Up / Add Balance */}
          <button
            onClick={() => setTopUpOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-850 text-left transition"
          >
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Add Balance</div>
                <div className="text-[10px] text-zinc-400">Top up via card or crypto</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Payment History */}
          <button
            onClick={onOpenPayments}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-850 text-left transition"
          >
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Payment History</div>
                <div className="text-[10px] text-zinc-400">Invoices and recharge records</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Support Tickets */}
          <button
            onClick={onOpenSupport}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-850 text-left transition"
          >
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Help & Support Tickets</div>
                <div className="text-[10px] text-zinc-400">Open an inquiry with operations</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Account Settings */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-850 text-left transition"
          >
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Account Settings</div>
                <div className="text-[10px] text-zinc-400">Security & profile details</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Direct WhatsApp Support link */}
          <a
            href={BRANDING.SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-850 text-left transition"
          >
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Direct WhatsApp Support</div>
                <div className="text-[10px] text-zinc-400">Live chat with human team</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </a>

          {/* Admin Switcher (if admin) */}
          {user?.role === 'admin' && onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-850 text-left transition"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Administrator Portal</div>
                  <div className="text-[10px] text-zinc-400">Manage categories, services & users</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          )}
        </div>

        {/* Logout Action */}
        <button
          id="menu-logout-btn"
          onClick={onLogout}
          className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </main>

      <TopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={() => setTopUpOpen(false)}
      />

      <FloatingSupport onOpenTicket={onOpenSupport} />
    </div>
  );
};
