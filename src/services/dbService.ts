import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { compressImageFile } from '../utils/photoStorage';
import { DEFAULT_ROOM_PRICES } from '../data/hotels';

export type GalleryId =
  // Trikuta Residency (Gangtok)
  | 'gangtok/exterior'
  | 'gangtok/view-room'
  | 'gangtok/non-view-room'
  | 'gangtok/reception'
  | 'gangtok/dining'
  // Hotel Parijaye (Kalyani)
  | 'kalyani/exterior'
  | 'kalyani/non-ac'
  | 'kalyani/standard-ac'
  | 'kalyani/deluxe-twin'
  | 'kalyani/reception'
  | 'kalyani/dining';

export interface GalleryPhoto {
  id: string;
  galleryId: GalleryId;
  url: string;
  title: string;
  caption?: string;
  storagePath?: string;
  uploadedAt: string;
  timestamp: number;
}

export interface GallerySectionConfig {
  id: GalleryId;
  propertyId: 'gangtok' | 'kalyani';
  propertyName: string;
  name: string;
  sectionTitle: string;
  badge: string;
  description: string;
}

export const GALLERY_CONFIGS: Record<GalleryId, GallerySectionConfig> = {
  // Gangtok
  'gangtok/exterior': {
    id: 'gangtok/exterior',
    propertyId: 'gangtok',
    propertyName: 'Trikuta Residency (Gangtok)',
    name: 'Building Front / Exterior',
    sectionTitle: 'Building Front & Hillside Exterior',
    badge: 'Resort Facade',
    description: 'Mountain frontage, cedar-insulated exterior architecture, car porch, and panoramic views of Gangtok hills.'
  },
  'gangtok/view-room': {
    id: 'gangtok/view-room',
    propertyId: 'gangtok',
    propertyName: 'Trikuta Residency (Gangtok)',
    name: 'View Room',
    sectionTitle: 'View Room (Deluxe Mountain Facing)',
    badge: 'Hillside & Valley View',
    description: 'Window faces the hillside, offering direct views of the Kanchenjunga range and verdant valley mist.'
  },
  'gangtok/non-view-room': {
    id: 'gangtok/non-view-room',
    propertyId: 'gangtok',
    propertyName: 'Trikuta Residency (Gangtok)',
    name: 'Non-View Room',
    sectionTitle: 'Non-View Room (Regular Mountain Comfort)',
    badge: 'Standard Window',
    description: 'Standard window, peaceful mountain room with cozy wooden aesthetics and electric bed warmers.'
  },
  'gangtok/reception': {
    id: 'gangtok/reception',
    propertyId: 'gangtok',
    propertyName: 'Trikuta Residency (Gangtok)',
    name: 'Reception Area',
    sectionTitle: 'Reception & Check-in Lobby',
    badge: 'Common Area',
    description: 'Warm welcoming check-in desk, marble staircase, cozy seating lounge, and dedicated travel permit desk for Nathula Pass & North Sikkim.'
  },
  'gangtok/dining': {
    id: 'gangtok/dining',
    propertyId: 'gangtok',
    propertyName: 'Trikuta Residency (Gangtok)',
    name: 'Dining Area',
    sectionTitle: 'In-House Dining & Restaurant',
    badge: 'Common Area',
    description: 'Authentic in-house Sikkimese organic specialty dining along with comforting North & South Indian meals, mountain tea, and breakfast spread.'
  },

  // Kalyani
  'kalyani/exterior': {
    id: 'kalyani/exterior',
    propertyId: 'kalyani',
    propertyName: 'Hotel Parijaye (Kalyani)',
    name: 'Building Front / Exterior',
    sectionTitle: 'Hotel Facade & Building Front',
    badge: 'Hotel Entrance',
    description: 'Executive healthcare-adjacent hotel exterior in Basantapur, wheelchair ramps, and dedicated transit entrance just 2-3 minutes from AIIMS OPD.'
  },
  'kalyani/non-ac': {
    id: 'kalyani/non-ac',
    propertyId: 'kalyani',
    propertyName: 'Hotel Parijaye (Kalyani)',
    name: 'Non-AC Rooms',
    sectionTitle: 'Non-AC Rooms (Attendant Comfort)',
    badge: 'Economical Attendant Stay',
    description: 'Economical, well-ventilated, spotlessly sanitized comfort with elevator and ramp access for patient attendants.'
  },
  'kalyani/standard-ac': {
    id: 'kalyani/standard-ac',
    propertyId: 'kalyani',
    propertyName: 'Hotel Parijaye (Kalyani)',
    name: 'Standard AC Rooms',
    sectionTitle: 'Standard AC Rooms (Climate Care)',
    badge: 'Climate Controlled',
    description: 'Climate-controlled serene comfort with elevator access, sanitized linens, quiet rest atmosphere, and doctor-on-call support.'
  },
  'kalyani/deluxe-twin': {
    id: 'kalyani/deluxe-twin',
    propertyId: 'kalyani',
    propertyName: 'Hotel Parijaye (Kalyani)',
    name: 'Deluxe Twin Care Room',
    sectionTitle: 'Deluxe Twin Care Room (Orthopedic Twin Beds)',
    badge: 'Caregiver Comfort',
    description: 'Spotlessly sanitized comfort with twin ergonomic care beds, wheelchair accessible doorways, and hospital-grade elevator access.'
  },
  'kalyani/reception': {
    id: 'kalyani/reception',
    propertyId: 'kalyani',
    propertyName: 'Hotel Parijaye (Kalyani)',
    name: 'Reception Area',
    sectionTitle: 'Reception Desk & Medical Help Lobby',
    badge: '24/7 Front Desk',
    description: '24/7 check-in lobby, prescription and emergency assistance, wheelchair parking, and prompt e-rickshaw dispatch to AIIMS Kalyani Gate 1.'
  },
  'kalyani/dining': {
    id: 'kalyani/dining',
    propertyId: 'kalyani',
    propertyName: 'Hotel Parijaye (Kalyani)',
    name: 'Dining Area',
    sectionTitle: 'Sanitized Kitchen & Attendant Dining',
    badge: 'Diet & Attendant Dining',
    description: 'Sanitized in-house kitchen preparing fresh homestyle Bengali & North Indian food, plus customizable low-sodium, boiled patient diet meals.'
  }
};

