import React, { useState, useEffect } from 'react';
import {
  Mountain,
  Building,
  MapPin,
  ExternalLink,
  Camera,
  CheckCircle2,
  Bed,
  Users,
  Maximize2,
  Flame,
  Tv,
  UtensilsCrossed,
  Wifi,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Compass,
  HeartPulse,
  Sparkles,
  PhoneCall,
  Accessibility,
  Clock,
  Wind
} from 'lucide-react';
import { Room, PROPERTIES, ROOMS } from '../data/hotels';
import { useTheme } from '../context/ThemeContext';
import {
  GalleryId,
  GalleryPhoto,
  GALLERY_CONFIGS
} from '../services/dbService';

interface PropertyShowcaseProps {
  activeProperty: 'gangtok' | 'kalyani';
  purpose: 'leisure' | 'medical' | 'corporate';
  onReserveRoom: (room: Room) => void;
  isLoading?: boolean;
  galleryPhotos: Record<GalleryId, GalleryPhoto[]>;
  roomPrices: Record<string, number>;
  onOpenManagePhotos?: (galleryId?: GalleryId) => void;
}

export interface UserPhoto {
  id: string;
  url: string;
  title: string;
  caption?: string;
  tag?: string;
  addedAt?: number;
}

export const PropertyShowcase: React.FC<PropertyShowcaseProps> = ({
  activeProperty,
  purpose,
  onReserveRoom,
  isLoading = false,
  galleryPhotos,
  roomPrices,
  onOpenManagePhotos
}) => {
  const { isNight } = useTheme();

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<UserPhoto | null>(null);
  const [activeLightboxGallery, setActiveLightboxGallery] = useState<UserPhoto[]>([]);

  const property = PROPERTIES[activeProperty];
  const propertyRooms = ROOMS.filter((r) => r.propertyId === activeProperty);

  const sortedRooms = [...propertyRooms].sort((a, b) => {
    const aMatch = a.purposeTags.includes(purpose) ? 1 : 0;
    const bMatch = b.purposeTags.includes(purpose) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Lightbox controls
  const openLightboxWithPhotos = (photo: UserPhoto, allPhotos: UserPhoto[]) => {
    setActiveLightboxGallery(allPhotos);
    setLightboxPhoto(photo);
  };

  const closeLightbox = () => setLightboxPhoto(null);

  const nextLightbox = () => {
    if (!lightboxPhoto || activeLightboxGallery.length === 0) return;
    const idx = activeLightboxGallery.findIndex((p) => p.id === lightboxPhoto.id);
    const nextIdx = (idx + 1) % activeLightboxGallery.length;
    setLightboxPhoto(activeLightboxGallery[nextIdx]);
  };

  const prevLightbox = () => {
    if (!lightboxPhoto || activeLightboxGallery.length === 0) return;
    const idx = activeLightboxGallery.findIndex((p) => p.id === lightboxPhoto.id);
    const prevIdx = (idx - 1 + activeLightboxGallery.length) % activeLightboxGallery.length;
    setLightboxPhoto(activeLightboxGallery[prevIdx]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxPhoto) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, activeLightboxGallery]);

  const handleOpenCustomLightbox = (photo: GalleryPhoto, all: GalleryPhoto[]) => {
    const convertedList: UserPhoto[] = all.map((p) => ({
      id: p.id,
      url: p.url,
      title: p.title,
      caption: p.caption
    }));
    const target: UserPhoto = {
      id: photo.id,
      url: photo.url,
      title: photo.title,
      caption: photo.caption
    };
    openLightboxWithPhotos(target, convertedList);
  };

  const isGangtok = activeProperty === 'gangtok';
  const exteriorGalleryId: GalleryId = isGangtok ? 'gangtok/exterior' : 'kalyani/exterior';
  const exteriorPhotos = galleryPhotos[exteriorGalleryId] || [];

  return (
    <section
      id="properties"
      className={`py-12 md:py-20 transition-colors duration-500 ${
        isNight ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DEDICATED SHOWCASE FOR THE CHOSEN HOTEL */}
        <div id={isGangtok ? 'trikuta-residency' : 'hotel-parijaye'} className="scroll-mt-24">
          {/* Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md border ${
                  isGangtok
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-300'
                }`}
              >
                {isGangtok ? <Mountain className="w-7 h-7" /> : <Building className="w-7 h-7" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                      isNight ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {property.name}
                  </h3>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isGangtok
                        ? 'bg-amber-400/15 text-amber-500 border-amber-400/30'
                        : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    }`}
                  >
                    {property.location}
                  </span>
                </div>

                <a
                  href={property.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 transition-colors ${
                    isGangtok ? 'hover:text-amber-500 dark:hover:text-amber-400' : 'hover:text-emerald-500 dark:hover:text-emerald-400'
                  }`}
                  title="View Google Maps Location"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{property.address}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>

            {/* Ratings & Quick Admin Link */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isNight
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                  ●
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <span>●●●●◐</span>
                </div>
                <span className="text-[11px] text-slate-400">{property.reviewCount * 2}+ reviews</span>
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isNight
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <span className="font-bold text-xs tracking-tight">
                  <span className="text-blue-500">G</span>
                  <span className="text-rose-500">o</span>
                  <span className="text-amber-500">o</span>
                  <span className="text-blue-500">g</span>
                  <span className="text-emerald-500">l</span>
                  <span className="text-rose-500">e</span>
                </span>
                <span className="text-amber-400 font-mono font-bold">{property.rating} ★</span>
                <span className="text-[11px] text-slate-400">{property.reviewCount} reviews</span>
              </div>

              {onOpenManagePhotos && (
                <button
                  onClick={() => onOpenManagePhotos(exteriorGalleryId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    isNight
                      ? 'border-slate-700 bg-slate-800/80 text-amber-400 hover:bg-slate-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
                  }`}
                  title="Upload or manage photos for this property in Admin Panel"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Photos</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. BUILDING FRONT / EXTERIOR SECTION (Top of Showcase) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isGangtok ? 'bg-amber-400/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
                  }`}
                >
                  Building Front / Exterior
                </span>
                <span className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isGangtok ? 'Trikuta Residency' : 'Hotel Parijaye'} Exterior & Facade
                </span>
              </div>

              {onOpenManagePhotos && (
                <button
                  onClick={() => onOpenManagePhotos(exteriorGalleryId)}
                  className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Manage Exterior Photos</span>
                </button>
              )}
            </div>

            {/* Building Front / Exterior Photo Gallery */}
            <BuildingExteriorShowcase
              photos={exteriorPhotos}
              propertyName={property.name}
              onOpenManagePhotos={() => onOpenManagePhotos?.(exteriorGalleryId)}
              onOpenLightbox={handleOpenCustomLightbox}
              isNight={isNight}
              isGangtok={isGangtok}
            />
          </div>

          {/* 2. ROOMS & ACCOMMODATIONS SECTION */}
          <div className="mt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isGangtok ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {isGangtok ? 'Rooms & Nightly Tariffs' : 'Suites & Healthcare Accommodations'}
              </span>
              <h3
                className={`text-2xl sm:text-3xl font-serif font-bold mt-1 ${
                  isNight ? 'text-white' : 'text-slate-950'
                }`}
              >
                Suites & Tariffs at {property.name}
              </h3>
            </div>
            <span className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing {sortedRooms.length} room types (Nightly rates synced live with database)
            </span>
          </div>

          {/* Loading Shimmer State */}
          {isLoading ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`rounded-2xl p-6 h-80 animate-pulse flex flex-col justify-between border ${
                    isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`h-6 rounded w-3/4 ${isNight ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`h-4 rounded w-1/2 ${isNight ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  </div>
                  <div className={`h-12 rounded w-full ${isNight ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
              ))}
            </div>
          ) : isGangtok ? (
            /* Gangtok: View Room & Non-View Room */
            <div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {sortedRooms.map((room) => {
                  const isViewRoom = room.id === 'g-view-deluxe';
                  const galleryId: GalleryId = isViewRoom ? 'gangtok/view-room' : 'gangtok/non-view-room';
                  const photosForRoom = galleryPhotos[galleryId] || [];
                  const dynamicPrice = roomPrices[room.id] ?? room.pricePerNight;

                  return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      dynamicPrice={dynamicPrice}
                      galleryId={galleryId}
                      photos={photosForRoom}
                      isNight={isNight}
                      isGangtok={true}
                      onReserve={() => onReserveRoom({ ...room, pricePerNight: dynamicPrice })}
                      onOpenManagePhotos={() => onOpenManagePhotos?.(galleryId)}
                      onOpenLightbox={handleOpenCustomLightbox}
                    />
                  );
                })}
              </div>

              {/* Common Spaces Section for Trikuta Residency (Reception & Dining) */}
              <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-amber-400/15 text-amber-500 border border-amber-400/30">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Shared Property Spaces · Not Bookable</span>
                    </div>
                    <h3
                      className={`text-2xl sm:text-3xl font-serif font-bold mt-2 ${
                        isNight ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      Reception & Dining Areas (Trikuta Residency)
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      Welcoming shared property amenities at Trikuta Residency included with your mountain stay.
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenManagePhotos?.('gangtok/reception')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Manage Common Area Photos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CommonSpaceCard
                    galleryId="gangtok/reception"
                    name="Reception Area & Check-in Lobby"
                    badge="Lobby & Tour Desk"
                    description="Warm welcoming check-in desk, marble staircase, cozy leather seating lounge, and dedicated travel permit desk for Nathula Pass, Tsomgo Lake, and North Sikkim excursions."
                    highlights={[
                      '24/7 Front Check-in & Concierge Desk',
                      'Dedicated Nathula Pass & Tsomgo Permits Help Desk',
                      'Cozy Leather Sofa Seating & Mountain Heating',
                      'Luggage Holding & Mountain Taxi Coordination'
                    ]}
                    photos={galleryPhotos['gangtok/reception'] || []}
                    isNight={isNight}
                    onOpenManagePhotos={() => onOpenManagePhotos?.('gangtok/reception')}
                    onOpenLightbox={handleOpenCustomLightbox}
                  />

                  <CommonSpaceCard
                    galleryId="gangtok/dining"
                    name="Dining Area & In-House Restaurant"
                    badge="Sikkimese & Indian Cuisine"
                    description="Authentic in-house Sikkimese organic specialty dining along with comforting North & South Indian meals, mountain tea, and fresh breakfast spread overlooking the valleys."
                    highlights={[
                      'Freshly Prepared Organic Sikkimese Delicacies',
                      'Homestyle North & South Indian Thalis',
                      'Hot Himalayan Spiced Tea & Filter Coffee',
                      'Breakfast Included Options & Room Dining'
                    ]}
                    photos={galleryPhotos['gangtok/dining'] || []}
                    isNight={isNight}
                    onOpenManagePhotos={() => onOpenManagePhotos?.('gangtok/dining')}
                    onOpenLightbox={handleOpenCustomLightbox}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Kalyani: Non-AC Rooms, Standard AC Rooms, Deluxe Twin Care Room */
            <div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRooms.map((room) => {
                  let galleryId: GalleryId = 'kalyani/non-ac';
                  if (room.id === 'k-standard-ac') galleryId = 'kalyani/standard-ac';
                  if (room.id === 'k-deluxe-twin') galleryId = 'kalyani/deluxe-twin';

                  const photosForRoom = galleryPhotos[galleryId] || [];
                  const dynamicPrice = roomPrices[room.id] ?? room.pricePerNight;

                  return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      dynamicPrice={dynamicPrice}
                      galleryId={galleryId}
                      photos={photosForRoom}
                      isNight={isNight}
                      isGangtok={false}
                      onReserve={() => onReserveRoom({ ...room, pricePerNight: dynamicPrice })}
                      onOpenManagePhotos={() => onOpenManagePhotos?.(galleryId)}
                      onOpenLightbox={handleOpenCustomLightbox}
                    />
                  );
                })}
              </div>

              {/* Common Spaces Section for Hotel Parijaye (Reception & Dining) */}
              <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>Shared Property Spaces · Hotel Parijaye</span>
                    </div>
                    <h3
                      className={`text-2xl sm:text-3xl font-serif font-bold mt-2 ${
                        isNight ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      Reception & Dining Areas (Hotel Parijaye)
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      Hygienic shared facilities, 24/7 attendant check-in desk, and patient-tailored dietary dining.
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenManagePhotos?.('kalyani/reception')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Manage Common Area Photos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CommonSpaceCard
                    galleryId="kalyani/reception"
                    name="Reception Area & Medical Assistance Desk"
                    badge="24/7 Front Desk"
                    description="Warm check-in lobby, wheelchair parking area, emergency prescription assistance, and prompt door-to-door transit to AIIMS Kalyani OPD."
                    highlights={[
                      '24/7 Front Reception & Emergency Desk',
                      'Dedicated Door-to-Door AIIMS OPD Transit Pass',
                      'Wheelchair Ramps & Stretcher Lift Direct Access',
                      'Prescription Delivery & Doctor-on-Call Assistance'
                    ]}
                    photos={galleryPhotos['kalyani/reception'] || []}
                    isNight={isNight}
                    onOpenManagePhotos={() => onOpenManagePhotos?.('kalyani/reception')}
                    onOpenLightbox={handleOpenCustomLightbox}
                  />

                  <CommonSpaceCard
                    galleryId="kalyani/dining"
                    name="Sanitized Kitchen & Attendant Dining Area"
                    badge="Wholesome & Patient Diet"
                    description="Sanitized in-house kitchen preparing fresh homestyle Bengali & North Indian food, plus customizable low-sodium, boiled patient diet meals."
                    highlights={[
                      'Freshly Prepared Homestyle Meals & Thalis',
                      'Doctor-Approved Low-Sodium & Boiled Diets',
                      'Hot Purified RO Drinking Water Available 24/7',
                      'Quiet, Spotless Dining Seating & In-Room Service'
                    ]}
                    photos={galleryPhotos['kalyani/dining'] || []}
                    isNight={isNight}
                    onOpenManagePhotos={() => onOpenManagePhotos?.('kalyani/dining')}
                    onOpenLightbox={handleOpenCustomLightbox}
                  />
                </div>
              </div>

              {/* Specialized AIIMS Healthcare Support Highlights */}
              <div
                className={`mt-16 p-6 sm:p-8 rounded-2xl border transition-colors ${
                  isNight ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                        Dedicated AIIMS Kalyani Medical Convenience
                      </h4>
                      <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        Designed specifically for patient attendants, recovering guests, and medical consultants.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start md:self-auto">
                    800m to AIIMS OPD Gate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Accessibility className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white font-semibold">Elevator & Wheelchair</strong>
                      <span className="text-slate-500 dark:text-slate-400">Step-free ramps and hospital-grade elevator throughout.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white font-semibold">24/7 Front Desk</strong>
                      <span className="text-slate-500 dark:text-slate-400">Emergency support, prescription delivery, doctor-on-call.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white font-semibold">Diet-Friendly Meals</strong>
                      <span className="text-slate-500 dark:text-slate-400">Custom boiled, low-sodium light patient food upon request.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white font-semibold">E-Rickshaw Shuttle</strong>
                      <span className="text-slate-500 dark:text-slate-400">Door-to-door 2-min drop to AIIMS OPD & test centers.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div
            className="flex items-center justify-between text-white max-w-7xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="font-serif font-bold text-base sm:text-lg">{lightboxPhoto.title}</h4>
              {lightboxPhoto.caption && (
                <p className="text-xs text-slate-400 mt-0.5">{lightboxPhoto.caption}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 flex items-center justify-center relative my-4 max-w-6xl mx-auto w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-all"
            />

            {activeLightboxGallery.length > 1 && (
              <>
                <button
                  onClick={prevLightbox}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextLightbox}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div
            className="flex items-center justify-center text-xs text-slate-400 max-w-7xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {activeLightboxGallery.length > 0 && (
              <span>
                Photo {activeLightboxGallery.findIndex((p) => p.id === lightboxPhoto.id) + 1} of{' '}
                {activeLightboxGallery.length}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Building Exterior Showcase
// ----------------------------------------------------------------------
interface BuildingExteriorShowcaseProps {
  photos: GalleryPhoto[];
  propertyName: string;
  onOpenManagePhotos: () => void;
  onOpenLightbox: (photo: GalleryPhoto, allPhotos: GalleryPhoto[]) => void;
  isNight: boolean;
  isGangtok: boolean;
}

const BuildingExteriorShowcase: React.FC<BuildingExteriorShowcaseProps> = ({
  photos,
  propertyName,
  onOpenManagePhotos,
  onOpenLightbox,
  isNight,
  isGangtok
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
          isNight ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            isGangtok ? 'bg-amber-400/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
          }`}>
            <Building className="w-7 h-7" />
          </div>
          <div>
            <h4 className={`font-serif font-bold text-base ${isNight ? 'text-white' : 'text-slate-950'}`}>
              {propertyName} — Building Front & Exterior
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              No exterior photos uploaded yet for this property. Upload photos via the Admin Panel to display the building entrance, facade, and surroundings here.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenManagePhotos}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer self-start sm:self-auto ${
            isGangtok
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Upload Exterior Photos</span>
        </button>
      </div>
    );
  }

  // If 1 photo: Hero Banner
  // If >1 photos: Mosaic / Carousel
  const currentPhoto = photos[activeIdx] || photos[0];

  return (
    <div className="space-y-3">
      <div
        onClick={() => onOpenLightbox(currentPhoto, photos)}
        className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 h-[280px] sm:h-[380px] lg:h-[420px]"
      >
        <img
          src={currentPhoto.url}
          alt={currentPhoto.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-3.5 left-4 flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20">
            Exterior & Building Front · {photos.length} Verified Photo{photos.length > 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenManagePhotos();
          }}
          title="Manage exterior photos in Admin Panel"
          className="absolute top-3.5 right-4 p-2 rounded-xl bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white border border-white/20 transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-lg"
        >
          <Camera className="w-4 h-4" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="font-serif font-bold text-base sm:text-lg drop-shadow line-clamp-1">
            {currentPhoto.title}
          </div>
          {currentPhoto.caption && (
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 drop-shadow">
              {currentPhoto.caption}
            </p>
          )}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev - 1 + photos.length) % photos.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev + 1) % photos.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar if more than 1 photo */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                idx === activeIdx
                  ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Room Card (Dynamic Rates & Strict Admin Gallery Photos)
// ----------------------------------------------------------------------
interface RoomCardProps {
  room: Room;
  dynamicPrice: number;
  galleryId: GalleryId;
  photos: GalleryPhoto[];
  isNight: boolean;
  isGangtok: boolean;
  onReserve: () => void;
  onOpenManagePhotos: () => void;
  onOpenLightbox: (photo: GalleryPhoto, allPhotos: GalleryPhoto[]) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  dynamicPrice,
  galleryId,
  photos,
  isNight,
  isGangtok,
  onReserve,
  onOpenManagePhotos,
  onOpenLightbox
}) => {
  const originalPrice = Math.round(dynamicPrice * 1.25);

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group border relative ${
        isNight
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-xl'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl'
      }`}
    >
      <div>
        {/* Strictly Admin Gallery Photos or Clean Empty Placeholder */}
        <div className="mb-4">
          <RoomImageGallery
            galleryId={galleryId}
            roomName={room.name}
            photos={photos}
            onOpenManagePhotos={onOpenManagePhotos}
            onOpenLightbox={onOpenLightbox}
            isNight={isNight}
          />
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
              isGangtok
                ? galleryId === 'gangtok/view-room'
                  ? 'bg-amber-400 text-slate-950'
                  : isNight
                  ? 'border border-slate-700 text-slate-400 bg-slate-950/60'
                  : 'border border-slate-300 text-slate-600 bg-slate-100'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isGangtok ? (
              galleryId === 'gangtok/view-room' ? (
                <>
                  <Mountain className="w-3.5 h-3.5 text-slate-950" />
                  <span>Hillside & Valley View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Standard Window</span>
                </>
              )
            ) : (
              <>
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                <span>AIIMS Convenience</span>
              </>
            )}
          </span>

          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Free Cancellation</span>
          </span>
        </div>

        <h4
          className={`text-xl font-serif font-bold transition-colors ${
            isNight
              ? isGangtok
                ? 'text-white group-hover:text-amber-300'
                : 'text-white group-hover:text-emerald-300'
              : isGangtok
              ? 'text-slate-950 group-hover:text-amber-600'
              : 'text-slate-950 group-hover:text-emerald-600'
          }`}
        >
          {room.name}
        </h4>

        <p className={`text-xs mt-1 leading-relaxed ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
          {room.tagline}
        </p>

        {/* Room Specifications */}
        <div
          className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
            isNight
              ? 'bg-slate-950/70 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Maximize2 className={`w-3.5 h-3.5 shrink-0 ${isGangtok ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="font-mono font-bold">{room.sqft}</span>
            <span className="text-[11px] text-slate-400">sq ft</span>
          </div>

          <div className="h-4 w-px bg-slate-700/50" />

          <div className="flex items-center gap-1.5">
            <Bed className={`w-3.5 h-3.5 shrink-0 ${isGangtok ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-[11px]">{room.bed}</span>
          </div>

          <div className="h-4 w-px bg-slate-700/50" />

          <div className="flex items-center gap-1.5">
            <Users className={`w-3.5 h-3.5 shrink-0 ${isGangtok ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-[11px]">{room.occupancy}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Included Room Amenities
          </div>
          <div className="grid grid-cols-2 gap-2">
            {room.amenities.map((amenity, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                  isNight
                    ? 'bg-slate-950 text-slate-300 border-slate-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isGangtok ? 'text-amber-500' : 'text-emerald-500'}`} />
                <span className="text-[11px] truncate font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {room.remainingRooms <= 3 && (
          <div className="mt-4 text-[11px] font-semibold text-rose-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Only {room.remainingRooms} suites remaining for selected dates</span>
          </div>
        )}
      </div>

      {/* Dynamic Nightly Rate & Action */}
      <div
        className={`mt-6 pt-4 border-t flex items-center justify-between ${
          isNight ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${isNight ? 'text-white' : 'text-slate-950'}`}>
              ₹{dynamicPrice}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono">₹{originalPrice}</span>
          </div>
          <span className={`text-[10px] block ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
            + GST · Per Night
          </span>
        </div>

        <button
          onClick={onReserve}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            isGangtok
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:shadow-lg hover:scale-102 active:scale-98'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:shadow-lg hover:scale-102 active:scale-98'
          }`}
        >
          <span>Reserve Suite</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Room Image Gallery (Strictly Real Admin Uploads)
// ----------------------------------------------------------------------
interface RoomImageGalleryProps {
  galleryId: GalleryId;
  roomName: string;
  photos: GalleryPhoto[];
  onOpenManagePhotos: () => void;
  onOpenLightbox: (photo: GalleryPhoto, allPhotos: GalleryPhoto[]) => void;
  isNight: boolean;
}

const RoomImageGallery: React.FC<RoomImageGalleryProps> = ({
  galleryId,
  roomName,
  photos,
  onOpenManagePhotos,
  onOpenLightbox,
  isNight
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden border p-6 flex flex-col items-center justify-center text-center aspect-16/10 transition-colors ${
          isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center mb-2">
          <ImageIcon className="w-5 h-5 text-slate-400" />
        </div>
        <span className="font-serif font-bold text-xs text-slate-300">
          No photo uploaded for {roomName}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
          Upload room photos in the Admin Panel to display them here.
        </span>
        <button
          onClick={onOpenManagePhotos}
          className="mt-3 px-3 py-1 rounded-lg bg-amber-400/90 hover:bg-amber-400 text-slate-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <Camera className="w-3 h-3" />
          <span>Upload Room Photos</span>
        </button>
      </div>
    );
  }

  const currentPhoto = photos[currentIdx] || photos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % photos.length);
  };

  return (
    <div
      onClick={() => onOpenLightbox(currentPhoto, photos)}
      className="relative rounded-xl overflow-hidden group/gallery cursor-pointer border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-16/10"
    >
      <img
        src={currentPhoto.url}
        alt={currentPhoto.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs border border-white/15">
          {photos.length} Verified Photo{photos.length > 1 ? 's' : ''}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenManagePhotos();
        }}
        title="Manage photos for this room in Admin Panel"
        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white border border-white/20 transition-all opacity-80 group-hover/gallery:opacity-100 cursor-pointer shadow-md"
      >
        <Camera className="w-3.5 h-3.5" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-0 group-hover/gallery:opacity-100 cursor-pointer shadow-md"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-0 group-hover/gallery:opacity-100 cursor-pointer shadow-md"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {photos.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Common Space Card (Reception & Dining)
// ----------------------------------------------------------------------
interface CommonSpaceCardProps {
  galleryId: GalleryId;
  name: string;
  badge: string;
  description: string;
  highlights: string[];
  photos: GalleryPhoto[];
  isNight: boolean;
  onOpenManagePhotos: () => void;
  onOpenLightbox: (photo: GalleryPhoto, allPhotos: GalleryPhoto[]) => void;
}

const CommonSpaceCard: React.FC<CommonSpaceCardProps> = ({
  galleryId,
  name,
  badge,
  description,
  highlights,
  photos,
  isNight,
  onOpenManagePhotos,
  onOpenLightbox
}) => {
  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group border relative ${
        isNight
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      <div>
        <div className="mb-4">
          <RoomImageGallery
            galleryId={galleryId}
            roomName={name}
            photos={photos}
            onOpenManagePhotos={onOpenManagePhotos}
            onOpenLightbox={onOpenLightbox}
            isNight={isNight}
          />
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-500 border border-amber-400/30">
            {badge}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Shared Guest Space</span>
        </div>

        <h4 className={`text-xl font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
          {name}
        </h4>

        <p className={`text-xs mt-1.5 leading-relaxed ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </p>

        <div className="mt-4 space-y-1.5">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className={isNight ? 'text-slate-300' : 'text-slate-700'}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
          isNight ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Complimentary access for all resident guests</span>
        </div>

        <button
          onClick={onOpenManagePhotos}
          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer"
        >
          Manage photos
        </button>
      </div>
    </div>
  );
};
