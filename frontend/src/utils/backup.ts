import { getAllItems, clearStore, addItems } from './indexeddb';

export async function exportStore(dbName: string, storeName: string): Promise<Blob> {
  const data = await getAllItems(dbName, storeName);
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export async function importStore(dbName: string, storeName: string, file: File): Promise<void> {
  const text = await file.text();
  const items = JSON.parse(text);
  if (!Array.isArray(items)) {
    throw new Error('Arquivo de backup inválido');
  }
  await clearStore(dbName, storeName);
  await addItems(dbName, storeName, items);
}
