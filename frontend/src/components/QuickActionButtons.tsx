'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Componente de Botões de Ação Rápida
 * 
 * Fornece botões para criar rapidamente notas e cadernos sem precisar navegar para outras páginas.
 * Implementa modais simples e diretos para criação rápida.
 */
export default function QuickActionButtons() {
  const router = useRouter();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  
  // Estados para nova nota
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  // Estados para novo caderno
  const [notebookName, setNotebookName] = useState('');
  
  // Função para redirecionar para a página de criação de nova nota
  const handleCreateNote = () => {
    // Redireciona para a página de criação de nova nota
    router.push('/dashboard/notes/new');
  };
  
  // Função para criar um novo caderno rapidamente
  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/notebooks', {
        name: notebookName,
      });
      
      // Redireciona para o caderno criado
      router.push(`/dashboard/notebooks`);
      setIsNotebookModalOpen(false);
      
      // Limpa o campo
      setNotebookName('');
    } catch (error) {
      console.error('Erro ao criar caderno:', error);
      alert('Não foi possível criar o caderno. Tente novamente.');
    }
  };
  
  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleCreateNote}
            className="flex items-center justify-center px-2 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-full"
          >
            <span className="mr-1">📝</span>
            Nova Nota
          </button>
          <button
            onClick={() => setIsNotebookModalOpen(true)}
            className="flex items-center justify-center px-2 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full"
          >
            <span className="mr-1">📘</span>
            Novo Caderno
          </button>
        </div>
      </div>
      
      {/* Modal para criar caderno */}
      {isNotebookModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Novo Caderno</h2>
            
            <form onSubmit={handleCreateNotebook}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-1">Nome</label>
                <input
                  type="text"
                  value={notebookName}
                  onChange={(e) => setNotebookName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Digite o nome do caderno"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNotebookModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-800 font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Criar Caderno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}