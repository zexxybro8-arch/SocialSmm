import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BRANDING } from '../config/branding';
import { FloatingSupport } from '../components/FloatingSupport';

interface LandingPageProps {
  onGoToLogin?: () => void;
  onGoToRegister?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onGoToRegister,
  onOpenLogin,
  onOpenRegister,
}) => {
  const handleLoginClick = onGoToLogin || onOpenLogin || (() => {});
  const handleRegisterClick = onGoToRegister || onOpenRegister || (() => {});

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-zinc-950 relative overflow-hidden">
      {/* Background radial green ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-emerald-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center font-black text-zinc-950 shadow-lg shadow-emerald-950/60">
            {BRANDING.BRAND_NAME.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            {BRANDING.BRAND_NAME}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="landing-signin-nav-btn"
            onClick={handleLoginClick}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            id="landing-register-nav-btn"
            onClick={handleRegisterClick}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition shadow-md shadow-emerald-950/50 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Mobile-First Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto text-center my-auto">
        {/* Verified Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official API Compliant SMM Hub</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
          Scale Your Social Impact With{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
            Precision & Strategy
          </span>
        </h1>

        {/* Short Hero Description */}
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed max-w-sm">
          {BRANDING.TAGLINE}. Legitimate campaign audits, creative script kits, and multi-platform growth services built for serious creators and enterprise agencies.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 w-full space-y-3">
          <button
            id="landing-hero-register-btn"
            onClick={handleRegisterClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:scale-[0.98] text-zinc-950 font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950/60 transition-all duration-150 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            id="landing-hero-signin-btn"
            onClick={handleLoginClick}
            className="w-full py-3 px-6 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 active:scale-[0.98] border border-zinc-800 text-zinc-200 font-semibold text-sm transition cursor-pointer"
          >
            Sign In to Existing Account
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-5 text-center text-xs text-zinc-400 border-t border-zinc-900/80 px-4">
        <p>© {new Date().getFullYear()} {BRANDING.BRAND_NAME}. All rights reserved.</p>
      </footer>

      {/* Floating Support Button */}
      <FloatingSupport />
    </div>
  );
};