/**
 * Normalizes legacy or aliased gallery IDs so existing data works smoothly
 */
export function normalizeGalleryId(rawId: string): GalleryId {
  if (rawId === 'rooms/view-room') return 'gangtok/view-room';
  if (rawId === 'rooms/non-view-room') return 'gangtok/non-view-room';
  if (rawId === 'common/reception') return 'gangtok/reception';
  if (rawId === 'common/dining') return 'gangtok/dining';
  if (rawId in GALLERY_CONFIGS) return rawId as GalleryId;
  return 'gangtok/view-room';
}

export function getInitialGalleryPhotos(): Record<GalleryId, GalleryPhoto[]> {
  return {
    'gangtok/exterior': [],
    'gangtok/view-room': [],
    'gangtok/non-view-room': [],
    'gangtok/reception': [],
    'gangtok/dining': [],
    'kalyani/exterior': [],
    'kalyani/non-ac': [],
    'kalyani/standard-ac': [],
    'kalyani/deluxe-twin': [],
    'kalyani/reception': [],
    'kalyani/dining': []
  };
}

export interface DatabasePhoto {
  id: string;
  propertyId: 'gangtok' | 'kalyani';
  url: string;
  title: string;
  caption?: string;
  tag?: string;
  addedAt: number;
  addedBy?: string;
}

export interface BookingRecord {
  id: string;
  bookingRef: string;
  propertyId: 'gangtok' | 'kalyani';
  propertyName: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  childrenCount: number;
  purpose: 'leisure' | 'medical' | 'corporate';
  specialNeeds: string;
  selectedAddOns: { id: string; name: string; price: number }[];
  baseTariff: number;
  addOnsTotal: number;
  subTotal: number;
  gst: number;
  grandTotal: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'pay_at_hotel';
  status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  createdAt: string;
  createdTimestamp?: number;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  propertyId?: 'gangtok' | 'kalyani' | 'general';
  subject: string;
  message: string;
  source: 'website_inquiry' | 'newsletter' | 'frontdesk';
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface RoomPriceRecord {
  roomId: string;
  propertyId: 'gangtok' | 'kalyani';
  roomName: string;
  pricePerNight: number;
  updatedAt: string;
  updatedTimestamp: number;
}

const PHOTOS_COLLECTION = 'photos';
const BOOKINGS_COLLECTION = 'bookings';
const INQUIRIES_COLLECTION = 'customerInquiries';
const GALLERY_COLLECTION = 'galleryPhotos';
const ROOM_PRICING_COLLECTION = 'roomPricing';

// -------------------------------------------------------------
// FIRESTORE QUOTA & RESILIENCE HANDLER
// -------------------------------------------------------------
const QUOTA_STORAGE_KEY = 'parijai_firestore_quota_state';
let isQuotaExceededMemory = false;

export function isFirestoreQuotaExceeded(): boolean {
  if (isQuotaExceededMemory) return true;
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - (parsed.timestamp || 0) < 2 * 60 * 60 * 1000) {
        isQuotaExceededMemory = true;
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export function checkAndMarkQuotaExceeded(err: unknown): boolean {
  if (!err) return false;
  const msg = typeof err === 'object' && err !== null && 'message' in err ? String((err as any).message) : String(err);
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as any).code) : '';
  const isQuota =
    code === 'resource-exhausted' ||
    /quota limit exceeded/i.test(msg) ||
    /quota exceeded/i.test(msg) ||
    /Free daily read units/i.test(msg);

