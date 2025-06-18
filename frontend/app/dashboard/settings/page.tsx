'use client';

import React, { useRef } from 'react';
import { exportStore, importStore } from '../../../src/utils/backup';

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const blob = await exportStore('notesDB', 'notes');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Falha ao exportar backup');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importStore('notesDB', 'notes', file);
      alert('Backup restaurado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Falha ao importar backup');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Backup</h2>
        <p className="text-sm text-gray-600">
          Exporte suas notas para um arquivo JSON e armazene-o onde quiser
          (Google Drive, pendrive, etc.). Também é possível importar o arquivo
          para restaurar suas notas.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Exportar notas
          </button>
          <button
            onClick={handleImportClick}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Importar notas
          </button>
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Arquivo de backup JSON"
            title="Selecionar arquivo de backup JSON"
            className="hidden"
          />
        </div>
      </section>
    </div>
  );
}
