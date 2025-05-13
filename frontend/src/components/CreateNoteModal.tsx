'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Componente Modal de Criação de Nota
 * 
 * Este componente renderiza um modal para criação rápida de notas
 * que pode ser aberto de qualquer lugar do aplicativo através de um evento personalizado.
 */
export default function CreateNoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Escuta o evento personalizado para abrir o modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
    };

    // Registra o listener para o evento personalizado
    window.addEventListener('openCreateNoteModal', handleOpenModal);

    // Limpa o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('openCreateNoteModal', handleOpenModal);
    };
  }, []);

  // Função para redirecionar para a página de criação de notas
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    router.push('/dashboard/notes/new');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nova Nota</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateNote}>
          <div className="mb-6 text-center">
            <p className="text-gray-700 mb-4">Você será redirecionado para o editor completo de notas.</p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-800 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md"
            >
              Criar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}