  if (isQuota) {
    isQuotaExceededMemory = true;
    try {
      localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
    } catch {
      // ignore
    }
  }
  return isQuota;
}

// -------------------------------------------------------------
// LOCAL CACHING REPOSITORIES
// -------------------------------------------------------------
const LOCAL_PHOTOS_KEY_PREFIX = 'parijai_cache_photos_';
const LOCAL_BOOKINGS_KEY = 'parijai_cache_bookings';
const LOCAL_INQUIRIES_KEY = 'parijai_cache_inquiries';
const LOCAL_GALLERY_KEY = 'parijai_cache_gallery_v2';
const LOCAL_ROOM_PRICES_KEY = 'parijai_cache_room_prices';

function getLocalPhotos(propertyId: 'gangtok' | 'kalyani'): DatabasePhoto[] {
  try {
    const raw = localStorage.getItem(LOCAL_PHOTOS_KEY_PREFIX + propertyId);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveLocalPhotos(propertyId: 'gangtok' | 'kalyani', photos: DatabasePhoto[]): void {
  try {
    localStorage.setItem(LOCAL_PHOTOS_KEY_PREFIX + propertyId, JSON.stringify(photos));
  } catch {
    // ignore
  }
}

function addLocalPhoto(photo: DatabasePhoto): void {
  const current = getLocalPhotos(photo.propertyId);
  const filtered = current.filter((p) => p.id !== photo.id);
  const updated = [photo, ...filtered];
  saveLocalPhotos(photo.propertyId, updated);
}

function deleteLocalPhoto(photoId: string): void {
  for (const pid of ['gangtok', 'kalyani'] as const) {
    const current = getLocalPhotos(pid);
    const updated = current.filter((p) => p.id !== photoId);
    if (updated.length !== current.length) {
      saveLocalPhotos(pid, updated);
    }
  }
}

function getLocalBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveLocalBookings(bookings: BookingRecord[]): void {
  try {
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch {
    // ignore
  }
}

function addLocalBooking(booking: BookingRecord): void {
  const current = getLocalBookings();
  const filtered = current.filter((b) => b.id !== booking.id);
  saveLocalBookings([booking, ...filtered]);
}

function updateLocalBooking(bookingId: string, status: BookingRecord['status']): void {
  const current = getLocalBookings();
  const updated = current.map((b) => (b.id === bookingId ? { ...b, status } : b));
  saveLocalBookings(updated);
}

function getLocalInquiries(): CustomerInquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveLocalInquiries(inquiries: CustomerInquiry[]): void {
  try {
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(inquiries));
  } catch {
    // ignore
  }
}

function addLocalInquiry(inquiry: CustomerInquiry): void {
  const current = getLocalInquiries();
  const filtered = current.filter((i) => i.id !== inquiry.id);
  saveLocalInquiries([inquiry, ...filtered]);
}

function getLocalGalleryPhotos(): Record<GalleryId, GalleryPhoto[]> {
  const initial = getInitialGalleryPhotos();
  try {
    const raw = localStorage.getItem(LOCAL_GALLERY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Remap any legacy keys to current keys
      for (const k of Object.keys(parsed)) {
        const normKey = normalizeGalleryId(k);
        if (normKey in initial) {
          initial[normKey] = parsed[k];
        }
      }
      return initial;
    }
  } catch {
    // ignore
  }
  return initial;
}

function saveLocalGalleryPhotos(photos: Record<GalleryId, GalleryPhoto[]>): void {
  try {
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(photos));
  } catch {
    // ignore
  }
}

function addLocalGalleryPhoto(photo: GalleryPhoto): void {
  const current = getLocalGalleryPhotos();
  const normId = normalizeGalleryId(photo.galleryId);
  const existing = current[normId] || [];
  const filtered = existing.filter((p) => p.id !== photo.id);
  current[normId] = [photo, ...filtered];
  saveLocalGalleryPhotos(current);
}

function deleteLocalGalleryPhoto(photoId: string): void {
  const current = getLocalGalleryPhotos();
  for (const key of Object.keys(current) as GalleryId[]) {
    current[key] = current[key].filter((p) => p.id !== photoId);
  }
  saveLocalGalleryPhotos(current);
}

// -------------------------------------------------------------
// ROOM PRICING REPOSITORY
// -------------------------------------------------------------

function getLocalRoomPrices(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCAL_ROOM_PRICES_KEY);
    if (raw) {
      return { ...DEFAULT_ROOM_PRICES, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_ROOM_PRICES };
}

function saveLocalRoomPrices(prices: Record<string, number>): void {
  try {
    localStorage.setItem(LOCAL_ROOM_PRICES_KEY, JSON.stringify(prices));
  } catch {
    // ignore
  }
}

/**
 * Save new nightly rate for a specific room to Firestore and local cache
 */
export async function saveRoomPriceToDb(
  roomId: string,
  pricePerNight: number,
  roomName?: string,
  propertyId?: 'gangtok' | 'kalyani'
): Promise<void> {
  const current = getLocalRoomPrices();
  current[roomId] = pricePerNight;
  saveLocalRoomPrices(current);

  try {
    const docRef = doc(db, ROOM_PRICING_COLLECTION, roomId);
    await setDoc(docRef, {
      roomId,
      roomName: roomName || roomId,
      propertyId: propertyId || (roomId.startsWith('g') ? 'gangtok' : 'kalyani'),
      pricePerNight,
      updatedAt: new Date().toISOString(),
      updatedTimestamp: Date.now()
    }, { merge: true });
  } catch (err) {
    if (checkAndMarkQuotaExceeded(err)) {
      console.warn('Room price saved locally (cloud quota reached):', err);
    } else {
      console.warn('Notice saving room price to database (stored in local cache):', err);
    }
  }
}

/**
 * Fetch all room prices with local cache fallback
 */
export async function getRoomPricesFromDb(): Promise<Record<string, number>> {
  const local = getLocalRoomPrices();

  if (isFirestoreQuotaExceeded()) {
    return local;
  }

  try {
    const snap = await getDocs(collection(db, ROOM_PRICING_COLLECTION));
    const result: Record<string, number> = { ...local };
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data.pricePerNight === 'number') {
        result[d.id] = data.pricePerNight;
      }
    });
    saveLocalRoomPrices(result);
    return result;
  } catch (err) {
    checkAndMarkQuotaExceeded(err);
    return local;
  }
}

