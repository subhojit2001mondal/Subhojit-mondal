import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  Mail,
  Key,
  LogOut,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Link as LinkIcon,
  ShieldCheck,
  Building,
  Mountain,
  Tag,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Wind,
  Sparkles,
  HeartPulse,
  Compass,
  UtensilsCrossed,
  Bed,
  Search,
  Phone,
  PhoneCall,
  MessageCircle,
  Calendar,
  User,
  Clock,
  Edit,
  Plus,
  Copy,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  GalleryId,
  GalleryPhoto,
  GALLERY_CONFIGS,
  normalizeGalleryId,
  uploadGalleryPhoto,
  saveGalleryPhotoUrl,
  deleteGalleryPhotoFromDb,
  saveRoomPriceToDb,
  BookingRecord,
  CustomerInquiry,
  subscribeToBookings,
  getCustomerInquiriesFromDb,
  deleteBookingFromDb,
  deleteCustomerInquiryFromDb,
  ContactNumber,
  formatTelLink,
  formatWhatsAppLink,
  TouristSpot
} from '../services/dbService';
import { useContact } from '../context/ContactContext';
import { useTouristSpots } from '../context/TouristSpotsContext';
import { DEFAULT_ROOM_PRICES, ROOMS } from '../data/hotels';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { ParijaiLogo } from './ParijaiLogo';

