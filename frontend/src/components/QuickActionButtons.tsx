'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotesService, { Note } from '../services/notes';
import Link from 'next/link';

/**
 * Componente de Botões de Ação Rápida
 * 
 * Fornece botões para criar rapidamente notas e cadernos sem precisar navegar para outras páginas.
 * Também exibe as notas recentes do usuário.
 */
export default function QuickActionButtons() {
  const router = useRouter();
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para novo caderno
  const [notebookName, setNotebookName] = useState('');
  
  // Carrega as notas recentes ao montar o componente
  useEffect(() => {
    const loadRecentNotes = async () => {
      try {
        const notes = await NotesService.getRecentNotes(5);
        setRecentNotes(notes);
      } catch (error) {
        console.error('Erro ao carregar notas recentes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecentNotes();
  }, []);
  
  // Função para formatar a data de atualização
  const formatUpdatedAt = (dateString: string) => {
    const now = new Date();
    const updatedAt = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60));
      return `Atualizado há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Atualizado há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Atualizado há ${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`;
    }
  };

  // Função para abrir o modal de criação de nota
  const handleCreateNote = () => {
    // Redireciona para a página de criação de nota
    router.push('/dashboard/notes/new');
  };
  
  // Função para criar um novo caderno rapidamente
  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/notebooks', {
        name: notebookName,
      });
      
      // Redireciona para a lista de cadernos
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
      <div className="mb-6">
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

      {/* Seção de Notas Recentes */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-700 mb-3">Notas Recentes</h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
          </div>
        ) : recentNotes.length > 0 ? (
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <Link 
                key={note.id} 
                href={`/dashboard/notes/${note.id}`}
                className="block p-2 hover:bg-blue-50 rounded transition-colors"
              >
                <p className="font-medium text-gray-800 truncate">{note.title || 'Sem título'}</p>
                <p className="text-xs text-gray-500">{formatUpdatedAt(note.updatedAt)}</p>
              </Link>
            ))}
            <Link 
              href="/dashboard/notes"
              className="text-blue-600 text-sm font-medium hover:underline inline-block mt-2"
            >
              Ver todas as notas →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma nota recente encontrada.</p>
        )}
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