/**
 * Realtime subscription for room prices
 */
export function subscribeToRoomPrices(
  callback: (prices: Record<string, number>) => void
): Unsubscribe {
  if (isFirestoreQuotaExceeded()) {
    callback(getLocalRoomPrices());
    return () => {};
  }

  return onSnapshot(
    collection(db, ROOM_PRICING_COLLECTION),
    (snapshot) => {
      const result: Record<string, number> = { ...DEFAULT_ROOM_PRICES };
      snapshot.forEach((d) => {
        const data = d.data();
        if (data && typeof data.pricePerNight === 'number') {
          result[d.id] = data.pricePerNight;
        }
      });
      saveLocalRoomPrices(result);
      callback(result);
    },
    (err) => {
      checkAndMarkQuotaExceeded(err);
      console.warn('Room pricing subscription notice (serving local cache):', err?.message || err);
      callback(getLocalRoomPrices());
    }
  );
}

// -------------------------------------------------------------
// PHOTOS DATABASE REPOSITORY
// -------------------------------------------------------------

export async function savePhotoToDb(photo: DatabasePhoto): Promise<void> {
  addLocalPhoto(photo);
  try {
    const photoRef = doc(db, PHOTOS_COLLECTION, photo.id);
    await setDoc(photoRef, {
      ...photo,
      updatedAt: Date.now()
    });
  } catch (error) {
    if (checkAndMarkQuotaExceeded(error)) {
      console.warn('Cloud sync deferred: Firestore quota reached; photo stored in local persistent cache.');
    } else {
      console.warn('Notice saving photo to database (stored in local cache):', error);
    }
  }
}

