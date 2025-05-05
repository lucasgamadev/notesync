import { useCallback, useEffect, useState } from "react";

/**
 * Hook para gerenciar armazenamento com IndexedDB
 *
 * Este hook fornece uma interface para armazenar e recuperar dados
 * usando IndexedDB, ideal para armazenamento offline de grandes volumes de dados.
 *
 * @param {string} dbName - Nome do banco de dados
 * @param {string} storeName - Nome do object store
 * @param {number} version - Versão do banco de dados
 */
export const useIndexedDB = (dbName, storeName, version = 1) => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar o banco de dados
  useEffect(() => {
    if (!window.indexedDB) {
      setError("Seu navegador não suporta IndexedDB");
      setIsLoading(false);
      return;
    }

    const request = window.indexedDB.open(dbName, version);

    request.onerror = (event) => {
      setError(`Erro ao abrir banco de dados: ${event.target.error}`);
      setIsLoading(false);
    };

    request.onsuccess = (event) => {
      setDb(event.target.result);
      setIsLoading(false);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Criar object store se não existir
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    return () => {
      // Fechar conexão quando o componente for desmontado
      if (db) {
        db.close();
      }
    };
  }, [dbName, storeName, version]);

  // Adicionar ou atualizar um item
  const addItem = useCallback(
    async (item) => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error("Banco de dados não inicializado"));
          return;
        }

        try {
          const transaction = db.transaction([storeName], "readwrite");
          const store = transaction.objectStore(storeName);

          // Garantir que o item tenha um ID
          const itemToAdd = {
            ...item,
            id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            updatedAt: new Date().toISOString()
          };

          const request = store.put(itemToAdd);

          request.onsuccess = () => resolve(itemToAdd);
          request.onerror = (event) => reject(event.target.error);

          transaction.oncomplete = () => {
            // Transação concluída com sucesso
          };

          transaction.onerror = (event) => {
            reject(event.target.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    },
    [db, storeName]
  );

  // Obter um item pelo ID
  const getItem = useCallback(
    async (id) => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error("Banco de dados não inicializado"));
          return;
        }

        try {
          const transaction = db.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);
          const request = store.get(id);

          request.onsuccess = () => resolve(request.result);
          request.onerror = (event) => reject(event.target.error);
        } catch (error) {
          reject(error);
        }
      });
    },
    [db, storeName]
  );

  // Obter todos os itens
  const getAllItems = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Banco de dados não inicializado"));
        return;
      }

      try {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      } catch (error) {
        reject(error);
      }
    });
  }, [db, storeName]);

  // Remover um item pelo ID
  const removeItem = useCallback(
    async (id) => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error("Banco de dados não inicializado"));
          return;
        }

        try {
          const transaction = db.transaction([storeName], "readwrite");
          const store = transaction.objectStore(storeName);
          const request = store.delete(id);

          request.onsuccess = () => resolve(true);
          request.onerror = (event) => reject(event.target.error);
        } catch (error) {
          reject(error);
        }
      });
    },
    [db, storeName]
  );

  // Limpar todos os dados
  const clearStore = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Banco de dados não inicializado"));
        return;
      }

      try {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
      } catch (error) {
        reject(error);
      }
    });
  }, [db, storeName]);

  // Verificar o tamanho aproximado do armazenamento
  const getStoreSize = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Banco de dados não inicializado"));
        return;
      }

      try {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result;
          let size = 0;

          // Calcular tamanho aproximado em bytes
          if (items && items.length > 0) {
            const jsonString = JSON.stringify(items);
            size = new Blob([jsonString]).size;
          }

          resolve({
            items: items.length,
            sizeInBytes: size,
            sizeInKB: Math.round(size / 1024),
            sizeInMB: Math.round((size / (1024 * 1024)) * 100) / 100
          });
        };

        request.onerror = (event) => reject(event.target.error);
      } catch (error) {
        reject(error);
      }
    });
  }, [db, storeName]);

  return {
    isLoading,
    error,
    addItem,
    getItem,
    getAllItems,
    removeItem,
    clearStore,
    getStoreSize
  };
};
