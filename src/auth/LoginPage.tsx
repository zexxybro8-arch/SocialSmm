import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../api/client';
import { 
  Instagram, 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Sparkles,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [roleTab, setRoleTab] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState<string>('alex@creatorbrand.io');
  const [password, setPassword] = useState<string>('Customer@123456');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgot, setShowForgot] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleTabChange = (tab: 'customer' | 'admin') => {
    setRoleTab(tab);
    if (tab === 'customer') {
      setEmail('alex@creatorbrand.io');
      setPassword('Customer@123456');
    } else {
      setEmail('admin@instasmm.com');
      setPassword('Admin@123456');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast('success', `Welcome back, ${roleTab === 'admin' ? 'Administrator' : 'Customer'}!`);
    } catch (err: any) {
      toast('error', err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast('error', 'Please enter your email');
      return;
    }
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMessage(res.message);
      toast('success', 'Reset instructions generated');
    } catch (err: any) {
      toast('error', err.message || 'Failed to process request');
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-purple-900/20 via-rose-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-rose-950/50 mb-3.5">
            <Instagram className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Instagram SMM Panel</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Professional Meta API Compliant Social Media Management Portal
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-950/80 p-1 border border-zinc-800/80 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleTab === 'customer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Quick autofill helper */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs text-zinc-400 flex items-center justify-between">
              <div>
                <span className="text-zinc-500">Preset: </span>
                <span className="font-mono text-zinc-300 font-semibold">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange(roleTab)}
                className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
              >
                Reset Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : `Sign In as ${roleTab === 'admin' ? 'Admin' : 'Customer'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Customer Creation Rules Notice */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-zinc-400">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Customer accounts are provisioned exclusively by administrators.</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Arbitrary customer-to-admin elevation is strictly prohibited by security policy.
            </p>
          </div>
        </div>

        {/* Meta Compliance Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-zinc-400">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Meta Graph API Official Integration Standard</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Reset Account Password</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Enter your email to receive secure password recovery instructions.
            </p>
            {forgotMessage ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300">
                {forgotMessage}
                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotMessage(null);
                  }}
                  className="mt-3 block w-full py-1.5 rounded-lg bg-zinc-800 text-white text-center hover:bg-zinc-700"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