export async function savePhotosToDb(photos: DatabasePhoto[]): Promise<void> {
  await Promise.all(photos.map((p) => savePhotoToDb(p)));
}

export async function getPhotosFromDb(propertyId: 'gangtok' | 'kalyani'): Promise<DatabasePhoto[]> {
  const local = getLocalPhotos(propertyId);

  if (isFirestoreQuotaExceeded()) {
    return local;
  }

  try {
    const q = query(
      collection(db, PHOTOS_COLLECTION),
      where('propertyId', '==', propertyId)
    );
    const snap = await getDocs(q);
    const results: DatabasePhoto[] = [];
    snap.forEach((d) => {
      const data = d.data() as DatabasePhoto;
      results.push({ ...data, id: d.id });
    });
    const sorted = results.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    saveLocalPhotos(propertyId, sorted);
    return sorted;
  } catch (error) {
    if (checkAndMarkQuotaExceeded(error)) {
      console.warn('Firestore read quota reached; serving photos from local persistent cache.');
    } else {
      console.warn('Notice: Firestore photo retrieval fallback:', error);
    }
    return local;
  }
}

export function subscribeToPhotos(
  propertyId: 'gangtok' | 'kalyani',
  callback: (photos: DatabasePhoto[]) => void
): Unsubscribe {
  if (isFirestoreQuotaExceeded()) {
    callback(getLocalPhotos(propertyId));
    return () => {};
  }

  const q = query(
    collection(db, PHOTOS_COLLECTION),
    where('propertyId', '==', propertyId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const photos: DatabasePhoto[] = [];
      snapshot.forEach((d) => {
        photos.push({ ...(d.data() as DatabasePhoto), id: d.id });
      });
      photos.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
      saveLocalPhotos(propertyId, photos);
      callback(photos);
    },
    (err) => {
      checkAndMarkQuotaExceeded(err);
      console.warn('Realtime photos notice (serving local cache):', err?.message || err);
      callback(getLocalPhotos(propertyId));
    }
  );
}

export async function deletePhotoFromDb(photoId: string): Promise<void> {
  deleteLocalPhoto(photoId);
  try {
    const photoRef = doc(db, PHOTOS_COLLECTION, photoId);
    await deleteDoc(photoRef);
  } catch (err) {
    console.warn('Notice deleting photo from cloud:', err);
  }
}

// -------------------------------------------------------------
// CUSTOMER BOOKINGS & RECORDS REPOSITORY
// -------------------------------------------------------------

export async function saveBookingToDb(
  bookingData: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>
): Promise<BookingRecord> {
  const newBookingId = bookingData.bookingRef || 'PJ-' + Date.now().toString(36).toUpperCase();
  const fullRecord: BookingRecord = {
    ...bookingData,
    id: newBookingId,
    bookingRef: newBookingId,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    createdTimestamp: Date.now()
  };

  addLocalBooking(fullRecord);

  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, newBookingId);
    await setDoc(docRef, fullRecord);
  } catch (error) {
    if (checkAndMarkQuotaExceeded(error)) {
      console.warn('Cloud sync deferred: Firestore quota reached; booking secured in local database.');
    } else {
      console.warn('Notice saving booking to cloud (saved locally):', error);
    }
  }

  return fullRecord;
}

export async function getAllBookingsFromDb(): Promise<BookingRecord[]> {
  const local = getLocalBookings();

  if (isFirestoreQuotaExceeded()) {
    return local;
  }

  try {
    const snap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    const results: BookingRecord[] = [];
    snap.forEach((d) => {
      results.push({ ...(d.data() as BookingRecord), id: d.id });
    });
    const sorted = results.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));
    saveLocalBookings(sorted);
    return sorted;
  } catch (error) {
    if (checkAndMarkQuotaExceeded(error)) {
      console.warn('Firestore read quota reached; serving bookings from local persistent database.');
    } else {
      console.warn('Notice fetching bookings from database:', error);
    }
    return local;
  }
}

