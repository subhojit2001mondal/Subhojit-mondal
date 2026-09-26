import React, { useState } from 'react';
import {
  Compass,
  HeartPulse,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  Building,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Mountain
} from 'lucide-react';
import { TESTIMONIALS, FAQS, PROPERTIES } from '../data/hotels';
import { useTheme } from '../context/ThemeContext';

interface LocalGuidesAndTrustProps {
  selectedProperty?: 'gangtok' | 'kalyani';
}

export const LocalGuidesAndTrust: React.FC<LocalGuidesAndTrustProps> = ({
  selectedProperty = 'gangtok'
}) => {
  const isGangtok = selectedProperty === 'gangtok';
  const property = PROPERTIES[selectedProperty];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openPolicyTab, setOpenPolicyTab] = useState<'permits' | 'medical' | 'hygiene'>(
    isGangtok ? 'permits' : 'medical'
  );
  const { isNight } = useTheme();

  // Filter reviews matching the active property
  const relevantTestimonials = TESTIMONIALS.filter((t) =>
    isGangtok ? t.property.includes('Gangtok') : t.property.includes('Kalyani')
  );

  // Filter FAQs relevant to the active property
  const relevantFaqs = FAQS.filter((f) => {
    if (isGangtok) {
      return !f.question.includes('AIIMS') && !f.question.includes('Kalyani');
    } else {
      return !f.question.includes('Gangtok') && !f.question.includes('Sikkim');
    }
  });

  return (
    <div
      id="guides"
      className={`py-16 md:py-24 border-t transition-colors duration-500 ${
        isNight
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : 'bg-slate-100/80 text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SURROUNDING AREA INTELLIGENCE: DEDICATED TO ACTIVE HOTEL ONLY */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isGangtok ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
            }`}>
              Neighborhood Intelligence & Transit
            </span>
            <h2
              className={`text-2xl sm:text-4xl font-serif font-bold mt-1 ${
                isNight ? 'text-white' : 'text-slate-950'
              }`}
            >
              Local Guide for {property.name}
            </h2>
            <p className={`mt-2 text-sm ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need to know about the surrounding destinations, transit, and on-site support.
            </p>
          </div>

          {/* SINGLE DEDICATED GUIDE CARD */}
          <div className="max-w-4xl mx-auto">
            {isGangtok ? (
              /* Gangtok Mountain & Sightseeing Guide */
              <div
                className={`rounded-2xl p-6 sm:p-8 border flex flex-col justify-between transition-colors shadow-sm ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Sikkim Leisure Explorer · Trikuta Residency</span>
                  </div>
                  <h3
                    className={`text-xl sm:text-2xl font-serif font-bold mt-1 ${
                      isNight ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    Gangtok Mountain, Scenery & Excursion Guide
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isNight ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Trikuta Residency sits peacefully near Ridge Park, away from noisy congestion yet within brisk walking reach of Gangtok's vibrant promenades, ropeway cable car, and viewpoints.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-semibold">MG Marg Mall Promenade</span>
                      </div>
                      <span className="font-mono text-amber-600 dark:text-amber-300 font-semibold">
                        1.2 km · 7 mins walk or cab
                      </span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Gangtok Ropeway Cable Car</span>
                      </div>
                      <span className="font-mono">2.4 km · 10 mins</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Rumtek Monastery & Enchey Gompa</span>
                      </div>
                      <span className="font-mono">Scenic 30-40 mins day excursion</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Tsomgo (Changu) Lake & Nathula Pass</span>
                      </div>
                      <span className="font-mono">Permits processed at hotel travel desk</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-6 pt-4 border-t text-[11px] flex items-center justify-between ${
                    isNight ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span>Direct Sikkim government registered tourist assistance</span>
                  <span className="text-amber-500 font-semibold">Travel Desk On-Site</span>
                </div>
              </div>
            ) : (
              /* AIIMS Kalyani Care Guide */
              <div
                className={`rounded-2xl p-6 sm:p-8 border flex flex-col justify-between transition-colors shadow-sm ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <HeartPulse className="w-4 h-4" />
                    <span>Medical Convenience Hub · Hotel Parijaye</span>
                  </div>
                  <h3
                    className={`text-xl sm:text-2xl font-serif font-bold mt-1 ${
                      isNight ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    AIIMS Kalyani Patient & Attendant Guide
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isNight ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Navigating treatments can be taxing. Hotel Parijaye is situated right on the NH-12 connector to AIIMS, providing rapid transit and round-the-clock emergency access.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold">AIIMS Kalyani Main Gate & OPD</span>
                      </div>
                      <span className="font-mono text-emerald-600 dark:text-emerald-300 font-semibold">
                        800 meters · 3 mins (Free Shuttle)
                      </span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>24/7 Pharmacies & Diagnostic Blood Labs</span>
                      </div>
                      <span className="font-mono">200 meters · 2 mins walk</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Kalyani Main Railway Station</span>
                      </div>
                      <span className="font-mono">3.2 km · 8 mins cab</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isNight
                          ? 'bg-slate-900 border-slate-800/80 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Netaji Subhash Chandra Bose Int. Airport (CCU)</span>
                      </div>
                      <span className="font-mono">42 km · 55 mins via Express NH-12</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-6 pt-4 border-t text-[11px] flex items-center justify-between ${
                    isNight ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span>Free attendant assistance for wheelchair transfers</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">24/7 Desk Support</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GUEST TESTIMONIALS (FILTERED FOR CHOSEN PROPERTY) */}
        <div id="reviews">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isGangtok ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
              }`}>
                Verified Resident Feedback
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-serif font-bold mt-1 ${
                  isNight ? 'text-white' : 'text-slate-950'
                }`}
              >
                Guest Reviews for {property.name}
              </h2>
            </div>

            <div className={`flex items-center gap-3 text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="font-semibold">{property.rating} / 5.0</span>
              <span>·</span>
              <span>Based on {property.reviewCount}+ Google Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantTestimonials.map((review, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-colors shadow-sm ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        isNight
                          ? 'bg-slate-900 border-slate-800 text-slate-400'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {review.badge}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed italic ${
                      isNight ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    "{review.text}"
                  </p>
                </div>

                <div
                  className={`mt-5 pt-4 border-t ${
                    isNight ? 'border-slate-800/80' : 'border-slate-100'
                  }`}
                >
                  <div className={`text-sm font-semibold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                    {review.name}
                  </div>
                  <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {review.role}
                  </div>
                  <div className={`text-[11px] font-medium mt-0.5 ${
                    isGangtok ? 'text-amber-500 dark:text-amber-300' : 'text-emerald-500 dark:text-emerald-300'
                  }`}>
                    {review.property}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POLICIES & CARE ACCORDION */}
        <div
          className={`rounded-2xl p-6 sm:p-8 border transition-colors shadow-sm ${
            isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-2xl mb-6">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isGangtok ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              Guest Commitments
            </span>
            <h3
              className={`text-xl sm:text-2xl font-serif font-bold mt-1 ${
                isNight ? 'text-white' : 'text-slate-950'
              }`}
            >
              Safety, Cleanliness & Booking Policies
            </h3>
          </div>

          <div
            className={`flex flex-wrap gap-2 border-b pb-4 mb-6 ${
              isNight ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            {isGangtok ? (
              <>
                <button
                  onClick={() => setOpenPolicyTab('permits')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    openPolicyTab === 'permits'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : isNight
                      ? 'text-slate-400 hover:text-white bg-slate-900'
                      : 'text-slate-600 hover:text-slate-950 bg-slate-100'
                  }`}
                >
                  Check-in ID & Sikkim Permits
                </button>
                <button
                  onClick={() => setOpenPolicyTab('hygiene')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    openPolicyTab === 'hygiene'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : isNight
                      ? 'text-slate-400 hover:text-white bg-slate-900'
                      : 'text-slate-600 hover:text-slate-950 bg-slate-100'
                  }`}
                >
                  Winter Heating & Sanitation
                </button>
                <button
                  onClick={() => setOpenPolicyTab('medical')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    openPolicyTab === 'medical'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : isNight
                      ? 'text-slate-400 hover:text-white bg-slate-900'
                      : 'text-slate-600 hover:text-slate-950 bg-slate-100'
                  }`}
                >
                  Flexible Cancellation
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setOpenPolicyTab('medical')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    openPolicyTab === 'medical'
                      ? 'bg-emerald-500 text-white font-bold shadow-sm'
                      : isNight
                      ? 'text-slate-400 hover:text-white bg-slate-900'
                      : 'text-slate-600 hover:text-slate-950 bg-slate-100'
                  }`}
                >
                  Flexible Medical Cancellation
                </button>
                <button
                  onClick={() => setOpenPolicyTab('hygiene')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    openPolicyTab === 'hygiene'
                      ? 'bg-emerald-500 text-white font-bold shadow-sm'
                      : isNight
                      ? 'text-slate-400 hover:text-white bg-slate-900'
                      : 'text-slate-600 hover:text-slate-950 bg-slate-100'
                  }`}
                >
                  Hospital-Grade Sanitization & Diets
                </button>
                <button
                  onClick={() => setOpenPolicyTab('permits')}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    openPolicyTab === 'permits'
                      ? 'bg-emerald-500 text-white font-bold shadow-sm'
                      : isNight
                      ? 'text-slate-400 hover:text-white bg-slate-900'
                      : 'text-slate-600 hover:text-slate-950 bg-slate-100'
                  }`}
                >
                  Check-in ID Regulations
                </button>
              </>
            )}
          </div>

          <div
            className={`text-xs leading-relaxed space-y-2 ${
              isNight ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {openPolicyTab === 'medical' && (
              <div className="space-y-2">
                <p>
                  <strong>Flexible Emergency Modification:</strong> We know medical appointments and travel plans can change unexpectedly. We allow hassle-free adjustments and date changes when informed 24 hours prior.
                </p>
                <p>
                  Full refund is provided if cancelled up to 48 hours before check-in.
                </p>
              </div>
            )}

            {openPolicyTab === 'permits' && (
              <div className="space-y-2">
                <p>
                  <strong>Government ID Requirement:</strong> All Indian adult guests must present a valid government-issued photo ID (Aadhar Card, Voter ID, Passport, or Driving License).
                </p>
                {isGangtok && (
                  <p>
                    <strong>Sikkim Protected Area Permits:</strong> To visit Nathula Pass or Tsomgo Lake, guests must provide 2 passport photos and Voter ID or Passport copy. We coordinate permits directly at our front desk.
                  </p>
                )}
              </div>
            )}

            {openPolicyTab === 'hygiene' && (
              <div className="space-y-2">
                <p>
                  <strong>Sanitization Standards:</strong> Every room undergoes strict high-temperature linen laundering and antimicrobial surface sanitization prior to check-in.
                </p>
                {isGangtok ? (
                  <p>
                    <strong>Himalayan Winter Heating:</strong> Equipped with electric bed warmers, heavy thermal duvets, and supplemental heaters for cozy mountain warmth.
                  </p>
                ) : (
                  <p>
                    <strong>Custom Dietary Food:</strong> Our kitchen prepares mild, low-sodium convalescent diets recommended for patients visiting AIIMS Kalyani.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS (FILTERED FOR CHOSEN HOTEL) */}
        <div id="faqs" className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isGangtok ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
            }`}>
              Clear Answers
            </span>
            <h3
              className={`text-2xl font-serif font-bold mt-1 ${
                isNight ? 'text-white' : 'text-slate-950'
              }`}
            >
              Frequently Asked Questions ({property.name})
            </h3>
          </div>

          <div className="space-y-3">
            {relevantFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-colors shadow-sm ${
                    isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className={`w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-colors ${
                      isNight ? 'text-white hover:text-amber-300' : 'text-slate-900 hover:text-amber-600'
                    }`}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-500 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div
                      className={`px-4 pb-4 pt-1 text-xs leading-relaxed border-t ${
                        isNight
                          ? 'border-slate-900 text-slate-400'
                          : 'border-slate-100 text-slate-600'
                      }`}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
