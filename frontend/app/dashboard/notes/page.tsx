"use client";

import FloatingActionButton from "@/src/components/FloatingActionButton";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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

  // Estado para o modal de criação rápida de nota
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

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

  // Componente de Sidebar (reutilizado do Dashboard)
  const Sidebar = () => {
    return (
      <div className="w-64 bg-indigo-800 text-white h-full fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-8">NoteSync</h1>

          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="block py-2.5 px-4 rounded hover:bg-indigo-700 sidebar-link"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/notebooks"
              className="block py-2.5 px-4 rounded hover:bg-indigo-700 sidebar-link"
            >
              Cadernos
            </a>
            <a
              href="/dashboard/notes"
              className="block py-2.5 px-4 rounded bg-indigo-900 hover:bg-indigo-700 sidebar-link"
            >
              Notas
            </a>
            <a
              href="/dashboard/tags"
              className="block py-2.5 px-4 rounded hover:bg-indigo-700 sidebar-link"
            >
              Etiquetas
            </a>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <a
            href="/dashboard/settings"
            className="block py-2.5 px-4 rounded hover:bg-indigo-700 text-gray-300 contrast-text"
          >
            Configurações
          </a>
          <button
            className="block w-full text-left py-2.5 px-4 rounded hover:bg-indigo-700 sidebar-link contrast-text"
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
      <FloatingActionButton />

      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Minhas Notas
        </h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Pesquisar notas..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={openCreateNoteModal}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md ml-4 flex items-center shadow-md transition-all duration-200 transform hover:scale-105 font-bold"
          >
            <span className="mr-2">📝</span>
            Nova Nota
          </button>
        </div>

        {/* Filtros de tags */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-1">Filtrar por tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagSelection(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selectedTags.includes(tag.id)
                    ? tag.name === "Importante" 
                      ? "bg-red-700 text-white" 
                      : tag.name === "Trabalho" 
                      ? "bg-blue-700 text-white" 
                      : tag.name === "Pessoal" 
                      ? "bg-green-700 text-white" 
                      : tag.name === "Estudo" 
                      ? "bg-purple-700 text-white"
                      : "bg-gray-700 text-white"
                    : "bg-gray-800 text-white hover:bg-gray-900"
                }`}
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

        {/* Renderiza o modal de criação de nota */}
        {renderCreateNoteModal()}

        {/* Estado de carregamento */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Lista de notas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2 truncate text-black">{note.title}</h2>
                    <div
                      className="text-black font-medium mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + "..." }}
                    />

                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className={`text-xs px-2 py-1 rounded font-bold ${
                            tag.name === "Importante" 
                              ? "bg-red-700 text-white" 
                              : tag.name === "Trabalho" 
                              ? "bg-blue-700 text-white" 
                              : tag.name === "Pessoal" 
                              ? "bg-green-700 text-white" 
                              : tag.name === "Estudo" 
                              ? "bg-purple-700 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">
                        Atualizado: {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
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
                  ? "Nenhuma nota encontrada com os filtros aplicados."
                  : 'Você ainda não tem notas. Clique em "Nova Nota" para começar.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
