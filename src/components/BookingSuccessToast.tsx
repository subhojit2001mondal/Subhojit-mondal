import React, { useState } from 'react';
import {
  Check,
  X,
  Copy,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BookingConfirmationSummary } from '../data/hotels';
import { useTheme } from '../context/ThemeContext';
import { ParijaiLogo } from './ParijaiLogo';

interface BookingSuccessToastProps {
  summary: BookingConfirmationSummary | null;
  onOpenSummaryModal: () => void;
  onDismiss: () => void;
}

export const BookingSuccessToast: React.FC<BookingSuccessToastProps> = ({
  summary,
  onOpenSummaryModal,
  onDismiss
}) => {
  const { isNight } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(summary.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      aria-label="Reservation Confirmed Notification"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
          isNight
            ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/10'
            : 'bg-white/95 border-emerald-300 text-slate-900 shadow-xl'
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <ParijaiLogo size={22} />
            <span className="text-xs font-serif font-bold text-emerald-400">
              Reservation Confirmed!
            </span>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss toast"
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="py-2.5 space-y-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-serif font-bold text-white truncate max-w-[200px]">
              {summary.propertyName}
            </span>
            <span className="font-mono text-[11px] text-amber-400 font-bold">
              ₹{summary.grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 truncate">
            {summary.roomName} · {summary.nights} night{summary.nights > 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Ref: {summary.bookingRef}</span>
            <button
              onClick={handleCopy}
              className="text-amber-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
          <button
            onClick={onOpenSummaryModal}
            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <span>View Full Voucher</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={onDismiss}
            className="py-1.5 px-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </aside>
  );
};
