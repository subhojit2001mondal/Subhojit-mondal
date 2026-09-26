/**
 * Unified photo storage utility combining Firestore Cloud Database with local IndexedDB cache.
 * High-resolution phone/camera photos are compressed and persisted to Cloud Firestore
 * so they are saved across devices, reloads, and visitors.
 */

import {
  DatabasePhoto,
  savePhotosToDb,
  deletePhotoFromDb,
  getPhotosFromDb,
  subscribeToPhotos
} from '../services/dbService';

const DB_NAME = 'parijai_hospitality_db';
const DB_VERSION = 2;
const STORE_GANGTOK = 'gangtok_photos';
const STORE_KALYANI = 'kalyani_photos';

export interface StoredPhoto {
  id: string;
  url: string;
  title: string;
  caption?: string;
  tag?: string;
  addedAt: number;
  propertyId?: 'gangtok' | 'kalyani';
}

function getStoreName(property: 'gangtok' | 'kalyani' = 'gangtok'): string {
  return property === 'kalyani' ? STORE_KALYANI : STORE_GANGTOK;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_GANGTOK)) {
        db.createObjectStore(STORE_GANGTOK, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_KALYANI)) {
        db.createObjectStore(STORE_KALYANI, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get stored photos: checks Firestore first, merges with local IndexedDB
 */
export async function getStoredPhotos(property: 'gangtok' | 'kalyani' = 'gangtok'): Promise<StoredPhoto[]> {
  try {
    // 1. Fetch from Firestore Cloud Database
    const cloudPhotos = await getPhotosFromDb(property);

    // 2. Fetch from IndexedDB for local offline fallback
    let localPhotos: StoredPhoto[] = [];
    try {
      const db = await openDB();
      const storeName = getStoreName(property);
      localPhotos = await new Promise((resolve) => {
        if (!db.objectStoreNames.contains(storeName)) {
          resolve([]);
          return;
        }
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as StoredPhoto[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      // indexedDB failed, ignore
    }

    // Merge by ID giving cloud priority
    const map = new Map<string, StoredPhoto>();
    localPhotos.forEach((p) => map.set(p.id, p));
    cloudPhotos.forEach((p) => map.set(p.id, { ...p, propertyId: property }));

    const merged = Array.from(map.values());
    merged.sort((a, b) => b.addedAt - a.addedAt);
    return merged;
  } catch (err) {
    console.warn('Failed to load photos from DB', err);
    return [];
  }
}

/**
 * Save photos to both Firestore Database and IndexedDB
 */
export async function savePhotosToStorage(
  photos: StoredPhoto[],
  property: 'gangtok' | 'kalyani' = 'gangtok'
): Promise<void> {
  // 1. Save to Firestore
  try {
    const dbPhotos: DatabasePhoto[] = photos.map((p) => ({
      id: p.id,
      propertyId: property,
      url: p.url,
      title: p.title,
      caption: p.caption,
      tag: p.tag,
      addedAt: p.addedAt || Date.now()
    }));
    await savePhotosToDb(dbPhotos);
  } catch (cloudErr) {
    console.warn('Could not save to Firestore, saving to local store:', cloudErr);
  }

  // 2. Save to local IndexedDB
  try {
    const db = await openDB();
    const storeName = getStoreName(property);
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      photos.forEach((photo) => store.put(photo));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Failed to save photos to IndexedDB', err);
  }
}

/**
 * Delete photo from both Firestore and IndexedDB
 */
export async function deletePhotoFromStorage(
  id: string,
  property: 'gangtok' | 'kalyani' = 'gangtok'
): Promise<void> {
  // 1. Delete from Firestore
  try {
    await deletePhotoFromDb(id);
  } catch (err) {
    console.warn('Could not delete from Firestore:', err);
  }

  // 2. Delete from IndexedDB
  try {
    const db = await openDB();
    const storeName = getStoreName(property);
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Failed to delete photo from IndexedDB', err);
  }
}

export async function clearBrokenPhotosFromStorage(
  property: 'gangtok' | 'kalyani' = 'gangtok'
): Promise<void> {
  try {
    const db = await openDB();
    const storeName = getStoreName(property);
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result as StoredPhoto[]) || [];
        items.forEach((item) => {
          if (
            !item.url ||
            (!item.url.startsWith('data:') &&
              !item.url.startsWith('http://') &&
              !item.url.startsWith('https://') &&
              !item.url.startsWith('blob:'))
          ) {
            store.delete(item.id);
          }
        });
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Failed to clear broken photos', err);
  }
}

export async function clearAllPhotosFromStorage(
  property: 'gangtok' | 'kalyani' = 'gangtok'
): Promise<void> {
  try {
    const db = await openDB();
    const storeName = getStoreName(property);
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Failed to clear all photos from IndexedDB', err);
  }
}

/**
 * Resizes and compresses an image file to max 1280px width/height and JPEG 0.78.
 * Ensures the data URL payload is compact (~100-200KB) for fast Firestore document persistence.
 */
export function compressImageFile(file: File, maxDim = 1280, quality = 0.78): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
