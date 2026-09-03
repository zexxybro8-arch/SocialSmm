import React from 'react';
import { Bell, ArrowLeft, Shield, LogOut, Check } from 'lucide-react';
import { User } from '../types/database';
import { BRANDING } from '../config/branding';

interface HeaderProps {
  user: User | null;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
  onSwitchRole?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  title,
  subtitle,
  onBack,
  showBack = false,
  onOpenNotifications,
  unreadNotifications = 0,
  onSwitchRole,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center font-extrabold text-zinc-950 shadow-md shadow-emerald-950/40 text-sm">
                {BRANDING.BRAND_NAME.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}

          <div>
            {title ? (
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                {title}
              </h1>
            ) : (
              <div>
                <span className="text-xs text-zinc-400 font-medium">Welcome back,</span>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                  {user?.fullName?.split(' ')[0] || 'Creator'} 👋
                </h2>
              </div>
            )}
            {subtitle && (
              <p className="text-[11px] text-zinc-400 font-medium truncate max-w-[220px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Fast Switch Role pill for seamless review */}
          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              title="Switch between Admin and Customer views"
              className="hidden xs:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700/80 transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user?.role === 'admin' ? 'Customer Mode' : 'Admin'}</span>
            </button>
          )}

          {/* Notifications button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 active:scale-95 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {/* User Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
