import React from "react";
import { useOfflineSync } from "../hooks/useOfflineSync";

/**
 * Componente que exibe um indicador de status offline e operações pendentes
 *
 * Este componente mostra um banner na parte superior da aplicação quando
 * o usuário está offline, além de exibir o número de operações pendentes
 * e permitir forçar a sincronização quando voltar a ficar online.
 */
const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingOperationsCount, lastSyncTime, forceSyncNow } =
    useOfflineSync();

  // Se estiver online e não houver operações pendentes, não exibir nada
  if (isOnline && pendingOperationsCount === 0 && !isSyncing) {
    return null;
  }

  // Formatar a última sincronização
  const formatLastSync = () => {
    if (!lastSyncTime) return "Nunca";

    const date = new Date(lastSyncTime);
    return date.toLocaleString();
  };

  return (
    <div className={`offline-indicator ${isOnline ? "online" : "offline"}`}>
      <div className="status-icon">
        {isOnline ? (
          <span className="online-icon">🟢</span>
        ) : (
          <span className="offline-icon">🔴</span>
        )}
      </div>

      <div className="status-message">
        {!isOnline && (
          <span className="offline-message">
            Você está offline. As alterações serão sincronizadas quando a conexão for restabelecida.
          </span>
        )}

        {isOnline && pendingOperationsCount > 0 && (
          <span className="pending-message">
            {isSyncing
              ? `Sincronizando ${pendingOperationsCount} operações pendentes...`
              : `${pendingOperationsCount} operações pendentes para sincronizar`}
          </span>
        )}

        <div className="sync-info">
          <small>Última sincronização: {formatLastSync()}</small>

          {isOnline && pendingOperationsCount > 0 && !isSyncing && (
            <button className="sync-button" onClick={forceSyncNow} disabled={isSyncing}>
              Sincronizar agora
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .offline-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .offline {
          background-color: #ffebee;
          color: #c62828;
          border-bottom: 1px solid #ef9a9a;
        }

        .online {
          background-color: #e8f5e9;
          color: #2e7d32;
          border-bottom: 1px solid #a5d6a7;
        }

        .status-icon {
          margin-right: 12px;
          font-size: 18px;
        }

        .status-message {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .sync-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.8;
        }

        .sync-button {
          background: none;
          border: 1px solid currentColor;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 12px;
          cursor: pointer;
          margin-left: 8px;
        }

        .sync-button:hover {
          opacity: 0.8;
        }

        .sync-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;
