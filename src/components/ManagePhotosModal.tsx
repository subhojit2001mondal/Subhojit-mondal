import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Unlock,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
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
  Bed
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
  saveRoomPriceToDb
} from '../services/dbService';
import { DEFAULT_ROOM_PRICES, ROOMS } from '../data/hotels';

interface ManagePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryPhotos: Record<GalleryId, GalleryPhoto[]>;
  initialGallery?: GalleryId;
  roomPrices: Record<string, number>;
  onUpdateRoomPrice?: (roomId: string, newPrice: number) => Promise<void>;
}

const DEFAULT_PASSCODE = 'parijai';

export const ManagePhotosModal: React.FC<ManagePhotosModalProps> = ({
  isOpen,
  onClose,
  galleryPhotos,
  initialGallery = 'gangtok/exterior',
  roomPrices,
  onUpdateRoomPrice
}) => {
  const { isNight } = useTheme();

  // Passcode gate state
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);

  // Top-level Admin Panel Tab: 'photos' | 'pricing'
  const [adminTab, setAdminTab] = useState<'photos' | 'pricing'>('photos');

  // Normalized initial gallery
  const normalizedInitial = normalizeGalleryId(initialGallery);

  // Property accordion state: which property option is currently open ("one option under another")
  const [expandedProperty, setExpandedProperty] = useState<'gangtok' | 'kalyani'>(
    normalizedInitial.startsWith('kalyani') ? 'kalyani' : 'gangtok'
  );

  // Active sub-section gallery selection
  const [activeGallery, setActiveGallery] = useState<GalleryId>(normalizedInitial);

  // Multi-file upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Direct URL state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');

  // Lightbox preview
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Room pricing state (local draft values before saving)
  const [editablePrices, setEditablePrices] = useState<Record<string, number>>(() => ({
    ...DEFAULT_ROOM_PRICES,
    ...roomPrices
  }));
  const [savingRoomId, setSavingRoomId] = useState<string | null>(null);
  const [savedRoomId, setSavedRoomId] = useState<string | null>(null);

  // Keep editablePrices synced with incoming roomPrices if they update
  React.useEffect(() => {
    setEditablePrices((prev) => ({
      ...prev,
      ...roomPrices
    }));
  }, [roomPrices]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === DEFAULT_PASSCODE) {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

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

  const handleDelete = async (photo: GalleryPhoto) => {
    if (confirm(`Delete this photo? This will immediately remove it from the database and the live website page.`)) {
      try {
        await deleteGalleryPhotoFromDb(photo);
        if (previewPhoto?.id === photo.id) setPreviewPhoto(null);
      } catch (err: any) {
        alert('Failed to delete photo: ' + err.message);
      }
    }
  };

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

  // Gangtok sub-sections
  const gangtokGalleries: { id: GalleryId; icon: React.ReactNode }[] = [
    { id: 'gangtok/exterior', icon: <Building className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/view-room', icon: <Mountain className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/non-view-room', icon: <Bed className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/reception', icon: <Compass className="w-4 h-4 text-amber-500" /> },
    { id: 'gangtok/dining', icon: <UtensilsCrossed className="w-4 h-4 text-amber-500" /> }
  ];

  // Kalyani sub-sections
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

  const gangtokRooms = ROOMS.filter((r) => r.propertyId === 'gangtok');
  const kalyaniRooms = ROOMS.filter((r) => r.propertyId === 'kalyani');

  const totalPhotosCount = Object.values(galleryPhotos).reduce((acc, list) => acc + (list?.length || 0), 0);

  const gangtokTotalPhotos = gangtokGalleries.reduce((acc, g) => acc + (galleryPhotos[g.id]?.length || 0), 0);
  const kalyaniTotalPhotos = kalyaniGalleries.reduce((acc, g) => acc + (galleryPhotos[g.id]?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-150">
      <div
        className={`border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] transition-colors duration-200 ${
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
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Passcode Protected
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                Photo Galleries by Sub-Section & Room Nightly Pricing (Live Cloud Database Sync)
              </p>
            </div>
          </div>

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

        {/* PASSCODE GATE */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-12 text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h4 className={`text-xl font-serif font-bold ${isNight ? 'text-white' : 'text-slate-950'}`}>
                Owner & Admin Access Verification
              </h4>
              <p className={`text-xs mt-1.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                This section controls live persistent photo galleries and room nightly rates seen by every visitor. Please enter the passcode to access.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(false);
                  }}
                  placeholder="Enter passcode (Default: parijai)"
                  autoFocus
                  className={`w-full px-4 py-2.5 rounded-xl text-center text-sm font-mono tracking-widest border focus:outline-none transition-colors ${
                    isNight
                      ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                  }`}
                />
                {passcodeError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Incorrect passcode. Default passcode is &quot;parijai&quot;.</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Full Admin Panel</span>
              </button>
            </form>

            <div className="pt-2 text-[11px] text-slate-400">
              Passcode hint: <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">parijai</code>
            </div>
          </div>
        ) : (
          /* UNLOCKED: FULL ADMIN PANEL WITH TWO CLEAR PARTS */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top-Level Admin Navigation: Two Clear Parts */}
            <div
              className={`px-3 sm:px-6 pt-2.5 border-b flex items-center gap-2 ${
                isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/90 border-slate-200'
              }`}
            >
              <button
                onClick={() => setAdminTab('photos')}
                className={`py-2 px-3 sm:py-2.5 sm:px-4 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
                  adminTab === 'photos'
                    ? isNight
                      ? 'bg-slate-900 border-slate-700 text-amber-400 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-950 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>1. Photo Galleries</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold">
                  {totalPhotosCount} photos
                </span>
              </button>

              <button
                onClick={() => setAdminTab('pricing')}
                className={`py-2 px-3 sm:py-2.5 sm:px-4 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
                  adminTab === 'pricing'
                    ? isNight
                      ? 'bg-slate-900 border-slate-700 text-amber-400 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-950 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>2. Room Pricing</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  5 rooms
                </span>
              </button>
            </div>

            {/* PART 1: PHOTO GALLERIES — OPTIMIZED ONE OPTION UNDER ANOTHER */}
            {adminTab === 'photos' && (
              <div className="flex flex-col flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5">
                {/* Descriptive Instruction */}
                <div
                  className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    isNight ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Select a property below to view and manage its building sections. Click any section to open its photo manager.
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                    Live Database Connected
                  </span>
                </div>

                {/* THE PROGRESSIVE DISCLOSURE LIST: ONE OPTION UNDER ANOTHER */}
                <div className="space-y-3.5">
                  {/* OPTION 1: TRIKUTA RESIDENCY (GANGTOK) */}
                  <div
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      expandedProperty === 'gangtok'
                        ? isNight
                          ? 'border-amber-500/60 bg-slate-950/80 shadow-lg ring-1 ring-amber-500/20'
                          : 'border-amber-400 bg-amber-50/30 shadow-md ring-1 ring-amber-400/30'
                        : isNight
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Primary Property Option Header Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedProperty === 'gangtok') {
                          // keep expanded or toggle
                          setExpandedProperty('gangtok');
                        } else {
                          setExpandedProperty('gangtok');
                          if (!activeGallery.startsWith('gangtok/')) {
                            setActiveGallery('gangtok/exterior');
                          }
                        }
                      }}
                      className="w-full p-3.5 sm:p-4.5 flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            expandedProperty === 'gangtok'
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : isNight
                              ? 'bg-slate-800 text-amber-400'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          <Mountain className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-serif font-bold text-sm sm:text-base ${
                                expandedProperty === 'gangtok'
                                  ? 'text-amber-500'
                                  : isNight
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              Trikuta Residency (Gangtok)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 font-semibold">
                              5 Sections
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                            Building Front, View Room, Non-View Room, Reception, and Dining Area
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                            gangtokTotalPhotos > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {gangtokTotalPhotos} photo{gangtokTotalPhotos !== 1 ? 's' : ''}
                        </span>

                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${
                            expandedProperty === 'gangtok'
                              ? 'bg-amber-400 text-slate-950 rotate-180'
                              : isNight
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* AUTOMATIC UNDER OPTIONS FOR TRIKUTA RESIDENCY (WHEN CLICKED) */}
                    {expandedProperty === 'gangtok' && (
                      <div
                        className={`p-3 sm:p-4 border-t space-y-2.5 animate-in slide-in-from-top-2 duration-150 ${
                          isNight ? 'border-slate-800 bg-slate-950/70' : 'border-amber-200/60 bg-amber-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Select Area under Trikuta Residency:</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Click to manage that area</span>
                        </div>

                        {/* Sub-sections stacked cleanly one under another */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {gangtokGalleries.map((item) => {
                            const gid = item.id;
                            const cfg = GALLERY_CONFIGS[gid];
                            const count = (galleryPhotos[gid] || []).length;
                            const isSelected = activeGallery === gid;

                            return (
                              <button
                                key={gid}
                                type="button"
                                onClick={() => {
                                  setActiveGallery(gid);
                                  setShowUrlInput(false);
                                }}
                                className={`w-full p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40 font-bold'
                                    : isNight
                                    ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'bg-slate-950 text-amber-400'
                                        : isNight
                                        ? 'bg-slate-800 text-amber-400'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {item.icon}
                                  </div>
                                  <div className="truncate">
                                    <div className={`text-xs truncate ${isSelected ? 'font-bold text-slate-950' : 'font-semibold'}`}>
                                      {cfg.name}
                                    </div>
                                    <div
                                      className={`text-[10px] truncate ${
                                        isSelected ? 'text-slate-800' : 'text-slate-400'
                                      }`}
                                    >
                                      {cfg.badge}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                      isSelected
                                        ? 'bg-slate-950 text-amber-300'
                                        : count > 0
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {count} photo{count !== 1 ? 's' : ''}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION 2: HOTEL PARIJAYE (KALYANI) — ONE OPTION UNDER ANOTHER */}
                  <div
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      expandedProperty === 'kalyani'
                        ? isNight
                          ? 'border-emerald-500/60 bg-slate-950/80 shadow-lg ring-1 ring-emerald-500/20'
                          : 'border-emerald-400 bg-emerald-50/30 shadow-md ring-1 ring-emerald-400/30'
                        : isNight
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Primary Property Option Header Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedProperty === 'kalyani') {
                          // keep expanded
                          setExpandedProperty('kalyani');
                        } else {
                          setExpandedProperty('kalyani');
                          if (!activeGallery.startsWith('kalyani/')) {
                            setActiveGallery('kalyani/exterior');
                          }
                        }
                      }}
                      className="w-full p-3.5 sm:p-4.5 flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            expandedProperty === 'kalyani'
                              ? 'bg-emerald-500 text-white shadow-md'
                              : isNight
                              ? 'bg-slate-800 text-emerald-400'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-serif font-bold text-sm sm:text-base ${
                                expandedProperty === 'kalyani'
                                  ? 'text-emerald-500'
                                  : isNight
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              Hotel Parijaye (Kalyani)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                              6 Sections
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                            Building Front, Non-AC, Standard AC, Deluxe Twin Care, Reception, and Dining Area
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                            kalyaniTotalPhotos > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {kalyaniTotalPhotos} photo{kalyaniTotalPhotos !== 1 ? 's' : ''}
                        </span>

                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${
                            expandedProperty === 'kalyani'
                              ? 'bg-emerald-500 text-white rotate-180'
                              : isNight
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* AUTOMATIC UNDER OPTIONS FOR HOTEL PARIJAYE (WHEN CLICKED) */}
                    {expandedProperty === 'kalyani' && (
                      <div
                        className={`p-3 sm:p-4 border-t space-y-2.5 animate-in slide-in-from-top-2 duration-150 ${
                          isNight ? 'border-slate-800 bg-slate-950/70' : 'border-emerald-200/60 bg-emerald-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Select Area under Hotel Parijaye:</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Click to manage that area</span>
                        </div>

                        {/* Sub-sections stacked cleanly one under another */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {kalyaniGalleries.map((item) => {
                            const gid = item.id;
                            const cfg = GALLERY_CONFIGS[gid];
                            const count = (galleryPhotos[gid] || []).length;
                            const isSelected = activeGallery === gid;

                            return (
                              <button
                                key={gid}
                                type="button"
                                onClick={() => {
                                  setActiveGallery(gid);
                                  setShowUrlInput(false);
                                }}
                                className={`w-full p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                                  isSelected
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/40 font-bold'
                                    : isNight
                                    ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'bg-white text-emerald-600'
                                        : isNight
                                        ? 'bg-slate-800 text-emerald-400'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {item.icon}
                                  </div>
                                  <div className="truncate">
                                    <div className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-semibold'}`}>
                                      {cfg.name}
                                    </div>
                                    <div
                                      className={`text-[10px] truncate ${
                                        isSelected ? 'text-emerald-100' : 'text-slate-400'
                                      }`}
                                    >
                                      {cfg.badge}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : count > 0
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {count} photo{count !== 1 ? 's' : ''}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE AREA PHOTO MANAGEMENT CARD (UPLOAD + GRID) */}
                <div
                  className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition-colors ${
                    isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Active Area Banner Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {galleryConfig.propertyName}
                        </span>
                        <h4 className="font-serif font-bold text-base text-amber-500">
                          {galleryConfig.sectionTitle}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-400">
                          {galleryConfig.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {galleryConfig.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{currentGalleryPhotos.length} photo(s) currently active on live website</span>
                      </div>
                    </div>

                    {/* Upload Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFilesSelected(e.target.files)}
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                      />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-102"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos</span>
                      </button>

                      <button
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                          isNight
                            ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Web URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Alerts */}
                  {isUploading && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{uploadStatus || 'Uploading photos to database & storage...'}</span>
                    </div>
                  )}

                  {uploadStatus && !isUploading && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{uploadStatus}</span>
                    </div>
                  )}

                  {errorStatus && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>{errorStatus}</span>
                    </div>
                  )}

                  {/* Web URL input */}
                  {showUrlInput && (
                    <form
                      onSubmit={handleAddUrl}
                      className={`p-3.5 rounded-xl border space-y-3 ${
                        isNight ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-400">Save Photo via Direct URL</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="url"
                          required
                          placeholder="https://example.com/photo.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className={`px-3 py-2 text-xs rounded-lg border outline-none ${
                            isNight
                              ? 'bg-slate-950 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Photo title (optional)"
                          value={imageTitle}
                          onChange={(e) => setImageTitle(e.target.value)}
                          className={`px-3 py-2 text-xs rounded-lg border outline-none ${
                            isNight
                              ? 'bg-slate-950 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-300 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Photo Grid for Selected Area */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                        Photos for {galleryConfig.name} ({currentGalleryPhotos.length})
                      </span>
                      {currentGalleryPhotos.length > 0 && (
                        <span className="text-[11px] text-emerald-400">
                          ✓ Deleting removes immediately everywhere
                        </span>
                      )}
                    </div>

                    {currentGalleryPhotos.length === 0 ? (
                      <div
                        className={`rounded-xl border p-8 text-center space-y-2.5 ${
                          isNight ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                        </div>
                        <h6 className={`font-serif font-bold text-sm ${isNight ? 'text-white' : 'text-slate-950'}`}>
                          No photos uploaded yet for {galleryConfig.name}
                        </h6>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Upload multiple photos for this section. They will immediately appear on the live website.
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 cursor-pointer inline-flex items-center gap-1.5 shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photos Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                        {currentGalleryPhotos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className={`group relative rounded-xl overflow-hidden border transition-all ${
                              isNight
                                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <div className="aspect-16/10 overflow-hidden relative">
                              <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="p-2 flex items-center justify-between text-xs">
                              <div className="truncate mr-2">
                                <span className={`font-semibold block truncate text-[11px] ${isNight ? 'text-white' : 'text-slate-900'}`}>
                                  {photo.title}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(photo.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setPreviewPhoto(photo)}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                  title="Preview Photo"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(photo)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-100 hover:bg-rose-500/30 cursor-pointer transition-colors"
                                  title="Delete photo (Removes everywhere immediately)"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PART 2: ROOM PRICING */}
            {adminTab === 'pricing' && (
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isNight ? 'bg-slate-950/70 border-slate-800' : 'bg-emerald-50/60 border-emerald-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-serif font-bold text-base text-emerald-500">
                        Room Pricing — Editable Nightly Rates
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Live Database
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Update the nightly rate for any room type. Changes are saved to the persistent database and immediately reflect everywhere on the live site: room cards, &quot;Check Availability&quot; results, and the itemized price ledger in the booking funnel.
                    </p>
                  </div>
                </div>

                {/* Trikuta Residency (Gangtok) Rooms */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-amber-500" />
                    <h5 className={`font-serif font-bold text-sm ${isNight ? 'text-white' : 'text-slate-950'}`}>
                      Trikuta Residency (Gangtok) — 2 Room Types
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gangtokRooms.map((room) => {
                      const currentRate = editablePrices[room.id] ?? room.pricePerNight;
                      const isSaving = savingRoomId === room.id;
                      const isSaved = savedRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                            isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-serif font-bold text-amber-500">
                                {room.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                                {room.occupancy}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                              {room.tagline}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min={500}
                                max={50000}
                                step={50}
                                value={currentRate}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  setEditablePrices((prev) => ({
                                    ...prev,
                                    [room.id]: isNaN(val) ? 0 : val
                                  }));
                                }}
                                className={`w-28 px-2.5 py-1.5 text-sm font-mono font-bold rounded-lg border outline-none text-right ${
                                  isNight
                                    ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                                    : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                                }`}
                              />
                              <span className="text-xs text-slate-400 font-sans">/ night</span>
                            </div>

                            <button
                              onClick={() => handleSavePrice(room.id)}
                              disabled={isSaving}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                                isSaved
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                              }`}
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : isSaved ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save Rate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hotel Parijaye (Kalyani) Rooms */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-500" />
                    <h5 className={`font-serif font-bold text-sm ${isNight ? 'text-white' : 'text-slate-950'}`}>
                      Hotel Parijaye (Kalyani) — 3 Room Types
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {kalyaniRooms.map((room) => {
                      const currentRate = editablePrices[room.id] ?? room.pricePerNight;
                      const isSaving = savingRoomId === room.id;
                      const isSaved = savedRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                            isNight ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-serif font-bold text-emerald-500">
                                {room.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                {room.occupancy}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                              {room.tagline}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min={500}
                                max={50000}
                                step={50}
                                value={currentRate}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  setEditablePrices((prev) => ({
                                    ...prev,
                                    [room.id]: isNaN(val) ? 0 : val
                                  }));
                                }}
                                className={`w-24 px-2 py-1.5 text-sm font-mono font-bold rounded-lg border outline-none text-right ${
                                  isNight
                                    ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-400'
                                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                                }`}
                              />
                              <span className="text-xs text-slate-400 font-sans">/nt</span>
                            </div>

                            <button
                              onClick={() => handleSavePrice(room.id)}
                              disabled={isSaving}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                                isSaved
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                              }`}
                            >
                              {isSaving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isSaved ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Lightbox for Preview */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <div
              className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{previewPhoto.title}</span>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={previewPhoto.url}
                  alt={previewPhoto.title}
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