export function subscribeToBookings(
  callback: (bookings: BookingRecord[]) => void
): Unsubscribe {
  if (isFirestoreQuotaExceeded()) {
    callback(getLocalBookings());
    return () => {};
  }

  return onSnapshot(
    collection(db, BOOKINGS_COLLECTION),
    (snapshot) => {
      const records: BookingRecord[] = [];
      snapshot.forEach((d) => {
        records.push({ ...(d.data() as BookingRecord), id: d.id });
      });
      records.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));
      saveLocalBookings(records);
      callback(records);
    },
    (err) => {
      checkAndMarkQuotaExceeded(err);
      console.warn('Realtime bookings listener notice (serving local cache):', err?.message || err);
      callback(getLocalBookings());
    }
  );
}

export async function findBookingByRefOrPhone(searchQuery: string): Promise<BookingRecord[]> {
  const clean = searchQuery.trim().toLowerCase();
  const all = await getAllBookingsFromDb();
  return all.filter(
    (b) =>
      b.bookingRef.toLowerCase().includes(clean) ||
      b.guestPhone.replace(/\D/g, '').includes(clean.replace(/\D/g, '')) ||
      b.guestName.toLowerCase().includes(clean)
  );
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingRecord['status']
): Promise<void> {
  updateLocalBooking(bookingId, newStatus);
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await setDoc(docRef, { status: newStatus }, { merge: true });
  } catch (err) {
    console.warn('Notice updating booking status on cloud:', err);
  }
}

// -------------------------------------------------------------
// CUSTOMER INQUIRIES & DIRECT INPUT REPOSITORY
// -------------------------------------------------------------

export async function saveCustomerInquiryToDb(
  inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>
): Promise<CustomerInquiry> {
  const id = 'INQ-' + Date.now().toString(36).toUpperCase();
  const fullInquiry: CustomerInquiry = {
    ...inquiry,
    id,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  addLocalInquiry(fullInquiry);

  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await setDoc(docRef, fullInquiry);
  } catch (error) {
    if (checkAndMarkQuotaExceeded(error)) {
      console.warn('Cloud sync deferred: Firestore quota reached; customer inquiry saved in local database.');
    } else {
      console.warn('Notice saving inquiry to cloud (saved locally):', error);
    }
  }

  return fullInquiry;
}

export async function getCustomerInquiriesFromDb(): Promise<CustomerInquiry[]> {
  const local = getLocalInquiries();

  if (isFirestoreQuotaExceeded()) {
    return local;
  }

  try {
    const snap = await getDocs(collection(db, INQUIRIES_COLLECTION));
    const results: CustomerInquiry[] = [];
    snap.forEach((d) => {
      results.push({ ...(d.data() as CustomerInquiry), id: d.id });
    });
    const sorted = results.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    saveLocalInquiries(sorted);
    return sorted;
  } catch (error) {
    if (checkAndMarkQuotaExceeded(error)) {
      console.warn('Firestore read quota reached; serving inquiries from local persistent database.');
    } else {
      console.warn('Notice fetching inquiries from database:', error);
    }
    return local;
  }
}

// -------------------------------------------------------------
// PERMANENT ROOM & COMMON-AREA GALLERY REPOSITORY
// -------------------------------------------------------------

/**
 * Uploads a photo to Cloud Storage and saves document to Firestore with local fallback
 */
