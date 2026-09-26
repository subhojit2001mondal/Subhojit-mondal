import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  FileText,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PROPERTIES } from '../data/hotels';
import { useTheme } from '../context/ThemeContext';
import { saveCustomerInquiryToDb } from '../services/dbService';
import { ParijaiLogo } from './ParijaiLogo';

interface FooterProps {
  selectedProperty?: 'gangtok' | 'kalyani';
  onBookNow: () => void;
  onSelectProperty?: (prop: 'gangtok' | 'kalyani') => void;
  onOpenDatabaseRecords?: () => void;
  onOpenManagePhotos?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  selectedProperty = 'gangtok',
  onBookNow,
  onOpenDatabaseRecords,
  onOpenManagePhotos
}) => {
  const isGangtok = selectedProperty === 'gangtok';
  const property = PROPERTIES[selectedProperty];
  const [newsletterInput, setNewsletterInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const { isNight } = useTheme();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterInput.trim()) {
      const contactVal = newsletterInput.trim();
      setSubscribed(true);
      setNewsletterInput('');
      try {
        await saveCustomerInquiryToDb({
          name: 'Subscriber',
          phone: contactVal.includes('@') ? '' : contactVal,
          email: contactVal.includes('@') ? contactVal : '',
          propertyId: selectedProperty,
          subject: 'Newsletter & Seasonal Rate Advisory Subscription',
          message: `User subscribed with contact: ${contactVal}`,
          source: 'newsletter'
        });
      } catch (err) {
        console.warn('Failed to save newsletter contact to DB:', err);
      }
    }
  };

  return (
    <>
      <footer id="contact" className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact & Map Card for the Chosen Property */}
          <div className="pb-12 border-b border-slate-800 max-w-4xl mx-auto">
            <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${
                    isGangtok ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {property.location} · Parijay Group of Hotels
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                    {property.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {property.address}
                  </p>
                </div>

                <button
                  onClick={onBookNow}
                  className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer shadow-md ${
                    isGangtok
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  Reserve Stay
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-800/80 pt-4">
                <a
                  href={`tel:${property.phone}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition-colors"
                >
                  <Phone className={`w-3.5 h-3.5 ${isGangtok ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>Reception & Desk: {property.phone}</span>
                </a>
                <a
                  href={`mailto:${property.email}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition-colors"
                >
                  <Mail className={`w-3.5 h-3.5 ${isGangtok ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>{property.email}</span>
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                <a
                  href={property.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-950 text-xs text-slate-200 hover:text-white border border-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className={`w-3.5 h-3.5 ${isGangtok ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>Get Directions (Google Maps)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <a
                  href={`https://wa.me/${property.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(property.name)},%20I%20would%20like%20to%20inquire%20about%20room%20availability.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-emerald-500/15 text-xs text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>24/7 WhatsApp Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links & Newsletter */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-3">
                <ParijaiLogo size={46} />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    <span className="font-brand-cinzel text-base sm:text-lg font-bold tracking-[0.08em] uppercase text-luxury-gold">
                      PARIJAY GROUP OF HOTELS
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300/80 font-semibold font-sans mt-0.5">
                    Sikkim & Bengal · Gangtok & Kalyani
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hospitality engineered for serenity in Sikkim and caring medical convenience in Kalyani.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Certified Sanitary Hospitality</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Quick Navigation
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <a href="#top" className="hover:text-amber-300">
                    Top / Overview
                  </a>
                </li>
                <li>
                  <a href="#properties" className="hover:text-amber-300">
                    Suites & Tariffs ({property.name})
                  </a>
                </li>
                <li>
                  <a href="#interactive-map" className="hover:text-amber-300">
                    Distances & Landmark Radar
                  </a>
                </li>
                <li>
                  <a href="#guides" className="hover:text-amber-300">
                    Local Guide & Transit
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-amber-300">
                    Guest Testimonials
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="hover:text-amber-300">
                    Policies & FAQs
                  </a>
                </li>
                <li>
                  <a href="#guides" className="hover:text-amber-300">
                    Local Guides & Transit
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-amber-300">
                    Guest Testimonials
                  </a>
                </li>
                {onOpenDatabaseRecords && (
                  <li>
                    <button
                      onClick={onOpenDatabaseRecords}
                      className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span>Cloud Database & Records</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">Live</span>
                    </button>
                  </li>
                )}
                {onOpenManagePhotos && (
                  <li>
                    <button
                      onClick={onOpenManagePhotos}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span>Manage Photos (Owner)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300">Admin</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Resources & Downloads
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    onClick={() => setShowTariffModal(true)}
                    className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Seasonal Tariff Card (PDF)</span>
                  </button>
                </li>
                <li>
                  <a href="#guides" className="hover:text-amber-300">
                    Sikkim Permit Documentation Checklist
                  </a>
                </li>
                <li>
                  <a href="#guides" className="hover:text-amber-300">
                    AIIMS Kalyani OPD Appointment Schedule
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="hover:text-amber-300">
                    Flexible Cancellation Terms
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Direct Updates & Offers
              </span>
              <p className="text-xs text-slate-400 mb-2">
                Receive AIIMS travel advisories and Sikkim seasonal rate updates directly.
              </p>
              {subscribed ? (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
                  ✓ Thank you! You're subscribed to Parijay Group of Hotels direct updates.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter WhatsApp or Email"
                    value={newsletterInput}
                    onChange={(e) => setNewsletterInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 pb-16 md:pb-0">
            <div>© {new Date().getFullYear()} Parijay Group of Hotels. All rights reserved.</div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Stay</span>
              <span>·</span>
              <span>FSSAI Certified In-House Kitchen</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Styled Tariff Card Download Modal */}
      {showTariffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl transition-colors ${
              isNight ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <div
              className={`flex justify-between items-center border-b pb-3 ${
                isNight ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <h4 className={`text-base font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                Official Parijay Group of Hotels Tariff Card
              </h4>
              <button
                onClick={() => setShowTariffModal(false)}
                className={`p-1 ${isNight ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'}`}
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div
                className={`p-3 rounded-lg border ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-amber-500">Trikuta Residency — Gangtok, Sikkim</div>
                <div className={`mt-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  View Room · Non-View Room (Includes Heaters & Electric Bed Warmers)
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">Hotel Parijaye — Kalyani, West Bengal</div>
                <div className={`mt-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  Non-AC Rooms · Standard AC Rooms · Deluxe Twin Care Room (Includes Free AIIMS OPD Transit)
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                  setShowTariffModal(false);
                }}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow cursor-pointer"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setShowTariffModal(false)}
                className={`px-4 py-2 rounded-lg text-xs cursor-pointer ${
                  isNight ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
