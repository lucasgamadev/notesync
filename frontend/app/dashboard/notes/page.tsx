'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipos para as notas
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  notebookId: string;
}

interface Tag {
  id: string;
  name: string;
}

/**
 * Página de Notas
 * 
 * Exibe todas as notas do usuário com opções para criar, editar e excluir.
 * Inclui funcionalidades de filtragem por tags e pesquisa.
 */
export default function NotesPage() {
  return (
    <ProtectedRoute>  
      <NotesPageContent />
    </ProtectedRoute>
  );
}

/**
 * Conteúdo da página de notas
 * 
 * Exibe todas as notas do usuário com opções para criar, editar e excluir.
 * Inclui funcionalidades de filtragem por tags e pesquisa.
 */
function NotesPageContent() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Buscar notas do backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/notes');
        setNotes(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar notas:', err);
        setError('Não foi possível carregar as notas. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('/api/tags');
        setAvailableTags(response.data);
      } catch (err) {
        console.error('Erro ao buscar tags:', err);
      }
    };

    fetchNotes();
    fetchTags();
  }, []);

  // Filtrar notas com base na pesquisa e tags selecionadas
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tagId => note.tags.some(tag => tag.id === tagId));
    
    return matchesSearch && matchesTags;
  });

  // Função para excluir uma nota
  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await axios.delete(`/api/notes/${noteId}`);
        setNotes(notes.filter(note => note.id !== noteId));
      } catch (err) {
        console.error('Erro ao excluir nota:', err);
        setError('Não foi possível excluir a nota. Por favor, tente novamente.');
      }
    }
  };

  // Função para navegar para a página de edição
  const handleEditNote = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
  };

  // Função para criar uma nova nota
  const handleCreateNote = () => {
    router.push('/dashboard/notes/new');
  };

  // Função para alternar a seleção de tags
  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  // Componente de Sidebar (reutilizado do Dashboard)
  const Sidebar = () => {
    return (
      <div className="w-64 bg-indigo-800 text-white h-full fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-8">NoteSync</h1>

          <nav className="space-y-2">
            <a href="/dashboard" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
              Dashboard
            </a>
            <a href="/dashboard/notebooks" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
              Cadernos
            </a>
            <a href="/dashboard/notes" className="block py-2.5 px-4 rounded bg-indigo-900 hover:bg-indigo-700 text-gray-300">
              Notas
            </a>
            <a href="/dashboard/tags" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
              Etiquetas
            </a>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <a href="/dashboard/settings" className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300">
            Configurações
          </a>
          <button
            className="block w-full text-left py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
            }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Minhas Notas</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Pesquisar notas..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleCreateNote}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md ml-4"
          >
            Nova Nota
          </button>
        </div>

        {/* Filtros de tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTagSelection(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag.id) 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 shadow-sm">
            {error}
          </div>
        )}

        {/* Estado de carregamento */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Lista de notas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2 truncate">{note.title}</h2>
                    <div className="text-gray-600 mb-4 line-clamp-3" 
                        dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + '...' }} />
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map(tag => (
                        <span key={tag.id} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Atualizado: {new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex border-t border-gray-200">
                    <button 
                      onClick={() => handleEditNote(note.id)}
                      className="flex-1 py-2 text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex-1 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {searchTerm || selectedTags.length > 0 ? 
                  'Nenhuma nota encontrada com os filtros aplicados.' : 
                  'Você ainda não tem notas. Clique em "Nova Nota" para começar.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}