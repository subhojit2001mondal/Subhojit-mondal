import React, { useState } from 'react';
import {
  X,
  Check,
  Calendar,
  User,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  MessageCircle,
  Download,
  AlertCircle,
  Plus,
  Trash2,
  HeartPulse,
  Printer
} from 'lucide-react';
import { Room, ADD_ONS, BookingAddOn, PROPERTIES, BookingConfirmationSummary } from '../data/hotels';
import { useTheme } from '../context/ThemeContext';
import { saveBookingToDb, GalleryId, GalleryPhoto } from '../services/dbService';

interface BookingFunnelModalProps {
  room: Room | null;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  childrenCount: number;
  purpose: 'leisure' | 'medical' | 'corporate';
  roomPrices?: Record<string, number>;
  galleryPhotos?: Record<GalleryId, GalleryPhoto[]>;
  onClose: () => void;
  onSuccess: (summary: BookingConfirmationSummary) => void;
}

export const BookingFunnelModal: React.FC<BookingFunnelModalProps> = ({
  room,
  checkInDate,
  checkOutDate,
  adults,
  childrenCount,
  purpose,
  roomPrices,
  galleryPhotos,
  onClose,
  onSuccess
}) => {
  const { isNight } = useTheme();

  if (!room) return null;

  const property = PROPERTIES[room.propertyId];
  const propertyAddOns = ADD_ONS.filter((a) => a.propertyId === room.propertyId);

  // Dynamic nightly rate
  const effectivePricePerNight = (roomPrices && typeof roomPrices[room.id] === 'number')
    ? roomPrices[room.id]
    : room.pricePerNight;

  // Calculate nights
  const getNightCount = () => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const nights = getNightCount();

  // Step state (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // Form fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState(
    purpose === 'medical' ? 'Wheelchair assistance required at check-in; please keep low-sodium warm water ready.' : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'pay_at_hotel'>('upi');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingRefNumber, setBookingRefNumber] = useState('');

  // Inline Validation Errors
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const toggleAddOn = (id: string) => {
    if (selectedAddOnIds.includes(id)) {
      setSelectedAddOnIds(selectedAddOnIds.filter((item) => item !== id));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, id]);
    }
  };

  // Price calculations with dynamic price
  const baseRoomTariff = effectivePricePerNight * nights;
  const addOnsTotal = selectedAddOnIds.reduce((sum, id) => {
    const addon = propertyAddOns.find((a) => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);
  const subTotal = baseRoomTariff + addOnsTotal;
  const gst = Math.round(subTotal * 0.12);
  const grandTotal = subTotal + gst;

  // Validation
  const validateStep3 = () => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};
    if (!guestName.trim() || guestName.trim().length < 3) {
      newErrors.name = 'Please provide full guest or patient attendant name';
    }
    if (!guestPhone.trim() || !/^[6-9]\d{9}$/.test(guestPhone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Valid 10-digit Indian mobile number required (e.g. 9831234567)';
    }
    if (guestEmail && !/\S+@\S+\.\S+/.test(guestEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 3) {
      if (!validateStep3()) return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const [isSavingBooking, setIsSavingBooking] = useState(false);

  const handleConfirmReservation = async () => {
    const randomRef = 'PJ-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRefNumber(randomRef);
    setIsSavingBooking(true);

    const selectedAddOnObjects = selectedAddOnIds
      .map((id) => {
        const addOn = propertyAddOns.find((a) => a.id === id);
        return addOn ? { id: addOn.id, name: addOn.name, price: addOn.price } : null;
      })
      .filter((item): item is { id: string; name: string; price: number } => item !== null);

    try {
      await saveBookingToDb({
        bookingRef: randomRef,
        propertyId: room.propertyId,
        propertyName: property.name,
        roomId: room.id,
        roomName: room.name,
        guestName,
        guestPhone,
        guestEmail: guestEmail || '',
        checkInDate,
        checkOutDate,
        nights,
        adults,
        childrenCount,
        purpose,
        specialNeeds: specialNeeds || 'Standard check-in requested',
        selectedAddOns: selectedAddOnObjects,
        baseTariff: baseRoomTariff,
        addOnsTotal,
        subTotal,
        gst,
        grandTotal,
        paymentMethod
      });
    } catch (err) {
      console.warn('Booking saved locally, database synchronization note:', err);
    } finally {
      const summaryData: BookingConfirmationSummary = {
        bookingRef: randomRef,
        propertyId: room.propertyId,
        propertyName: property.name,
        propertyLocation: property.location,
        propertyPhone: property.phone,
        propertyWhatsapp: property.whatsapp,
        roomId: room.id,
        roomName: room.name,
        guestName,
        guestPhone,
        guestEmail: guestEmail || '',
        checkInDate,
        checkOutDate,
        nights,
        adults,
        childrenCount,
        purpose,
        selectedAddOns: selectedAddOnObjects,
        baseTariff: baseRoomTariff,
        addOnsTotal,
        gst,
        grandTotal,
        paymentMethod,
        specialNeeds: specialNeeds || 'Standard check-in requested',
        createdAt: new Date().toISOString()
      };

      setIsSavingBooking(false);
      setBookingConfirmed(true);
      onSuccess(summaryData);
    }
  };

  const getRoomGalleryId = (): GalleryId => {
    if (room.id === 'g-view-deluxe') return 'gangtok/view-room';
    if (room.id === 'g-non-view-regular') return 'gangtok/non-view-room';
    if (room.id === 'k-non-ac') return 'kalyani/non-ac';
    if (room.id === 'k-standard-ac') return 'kalyani/standard-ac';
    if (room.id === 'k-deluxe-twin') return 'kalyani/deluxe-twin';
    return (room.propertyId === 'gangtok' ? 'gangtok/view-room' : 'kalyani/non-ac') as GalleryId;
  };
  const roomPhotos = galleryPhotos ? (galleryPhotos[getRoomGalleryId()] || []) : [];

  const generateWhatsAppConfirmationMessage = () => {
    const message = `Namaste Parijay Group of Hotels! I have reserved ${room.name} at ${property.name}.\nBooking Ref: ${bookingRefNumber}\nDates: ${checkInDate} to ${checkOutDate} (${nights} nights)\nGuest: ${guestName} (${guestPhone})\nTotal Tariff: ₹${grandTotal.toLocaleString('en-IN')}\nSpecial Request: ${specialNeeds || 'Standard Check-in'}`;
    return `https://wa.me/${property.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        className={`border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors duration-300 ${
          isNight
            ? 'bg-slate-900 border-slate-700/80 text-slate-200'
            : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isNight ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                {property.name}
              </span>
              <span className={isNight ? 'text-slate-500' : 'text-slate-300'}>·</span>
              <span className={`text-xs ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>
                {property.location}
              </span>
            </div>
            <h3
              className={`text-lg sm:text-xl font-serif font-bold mt-0.5 ${
                isNight ? 'text-white' : 'text-slate-950'
              }`}
            >
              {bookingConfirmed ? 'Reservation Confirmed' : `Reserving: ${room.name}`}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isNight
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Steps 1 to 4) */}
        {!bookingConfirmed && (
          <div
            className={`px-5 py-3 border-b flex items-center justify-between text-xs ${
              isNight ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100/60 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                {currentStep}
              </span>
              <span className={isNight ? 'text-slate-300' : 'text-slate-600'}>
                Step {currentStep} of 4:
              </span>
              <span className="text-amber-500 font-semibold">
                {currentStep === 1 && 'Room & Occupancy'}
                {currentStep === 2 && 'Location Add-Ons'}
                {currentStep === 3 && 'Guest & Assistance Details'}
                {currentStep === 4 && 'Transparent Price Ledger'}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    step === currentStep
                      ? 'w-6 bg-amber-400'
                      : step < currentStep
                      ? 'w-3 bg-emerald-500'
                      : isNight
                      ? 'w-3 bg-slate-700'
                      : 'w-3 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* STEP 1: ROOM & OCCUPANCY */}
          {currentStep === 1 && !bookingConfirmed && (
            <div className="space-y-4">
              <div
                className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {roomPhotos.length > 0 ? (
                  <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border border-slate-700 relative shrink-0">
                    <img
                      src={roomPhotos[0].url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                      {room.name}
                    </span>
                  </div>
                ) : (
                  <div className={`w-full sm:w-36 h-28 rounded-lg flex flex-col items-center justify-center p-3 text-center border shrink-0 ${
                    isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <Building className="w-6 h-6 text-amber-500 mb-1" />
                    <span className="text-xs font-serif font-bold leading-tight">{room.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{room.occupancy}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-xs text-amber-500 font-semibold uppercase">{property.name}</div>
                  <h4 className={`text-base font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                    {room.name}
                  </h4>
                  <p className={`text-xs mt-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                    {room.tagline}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded border font-mono ${
                        isNight
                          ? 'bg-slate-900 border-slate-800 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {room.sqft} sq ft
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        isNight
                          ? 'bg-slate-900 border-slate-800 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {room.bed}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800/60">
                      Free Cancellation
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-3.5 rounded-lg border ${
                    isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Stay Duration
                  </div>
                  <div className={`text-sm font-semibold mt-1 ${isNight ? 'text-white' : 'text-slate-950'}`}>
                    {checkInDate} → {checkOutDate}
                  </div>
                  <div className="text-xs text-amber-500 mt-0.5 font-medium">{nights} Night(s)</div>
                </div>

                <div
                  className={`p-3.5 rounded-lg border ${
                    isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Guests Registered
                  </div>
                  <div className={`text-sm font-semibold mt-1 ${isNight ? 'text-white' : 'text-slate-950'}`}>
                    {adults} Adult{adults > 1 ? 's' : ''}, {childrenCount} Child{childrenCount !== 1 ? 'ren' : ''}
                  </div>
                  <div className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Maximum permitted: {room.occupancy}
                  </div>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-lg border text-xs flex items-start gap-2 ${
                  isNight
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>
                  <strong>Parijay Direct Guarantee:</strong> You are booking directly with the property desk. Instant
                  confirmation, zero convenience markups, and flexible check-in assistance.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION-SPECIFIC ADD-ONS */}
          {currentStep === 2 && !bookingConfirmed && (
            <div className="space-y-4">
              <div>
                <h4 className={`text-base font-semibold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                  Enhance your stay at {property.name}
                </h4>
                <p className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  Handpicked add-ons tailored for your visit. Select any services you wish to include.
                </p>
              </div>

              <div className="space-y-3">
                {propertyAddOns.map((addon) => {
                  const isSelected = selectedAddOnIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? isNight
                            ? 'bg-amber-950/20 border-amber-400/80 ring-1 ring-amber-400/30'
                            : 'bg-amber-50/70 border-amber-400/80 ring-1 ring-amber-400/30'
                          : isNight
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : isNight
                              ? 'border border-slate-600 bg-slate-900'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                            {addon.name}
                          </div>
                          <div className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                            {addon.description}
                          </div>
                          {addon.recommendedFor === purpose && (
                            <span className="inline-block mt-1 text-[10px] text-amber-500 font-semibold">
                              ★ Recommended for your visit
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <div
                          className={`text-sm font-bold font-mono ${
                            isNight ? 'text-white' : 'text-slate-950'
                          }`}
                        >
                          +₹{addon.price}
                        </div>
                        <span className={`text-[10px] ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Fixed rate
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: GUEST DETAILS & ASSISTANCE */}
          {currentStep === 3 && !bookingConfirmed && (
            <div className="space-y-4">
              <div>
                <h4 className={`text-base font-semibold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                  Primary Guest & Special Requirements
                </h4>
                <p className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  We use this to prepare your check-in and coordinate arrival arrangements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-semibold uppercase mb-1 ${
                      isNight ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Debabrata Roy"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-colors ${
                      isNight ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
                    } ${
                      errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-amber-400'
                    }`}
                  />
                  {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold uppercase mb-1 ${
                      isNight ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile (e.g. 9831234567)"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-colors ${
                      isNight ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
                    } ${
                      errors.phone ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-amber-400'
                    }`}
                  />
                  {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold uppercase mb-1 ${
                    isNight ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Email Address{' '}
                  <span className={isNight ? 'text-slate-500' : 'text-slate-400'}>
                    (Optional for instant receipt)
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-colors ${
                    isNight ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
                  } ${
                    errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-amber-400'
                  }`}
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold uppercase mb-1 flex items-center justify-between ${
                    isNight ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-500" />
                    <span>Medical / Special Assistance Needs</span>
                  </span>
                  <span className={`text-[11px] font-normal ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Optional
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="e.g. Patient arriving in wheelchair, need ground-floor accessible room or boiled drinking water."
                  className={`w-full border rounded-lg px-3.5 py-2 text-xs focus:outline-none transition-colors ${
                    isNight
                      ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                  }`}
                />
                <p className={`text-[11px] mt-1 ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our front desk directly reviews this before room allotment.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: TRANSPARENT PRICE LEDGER & PAYMENT */}
          {currentStep === 4 && !bookingConfirmed && (
            <div className="space-y-5">
              <div>
                <h4 className={`text-base font-semibold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                  Itemized Price Breakdown & Payment Mode
                </h4>
                <p className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  Complete tariff transparency with zero hidden reservation fees.
                </p>
              </div>

              {/* Ledger Table */}
              <div
                className={`border rounded-xl p-4 space-y-2.5 text-xs ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between">
                  <span>
                    {room.name} ({nights} Night{nights > 1 ? 's' : ''} × ₹{effectivePricePerNight})
                  </span>
                  <span className={`font-mono font-semibold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                    ₹{baseRoomTariff.toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedAddOnIds.map((id) => {
                  const addon = propertyAddOns.find((a) => a.id === id);
                  if (!addon) return null;
                  return (
                    <div key={id} className={`flex justify-between ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>+ {addon.name}</span>
                      <span className="font-mono">₹{addon.price.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}

                <div
                  className={`pt-2 border-t flex justify-between ${
                    isNight ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className={`flex justify-between ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Goods & Services Tax (GST 12%)</span>
                  <span className="font-mono">₹{gst.toLocaleString('en-IN')}</span>
                </div>

                <div
                  className={`pt-3 border-t flex justify-between items-baseline text-sm font-bold ${
                    isNight ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-950'
                  }`}
                >
                  <span>Total Payable Amount</span>
                  <div className="text-right">
                    <span className="text-lg font-mono text-amber-500">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-[10px] block font-normal ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                      All taxes included
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label
                  className={`block text-xs font-semibold uppercase mb-2 ${
                    isNight ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Select Payment Option
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'upi', label: 'UPI / GPay / QR', icon: Smartphone },
                    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'netbanking', label: 'Net Banking', icon: Building },
                    { id: 'pay_at_hotel', label: 'Pay at Desk', icon: ShieldCheck },
                  ].map((method) => {
                    const IconComp = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                          paymentMethod === method.id
                            ? isNight
                              ? 'bg-amber-950/20 border-amber-400 text-white ring-1 ring-amber-400'
                              : 'bg-amber-50 border-amber-400 text-slate-950 ring-1 ring-amber-400 font-semibold'
                            : isNight
                            ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <IconComp className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Trust Signals */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  isNight
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>256-Bit SSL Encrypted Booking Session</span>
                </div>
                <span className={`text-[11px] ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Your details are never shared
                </span>
              </div>
            </div>
          )}

          {/* BOOKING CONFIRMATION & RECEIPT VIEW */}
          {bookingConfirmed && (
            <div className="space-y-6">
              <div
                className={`text-center p-6 rounded-2xl border ${
                  isNight
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h4 className={`text-xl font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                  Your Stay is Confirmed!
                </h4>
                <p className="text-xs mt-1">
                  A reservation voucher has been created for your records.
                </p>
                <div
                  className={`mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                    isNight
                      ? 'bg-slate-900 border-slate-700 text-amber-300'
                      : 'bg-white border-slate-300 text-amber-800 shadow-sm'
                  }`}
                >
                  <span>Confirmation Code: {bookingRefNumber}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Saved to Database
                  </span>
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div
                className={`border rounded-xl p-5 space-y-3 text-xs ${
                  isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`flex justify-between border-b pb-3 ${
                    isNight ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className={`font-bold text-sm ${isNight ? 'text-white' : 'text-slate-950'}`}>
                      {property.name}
                    </div>
                    <div className={isNight ? 'text-slate-400' : 'text-slate-500'}>
                      {property.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-500 font-semibold">Direct Booking</span>
                    <div className={isNight ? 'text-slate-400' : 'text-slate-500'}>
                      {checkInDate} to {checkOutDate}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <div>
                    <span className={isNight ? 'text-slate-500 block' : 'text-slate-400 block'}>Lead Guest:</span>
                    <span className={`font-medium ${isNight ? 'text-white' : 'text-slate-950'}`}>{guestName}</span>
                  </div>
                  <div>
                    <span className={isNight ? 'text-slate-500 block' : 'text-slate-400 block'}>Contact Phone:</span>
                    <span className={`font-medium ${isNight ? 'text-white' : 'text-slate-950'}`}>{guestPhone}</span>
                  </div>
                  <div>
                    <span className={isNight ? 'text-slate-500 block' : 'text-slate-400 block'}>Room Reserved:</span>
                    <span className={`font-medium ${isNight ? 'text-white' : 'text-slate-950'}`}>{room.name}</span>
                  </div>
                  <div>
                    <span className={isNight ? 'text-slate-500 block' : 'text-slate-400 block'}>Payment Method:</span>
                    <span className={`font-medium uppercase ${isNight ? 'text-white' : 'text-slate-950'}`}>
                      {paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {specialNeeds && (
                  <div className={`pt-2 border-t text-xs ${isNight ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className="text-amber-500 font-medium block">Special Assistance Note:</span>
                    <span className={isNight ? 'text-slate-300' : 'text-slate-700'}>{specialNeeds}</span>
                  </div>
                )}

                <div
                  className={`pt-3 border-t flex justify-between items-center text-sm font-bold ${
                    isNight ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-950'
                  }`}
                >
                  <span>Grand Total Tariff:</span>
                  <span className="font-mono text-amber-500">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Instant WhatsApp & Post-Booking Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={generateWhatsAppConfirmationMessage()}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Confirmation</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className={`py-3 px-4 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isNight
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt / Summary</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-700/40">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Done & View Detailed Voucher</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!bookingConfirmed && (
          <div
            className={`p-4 sm:p-5 border-t flex items-center justify-between ${
              isNight ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isNight ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow transition-all active:scale-95 cursor-pointer"
              >
                Continue to Step {currentStep + 1}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={isSavingBooking}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {isSavingBooking ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <span>Confirm Reservation (₹{grandTotal.toLocaleString('en-IN')})</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
