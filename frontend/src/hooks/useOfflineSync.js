import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Hook para gerenciar sincronização offline-online
 *
 * Este hook gerencia a detecção de conectividade, armazenamento de operações
 * offline e sincronização quando a conexão é restabelecida.
 */
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingOperations, setPendingOperations] = useLocalStorage("pendingOperations", []);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage("lastSyncTime", null);

  // Detectar mudanças de conectividade
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Adicionar operação à fila quando offline
  const addPendingOperation = useCallback(
    (operation) => {
      if (!operation) return;

      setPendingOperations((prev) => [
        ...prev,
        {
          ...operation,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }
      ]);
    },
    [setPendingOperations]
  );

  // Sincronizar operações pendentes quando online
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0 || isSyncing) return;

    setIsSyncing(true);

    try {
      // Clonar a lista para não modificar o estado durante o processamento
      const operations = [...pendingOperations];
      const successfulOps = [];
      const failedOps = [];

      // Processar operações em ordem
      for (const op of operations) {
        try {
          // Implementar lógica de envio para o servidor
          // Exemplo: await api.post(op.endpoint, op.data);

          // Se bem-sucedido, adicionar à lista de operações bem-sucedidas
          successfulOps.push(op.id);
        } catch (error) {
          console.error("Erro ao sincronizar operação:", op, error);
          failedOps.push(op.id);
        }
      }

      // Remover operações bem-sucedidas da lista
      if (successfulOps.length > 0) {
        setPendingOperations((prev) => prev.filter((op) => !successfulOps.includes(op.id)));
      }

      // Atualizar timestamp da última sincronização
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error("Erro durante sincronização:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingOperations, isSyncing, setPendingOperations, setLastSyncTime]);

  // Verificar conflitos entre operações locais e remotas
  const checkConflicts = useCallback((localData, remoteData) => {
    if (!localData || !remoteData) return { hasConflict: false, mergedData: remoteData };

    // Implementar lógica de detecção de conflitos
    // Exemplo: comparar timestamps ou versões
    const hasConflict =
      localData.updatedAt &&
      remoteData.updatedAt &&
      new Date(localData.updatedAt) > new Date(remoteData.updatedAt);

    if (!hasConflict) {
      return { hasConflict: false, mergedData: remoteData };
    }

    // Estratégia simples de merge (pode ser expandida conforme necessário)
    const mergedData = {
      ...remoteData,
      // Manter dados locais mais recentes para campos específicos
      // Exemplo: conteúdo da nota
      content: localData.content,
      // Adicionar flag de conflito para revisão manual se necessário
      _hasConflict: true,
      _localVersion: { ...localData },
      _remoteVersion: { ...remoteData }
    };

    return { hasConflict: true, mergedData };
  }, []);

  // Forçar sincronização manual
  const forceSyncNow = useCallback(() => {
    if (isOnline) {
      syncPendingOperations();
    }
  }, [isOnline, syncPendingOperations]);

  return {
    isOnline,
    isSyncing,
    pendingOperationsCount: pendingOperations.length,
    lastSyncTime,
    addPendingOperation,
    syncPendingOperations,
    checkConflicts,
    forceSyncNow
  };
};

// Hook auxiliar para localStorage (implementação simplificada)
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
