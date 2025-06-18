// util functions to interact with IndexedDB outside React components
// Provides simple Promise-based wrappers for the most common operations.
// This avoids re-usar o hook React em lógicas que rodam fora de componentes.

export async function openDatabase(
  dbName: string,
  storeName: string,
  version = 1
): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB só está disponível no navegador');
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);

    request.onerror = (event) => {
      reject(((event.target as IDBRequest).error) ?? new Error('IndexedDB error'));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
}

export async function getAllItems<T = unknown>(
  dbName: string,
  storeName: string
): Promise<T[]> {
  const db = await openDatabase(dbName, storeName);
  return new Promise<T[]>((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = (e) => reject(((e.target as IDBRequest).error) ?? new Error('IndexedDB error'));
  });
}

export async function clearStore(
  dbName: string,
  storeName: string
): Promise<void> {
  const db = await openDatabase(dbName, storeName);
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(((e.target as IDBRequest).error) ?? new Error('IndexedDB error'));
  });
}

export async function addItems<T extends { id?: string }>(
  dbName: string,
  storeName: string,
  items: T[]
): Promise<void> {
  const db = await openDatabase(dbName, storeName);
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    items.forEach((item) => {
      const itemToAdd = {
        ...item,
        id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        updatedAt: new Date().toISOString(),
      };
      store.put(itemToAdd);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(((e.target as IDBRequest).error) ?? new Error('IndexedDB error'));
  });
}