export async function uploadGalleryPhoto(
  galleryId: GalleryId,
  file: File,
  customTitle?: string,
  caption?: string
): Promise<GalleryPhoto> {
  const normId = normalizeGalleryId(galleryId);
  const docId = `gp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  let finalUrl = '';
  let storagePath: string | undefined = undefined;

  // 1. Attempt Cloud Storage upload
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    storagePath = `${normId.replace('/', '_')}/${Date.now()}_${cleanName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    finalUrl = await getDownloadURL(storageRef);
  } catch (storageErr) {
    console.warn('Cloud Storage direct upload notice (using optimized fallback):', storageErr);
  }

  // 2. If storage upload didn't return URL, compress to compact data URL
  if (!finalUrl) {
    finalUrl = await compressImageFile(file, 1280, 0.78);
  }

  const cleanTitle = customTitle?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const config = GALLERY_CONFIGS[normId];

  const photoRecord: GalleryPhoto = {
    id: docId,
    galleryId: normId,
    url: finalUrl,
    title: cleanTitle || config?.name || 'Hotel Photo',
    caption: caption || config?.description || '',
    storagePath,
    uploadedAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  // 3. Save to local cache first
  addLocalGalleryPhoto(photoRecord);

  // 4. Save to Firestore if quota allows
  try {
    const docRef = doc(db, GALLERY_COLLECTION, docId);
    await setDoc(docRef, photoRecord);
  } catch (err) {
    if (checkAndMarkQuotaExceeded(err)) {
      console.warn('Cloud sync deferred: Firestore quota reached; gallery photo safely stored in local database.');
    } else {
      console.warn('Notice saving gallery photo to Firestore (saved locally):', err);
    }
  }

  return photoRecord;
}

/**
 * Save photo via direct web URL
 */
export async function saveGalleryPhotoUrl(
  galleryId: GalleryId,
  url: string,
  title?: string,
  caption?: string
): Promise<GalleryPhoto> {
  const normId = normalizeGalleryId(galleryId);
  const docId = `gp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const config = GALLERY_CONFIGS[normId];

  const photoRecord: GalleryPhoto = {
    id: docId,
    galleryId: normId,
    url: url.trim(),
    title: title?.trim() || `${config?.name || 'Hotel'} Photo`,
    caption: caption || config?.description || '',
    uploadedAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  addLocalGalleryPhoto(photoRecord);

  try {
    const docRef = doc(db, GALLERY_COLLECTION, docId);
    await setDoc(docRef, photoRecord);
  } catch (err) {
    if (checkAndMarkQuotaExceeded(err)) {
      console.warn('Cloud sync deferred: Firestore quota reached; gallery photo URL stored locally.');
    } else {
      console.warn('Notice saving gallery photo URL to Firestore (saved locally):', err);
    }
  }

  return photoRecord;
}

/**
 * Fetch all gallery photos from Firestore with quota fallback
 */
export async function getAllGalleryPhotosFromDb(): Promise<Record<GalleryId, GalleryPhoto[]>> {
  const local = getLocalGalleryPhotos();

  if (isFirestoreQuotaExceeded()) {
    return local;
  }

  const result = getInitialGalleryPhotos();

  try {
    const snap = await getDocs(collection(db, GALLERY_COLLECTION));
    snap.forEach((d) => {
      const data = d.data() as GalleryPhoto;
      const normId = normalizeGalleryId(data.galleryId);
      if (result[normId]) {
        result[normId].push({ ...data, galleryId: normId, id: d.id });
      }
    });

    // Sort descending by timestamp
    for (const key of Object.keys(result) as GalleryId[]) {
      result[key].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    saveLocalGalleryPhotos(result);
    return result;
  } catch (err) {
    if (checkAndMarkQuotaExceeded(err)) {
      console.warn('Firestore read quota reached; serving gallery photos from local persistent cache.');
    } else {
      console.warn('Notice fetching gallery photos from Firestore:', err);
    }
    return local;
  }
}

/**
 * Real-time subscription to all gallery photos with quota fallback
 */
export function subscribeToGalleryPhotos(
  callback: (photos: Record<GalleryId, GalleryPhoto[]>) => void
): Unsubscribe {
  if (isFirestoreQuotaExceeded()) {
    callback(getLocalGalleryPhotos());
    return () => {};
  }

  return onSnapshot(
    collection(db, GALLERY_COLLECTION),
    (snapshot) => {
      const result = getInitialGalleryPhotos();

      snapshot.forEach((d) => {
        const data = d.data() as GalleryPhoto;
        const normId = normalizeGalleryId(data.galleryId);
        if (result[normId]) {
          result[normId].push({ ...data, galleryId: normId, id: d.id });
        }
      });

      for (const key of Object.keys(result) as GalleryId[]) {
        result[key].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }

      saveLocalGalleryPhotos(result);
      callback(result);
    },
    (err) => {
      checkAndMarkQuotaExceeded(err);
      console.warn('Gallery photos subscription notice (serving local cache):', err?.message || err);
      callback(getLocalGalleryPhotos());
    }
  );
}

/**
 * Delete photo from Firestore & Storage & local cache immediately
 */
export async function deleteGalleryPhotoFromDb(photo: GalleryPhoto): Promise<void> {
  // Immediately clear from local cache
  deleteLocalGalleryPhoto(photo.id);

  try {
    const docRef = doc(db, GALLERY_COLLECTION, photo.id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Notice deleting gallery photo doc from cloud:', err);
  }

  if (photo.storagePath) {
    try {
      const storageRef = ref(storage, photo.storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Storage delete notice:', e);
    }
  }
}
