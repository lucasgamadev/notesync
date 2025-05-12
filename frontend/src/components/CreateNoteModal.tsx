'use client';

import { useState, useEffect } from 'react';

/**
 * Componente Modal de Criação de Nota
 * 
 * Este componente renderiza um modal para criação rápida de notas
 * que pode ser aberto de qualquer lugar do aplicativo através de um evento personalizado.
 */
export default function CreateNoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

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

  // Função para criar uma nova nota rapidamente
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Importar o utilitário api para usar o mock API quando necessário
      const { default: api } = await import("@/src/utils/api");
      const response = await api.post("/notes", {
        title: noteTitle,
        content: noteContent,
        notebookId: "notebook1" // Usa o caderno padrão 'Geral'
      });

      // Limpa os campos e fecha o modal
      setNoteTitle('');
      setNoteContent('');
      setIsOpen(false);

      // Recarrega a página se estiver na página de notas para mostrar a nova nota
      if (window.location.pathname.includes('/dashboard/notes')) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Erro ao criar nota:", err);
      alert("Não foi possível criar a nota. Tente novamente.");
    }
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
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Título</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Digite o título da nota"
              autoFocus
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Conteúdo</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-32 transition-colors"
              placeholder="Digite o conteúdo da nota"
              required
            />
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