import React from 'react';
import { Clock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Service } from '../types/database';
import { BRANDING } from '../config/branding';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-zinc-900/95 border border-zinc-800/90 p-4 sm:p-5 shadow-lg shadow-black/40 hover:border-zinc-700 transition-all duration-200">
      <div>
        {/* Header: Title & Price */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold tracking-wide uppercase mb-1">
              Verified Compliance
            </span>
            <h4 className="text-base font-bold text-white tracking-tight">
              {service.name}
            </h4>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-lg sm:text-xl font-extrabold text-white">
              {BRANDING.CURRENCY_SYMBOL}{(service.price || 0).toFixed(2)}
            </span>
            <p className="text-[10px] text-zinc-400 font-medium">
              /{service.unitLabel || 'Package'}
            </p>
          </div>
        </div>

        {/* Short Description */}
        <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
          {service.shortDescription || service.description}
        </p>

        {/* Key Deliverables */}
        {service.deliverables && service.deliverables.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5">
            {service.deliverables.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11px] text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Delivery speed & Order Action */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{service.deliveryTime}</span>
        </div>

        <button
          id={`select-service-${service.id}`}
          onClick={() => onSelect(service)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-bold text-xs transition shadow-md shadow-emerald-950/40 active:scale-95"
        >
          <span>Select Service</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
