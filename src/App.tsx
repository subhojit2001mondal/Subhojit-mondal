/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HeroBookingBar } from './components/HeroBookingBar';
import { PropertyShowcase } from './components/PropertyShowcase';
import { LocalGuidesAndTrust } from './components/LocalGuidesAndTrust';
import { Footer } from './components/Footer';
import { BookingFunnelModal } from './components/BookingFunnelModal';
import { HelpChatBubble } from './components/HelpChatBubble';
import { DatabaseRecordsModal } from './components/DatabaseRecordsModal';
import { ManagePhotosModal } from './components/ManagePhotosModal';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { BookingSuccessToast } from './components/BookingSuccessToast';
import { MobileFloatingDock } from './components/MobileFloatingDock';
import { InteractiveMapSection } from './components/InteractiveMapSection';
import { Room, ROOMS, BookingConfirmationSummary, DEFAULT_ROOM_PRICES } from './data/hotels';
import {
  GalleryId,
  GalleryPhoto,
  getInitialGalleryPhotos,
  subscribeToGalleryPhotos,
  subscribeToRoomPrices,
  saveRoomPriceToDb
} from './services/dbService';

function MainAppContent() {
  const { isNight } = useTheme();

  // Global booking state
  const [selectedProperty, setSelectedProperty] = useState<'gangtok' | 'kalyani'>('gangtok');

  // Database Records modal state
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);

  // Manage Photos modal state & gallery selection
  const [isManagePhotosOpen, setIsManagePhotosOpen] = useState<boolean>(false);
  const [selectedManageGallery, setSelectedManageGallery] = useState<GalleryId>('gangtok/exterior');

  // Booking confirmation success modal and floating toast state
  const [bookingSuccessSummary, setBookingSuccessSummary] = useState<BookingConfirmationSummary | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Google Maps Quota Defense state
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Real-time persistent gallery photos across all 11 sub-sections
  const [galleryPhotos, setGalleryPhotos] = useState<Record<GalleryId, GalleryPhoto[]>>(getInitialGalleryPhotos());

  // Real-time room nightly pricing across both properties
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>(DEFAULT_ROOM_PRICES);

  // Subscribe to real-time changes across all galleries
  useEffect(() => {
    const unsub = subscribeToGalleryPhotos((data) => {
      setGalleryPhotos(data);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time changes in room pricing
  useEffect(() => {
    const unsubPrices = subscribeToRoomPrices((prices) => {
      setRoomPrices(prices);
    });
    return () => unsubPrices();
  }, []);

  const handleUpdateRoomPrice = async (roomId: string, newPrice: number) => {
    const room = ROOMS.find((r) => r.id === roomId);
    await saveRoomPriceToDb(roomId, newPrice, room?.name, room?.propertyId);
    setRoomPrices((prev) => ({ ...prev, [roomId]: newPrice }));
  };

  const handleOpenManagePhotos = (galleryId: GalleryId = 'gangtok/exterior') => {
    setSelectedManageGallery(galleryId);
    setIsManagePhotosOpen(true);
  };

  const handleBookingCompleted = (summary: BookingConfirmationSummary) => {
    setBookingSuccessSummary(summary);
    setShowSuccessToast(true);
  };

  // Format standard date defaults
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDefault = new Date(tomorrow);
  checkoutDefault.setDate(checkoutDefault.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(formatDate(tomorrow));
  const [checkOutDate, setCheckOutDate] = useState<string>(formatDate(checkoutDefault));
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [purpose, setPurpose] = useState<'leisure' | 'medical' | 'corporate'>('leisure');

  // Loading shimmer state for inventory check (400-600ms)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);

  // Active room for booking modal
  const [activeBookingRoom, setActiveBookingRoom] = useState<Room | null>(null);

  // Search handler with realistic skeleton shimmer
  const handleSearch = () => {
    setIsLoadingAvailability(true);
    setTimeout(() => {
      setIsLoadingAvailability(false);
      const element = document.getElementById('properties');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  const handleSelectProperty = (prop: 'gangtok' | 'kalyani') => {
    setSelectedProperty(prop);
    if (prop === 'kalyani' && purpose === 'leisure') {
      setPurpose('medical');
    } else if (prop === 'gangtok' && purpose === 'medical') {
      setPurpose('leisure');
    }
    // Scroll smoothly to top so the chosen hotel is fully visible from the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNowCTA = () => {
    // Open booking modal for the first room of current property with dynamic rate
    const matchingRoom = ROOMS.find((r) => r.propertyId === selectedProperty) || ROOMS[0];
    const currentPrice = roomPrices[matchingRoom.id] ?? matchingRoom.pricePerNight;
    setActiveBookingRoom({ ...matchingRoom, pricePerNight: currentPrice });
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans theme-transition selection:bg-amber-400 selection:text-slate-950 ${
        isNight ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Tier 2: Required Google Maps Quota Defense Banner */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Sticky Navigation Bar with Day / Night Mood Toggle & Exclusive Menu Bar Property Switcher */}
      <Navbar
        selectedProperty={selectedProperty}
        onBookClick={handleBookNowCTA}
        onSelectProperty={handleSelectProperty}
        onOpenDatabaseRecords={() => setIsDatabaseModalOpen(true)}
        onOpenManagePhotos={() => handleOpenManagePhotos(selectedProperty === 'gangtok' ? 'gangtok/exterior' : 'kalyani/exterior')}
      />

      {/* Main Content Landmark */}
      <main className="flex-1 theme-transition">
        {/* Main Head Banner: Dedicated to the active hotel selected in menu bar */}
        <HeroBookingBar
          selectedProperty={selectedProperty}
          setSelectedProperty={setSelectedProperty}
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          checkOutDate={checkOutDate}
          setCheckOutDate={setCheckOutDate}
          adults={adults}
          setAdults={setAdults}
          childrenCount={childrenCount}
          setChildrenCount={setChildrenCount}
          purpose={purpose}
          setPurpose={setPurpose}
          onSearch={handleSearch}
          isLoading={isLoadingAvailability}
        />

        {/* Dedicated Property Showcases & Room Cards (Only for Active Hotel) */}
        <PropertyShowcase
          activeProperty={selectedProperty}
          purpose={purpose}
          onReserveRoom={(room) => setActiveBookingRoom(room)}
          isLoading={isLoadingAvailability}
          galleryPhotos={galleryPhotos}
          roomPrices={roomPrices}
          onOpenManagePhotos={handleOpenManagePhotos}
        />

        {/* Interactive Landmark Map & Distance Section for Selected Hotel */}
        <InteractiveMapSection selectedProperty={selectedProperty} />

        {/* Local Guides, Testimonials, Policies, & FAQs for Selected Hotel */}
        <LocalGuidesAndTrust selectedProperty={selectedProperty} />
      </main>

      {/* Footer with Contact Card for Selected Hotel & Quick Actions */}
      <Footer
        selectedProperty={selectedProperty}
        onBookNow={handleBookNowCTA}
        onSelectProperty={handleSelectProperty}
        onOpenDatabaseRecords={() => setIsDatabaseModalOpen(true)}
        onOpenManagePhotos={() => handleOpenManagePhotos(selectedProperty === 'gangtok' ? 'gangtok/exterior' : 'kalyani/exterior')}
      />

      {/* Cloud Firestore Database Records & Customer Input Modal */}
      <DatabaseRecordsModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onSelectProperty={handleSelectProperty}
      />

      {/* Persistent Cloud Photo Manager & Room Pricing Admin Panel */}
      <ManagePhotosModal
        isOpen={isManagePhotosOpen}
        onClose={() => setIsManagePhotosOpen(false)}
        galleryPhotos={galleryPhotos}
        initialGallery={selectedManageGallery}
        roomPrices={roomPrices}
        onUpdateRoomPrice={handleUpdateRoomPrice}
      />

      {/* Multi-Step Booking Funnel Modal */}
      {activeBookingRoom && (
        <BookingFunnelModal
          room={activeBookingRoom}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          adults={adults}
          childrenCount={childrenCount}
          purpose={purpose}
          roomPrices={roomPrices}
          galleryPhotos={galleryPhotos}
          onClose={() => {
            setActiveBookingRoom(null);
            if (bookingSuccessSummary) {
              setIsSuccessModalOpen(true);
            }
          }}
          onSuccess={handleBookingCompleted}
        />
      )}

      {/* Official Booking Success & Summary Voucher Modal */}
      <BookingSuccessModal
        summary={bookingSuccessSummary}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
      />

      {/* Floating Success Toast Notification with Reference Number & Quick Actions */}
      {showSuccessToast && (
        <BookingSuccessToast
          summary={bookingSuccessSummary}
          onOpenSummaryModal={() => setIsSuccessModalOpen(true)}
          onDismiss={() => setShowSuccessToast(false)}
        />
      )}

      {/* Non-intrusive floating help launcher */}
      <HelpChatBubble selectedProperty={selectedProperty} />

      {/* Dynamic Mobile Floating Dock with Call Desk & Instant Reserve Stay (Displays on phone screens) */}
      <MobileFloatingDock
        selectedProperty={selectedProperty}
        onBookClick={handleBookNowCTA}
      />
    </div>
  );
}

export default function App() {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={mapsApiKey} libraries={['places', 'marker']}>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </APIProvider>
  );
}
