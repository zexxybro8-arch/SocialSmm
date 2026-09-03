import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, HelpCircle, Send } from 'lucide-react';
import { BRANDING } from '../config/branding';

interface FloatingSupportProps {
  onOpenTicket?: () => void;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = ({ onOpenTicket }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    window.open(BRANDING.SUPPORT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
      {/* Quick Action Popup */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl text-zinc-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{BRANDING.BRAND_NAME} Support</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online & Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="py-3 text-xs text-zinc-300 leading-relaxed">
            Need help with an order or custom campaign? Reach our 24/7 client operations team instantly.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-900/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp Chat</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
            </button>

            {onOpenTicket && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenTicket();
                }}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center justify-center space-x-2 transition border border-zinc-700/60"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Open Support Ticket</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Circular Green Floating Trigger */}
      <button
        id="floating-support-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Customer Support"
        className="relative group flex items-center justify-center h-13 w-13 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-xl shadow-emerald-950/60 border border-emerald-400/30 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-zinc-950"></span>
        </span>
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6 fill-white/20" />}
      </button>
    </div>
  );
};
