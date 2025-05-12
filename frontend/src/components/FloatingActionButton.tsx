'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Estilos de animação para os modais
import './animations.css';

/**
 * Componente de Botão de Ação Flutuante
 * 
 * Fornece acesso rápido à criação de notas e cadernos em qualquer página do aplicativo.
 * Implementa um botão flutuante que expande para mostrar opções de criação rápida.
 */
export default function FloatingActionButton() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  
  // Estados para nova nota
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  // Estados para novo caderno
  const [notebookName, setNotebookName] = useState('');
  
  // Função para abrir o modal de criação de nota
  const handleCreateNote = () => {
    // Redireciona para a página de criação de nota
    router.push('/dashboard/notes/new');
    setIsNoteModalOpen(false);
    setIsExpanded(false);
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
      {/* Botão flutuante */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative">
          {/* Botão principal */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none transform hover:scale-110 hover:rotate-180 animate-pulse"
            aria-label="Menu de ações rápidas"
          >
            {isExpanded ? '✕' : '+'}
          </button>
          
          {/* Menu expandido com animação */}
          <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${isExpanded ? 'opacity-100 transform translate-y-0' : 'opacity-0 pointer-events-none transform translate-y-4'}`}>
            <button
              onClick={handleCreateNote}
              className="flex items-center bg-white text-indigo-800 font-medium px-4 py-2 rounded-lg shadow-md hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105 w-full"
            >
              <span className="mr-2">📝</span>
              Nova Nota
            </button>
            
            <button
              onClick={() => {
                setIsNotebookModalOpen(true);
                setIsExpanded(false);
              }}
              className="flex items-center bg-white text-green-800 font-medium px-4 py-2 rounded-lg shadow-md hover:bg-green-50 transition-all duration-200 transform hover:scale-105 w-full"
            >
              <span className="mr-2">📘</span>
              Novo Caderno
            </button>
          </div>
        </div>
      </div>
      
      {/* Removido o modal de criação de nota, agora redirecionamos diretamente para a página de edição */}
      
      {/* Modal para criar caderno */}
      {isNotebookModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl transform transition-all animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Novo Caderno</h2>
              <button 
                onClick={() => setIsNotebookModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateNotebook}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-1">Nome</label>
                <input
                  type="text"
                  value={notebookName}
                  onChange={(e) => setNotebookName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Digite o nome do caderno"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNotebookModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-md"
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