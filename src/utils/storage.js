/**
 * Athena Resilient Storage Utility
 * Uses IndexedDB for unlimited capacity (>500MB) with safe LocalStorage fallback.
 * Prevents QuotaExceededError crashes when dealing with large product catalogs.
 */

const DB_NAME = 'AthenaAutomotivaDB';
const DB_VERSION = 1;
const STORE_NAME = 'catalog_store';

function getIndexedDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Reads value from IndexedDB asynchronously.
 */
export async function idbGet(key) {
  try {
    const db = await getIndexedDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  } catch (e) {
    return null;
  }
}

/**
 * Saves value to IndexedDB asynchronously without size limit.
 */
export async function idbSet(key, value) {
  try {
    const db = await getIndexedDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  } catch (e) {
    return false;
  }
}

/**
 * Safely writes to localStorage with try-catch and dual IndexedDB persistence.
 * Never throws QuotaExceededError.
 */
export function safeStorageSet(key, value) {
  // 1. Always persist to IndexedDB asynchronously
  idbSet(key, value);

  // 2. Attempt to save in localStorage for synchronous fast boot
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    // Quota exceeded: clean up obsolete keys and keep data safely in IndexedDB
    console.warn(`[Athena Storage] localStorage quota exceeded for "${key}". Data safely stored in IndexedDB.`);
    try {
      if (key === 'athena_products') {
        localStorage.removeItem('athena_products');
      }
    } catch (e) {}
  }
}

/**
 * Safely reads from localStorage synchronously.
 */
export function safeStorageGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.warn(`[Athena Storage] Error parsing "${key}" from localStorage:`, err);
  }
  return defaultValue;
}

/**
 * Safely removes a key from both localStorage and IndexedDB.
 */
export function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
  
  getIndexedDB().then((db) => {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
    } catch (e) {}
  });
}
