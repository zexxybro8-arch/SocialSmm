import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
} from 'lucide-react';
import { BRANDING } from '../config/branding';
import { useAuth } from '../auth/AuthContext';
import { getReadableAuthErrorMessage } from '../auth/authErrors';

interface LoginPageProps {
  onBackToLanding: () => void;
  onGoToRegister: () => void;
  onLoginSuccess: (role: 'admin' | 'customer') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToLanding,
  onGoToRegister,
  onLoginSuccess,
}) => {
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(trimmedEmail, password);
      // Auth succeeded and state is populated
      onLoginSuccess('customer');
    } catch (err: any) {
      setErrorMessage(getReadableAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotStatus('Password recovery instructions have been sent to your email.');
    } catch (err: any) {
      setForgotStatus(getReadableAuthErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-zinc-100 flex flex-col justify-center px-4 py-8 relative selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            id="login-back-btn"
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Secure Portal
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-zinc-800/90 bg-[#0C1220]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center font-black text-zinc-950 text-xl shadow-lg shadow-emerald-950/60 mb-3">
              {BRANDING.BRAND_NAME.slice(0, 2).toUpperCase()}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Sign in with Firebase Authentication to access your orders and dashboard
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* 1. Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* 2. Password with Forgot link */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-pwd-trigger"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotStatus(null);
                    setForgotModalOpen(true);
                  }}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  id="login-toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="login-remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:scale-[0.99] text-zinc-950 font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-xl shadow-emerald-950/60 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>

            {/* Secondary Outlined Create Account Button */}
            <div className="pt-1">
              <button
                type="button"
                id="login-to-create-account-btn"
                onClick={onGoToRegister}
                className="w-full py-3 px-6 rounded-2xl border border-zinc-700/90 hover:border-zinc-500 bg-transparent hover:bg-zinc-800/50 active:scale-[0.99] text-zinc-200 hover:text-white font-bold text-sm transition-all text-center cursor-pointer"
              >
                Create account
              </button>
            </div>
          </form>

          {/* Secure Verification Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center space-x-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Auth & Cloud Firestore Synchronized</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#0C1220] p-6 shadow-2xl text-zinc-100">
            <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your email address and Firebase will dispatch recovery instructions.
            </p>

            {forgotStatus ? (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                <p className="leading-relaxed">{forgotStatus}</p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotStatus(null);
                  }}
                  className="mt-3.5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Link'}
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