// =========================================================================
// ADMIN ACCESS PASSWORD CONFIGURATION
// The simple password for admin access is set below.
// To change the password, edit this variable directly in code.
// No hint is shown to visitors or users.
// =========================================================================
export const ADMIN_PASSWORD = 'parijay group of hotels';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryPhotos: Record<GalleryId, GalleryPhoto[]>;
  initialGallery?: GalleryId;
  roomPrices: Record<string, number>;
  onUpdateRoomPrice?: (roomId: string, newPrice: number) => Promise<void>;
  initialTab?: 'customers' | 'photos' | 'pricing' | 'contacts' | 'touristSpots';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  galleryPhotos,
  initialGallery = 'gangtok/exterior',
  roomPrices,
  onUpdateRoomPrice,
  initialTab = 'customers'
}) => {
  const { isNight } = useTheme();
  const { contacts, saveContact, deleteContact } = useContact();

  // Authentication State: Simple Password
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('parijay_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Active Admin Section Tab: 1. Customer Details, 2. Photo Galleries, 3. Room Pricing, 4. Contact Numbers, 5. Tourist Spots
  const [activeTab, setActiveTab] = useState<'customers' | 'photos' | 'pricing' | 'contacts' | 'touristSpots'>(initialTab);

  // -------------------------------------------------------------
  // SECTION 1: CUSTOMER DETAILS STATE
  // -------------------------------------------------------------
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [customerFilter, setCustomerFilter] = useState<'all' | 'gangtok' | 'kalyani'>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [recordTypeTab, setRecordTypeTab] = useState<'bookings' | 'inquiries'>('bookings');
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; type: 'booking' | 'inquiry'; name: string } | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // -------------------------------------------------------------
  // SECTION 2: PHOTO GALLERIES STATE
  // -------------------------------------------------------------
  const normalizedInitial = normalizeGalleryId(initialGallery);
  const [expandedProperty, setExpandedProperty] = useState<'gangtok' | 'kalyani'>(
    normalizedInitial.startsWith('kalyani') ? 'kalyani' : 'gangtok'
  );
  const [activeGallery, setActiveGallery] = useState<GalleryId>(normalizedInitial);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // -------------------------------------------------------------
  // SECTION 3: ROOM PRICING STATE
  // -------------------------------------------------------------
  const [editablePrices, setEditablePrices] = useState<Record<string, number>>(() => ({
    ...DEFAULT_ROOM_PRICES,
    ...roomPrices
  }));
  const [savingRoomId, setSavingRoomId] = useState<string | null>(null);
  const [savedRoomId, setSavedRoomId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // SECTION 4: CONTACT NUMBERS STATE
  // -------------------------------------------------------------
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactFormId, setContactFormId] = useState<string | null>(null);
  const [contactLabel, setContactLabel] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactProperty, setContactProperty] = useState<'gangtok' | 'kalyani' | 'both'>('gangtok');
  const [contactPurpose, setContactPurpose] = useState<'call' | 'whatsapp' | 'both'>('both');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);
  const [contactFormError, setContactFormError] = useState<string | null>(null);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactNumber | null>(null);

  // -------------------------------------------------------------
  // SECTION 5: TOURIST SPOTS STATE
  // -------------------------------------------------------------
  const {
    spots: touristSpots,
    addSpot,
    updateSpot,
    deleteSpot,
    moveSpotUp,
    moveSpotDown,
    toggleVisibility,
    uploadPhoto: uploadTouristPhoto
  } = useTouristSpots();

  const [isEditingSpot, setIsEditingSpot] = useState(false);
  const [spotFormId, setSpotFormId] = useState<string | null>(null);
  const [spotName, setSpotName] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [spotDistance, setSpotDistance] = useState('');
  const [spotPhotoUrl, setSpotPhotoUrl] = useState('');
  const [spotIsVisible, setSpotIsVisible] = useState(true);
  const [spotFormError, setSpotFormError] = useState<string | null>(null);
  const [isSavingSpot, setIsSavingSpot] = useState(false);
  const [isUploadingSpotPhoto, setIsUploadingSpotPhoto] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState<TouristSpot | null>(null);
  const [isDeletingSpot, setIsDeletingSpot] = useState(false);
  const [spotSearchQuery, setSpotSearchQuery] = useState('');
  const [spotFilterStatus, setSpotFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const spotFileInputRef = useRef<HTMLInputElement>(null);

  // Update room prices when props change
  useEffect(() => {
    setEditablePrices((prev) => ({
      ...prev,
      ...roomPrices
    }));
  }, [roomPrices]);

  // Load customer records when authenticated and modal open
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    setLoadingRecords(true);

    const unsubBookings = subscribeToBookings((data) => {
      setBookings(data);
      setLoadingRecords(false);
    });

    getCustomerInquiriesFromDb().then((data) => {
      setInquiries(data);
    });

    return () => {
      unsubBookings();
    };
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // SIMPLE PASSWORD AUTHENTICATION ACTIONS
  // -------------------------------------------------------------
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Please enter the password.');
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordError(null);

    // Exact check against the configured ADMIN_PASSWORD
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      try {
        await signInWithEmailAndPassword(auth, 'admin@parijay.com', passwordInput.trim());
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('parijay_admin_auth', 'true');
        } catch {
          // ignore
        }
        setPasswordInput('');
        setPasswordError(null);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
          setPasswordError('Security Setup Required: Please create the account "admin@parijay.com" with your password in Firebase Authentication.');
        } else {
          setPasswordError('Firebase Auth Error: ' + (err.message || err));
        }
      }
    } else {
      setPasswordError('Incorrect password. Access denied.');
    }
    setIsSubmittingPassword(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('parijay_admin_auth');
    } catch {
      // ignore
    }
    setPasswordInput('');
    setPasswordError(null);
  };

  // -------------------------------------------------------------
  // CUSTOMER DETAILS ACTIONS
  // -------------------------------------------------------------
  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    setIsDeletingRecord(true);
    try {
      if (recordToDelete.type === 'booking') {
        await deleteBookingFromDb(recordToDelete.id);
        setBookings((prev) => prev.filter((b) => b.id !== recordToDelete.id));
      } else {
        await deleteCustomerInquiryFromDb(recordToDelete.id);
        setInquiries((prev) => prev.filter((i) => i.id !== recordToDelete.id));
      }
      setRecordToDelete(null);
    } catch (err: any) {
      alert('Error deleting record: ' + (err?.message || err));
    } finally {
      setIsDeletingRecord(false);
    }
  };

  const handleCopyCustomerPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesProperty =
      customerFilter === 'all' ? true : b.propertyId === customerFilter;
    const cleanSearch = customerSearch.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      b.guestName.toLowerCase().includes(cleanSearch) ||
      b.guestPhone.includes(cleanSearch) ||
      b.bookingRef.toLowerCase().includes(cleanSearch) ||
      b.roomName.toLowerCase().includes(cleanSearch) ||
      b.propertyName.toLowerCase().includes(cleanSearch);
    return matchesProperty && matchesSearch;
  });

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesProperty =
      customerFilter === 'all' ? true : inq.propertyId === customerFilter;
    const cleanSearch = customerSearch.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      inq.name.toLowerCase().includes(cleanSearch) ||
      inq.phone.includes(cleanSearch) ||
      inq.subject.toLowerCase().includes(cleanSearch) ||
      inq.message.toLowerCase().includes(cleanSearch);
    return matchesProperty && matchesSearch;
  });

  // -------------------------------------------------------------
  // PHOTO GALLERIES ACTIONS
  // -------------------------------------------------------------
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''} to database & storage...`);
    setErrorStatus(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadGalleryPhoto(activeGallery, file);
      }
      setUploadStatus(`Successfully stored ${files.length} photo${files.length > 1 ? 's' : ''} in cloud database!`);
      setTimeout(() => setUploadStatus(null), 3500);
    } catch (err: any) {
      console.warn('Upload notice:', err);
      setErrorStatus(err.message || 'Error saving photo to cloud storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setIsUploading(true);
    setUploadStatus('Saving photo URL to Firestore...');
    try {
      await saveGalleryPhotoUrl(activeGallery, imageUrl.trim(), imageTitle.trim());
      setImageUrl('');
      setImageTitle('');
      setShowUrlInput(false);
      setUploadStatus('Photo successfully saved to cloud database!');
      setTimeout(() => setUploadStatus(null), 3500);
    } catch (err: any) {
      setErrorStatus(err.message || 'Error saving photo URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    if (confirm(`Delete this photo? This will immediately remove it from the database and the live website page.`)) {
      try {
        await deleteGalleryPhotoFromDb(photo);
        if (previewPhoto?.id === photo.id) setPreviewPhoto(null);
      } catch (err: any) {
        alert('Failed to delete photo: ' + err.message);
      }
    }
  };

  const gangtokGalleries: { id: GalleryId; icon: React.ReactNode }[] = [
    { id: 'gangtok/exterior', icon: <Building className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/view-room', icon: <Mountain className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/non-view-room', icon: <Bed className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/reception', icon: <Compass className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/dining', icon: <UtensilsCrossed className="w-4 h-4 text-amber-500" /> }
  ];

  const kalyaniGalleries: { id: GalleryId; icon: React.ReactNode }[] = [
    { id: 'kalyani/exterior', icon: <Building className="w-4 h-4 text-emerald-400" /> },
    { id: 'kalyani/non-ac', icon: <Wind className="w-4 h-4 text-emerald-400" /> },
    { id: 'kalyani/standard-ac', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
    { id: 'kalyani/deluxe-twin', icon: <HeartPulse className="w-4 h-4 text-emerald-400" /> },
    { id: 'kalyani/reception', icon: <Compass className="w-4 h-4 text-emerald-400" /> },
    { id: 'kalyani/dining', icon: <UtensilsCrossed className="w-4 h-4 text-emerald-400" /> }
  ];

  const currentGalleryPhotos = galleryPhotos[activeGallery] || [];
  const galleryConfig = GALLERY_CONFIGS[activeGallery] || GALLERY_CONFIGS['gangtok/exterior'];
  const totalPhotosCount = Object.values(galleryPhotos).reduce((acc, list) => acc + (list?.length || 0), 0);

  // -------------------------------------------------------------
  // ROOM PRICING ACTIONS
  // -------------------------------------------------------------
  const handleSavePrice = async (roomId: string) => {
    const newRate = editablePrices[roomId];
    if (typeof newRate !== 'number' || isNaN(newRate) || newRate <= 0) {
      alert('Please enter a valid nightly rate');
      return;
    }

    setSavingRoomId(roomId);
    try {
      const room = ROOMS.find((r) => r.id === roomId);
      if (onUpdateRoomPrice) {
        await onUpdateRoomPrice(roomId, newRate);
      } else {
        await saveRoomPriceToDb(roomId, newRate, room?.name, room?.propertyId);
      }
      setSavedRoomId(roomId);
      setTimeout(() => setSavedRoomId(null), 3000);
    } catch (err: any) {
      alert('Error updating room price: ' + (err?.message || err));
    } finally {
      setSavingRoomId(null);
    }
  };

  const gangtokRooms = ROOMS.filter((r) => r.propertyId === 'gangtok');
  const kalyaniRooms = ROOMS.filter((r) => r.propertyId === 'kalyani');

  // -------------------------------------------------------------
  // CONTACT NUMBERS ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddContact = () => {
    setContactFormId(null);
    setContactLabel('');
    setContactPhone('+91 ');
    setContactProperty('gangtok');
    setContactPurpose('both');
    setContactIsPrimary(false);
    setContactFormError(null);
    setIsEditingContact(true);
  };

  const handleOpenEditContact = (contact: ContactNumber) => {
    setContactFormId(contact.id);
    setContactLabel(contact.label);
    setContactPhone(contact.phoneNumber);
    setContactProperty(contact.property);
    setContactPurpose(contact.purpose);
    setContactIsPrimary(contact.isPrimary);
    setContactFormError(null);
    setIsEditingContact(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactLabel.trim()) {
      setContactFormError('Please provide a descriptive label (e.g. Front Desk Reception).');
      return;
    }

    const digitsOnly = contactPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 8) {
      setContactFormError('Please provide a valid telephone number with country/area code.');
      return;
    }

    setIsSavingContact(true);
    setContactFormError(null);

    const contactId = contactFormId || `contact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newContact: ContactNumber = {
      id: contactId,
      label: contactLabel.trim(),
      phoneNumber: contactPhone.trim(),
      property: contactProperty,
      purpose: contactPurpose,
      isPrimary: contactIsPrimary,
      updatedAt: new Date().toISOString(),
      updatedTimestamp: Date.now()
    };

    try {
      await saveContact(newContact);
      setIsEditingContact(false);
    } catch (err: any) {
      setContactFormError(err.message || 'Failed to save contact number to cloud database.');
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleConfirmDeleteContact = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact(contactToDelete.id);
      setContactToDelete(null);
    } catch (err: any) {
      alert('Error deleting contact number: ' + (err?.message || err));
    }
  };

  // -------------------------------------------------------------
  // TOURIST SPOTS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddSpot = () => {
    setSpotFormId(null);
    setSpotName('');
    setSpotDescription('');
    setSpotDistance('');
    setSpotPhotoUrl('');
    setSpotIsVisible(true);
    setSpotFormError(null);
    setIsEditingSpot(true);
  };

  const handleOpenEditSpot = (spot: TouristSpot) => {
    setSpotFormId(spot.id);
    setSpotName(spot.name);
    setSpotDescription(spot.description);
    setSpotDistance(spot.distance || '');
    setSpotPhotoUrl(spot.photoUrl || '');
    setSpotIsVisible(spot.isVisible !== false);
    setSpotFormError(null);
    setIsEditingSpot(true);
  };

  const handleSaveSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim()) {
      setSpotFormError('Please enter a spot name.');
      return;
    }
    if (!spotDescription.trim()) {
      setSpotFormError('Please enter a short description.');
      return;
    }

    setIsSavingSpot(true);
    setSpotFormError(null);

    try {
      if (spotFormId) {
        const existing = touristSpots.find((s) => s.id === spotFormId);
        if (existing) {
          await updateSpot({
            ...existing,
            name: spotName.trim(),
            description: spotDescription.trim(),
            distance: spotDistance.trim(),
            photoUrl: spotPhotoUrl.trim(),
            isVisible: spotIsVisible
          });
        }
      } else {
        await addSpot({
          name: spotName.trim(),
          description: spotDescription.trim(),
          distance: spotDistance.trim(),
          photoUrl: spotPhotoUrl.trim(),
          isVisible: spotIsVisible
        });
      }
      setIsEditingSpot(false);
    } catch (err: any) {
      setSpotFormError(err?.message || 'Error saving tourist spot');
    } finally {
      setIsSavingSpot(false);
    }
  };

  const handleConfirmDeleteSpot = async () => {
    if (!spotToDelete) return;
    setIsDeletingSpot(true);
    try {
      await deleteSpot(spotToDelete.id);
      setSpotToDelete(null);
    } catch (err: any) {
      alert('Error deleting tourist spot: ' + (err?.message || err));
    } finally {
      setIsDeletingSpot(false);
    }
  };

  const handleUploadSpotPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSpotPhoto(true);
    setSpotFormError(null);
    try {
      const url = await uploadTouristPhoto(file);
      setSpotPhotoUrl(url);
    } catch (err: any) {
      setSpotFormError('Error uploading spot photo: ' + (err?.message || err));
    } finally {
      setIsUploadingSpotPhoto(false);
      if (spotFileInputRef.current) spotFileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-6 animate-in fade-in duration-150">
      <div
        className={`border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[94vh] transition-colors duration-200 ${
          isNight ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-3.5 sm:p-5 border-b flex items-center justify-between ${
            isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-bold flex items-center justify-center shadow shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className={`text-base sm:text-lg font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                  Parijay Group — Admin Panel
                </h3>
                {isAuthenticated ? (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Authenticated Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Lock className="w-3 h-3" />
                    Password Protected
                  </span>
                )}
              </div>
              <p className={`text-[11px] sm:text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                {isAuthenticated
                  ? 'Administrator Access · Hotel Management Portal'
                  : 'Administrator Portal · Password Required'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign Out"
                title="Sign Out of Administrator Account"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  isNight
                    ? 'border-slate-700 bg-slate-800 text-rose-300 hover:bg-slate-700'
                    : 'border-slate-300 bg-slate-100 text-rose-600 hover:bg-slate-200'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close Admin Panel"
              className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isNight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SIMPLE PASSWORD LOGIN FORM (WHEN SIGNED OUT) */}
        {/* ========================================================= */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 overflow-y-auto max-w-md mx-auto my-auto space-y-6 w-full">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className={`text-xl font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                Administrator Sign In
              </h4>
              <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Enter the administrator password to access customer details, photo galleries, room pricing, and contact numbers.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-snug">{passwordError}</div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isNight ? 'text-slate-300' : 'text-slate-700'}`}>
                  Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                      isNight ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPassword || !passwordInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
              </button>
            </form>

            <div className={`p-3 rounded-xl border text-[11px] text-center ${
              isNight ? 'bg-slate-950/60 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <p>Protected Management Portal · Parijay Group of Hotels</p>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* FOUR SEPARATE ADMIN SECTIONS (WHEN AUTHENTICATED) */
          /* ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 5-Section Navigation Tabs - Mobile Optimized Scrollable Chip Bar */}
            <div
              className={`flex items-center gap-1.5 p-2 sm:px-4 border-b overflow-x-auto shrink-0 scrollbar-none touch-pan-x ${
                isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/90 border-slate-200'
              }`}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Tab 1: Customer Details */}
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'customers'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : isNight
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Customer Details</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'customers'
                      ? 'bg-slate-950 text-amber-300 font-bold'
                      : isNight
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {bookings.length + inquiries.length}
                </span>
              </button>

              {/* Tab 2: Photo Galleries */}
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'photos'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : isNight
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Photo Galleries</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'photos'
                      ? 'bg-slate-950 text-amber-300 font-bold'
                      : isNight
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {totalPhotosCount}
                </span>
              </button>

              {/* Tab 3: Room Pricing */}
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'pricing'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : isNight
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span>Room Pricing</span>
              </button>

              {/* Tab 4: Contact Numbers */}
              <button
                type="button"
                onClick={() => setActiveTab('contacts')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'contacts'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : isNight
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                <span>Contact Numbers</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'contacts'
                      ? 'bg-slate-950 text-amber-300 font-bold'
                      : isNight
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {contacts.length}
                </span>
              </button>

              {/* Tab 5: Tourist Spots */}
              <button
                type="button"
                onClick={() => setActiveTab('touristSpots')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'touristSpots'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : isNight
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Tourist Spots</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'touristSpots'
                      ? 'bg-slate-950 text-amber-300 font-bold'
                      : isNight
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {touristSpots.length}
                </span>
              </button>
            </div>

            {/* ------------------------------------------------------- */}
            {/* SECTION 1: CUSTOMER DETAILS */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'customers' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
                {/* Search & Filter Controls: Dynamic and Responsive for All Screens */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Search Input Row with clear button */}
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Filter by guest name, phone, room, booking ref..."
                      className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                        isNight ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    {customerSearch && (
                      <button
                        type="button"
                        onClick={() => setCustomerSearch('')}
                        className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter Controls Row: Stacks vertically or 2-col on mobile, flex on desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Property Selector */}
                    <div className="w-full sm:w-auto">
                      <select
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value as any)}
                        className={`w-full sm:w-auto py-2 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${
                          isNight ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="all">All Properties</option>
                        <option value="gangtok">Trikuta Residency (Gangtok)</option>
                        <option value="kalyani">Hotel Parijaye (AIIMS Kalyani)</option>
                      </select>
                    </div>

                    {/* Record Type Switcher: Bookings / Enquiries */}
                    <div className="grid grid-cols-2 sm:flex rounded-xl border p-1 bg-slate-950 border-slate-800 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setRecordTypeTab('bookings')}
                        className={`py-2 sm:py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center ${
                          recordTypeTab === 'bookings'
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Bookings ({filteredBookings.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordTypeTab('inquiries')}
                        className={`py-2 sm:py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center ${
                          recordTypeTab === 'inquiries'
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Enquiries ({filteredInquiries.length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {loadingRecords && (
                  <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Loading customer records from cloud database...</span>
                  </div>
                )}

                {/* BOOKINGS LIST */}
                {recordTypeTab === 'bookings' && (
                  <div className="space-y-3">
                    {filteredBookings.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl p-6 border-slate-800">
                        <User className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <div className="font-semibold text-slate-300">No booking records found</div>
                        <div className="text-[11px] mt-1 text-slate-500">
                          {customerSearch ? 'Try clearing your search query' : 'When guests submit reservations, they will appear here.'}
                        </div>
                      </div>
                    ) : (
                      filteredBookings.map((b) => (
                        <div
                          key={b.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                            isNight ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-serif font-bold text-sm sm:text-base text-white">{b.guestName}</span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/25 shrink-0">
                                  Ref: {b.bookingRef}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                    b.propertyId === 'gangtok'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-emerald-500/20 text-emerald-400'
                                  }`}
                                >
                                  {b.propertyName}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>
                                  Submitted on{' '}
                                  {new Date(b.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Phone & Delete Actions - Responsive for Mobile & Desktop */}
                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                              <a
                                href={`tel:${b.guestPhone}`}
                                className="flex-1 sm:flex-initial py-2 sm:py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                title={`Tap to call ${b.guestPhone}`}
                              >
                                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                                <span>{b.guestPhone}</span>
                              </a>

                              <a
                                href={formatWhatsAppLink(b.guestPhone, `Namaste ${b.guestName}, regarding your booking at ${b.propertyName} (Ref: ${b.bookingRef}):`)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 sm:p-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center shrink-0"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              <button
                                type="button"
                                onClick={() => handleCopyCustomerPhone(b.guestPhone)}
                                className="p-2 sm:p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                title="Copy Phone Number"
                              >
                                {copiedPhone === b.guestPhone ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setRecordToDelete({ id: b.id, type: 'booking', name: `${b.guestName} (${b.bookingRef})` })}
                                className="p-2 sm:p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                title="Delete Booking Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Stay & Room Details Grid - Responsive Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Room Type</span>
                              <span className="font-semibold text-white mt-0.5 block">{b.roomName}</span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {b.adults} Adults · {b.childrenCount} Children · Purpose: {b.purpose}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Dates & Duration</span>
                              <span className="font-semibold text-white mt-0.5 block">
                                {b.checkInDate} → {b.checkOutDate}
                              </span>
                              <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                                {b.nights} Night{b.nights > 1 ? 's' : ''} Stay
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Tariff & Payment</span>
                              <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">
                                ₹{b.grandTotal ? b.grandTotal.toLocaleString('en-IN') : b.baseTariff?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] text-slate-400 block mt-0.5 uppercase">
                                {b.paymentMethod?.replace('_', ' ') || 'Guaranteed'}
                              </span>
                            </div>
                          </div>

                          {/* Medical / Special Notes */}
                          {b.specialNeeds && b.specialNeeds !== 'Standard check-in requested' && (
                            <div className="mt-3 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs">
                              <span className="font-semibold text-amber-400 block text-[10px] uppercase tracking-wider">
                                Special Requests / Medical Care Notes:
                              </span>
                              <p className="text-slate-200 mt-0.5 italic">&ldquo;{b.specialNeeds}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* INQUIRIES LIST */}
                {recordTypeTab === 'inquiries' && (
                  <div className="space-y-3">
                    {filteredInquiries.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl p-6 border-slate-800">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <div className="font-semibold text-slate-300">No customer enquiry records found</div>
                        <div className="text-[11px] mt-1 text-slate-500">
                          Enquiries from the website contact and newsletter will appear here.
                        </div>
                      </div>
                    ) : (
                      filteredInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                            isNight ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-serif font-bold text-sm sm:text-base text-white">{inq.name}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                  {inq.source}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                              {inq.phone && (
                                <a
                                  href={`tel:${inq.phone}`}
                                  className="flex-1 sm:flex-initial py-2 sm:py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                                  <span>{inq.phone}</span>
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => setRecordToDelete({ id: inq.id, type: 'inquiry', name: inq.name })}
                                className="p-2 sm:p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                                title="Delete Enquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 text-xs">
                            <span className="font-semibold text-amber-400">{inq.subject}</span>
                            <p className="text-slate-300 mt-1 leading-relaxed">{inq.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* SECTION 2: PHOTO GALLERIES */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'photos' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Mobile-Only Gallery & Property Switcher (Compact, Space-Efficient) */}
                <div className="block md:hidden border-b border-slate-800 bg-slate-950/95 p-2.5 space-y-2 shrink-0">
                  {/* Property Tabs */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedProperty('gangtok');
                        if (!activeGallery.startsWith('gangtok')) {
                          setActiveGallery('gangtok/exterior');
                        }
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        expandedProperty === 'gangtok'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Mountain className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Trikuta (Gangtok)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedProperty('kalyani');
                        if (!activeGallery.startsWith('kalyani')) {
                          setActiveGallery('kalyani/exterior');
                        }
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        expandedProperty === 'kalyani'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Parijaye (Kalyani)</span>
                    </button>
                  </div>

                  {/* Category Horizontal Scroll Pills */}
                  <div
                    className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {(expandedProperty === 'gangtok' ? gangtokGalleries : kalyaniGalleries).map((g) => {
                      const conf = GALLERY_CONFIGS[g.id];
                      const count = (galleryPhotos[g.id] || []).length;
                      const isActive = activeGallery === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setActiveGallery(g.id)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                            isActive
                              ? expandedProperty === 'gangtok'
                                ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-xs'
                                : 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold shadow-xs'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {g.icon}
                          <span>{conf.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                              isActive ? 'bg-black/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop-Only Left: Sub-section Navigation */}
                <div
                  className={`hidden md:block w-68 border-r overflow-y-auto shrink-0 p-3 space-y-3 ${
                    isNight ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Property Galleries
                  </div>

                  {/* Accordion 1: Trikuta Residency (Gangtok) */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedProperty(expandedProperty === 'gangtok' ? 'kalyani' : 'gangtok')}
                      className={`w-full p-2.5 text-left flex items-center justify-between font-bold text-xs transition-colors cursor-pointer ${
                        expandedProperty === 'gangtok'
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Trikuta Residency</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform shrink-0 ${expandedProperty === 'gangtok' ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {expandedProperty === 'gangtok' && (
                      <div className="p-1 space-y-1 bg-slate-950">
                        {gangtokGalleries.map((g) => {
                          const conf = GALLERY_CONFIGS[g.id];
                          const count = (galleryPhotos[g.id] || []).length;
                          const isActive = activeGallery === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setActiveGallery(g.id)}
                              className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950 font-bold'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {g.icon}
                                <span className="truncate">{conf.name}</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Hotel Parijaye (Kalyani) */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedProperty(expandedProperty === 'kalyani' ? 'gangtok' : 'kalyani')}
                      className={`w-full p-2.5 text-left flex items-center justify-between font-bold text-xs transition-colors cursor-pointer ${
                        expandedProperty === 'kalyani'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hotel Parijaye</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform shrink-0 ${expandedProperty === 'kalyani' ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {expandedProperty === 'kalyani' && (
                      <div className="p-1 space-y-1 bg-slate-950">
                        {kalyaniGalleries.map((g) => {
                          const conf = GALLERY_CONFIGS[g.id];
                          const count = (galleryPhotos[g.id] || []).length;
                          const isActive = activeGallery === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setActiveGallery(g.id)}
                              className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {g.icon}
                                <span className="truncate">{conf.name}</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Active Gallery Content & Photo Manager */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        {galleryConfig.propertyName}
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-white mt-0.5">
                        {galleryConfig.sectionTitle}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                        {galleryConfig.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFilesSelected(e.target.files)}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="py-2.5 sm:py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5 shrink-0" />
                        <span>Upload Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="py-2.5 sm:py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Add Web URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {uploadStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{uploadStatus}</span>
                    </div>
                  )}

                  {errorStatus && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{errorStatus}</span>
                    </div>
                  )}

                  {/* Direct URL Form */}
                  {showUrlInput && (
                    <form onSubmit={handleAddUrl} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
                      <div className="font-semibold text-white">Add Photo by Direct Web URL</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="url"
                          required
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          value={imageTitle}
                          onChange={(e) => setImageTitle(e.target.value)}
                          placeholder="Photo Title / Caption (optional)"
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="py-1.5 px-3 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="py-1.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold cursor-pointer"
                        >
                          Save Photo to Cloud
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Photo Grid */}
                  {currentGalleryPhotos.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-800 p-8">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      <div className="font-semibold text-slate-300">No photos uploaded for this sub-section yet</div>
                      <div className="text-[11px] mt-1 text-slate-500">
                        Tap "Upload Photos" above to add photos from your phone or device.
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                      {currentGalleryPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-xs"
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Photo Action Controls - ALWAYS visible on Mobile/Touch, Hover on Desktop */}
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setPreviewPhoto(photo)}
                              className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-white cursor-pointer shadow-sm backdrop-blur-xs"
                              title="Preview Photo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo)}
                              className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer shadow-sm backdrop-blur-xs"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1.5 text-[10px] text-white truncate font-medium">
                            {photo.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* SECTION 3: ROOM PRICING */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'pricing' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5 sm:space-y-6">
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                    Room Nightly Pricing Manager
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Update base room rates across both properties. Changes save directly to Cloud Firestore and sync live to every visitor on all devices.
                  </p>
                </div>

                {/* Property 1: Trikuta Residency (Gangtok) */}
                <div className="border border-slate-800 rounded-2xl p-3.5 sm:p-5 bg-slate-950 space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2 font-serif font-bold text-amber-400 text-sm">
                    <Mountain className="w-4 h-4 shrink-0" />
                    <span>Trikuta Residency — Gangtok, Sikkim</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {gangtokRooms.map((room) => {
                      const currentVal = editablePrices[room.id] ?? room.pricePerNight;
                      const isSaving = savingRoomId === room.id;
                      const isSaved = savedRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5 sm:space-y-3"
                        >
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-white">{room.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{room.tagline}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-300">₹</span>
                            <input
                              type="number"
                              min="500"
                              max="50000"
                              step="50"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setEditablePrices((prev) => ({
                                  ...prev,
                                  [room.id]: isNaN(val) ? 0 : val
                                }));
                              }}
                              className="flex-1 min-w-0 p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(room.id)}
                              disabled={isSaving}
                              className={`py-2 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                                isSaved
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                              }`}
                            >
                              {isSaving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isSaved ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              <span>{isSaved ? 'Saved!' : 'Save Rate'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Property 2: Hotel Parijaye (AIIMS Kalyani) */}
                <div className="border border-slate-800 rounded-2xl p-3.5 sm:p-5 bg-slate-950 space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2 font-serif font-bold text-emerald-400 text-sm">
                    <Building className="w-4 h-4 shrink-0" />
                    <span>Hotel Parijaye — AIIMS Kalyani, West Bengal</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {kalyaniRooms.map((room) => {
                      const currentVal = editablePrices[room.id] ?? room.pricePerNight;
                      const isSaving = savingRoomId === room.id;
                      const isSaved = savedRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5 sm:space-y-3"
                        >
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-white">{room.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{room.tagline}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-300">₹</span>
                            <input
                              type="number"
                              min="500"
                              max="50000"
                              step="50"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setEditablePrices((prev) => ({
                                  ...prev,
                                  [room.id]: isNaN(val) ? 0 : val
                                }));
                              }}
                              className="flex-1 min-w-0 p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(room.id)}
                              disabled={isSaving}
                              className={`py-2 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                                isSaved
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              }`}
                            >
                              {isSaving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isSaved ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              <span>{isSaved ? 'Saved!' : 'Save'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* SECTION 4: CONTACT NUMBERS */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'contacts' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                      Contact Numbers Directory
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                      Manage every phone and WhatsApp helpline shown across the website. Numbers sync live across all visitors, header buttons, mobile floating docks, and contact footers.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddContact}
                    className="w-full sm:w-auto py-2.5 sm:py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add New Number</span>
                  </button>
                </div>

                {/* List of Contact Numbers */}
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        contact.isPrimary
                          ? 'border-amber-400/40 bg-slate-950/80 ring-1 ring-amber-400/20'
                          : 'border-slate-800 bg-slate-950/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-serif font-bold text-sm sm:text-base text-white">
                              {contact.label}
                            </span>
                            {contact.isPrimary && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                                Primary Hotline
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {contact.property === 'both'
                                ? 'Both Properties'
                                : contact.property === 'gangtok'
                                ? 'Gangtok (Trikuta)'
                                : 'Kalyani (Parijaye)'}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {contact.purpose === 'both'
                                ? 'Call & WhatsApp'
                                : contact.purpose === 'call'
                                ? 'Call Only'
                                : 'WhatsApp Only'}
                            </span>
                          </div>

                          <div className="text-base sm:text-lg font-mono font-bold text-amber-400 mt-1">
                            {contact.phoneNumber}
                          </div>
                        </div>

                        {/* Actions for this contact - responsive buttons */}
                        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">
                          {/* Test Call link */}
                          {(contact.purpose === 'call' || contact.purpose === 'both') && (
                            <a
                              href={formatTelLink(contact.phoneNumber)}
                              className="flex-1 sm:flex-initial py-2 sm:py-1.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-400/30"
                              title="Test Dial"
                            >
                              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                              <span>Test Call</span>
                            </a>
                          )}

                          {/* Test WhatsApp link */}
                          {(contact.purpose === 'whatsapp' || contact.purpose === 'both') && (
                            <a
                              href={formatWhatsAppLink(contact.phoneNumber, 'Hello Parijay Group of Hotels Desk!')}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 sm:flex-initial py-2 sm:py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/30"
                              title="Test WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Test WhatsApp</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditContact(contact)}
                            className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                            title="Edit Number"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setContactToDelete(contact)}
                            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                            title="Delete Number"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* SECTION 5: TOURIST SPOTS */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'touristSpots' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
                {/* Header & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div>
                    <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Tourist Spots & Sightseeing Directory</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Control the list of tourist spots we offer visits to across the website. Add, edit, reorder, hide/show, or delete spots. Updates appear immediately on all devices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddSpot}
                    className="w-full sm:w-auto py-2.5 sm:py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add New Spot</span>
                  </button>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search spots by name or description..."
                      value={spotSearchQuery}
                      onChange={(e) => setSpotSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-950/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    {spotSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSpotSearchQuery('')}
                        className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Clear query"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSpotFilterStatus('all')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                        spotFilterStatus === 'all'
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({touristSpots.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpotFilterStatus('visible')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                        spotFilterStatus === 'visible'
                          ? 'bg-emerald-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Visible ({touristSpots.filter((s) => s.isVisible !== false).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpotFilterStatus('hidden')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                        spotFilterStatus === 'hidden'
                          ? 'bg-slate-700 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Hidden ({touristSpots.filter((s) => s.isVisible === false).length})
                    </button>
                  </div>
                </div>

                {/* Spot Cards List */}
                {(() => {
                  const filteredSpots = touristSpots.filter((spot) => {
                    const matchesSearch =
                      !spotSearchQuery ||
                      spot.name.toLowerCase().includes(spotSearchQuery.toLowerCase()) ||
                      spot.description.toLowerCase().includes(spotSearchQuery.toLowerCase()) ||
                      (spot.distance && spot.distance.toLowerCase().includes(spotSearchQuery.toLowerCase()));

                    const matchesStatus =
                      spotFilterStatus === 'all' ||
                      (spotFilterStatus === 'visible' && spot.isVisible !== false) ||
                      (spotFilterStatus === 'hidden' && spot.isVisible === false);

                    return matchesSearch && matchesStatus;
                  });

                  if (filteredSpots.length === 0) {
                    return (
                      <div className="p-10 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 space-y-3">
                        <Compass className="w-10 h-10 text-slate-500 mx-auto" />
                        <div className="text-sm font-semibold text-slate-300">
                          {spotSearchQuery ? 'No tourist spots match your search' : 'No tourist spots configured'}
                        </div>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                          {spotSearchQuery
                            ? 'Try clearing the search query or adjusting the visibility filter.'
                            : 'Click the button below to add your first tourist spot with photo, description, and travel time.'}
                        </p>
                        {!spotSearchQuery && (
                          <button
                            type="button"
                            onClick={handleOpenAddSpot}
                            className="py-2 px-4 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Tourist Spot</span>
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredSpots.map((spot, index) => {
                        const originalIndex = touristSpots.findIndex((s) => s.id === spot.id);
                        const isFirst = originalIndex === 0;
                        const isLast = originalIndex === touristSpots.length - 1;

                        return (
                          <div
                            key={spot.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                              spot.isVisible !== false
                                ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                : 'bg-slate-950/30 border-slate-800/60 opacity-75'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              {/* Left: Reorder controls + Photo + Details */}
                              <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                                {/* Reorder Controls */}
                                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => moveSpotUp(spot.id)}
                                    disabled={isFirst}
                                    title={isFirst ? 'Top of list' : 'Move Up in order'}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isFirst
                                        ? 'border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-amber-400 hover:border-amber-400'
                                    }`}
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>

                                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                                    #{originalIndex + 1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => moveSpotDown(spot.id)}
                                    disabled={isLast}
                                    title={isLast ? 'Bottom of list' : 'Move Down in order'}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isLast
                                        ? 'border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-amber-400 hover:border-amber-400'
                                    }`}
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Photo Thumbnail or Neutral Placeholder */}
                                <div className="shrink-0">
                                  {spot.photoUrl ? (
                                    <img
                                      src={spot.photoUrl}
                                      alt={spot.name}
                                      onClick={() =>
                                        setPreviewPhoto({
                                          id: spot.id,
                                          galleryId: 'gangtok/exterior',
                                          url: spot.photoUrl!,
                                          title: spot.name,
                                          caption: spot.description,
                                          uploadedAt: '',
                                          timestamp: 0
                                        })
                                      }
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                  ) : (
                                    <div
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 p-1 text-center"
                                      title="Neutral placeholder - no photo uploaded yet"
                                    >
                                      <Mountain className="w-5 h-5 text-amber-400/40 mb-0.5" />
                                      <span className="text-[9px] font-semibold text-slate-400 leading-tight">
                                        Neutral
                                      </span>
                                      <span className="text-[8px] text-slate-500">
                                        Placeholder
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <h5 className="font-serif font-bold text-sm sm:text-base text-white">
                                      {spot.name}
                                    </h5>

                                    {spot.distance && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span>{spot.distance}</span>
                                      </span>
                                    )}

                                    {spot.isVisible !== false ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Visible on Site
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                                        <EyeOff className="w-3 h-3 shrink-0" />
                                        Hidden from Site
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {spot.description}
                                  </p>

                                  {!spot.photoUrl && (
                                    <div className="text-[11px] text-amber-400/80 flex items-center gap-1">
                                      <span>Using neutral placeholder image on site.</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right / Bottom on mobile: Actions */}
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0">
                                {/* Hide/Show Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleVisibility(spot.id, spot.isVisible !== false)}
                                  title={spot.isVisible !== false ? 'Hide from website' : 'Show on website'}
                                  className={`flex-1 sm:flex-initial py-2 sm:py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                                    spot.isVisible !== false
                                      ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                                      : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                  }`}
                                >
                                  {spot.isVisible !== false ? (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>Hide</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>Show</span>
                                    </>
                                  )}
                                </button>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSpot(spot)}
                                  className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                  title="Edit Spot"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => setSpotToDelete(spot)}
                                  className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                  title="Delete Spot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* ADD / EDIT TOURIST SPOT MODAL DIALOG */}
        {/* ----------------------------------------------------------- */}
        {isEditingSpot && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <h4 className="font-serif font-bold text-sm text-white">
                    {spotFormId ? 'Edit Tourist Spot' : 'Add New Tourist Spot'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingSpot(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {spotFormError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{spotFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSpot} className="space-y-4">
                {/* Spot Name */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tourist Spot Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Gurudongmar Lake"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Short Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={spotDescription}
                    onChange={(e) => setSpotDescription(e.target.value)}
                    placeholder="A short description of the destination, its attractions, sacred significance, or scenic views..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                {/* Distance or Travel Time (Optional) */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Distance or Travel Time from Gangtok <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={spotDistance}
                    onChange={(e) => setSpotDistance(e.target.value)}
                    placeholder="e.g. 38 km · 1.5 hrs 4x4 cab, or 1.2 km · 7 mins walk"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Displays on the website cards to help guests gauge excursion distance and travel duration.
                  </span>
                </div>

                {/* Photo Upload & Preview */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-300">
                      Destination Photo
                    </label>
                    {spotPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setSpotPhotoUrl('')}
                        className="text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>

                  {/* Preview Box */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="w-24 h-24 rounded-xl border border-slate-700 overflow-hidden bg-slate-950 shrink-0 flex items-center justify-center">
                      {spotPhotoUrl ? (
                        <img
                          src={spotPhotoUrl}
                          alt="Spot preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Mountain className="w-6 h-6 text-amber-400/50 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-400 block leading-tight font-medium">
                            Neutral
                          </span>
                          <span className="text-[8px] text-slate-500 block">
                            Placeholder
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="file"
                        ref={spotFileInputRef}
                        accept="image/*"
                        onChange={handleUploadSpotPhotoFile}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => spotFileInputRef.current?.click()}
                        disabled={isUploadingSpotPhoto}
                        className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isUploadingSpotPhoto ? 'Uploading Photo...' : 'Upload Photo from Device'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold shrink-0">Or URL</span>
                        <input
                          type="url"
                          value={spotPhotoUrl}
                          onChange={(e) => setSpotPhotoUrl(e.target.value)}
                          placeholder="Paste image web link (https://...)"
                          className="flex-1 min-w-0 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>

                      <p className="text-[10px] text-slate-400">
                        If no photo is uploaded, a neutral placeholder will be shown on the website.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show/Hide Toggle */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={spotIsVisible}
                      onChange={(e) => setSpotIsVisible(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white">Show on Website Immediately</span>
                      <span className="text-[11px] text-slate-400 block">
                        When enabled, guests can see this spot in the Gangtok tourist guide and sightseeing sections.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingSpot(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSpot || isUploadingSpotPhoto}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold shadow cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSpot ? 'Saving Spot...' : spotFormId ? 'Update Tourist Spot' : 'Save Tourist Spot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DELETE TOURIST SPOT CONFIRMATION DIALOG */}
        {/* ----------------------------------------------------------- */}
        {spotToDelete && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-xs">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-sm text-white">Delete Tourist Spot?</h4>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <strong>{spotToDelete.name}</strong> from the website?
                </p>
                <p className="text-rose-400/90 text-[11px] mt-1">
                  This spot will be removed from the Gangtok tourist guide and all sightseeing lists.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSpotToDelete(null)}
                  disabled={isDeletingSpot}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSpot}
                  disabled={isDeletingSpot}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  {isDeletingSpot ? 'Deleting...' : 'Yes, Delete Spot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* ADD / EDIT CONTACT MODAL DIALOG */}
        {/* ----------------------------------------------------------- */}
        {isEditingContact && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-serif font-bold text-sm text-white">
                  {contactFormId ? 'Edit Contact Number' : 'Add New Contact Number'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {contactFormError && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {contactFormError}
                </div>
              )}

              <form onSubmit={handleSaveContact} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Label / Station Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactLabel}
                    onChange={(e) => setContactLabel(e.target.value)}
                    placeholder="e.g. Trikuta Residency Reception"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 91630 08361"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Valid for direct phone dialing and WhatsApp messaging.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Belongs To Property
                    </label>
                    <select
                      value={contactProperty}
                      onChange={(e) => setContactProperty(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="gangtok">Trikuta Residency (Gangtok)</option>
                      <option value="kalyani">Hotel Parijaye (AIIMS Kalyani)</option>
                      <option value="both">Both Properties</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Usage Purpose
                    </label>
                    <select
                      value={contactPurpose}
                      onChange={(e) => setContactPurpose(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="both">Both Call & WhatsApp</option>
                      <option value="call">Phone Call Only</option>
                      <option value="whatsapp">WhatsApp Only</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contactIsPrimary}
                      onChange={(e) => setContactIsPrimary(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white">Primary Hotline for Selected Property</span>
                      <span className="text-[11px] text-slate-400 block">
                        Used automatically by the header call button and instant mobile action bar.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="py-2 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingContact}
                    className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                  >
                    {isSavingContact ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DELETE RECORD CONFIRMATION DIALOG */}
        {/* ----------------------------------------------------------- */}
        {recordToDelete && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-xs">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-sm text-white">Delete Customer Record?</h4>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete the record for <strong>{recordToDelete.name}</strong>? This action cannot be undone and deletes the record from Cloud Firestore.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  disabled={isDeletingRecord}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteRecord}
                  disabled={isDeletingRecord}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  {isDeletingRecord ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DELETE CONTACT CONFIRMATION DIALOG */}
        {/* ----------------------------------------------------------- */}
        {contactToDelete && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-xs">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-sm text-white">Delete Contact Number?</h4>
                <p className="text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to remove <strong>{contactToDelete.label} ({contactToDelete.phoneNumber})</strong> from the live website?
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContactToDelete(null)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteContact}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Preview for Photos */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-70 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-3 text-center text-xs text-white bg-black/70 rounded-b-xl">
                <div className="font-semibold">{previewPhoto.title}</div>
                {previewPhoto.caption && <div className="text-slate-300 text-[11px] mt-0.5">{previewPhoto.caption}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
