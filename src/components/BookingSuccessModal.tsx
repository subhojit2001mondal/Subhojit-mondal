import React, { useState } from 'react';
import {
  Check,
  X,
  Copy,
  Printer,
  MessageCircle,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  Mountain,
  Building,
  CreditCard,
  Download,
  Database,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';
import { BookingConfirmationSummary } from '../data/hotels';
import { useTheme } from '../context/ThemeContext';
import { ParijaiLogo } from './ParijaiLogo';

interface BookingSuccessModalProps {
  summary: BookingConfirmationSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDatabase?: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  summary,
  isOpen,
  onClose,
  onOpenDatabase
}) => {
  const { isNight } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !summary) return null;

  const handleCopyRef = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(summary.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    const text = `Namaste Parijay Group of Hotels! I have confirmed my booking.\n\n` +
      `*Reservation Reference:* ${summary.bookingRef}\n` +
      `*Property:* ${summary.propertyName} (${summary.propertyLocation})\n` +
      `*Room:* ${summary.roomName}\n` +
      `*Dates:* ${summary.checkInDate} to ${summary.checkOutDate} (${summary.nights} night${summary.nights > 1 ? 's' : ''})\n` +
      `*Guest:* ${summary.guestName} (${summary.guestPhone})\n` +
      `*Total Tariff:* ₹${summary.grandTotal.toLocaleString('en-IN')}\n` +
      (summary.specialNeeds ? `*Special Request:* ${summary.specialNeeds}\n` : '') +
      `\nPlease keep my room ready. Thank you!`;

    const cleanPhone = summary.propertyWhatsapp.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div
        className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] transition-colors duration-200 print:max-h-none print:shadow-none print:border-none ${
          isNight
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between print:hidden ${
            isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <ParijaiLogo size={36} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                Parijay Group of Hotels · Booking Confirmed
              </span>
              <h3 className="font-serif font-bold text-base text-white">
                Official Reservation Voucher
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close summary modal"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isNight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Confirmed Badge Box */}
          <div
            className={`p-5 rounded-2xl border text-center relative overflow-hidden ${
              isNight
                ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30 text-emerald-100'
                : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold">
              Your Reservation is Confirmed!
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Thank you, <strong className={isNight ? 'text-white' : 'text-slate-900'}>{summary.guestName}</strong>.
              Your stay at <strong>{summary.propertyName}</strong> has been secured and logged in our reservation ledger.
            </p>

            {/* Reference Code Card */}
            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-mono font-bold tracking-wider ${
                  isNight
                    ? 'bg-slate-950 border-slate-700 text-amber-300'
                    : 'bg-white border-slate-300 text-amber-800 shadow-sm'
                }`}
              >
                <span className="text-slate-400 font-sans font-medium text-[11px]">Booking Ref:</span>
                <span className="text-sm">{summary.bookingRef}</span>
              </div>

              <button
                onClick={handleCopyRef}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : isNight
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Ref</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Detailed Voucher / Receipt Summary */}
          <div
            className={`border rounded-2xl p-5 space-y-4 text-xs ${
              isNight ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Property & Stay Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    summary.propertyId === 'gangtok'
                      ? 'bg-amber-400/20 text-amber-500'
                      : 'bg-emerald-500/20 text-emerald-500'
                  }`}
                >
                  {summary.propertyId === 'gangtok' ? (
                    <Mountain className="w-5 h-5" />
                  ) : (
                    <Building className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">
                    {summary.propertyName}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{summary.propertyLocation}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                  Direct Verified Stay
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  Booked on {new Date(summary.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Grid of Reservation Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Room Reserved
                </span>
                <span className="font-serif font-bold text-sm text-white block">
                  {summary.roomName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {summary.adults} Adult{summary.adults > 1 ? 's' : ''}
                  {summary.childrenCount > 0 ? `, ${summary.childrenCount} Child` : ''} · Standard check-in
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Stay Dates & Duration
                </span>
                <span className="font-semibold text-xs text-white block">
                  {summary.checkInDate} → {summary.checkOutDate}
                </span>
                <span className="text-[11px] text-amber-400 font-medium">
                  {summary.nights} Night{summary.nights > 1 ? 's' : ''}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Primary Guest Contact
                </span>
                <span className="font-semibold text-xs text-white block">
                  {summary.guestName}
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {summary.guestPhone}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Payment Mode
                </span>
                <span className="font-semibold text-xs uppercase text-emerald-400 block">
                  {summary.paymentMethod.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400">
                  Guaranteed Reservation
                </span>
              </div>
            </div>

            {/* Selected Add-ons */}
            {summary.selectedAddOns && summary.selectedAddOns.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Selected Add-Ons & Services
                </span>
                <div className="space-y-1">
                  {summary.selectedAddOns.map((addOn, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-300">
                      <span>• {addOn.name}</span>
                      <span className="font-mono text-slate-400">₹{addOn.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Needs */}
            {summary.specialNeeds && summary.specialNeeds !== 'Standard check-in requested' && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  Special Requests / Medical Assistance
                </span>
                <p className="text-xs text-slate-300 italic">
                  &ldquo;{summary.specialNeeds}&rdquo;
                </p>
              </div>
            )}

            {/* Transparent Tariff Ledger */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Base Room Tariff ({summary.nights} nights):</span>
                <span className="font-mono">₹{summary.baseTariff.toLocaleString('en-IN')}</span>
              </div>
              {summary.addOnsTotal > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Add-Ons & Sightseeing:</span>
                  <span className="font-mono">₹{summary.addOnsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-400">
                <span>Applicable GST (12%):</span>
                <span className="font-mono">₹{summary.gst.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800/90 text-white">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-amber-400">
                  ₹{summary.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 print:hidden">
            <a
              href={generateWhatsAppMessage()}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Voucher to WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isNight
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Voucher</span>
            </button>
          </div>

          {/* Database link & dismiss */}
          <div className="flex items-center justify-between pt-2 text-xs print:hidden">
            {onOpenDatabase && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDatabase();
                }}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>View in Cloud Database Records</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer ml-auto font-medium"
            >
              Done & Return to Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
