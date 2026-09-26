import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Calendar,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  Building,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  PlusCircle,
  FileText,
  Trash2,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ParijaiLogo } from './ParijaiLogo';
import {
  BookingRecord,
  CustomerInquiry,
  DatabasePhoto,
  getAllBookingsFromDb,
  subscribeToBookings,
  getCustomerInquiriesFromDb,
  saveCustomerInquiryToDb,
  updateBookingStatus,
  getPhotosFromDb,
  deletePhotoFromDb
} from '../services/dbService';
import { PROPERTIES } from '../data/hotels';

interface DatabaseRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty?: (propertyId: 'gangtok' | 'kalyani') => void;
}

export const DatabaseRecordsModal: React.FC<DatabaseRecordsModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty
}) => {
  const { isNight } = useTheme();
  const [activeTab, setActiveTab] = useState<'bookings' | 'input' | 'inquiries' | 'pictures'>('bookings');

  // Bookings state
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState<'all' | 'gangtok' | 'kalyani'>('all');
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Pictures state
  const [gangtokPhotos, setGangtokPhotos] = useState<DatabasePhoto[]>([]);
  const [kalyaniPhotos, setKalyaniPhotos] = useState<DatabasePhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<DatabasePhoto | null>(null);

  // Customer Data Input Form state
  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputProperty, setInputProperty] = useState<'gangtok' | 'kalyani' | 'general'>('kalyani');
  const [inputSubject, setInputSubject] = useState('Medical Stay / Room Inquiry');
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load and subscribe to real-time data
  useEffect(() => {
    if (!isOpen) return;

    // Load bookings
    setLoadingBookings(true);
    const unsubBookings = subscribeToBookings((data) => {
      setBookings(data);
      setLoadingBookings(false);
    });

    // Load Inquiries
    setLoadingInquiries(true);
    getCustomerInquiriesFromDb().then((data) => {
      setInquiries(data);
      setLoadingInquiries(false);
    });

    // Load Photos
    loadPhotos();

    return () => {
      unsubBookings();
    };
  }, [isOpen]);

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const [gPhotos, kPhotos] = await Promise.all([
        getPhotosFromDb('gangtok'),
        getPhotosFromDb('kalyani')
      ]);
      setGangtokPhotos(gPhotos);
      setKalyaniPhotos(kPhotos);
    } catch (e) {
      console.warn('Error loading db photos', e);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleManualCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputPhone.trim()) return;

    setIsSubmitting(true);
    try {
      await saveCustomerInquiryToDb({
        name: inputName.trim(),
        phone: inputPhone.trim(),
        email: inputEmail.trim(),
        propertyId: inputProperty,
        subject: inputSubject,
        message: inputMessage.trim() || 'Direct Front Desk / Customer record logged.',
        source: 'frontdesk'
      });

      setSubmitSuccess(true);
      setInputName('');
      setInputPhone('');
      setInputEmail('');
      setInputMessage('');

      // Refresh inquiries
      const updated = await getCustomerInquiriesFromDb();
      setInquiries(updated);

      setTimeout(() => setSubmitSuccess(false), 3500);
    } catch (err) {
      console.warn('Notice saving customer data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDbPhoto = async (photoId: string) => {
    if (confirm('Delete this photo from Cloud Database?')) {
      await deletePhotoFromDb(photoId);
      loadPhotos();
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingRecord['status']) => {
    await updateBookingStatus(bookingId, newStatus);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  if (!isOpen) return null;

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesProperty = filterProperty === 'all' || b.propertyId === filterProperty;
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !cleanSearch ||
      b.bookingRef.toLowerCase().includes(cleanSearch) ||
      b.guestName.toLowerCase().includes(cleanSearch) ||
      b.guestPhone.includes(cleanSearch) ||
      b.roomName.toLowerCase().includes(cleanSearch);
    return matchesProperty && matchesSearch;
  });

  const totalPhotosCount = gangtokPhotos.length + kalyaniPhotos.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        className={`border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors duration-200 ${
          isNight ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <ParijaiLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                  Parijay Group of Hotels Database Records
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Firestore
                </span>
              </div>
              <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                Cloud database storage for property pictures, guest booking records, and customer inquiries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isNight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-4 sm:px-6 border-b flex gap-1 sm:gap-4 overflow-x-auto text-xs font-semibold ${
            isNight ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-amber-400 text-amber-500'
                : isNight
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Customer Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('input')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'input'
                ? 'border-amber-400 text-amber-500'
                : isNight
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Customer Record</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'border-amber-400 text-amber-500'
                : isNight
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pictures')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pictures'
                ? 'border-amber-400 text-amber-500'
                : isNight
                ? 'border-transparent text-slate-400 hover:text-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Picture Database ({totalPhotosCount})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: CUSTOMER BOOKINGS & RECORDS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Booking Ref, Guest Name, Mobile, or Room..."
                    className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none transition-colors ${
                      isNight
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Property:
                  </span>
                  <select
                    value={filterProperty}
                    onChange={(e) => setFilterProperty(e.target.value as any)}
                    className={`px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-pointer ${
                      isNight
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="all">All Locations</option>
                    <option value="gangtok">Trikuta Residency (Gangtok)</option>
                    <option value="kalyani">Hotel Parijaye (AIIMS Kalyani)</option>
                  </select>
                </div>
              </div>

              {/* Bookings List */}
              {loadingBookings ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Connecting to Cloud Firestore database...</span>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div
                  className={`p-10 rounded-2xl border text-center text-xs ${
                    isNight ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
                  <p className="font-semibold">No booking records found in database.</p>
                  <p className="text-[11px] mt-1">
                    Use the "Book Now" flow or "Add Customer Record" tab to record reservations into the live database.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isNight
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-3 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-amber-500 text-xs px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                            {b.bookingRef}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              b.propertyId === 'gangtok'
                                ? 'bg-amber-400/20 text-amber-400'
                                : 'bg-emerald-400/20 text-emerald-400'
                            }`}
                          >
                            {b.propertyName || (b.propertyId === 'gangtok' ? 'Trikuta Residency' : 'Hotel Parijaye')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Booked: {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Status:</span>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold uppercase cursor-pointer border ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : b.status === 'checked-in'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : b.status === 'completed'
                                ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="checked-in">Checked-in</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Guest and Stay Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Lead Guest</span>
                          <span className="font-semibold text-white">{b.guestName}</span>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{b.guestPhone}</span>
                          </div>
                          {b.guestEmail && (
                            <div className="flex items-center gap-1.5 text-slate-400 mt-0.5 text-[11px]">
                              <Mail className="w-3 h-3 text-amber-400" />
                              <span className="truncate">{b.guestEmail}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Room & Dates</span>
                          <span className="font-semibold text-white">{b.roomName}</span>
                          <div className="text-slate-400 mt-0.5">
                            {b.checkInDate} to {b.checkOutDate} ({b.nights} night{b.nights > 1 ? 's' : ''})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {b.adults} Adults · {b.childrenCount || 0} Children
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Purpose & Note</span>
                          <span className="capitalize font-semibold text-amber-400">
                            {b.purpose || 'Direct Stay'}
                          </span>
                          <div className="text-slate-400 mt-0.5 text-[11px] line-clamp-2">
                            {b.specialNeeds || 'No special requests'}
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-slate-400 block text-[11px]">Grand Total</span>
                          <span className="text-base font-bold font-mono text-emerald-400">
                            ₹{b.grandTotal ? b.grandTotal.toLocaleString('en-IN') : '0'}
                          </span>
                          <div className="text-[11px] text-slate-400 uppercase mt-0.5">
                            Pay via: {b.paymentMethod ? b.paymentMethod.replace('_', ' ') : 'Desk'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD CUSTOMER RECORD / INPUT */}
          {activeTab === 'input' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div
                className={`p-4 rounded-xl border text-xs ${
                  isNight ? 'bg-slate-950/70 border-slate-800' : 'bg-amber-50/70 border-amber-200 text-slate-700'
                }`}
              >
                <h4 className="font-bold text-sm mb-1 text-amber-500">Customer Data Entry & Intake</h4>
                <p>
                  Record direct walk-in guests, telephone patient inquiries from AIIMS Kalyani, or Sikkim mountain tour leads into the centralized Firebase database.
                </p>
              </div>

              {submitSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Customer record has been successfully committed to the database!</span>
                </div>
              )}

              <form onSubmit={handleManualCustomerSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Customer / Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Mukherjee"
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                        isNight
                          ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Primary Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      placeholder="e.g. +91 98312 34567"
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                        isNight
                          ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="e.g. guest@example.com"
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                        isNight
                          ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Target Property</label>
                    <select
                      value={inputProperty}
                      onChange={(e) => setInputProperty(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none cursor-pointer ${
                        isNight
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="kalyani">Hotel Parijaye — AIIMS Kalyani</option>
                      <option value="gangtok">Trikuta Residency — Gangtok, Sikkim</option>
                      <option value="general">General Group Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Inquiry / Record Subject</label>
                  <input
                    type="text"
                    required
                    value={inputSubject}
                    onChange={(e) => setInputSubject(e.target.value)}
                    placeholder="e.g. AIIMS OPD Appointment Stay or Nathula Pass Permit Query"
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                      isNight
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Notes / Requirements / Health Assistance</label>
                  <textarea
                    rows={3}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Enter details such as wheelchair assistance, low-salt diet kitchen requirement, or expected check-in time..."
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${
                      isNight
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Cloud Database...</span>
                    </>
                  ) : (
                    <span>Save Customer Record into Database</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CUSTOMER INQUIRIES & LEADS */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Total Customer Inquiries Recorded: {inquiries.length}
                </span>
                <button
                  onClick={() => {
                    setLoadingInquiries(true);
                    getCustomerInquiriesFromDb().then((d) => {
                      setInquiries(d);
                      setLoadingInquiries(false);
                    });
                  }}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div
                  className={`p-10 rounded-2xl border text-center text-xs ${
                    isNight ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
                  <p className="font-semibold">No inquiries recorded yet.</p>
                  <p className="text-[11px] mt-1">
                    When visitors subscribe to updates or submit inquiries, they appear here in the database.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className={`p-4 rounded-xl border text-xs transition-all ${
                        isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{inq.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-amber-400/20 text-amber-400">
                            {inq.source}
                          </span>
                          {inq.propertyId && (
                            <span className="text-[10px] px-2 py-0.5 rounded capitalize bg-slate-800 text-slate-300">
                              {inq.propertyId}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="font-medium text-amber-400 mb-1">{inq.subject}</div>
                      <p className="text-slate-300">{inq.message}</p>

                      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{inq.phone}</span>
                          </a>
                        )}
                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}`}
                            className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                          >
                            <Mail className="w-3 h-3 text-amber-400" />
                            <span>{inq.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PICTURE DATABASE */}
          {activeTab === 'pictures' && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isNight ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-amber-500">Cloud Picture Database</h4>
                  <p className="text-slate-400 text-[11px]">
                    All photos uploaded across Trikuta Residency (Gangtok) and Hotel Parijaye (AIIMS Kalyani) are indexed in Cloud Firestore.
                  </p>
                </div>
                <button
                  onClick={loadPhotos}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPhotos ? 'animate-spin' : ''}`} />
                  <span>Refresh Cloud Photos</span>
                </button>
              </div>

              {/* Trikuta Residency (Gangtok) Photos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-sm text-amber-400">
                    Trikuta Residency Pictures (Gangtok) — {gangtokPhotos.length}
                  </h5>
                  {onSelectProperty && (
                    <button
                      onClick={() => {
                        onSelectProperty('gangtok');
                        onClose();
                      }}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Open Gangtok Gallery →
                    </button>
                  )}
                </div>

                {gangtokPhotos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No photos stored yet for Trikuta Residency.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {gangtokPhotos.map((p) => (
                      <div
                        key={p.id}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                      >
                        <img
                          src={p.url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPhotoPreview(p)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDbPhoto(p.id)}
                            className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white cursor-pointer"
                            title="Delete from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-slate-950/80 px-1 py-0.5 rounded truncate">
                          {p.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hotel Parijaye (AIIMS Kalyani) Photos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-sm text-emerald-400">
                    Hotel Parijaye Pictures (AIIMS Kalyani) — {kalyaniPhotos.length}
                  </h5>
                  {onSelectProperty && (
                    <button
                      onClick={() => {
                        onSelectProperty('kalyani');
                        onClose();
                      }}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Open Kalyani Gallery →
                    </button>
                  )}
                </div>

                {kalyaniPhotos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No photos stored yet for Hotel Parijaye.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {kalyaniPhotos.map((p) => (
                      <div
                        key={p.id}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                      >
                        <img
                          src={p.url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPhotoPreview(p)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDbPhoto(p.id)}
                            className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white cursor-pointer"
                            title="Delete from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-slate-950/80 px-1 py-0.5 rounded truncate">
                          {p.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Lightbox for Database Picture */}
        {selectedPhotoPreview && (
          <div
            className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoPreview(null)}
          >
            <div
              className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{selectedPhotoPreview.title}</span>
                <button
                  onClick={() => setSelectedPhotoPreview(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={selectedPhotoPreview.url}
                  alt={selectedPhotoPreview.title}
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
