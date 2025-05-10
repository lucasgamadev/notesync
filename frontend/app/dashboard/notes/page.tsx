"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./notes.css";

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
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Buscar notas do backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        // Importar o utilitário api para usar o mock API quando necessário
        const { default: api } = await import("@/src/utils/api");
        const response = await api.get("/notes");
        setNotes(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar notas:", err);
        setError("Não foi possível carregar as notas. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        // Importar o utilitário api para usar o mock API quando necessário
        const { default: api } = await import("@/src/utils/api");
        const response = await api.get("/tags");
        setAvailableTags(response.data);
      } catch (err) {
        console.error("Erro ao buscar tags:", err);
      }
    };

    fetchNotes();
    fetchTags();
  }, []);

  // Filtrar notas com base na pesquisa e tags selecionadas
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tagId) => note.tags.some((tag) => tag.id === tagId));

    return matchesSearch && matchesTags;
  });


  // Função para criar uma nova nota rapidamente
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Importar o utilitário api para usar o mock API quando necessário
      const { default: api } = await import("@/src/utils/api");
      const response = await api.post("/notes", {
        title: newNoteTitle,
        content: newNoteContent,
        notebookId: "notebook1" // Usa o caderno padrão 'Geral'
      });

      // Adiciona a nova nota à lista
      setNotes([response.data, ...notes]);
      setIsCreateModalOpen(false);

      // Limpa os campos
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch (err) {
      console.error("Erro ao criar nota:", err);
      alert("Não foi possível criar a nota. Tente novamente.");
    }
  };

  // Função para excluir uma nota
  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta nota?")) {
      try {
        // Importar o utilitário api para usar o mock API quando necessário
        const { default: api } = await import("@/src/utils/api");
        await api.delete(`/notes/${noteId}`);
        setNotes(notes.filter((note) => note.id !== noteId));
      } catch (err) {
        console.error("Erro ao excluir nota:", err);
        setError("Não foi possível excluir a nota. Por favor, tente novamente.");
      }
    }
  };

  // Função para navegar para a página de edição
  const handleEditNote = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
  };

  // Função para abrir o modal de criação de nota
  const openCreateNoteModal = () => {
    setIsCreateModalOpen(true);
  };

  // Modal de criação rápida de nota
  const renderCreateNoteModal = () => {
    if (!isCreateModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl transform transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nova Nota</h2>
            <button
              onClick={() => setIsCreateModalOpen(false)}
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
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Digite o título da nota"
                autoFocus
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Conteúdo</label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-32 transition-colors"
                placeholder="Digite o conteúdo da nota"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
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
  };

  // Função para alternar a seleção de tags
  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };



  return (
    <ProtectedRoute>
      <div className="p-8 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Minhas Notas</h2>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Pesquisar notas..."
                className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={openCreateNoteModal}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md flex items-center shadow-md font-bold"
              >
                <span className="mr-2">📝</span>
                Nova Nota
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">Filtrar por tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTagSelection(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    selectedTags.includes(tag.id)
                      ? tag.name === 'Importante'
                        ? 'bg-red-100 text-red-700'
                        : tag.name === 'Trabalho'
                        ? 'bg-blue-100 text-blue-700'
                        : tag.name === 'Pessoal'
                        ? 'bg-green-100 text-green-700'
                        : tag.name === 'Estudo'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 shadow-sm">
              {error}
            </div>
          )}

          {renderCreateNoteModal()}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-full flex flex-col transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="p-5 flex-grow">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{note.title}</h3>
                      <div className="text-gray-600 line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: note.content }} />
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              tag.name === 'Importante'
                                ? 'bg-red-100 text-red-700'
                                : tag.name === 'Trabalho'
                                ? 'bg-blue-100 text-blue-700'
                                : tag.name === 'Pessoal'
                                ? 'bg-green-100 text-green-700'
                                : tag.name === 'Estudo'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        Atualizado: {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex border-t border-gray-200">
                      <button
                        onClick={() => handleEditNote(note.id)}
                        className="flex-1 py-2 text-white bg-blue-700 hover:bg-blue-800 transition-colors duration-200 font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="flex-1 py-2 text-white bg-red-700 hover:bg-red-800 transition-colors duration-200 font-bold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-700 font-medium">
                  {searchTerm || selectedTags.length > 0
                    ? 'Nenhuma nota encontrada com os filtros aplicados.'
                    : 'Você ainda não tem notas. Clique em "Nova Nota" para começar.'}
                </div>
              )}
            </div>
          )}
        </div>
    </ProtectedRoute>
  );
}

