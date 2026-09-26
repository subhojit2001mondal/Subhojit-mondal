import React from 'react';
import { PhoneCall, Calendar, MessageCircle, Sparkles, Mountain, Building } from 'lucide-react';
import { PROPERTIES } from '../data/hotels';

interface MobileFloatingDockProps {
  selectedProperty: 'gangtok' | 'kalyani';
  onBookClick: () => void;
}

export const MobileFloatingDock: React.FC<MobileFloatingDockProps> = ({
  selectedProperty,
  onBookClick
}) => {
  const property = PROPERTIES[selectedProperty];
  const isGangtok = selectedProperty === 'gangtok';

  return (
    <aside
      aria-label="Quick Mobile Reservation & Helpline"
      className="fixed bottom-2.5 inset-x-2.5 z-40 md:hidden max-w-lg mx-auto pointer-events-none"
    >
      <div className="pointer-events-auto rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-amber-400/35 p-2 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.18)] ring-1 ring-white/10 transition-all duration-300">
        {/* Micro Dynamic Status Bar */}
        <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1.5 border-b border-white/10 text-[10px]">
          <div className="flex items-center gap-1.5 min-w-0">
            {isGangtok ? (
              <Mountain className="w-3 h-3 text-amber-400 shrink-0" />
            ) : (
              <Building className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
            <span className="font-semibold text-slate-200 truncate">
              {isGangtok ? 'Trikuta Residency (Gangtok)' : 'Hotel Parijaye (AIIMS Kalyani)'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-medium shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-[9px] uppercase tracking-wider font-mono">Best Rate Guarantee</span>
          </div>
        </div>

        {/* Dynamic Dual Action Buttons: Call Desk & Reserve Stay */}
        <div className="grid grid-cols-12 gap-1.5 items-stretch">
          {/* Direct Phone Call Helpline */}
          <a
            href="tel:+919163008361"
            aria-label="Call Parijay Group Helpline +91 91630 08361"
            className="col-span-5 flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-[0.98] border border-emerald-500/40 text-emerald-400 transition-all duration-150 cursor-pointer shadow-sm select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight text-left">
              <span className="font-bold text-[11px] xs:text-xs text-white tracking-tight whitespace-nowrap">
                Call Desk
              </span>
              <span className="text-[8.5px] xs:text-[9.5px] font-mono text-emerald-300/90 truncate">
                24/7 Helpline
              </span>
            </div>
          </a>

          {/* Primary CTA: Reserve Stay */}
          <button
            type="button"
            onClick={onBookClick}
            aria-label="Reserve your stay directly with instant confirmation"
            className="col-span-7 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 active:scale-[0.98] text-slate-950 font-serif font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-[0_4px_16px_rgba(245,158,11,0.35)] cursor-pointer select-none"
          >
            <Calendar className="w-4 h-4 text-slate-950 shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight text-left">
              <span className="font-brand-cinzel font-bold text-[12px] xs:text-[13px] tracking-wider text-slate-950 whitespace-nowrap">
                Reserve Stay
              </span>
              <span className="text-[8.5px] xs:text-[9.5px] font-sans font-semibold tracking-tight text-slate-800 normal-case">
                Instant Confirmation
              </span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};
