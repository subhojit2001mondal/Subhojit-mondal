import React, { useState, useEffect } from 'react';

interface HeroBookingBarProps {
  selectedProperty: 'gangtok' | 'kalyani';
  setSelectedProperty: (prop: 'gangtok' | 'kalyani') => void;
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  adults: number;
  setAdults: (num: number) => void;
  childrenCount: number;
  setChildrenCount: (num: number) => void;
  purpose: 'leisure' | 'medical' | 'corporate';
  setPurpose: (p: 'leisure' | 'medical' | 'corporate') => void;
  onSearch: () => void;
  isLoading: boolean;
}

export interface ViewpointSlide {
  id: string;
  name: string;
  altitude: string;
  tag: string;
  headline: string;
  subtext: string;
  url: string;
  focalPoint: string;
  routeHighlight: string;
}

const GANGTOK_VIEWPOINT_SLIDES: ViewpointSlide[] = [
  {
    id: 'gurudongmar-lake',
    name: 'Gurudongmar Lake',
    altitude: '17,800 ft',
    tag: 'North Sikkim Glacial Sanctuary',
    headline: 'One of the Highest Lakes on Earth.',
    subtext: 'Gurudongmar Lake, Sikkim (17,800 ft) — sacred turquoise glacial waters under snow-capped peaks, part of our guided North Sikkim journeys.',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Included in Trikuta 2N/3D North Sikkim Circuit'
  },
  {
    id: 'yumthang-valley',
    name: 'Yumthang Valley',
    altitude: '11,693 ft',
    tag: 'The Valley of Flowers',
    headline: 'Where the Himalayan Valley Blooms.',
    subtext: 'Yumthang Valley (11,693 ft) — the celebrated Valley of Flowers with wild rhododendrons, alpine river meadows & pine-clad ridges on our Lachung routes.',
    url: '/images/destinations/yumthang-valley.jpg',
    focalPoint: 'object-center',
    routeHighlight: 'Sanctuary of Rhododendrons & Alpine Meadows'
  },
  {
    id: 'tsomgo-lake',
    name: 'Tsomgo (Changu) Lake',
    altitude: '12,310 ft',
    tag: 'East Sikkim Glacial Wonder',
    headline: 'Sacred Turquoise Waters in the Clouds.',
    subtext: 'Tsomgo Lake (12,310 ft) — sacred glacial lake reflecting Himalayan peaks and yak trails, an easy and scenic day excursion arranged from Gangtok.',
    url: '/images/destinations/tsomgo-lake.jpg',
    focalPoint: 'object-center',
    routeHighlight: 'Dedicated same-day permit & cab booking at our desk'
  },
  {
    id: 'nathula-pass',
    name: 'Nathula Pass',
    altitude: '14,140 ft',
    tag: 'Historic Old Silk Route',
    headline: 'Stand at the Indo-China Border.',
    subtext: 'Nathula Pass (14,140 ft) — high-altitude mountain frontier winding through Himalayan snows, a signature day trip arranged from Trikuta Residency.',
    url: '/images/destinations/nathula-pass.jpg',
    focalPoint: 'object-center',
    routeHighlight: 'Exclusive Indian citizen frontier permit desk'
  },
  {
    id: 'baba-mandir',
    name: 'Baba Harbhajan Singh Mandir',
    altitude: '13,123 ft',
    tag: 'Revered Mountain Shrine',
    headline: 'Legend & Devotion on the Ridge.',
    subtext: 'Baba Mandir — honoring the revered soldier-saint guarding the eastern frontier, draped in sacred prayer flags above the cloud line.',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Seamlessly combined with the Tsomgo-Nathula route'
  },
  {
    id: 'mg-marg-gangtok',
    name: 'MG Marg, Gangtok',
    altitude: '5,410 ft',
    tag: 'Heart of the Capital',
    headline: 'The Vibrant Heart of Gangtok.',
    subtext: 'MG Marg — lively pedestrian boulevard of mountain cafes, Sikkimese craft shops, and charm, minutes from Trikuta Residency.',
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Centrally located base for all Sikkim excursions'
  }
];

const KALYANI_VIEWPOINT_SLIDES: ViewpointSlide[] = [
  {
    id: 'aiims-kalyani-gate',
    name: 'AIIMS Kalyani Main Gate & OPD',
    altitude: '800m · 2 Mins',
    tag: 'Healthcare-Adjacent Hospitality',
    headline: 'Dedicated Care & Proximity to AIIMS Kalyani.',
    subtext: 'Hotel Parijaye, Kalyani — peaceful, hygienic, and comforting suites located just 2 minutes from AIIMS Main OPD Gate.',
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Free patient shuttle & ambulance coordination desk'
  },
  {
    id: 'executive-attendant-suite',
    name: 'Sanitized Patient Attendant Suites',
    altitude: 'Quiet Rest Floors',
    tag: 'Attendant & Family Comfort',
    headline: 'Restful Comfort for Caregivers & Families.',
    subtext: 'Spotless linen, hot water, quiet environment, and spacious air-conditioned rooms designed for hospital companions and visiting doctors.',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Daily medical sanitization & elevator access'
  },
  {
    id: 'inhouse-diet-dining',
    name: 'Wholesome In-House Kitchen',
    altitude: 'Nutritious & Fresh',
    tag: 'Custom Patient Diets',
    headline: 'Nutritious, Pure & Hygienic Dining.',
    subtext: 'Freshly prepared homestyle Bengali, North Indian, and customized patient diet meals prepared with the highest hygiene standards.',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Custom boiled & low-sodium patient meals available'
  },
  {
    id: 'doctor-support-desk',
    name: '24/7 Front Desk & Medical Assistance',
    altitude: '24/7 Support',
    tag: 'Emergency & Prescription Aid',
    headline: 'Compassionate Assistance, 24 Hours a Day.',
    subtext: 'Doctor-on-call, pharmacy runner assistance, wheelchair-accessible corridors, and 24/7 front desk team ready to assist your loved ones.',
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: 'Wheelchair access & priority early check-in for patients'
  },
  {
    id: 'kalyani-township',
    name: 'Planned Green Township of Kalyani',
    altitude: 'Serene Township',
    tag: 'Quiet Greenery & Fresh Air',
    headline: 'Tranquil Green Spaces for Rapid Recovery.',
    subtext: 'Situated in the planned educational and medical hub of Kalyani, surrounded by wide avenues, lush greenery, and peaceful surroundings.',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&h=1080&q=85',
    focalPoint: 'object-center',
    routeHighlight: '5 mins from Kalyani Junction Railway Station'
  }
];

export const HeroBookingBar: React.FC<HeroBookingBarProps> = ({
  selectedProperty,
  setSelectedProperty,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  adults,
  setAdults,
  childrenCount,
  setChildrenCount,
  purpose,
  setPurpose,
  onSearch,
  isLoading,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isGangtok = selectedProperty === 'gangtok';
  const slides = isGangtok ? GANGTOK_VIEWPOINT_SLIDES : KALYANI_VIEWPOINT_SLIDES;

  // Reset slide index when property changes
  useEffect(() => {
    setSlideIndex(0);
  }, [selectedProperty]);

  // Respect user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Auto-advance viewpoint slideshow automatically after 10 seconds in any view (mobile, tablet, desktop)
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length, selectedProperty]);

  return (
    <div
      id="top"
      className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 overflow-hidden theme-transition"
    >
      {/* Auto-sliding Background Showcase for the Chosen Hotel */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {slides.map((slide, idx) => {
          const isActive = idx === slideIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.url}
                alt={`${slide.name} — ${slide.tag}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${slide.focalPoint} ${
                  isActive && !reducedMotion ? 'animate-kenburns' : 'scale-100'
                }`}
              />
            </div>
          );
        })}
        {/* Subtle cinematic gradient overlay for depth, legibility, and luxury atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65 pointer-events-none z-20" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* CENTERED HERO TEXT */}
        <div className="pt-12 pb-16 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32 flex flex-col items-center justify-center text-center">
          {/* Three lines of static text stacked, in polished luxury gold & champagne texture */}
          <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 select-none">
            {/* 3. Top eyebrow / label */}
            <span className="font-brand-cinzel text-xs sm:text-sm md:text-base lg:text-lg font-semibold uppercase tracking-[0.35em] text-[#FBD365] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              Parijai Group of Hotels
            </span>

            {/* 2. Primary large heading, the main focal point */}
            <h1 className="mt-2.5 sm:mt-4 text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-brand-cinzel font-bold tracking-tight hero-luxury-gold-heading leading-[1.12]">
              Trikuta Residency
            </h1>

            {/* 1. Supporting location line directly beneath */}
            <p className="mt-2 sm:mt-3.5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-brand-garamond italic tracking-[0.25em] text-[#FFE89E] font-medium drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
              Gangtok
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
