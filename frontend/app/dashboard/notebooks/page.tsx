"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useState } from "react";

// Componente de Card para Caderno
const NotebookCard = ({
  notebook,
  onEdit,
  onDelete
}: {
  notebook: { id: number; title: string; description: string; color: string; notesCount: number };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`h-2 ${notebook.color}`}></div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-black mb-2">{notebook.title}</h3>
        <p className="text-black text-sm font-semibold mb-4">{notebook.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-black font-semibold">{notebook.notesCount} notas</span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(notebook.id)}
              className="p-1.5 text-gray-800 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(notebook.id)}
              className="p-1.5 text-gray-800 hover:text-red-600 rounded-full hover:bg-gray-100"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Modal para Criar/Editar Caderno
const NotebookModal = ({
  isOpen,
  onClose,
  notebook,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  notebook: { id?: number; title: string; description: string; color: string } | null;
  onSave: (notebook: { id?: number; title: string; description: string; color: string }) => void;
}) => {
  const [title, setTitle] = useState(notebook?.title || "");
  const [description, setDescription] = useState(notebook?.description || "");
  const [color, setColor] = useState(notebook?.color || "bg-indigo-500");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: notebook?.id,
      title,
      description,
      color
    });
    onClose();
  };

  const colorOptions = [
    { value: "bg-indigo-500", label: "Índigo" },
    { value: "bg-red-500", label: "Vermelho" },
    { value: "bg-green-500", label: "Verde" },
    { value: "bg-yellow-500", label: "Amarelo" },
    { value: "bg-purple-500", label: "Roxo" },
    { value: "bg-blue-500", label: "Azul" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {notebook?.id ? "Editar Caderno" : "Novo Caderno"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="notebook-title" className="block text-sm font-semibold text-gray-800 mb-1">Título</label>
            <input
              id="notebook-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Digite o título do caderno"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="notebook-description" className="block text-sm font-semibold text-gray-800 mb-1">Descrição</label>
            <textarea
              id="notebook-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Digite uma descrição para o caderno"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Cor</label>
            <div className="flex space-x-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-8 h-8 rounded-full ${option.value} ${color === option.value ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                  onClick={() => setColor(option.value)}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Confirmação de Exclusão
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>
        <p className="mb-6">
          Tem certeza que deseja excluir este caderno? Esta ação não pode ser desfeita.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// Página de Gerenciamento de Cadernos
export default function NotebooksPage() {
  // Estado para cadernos (dados de exemplo)
  const [notebooks, setNotebooks] = useState([
    {
      id: 1,
      title: "Trabalho",
      description: "Anotações relacionadas ao trabalho",
      color: "bg-indigo-500",
      notesCount: 12
    },
    {
      id: 2,
      title: "Pessoal",
      description: "Anotações pessoais",
      color: "bg-green-500",
      notesCount: 8
    },
    {
      id: 3,
      title: "Projetos",
      description: "Ideias e planejamento de projetos",
      color: "bg-purple-500",
      notesCount: 5
    },
    {
      id: 4,
      title: "Estudos",
      description: "Material de estudo e anotações de cursos",
      color: "bg-blue-500",
      notesCount: 15
    }
  ]);

  // Estado para modal de criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNotebook, setCurrentNotebook] = useState<{
    id?: number;
    title: string;
    description: string;
    color: string;
  } | null>(null);

  // Estado para modal de confirmação de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<number | null>(null);

  // Estado para visualização (grade ou lista)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Função para abrir modal de criação
  const handleCreateNotebook = () => {
    setCurrentNotebook(null);
    setIsModalOpen(true);
  };

  // Função para abrir modal de edição
  const handleEditNotebook = (id: number) => {
    const notebook = notebooks.find((n) => n.id === id);
    if (notebook) {
      setCurrentNotebook({
        id: notebook.id,
        title: notebook.title,
        description: notebook.description,
        color: notebook.color
      });
      setIsModalOpen(true);
    }
  };

  // Função para abrir modal de confirmação de exclusão
  const handleDeleteClick = (id: number) => {
    setNotebookToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Função para salvar caderno (criar ou editar)
  const handleSaveNotebook = (notebook: {
    id?: number;
    title: string;
    description: string;
    color: string;
  }) => {
    if (notebook.id) {
      // Editar caderno existente
      setNotebooks(notebooks.map((n) => (n.id === notebook.id ? { ...n, ...notebook } : n)));
    } else {
      // Criar novo caderno
      const newId = Math.max(0, ...notebooks.map((n) => n.id)) + 1;
      setNotebooks([
        ...notebooks,
        {
          id: newId,
          title: notebook.title,
          description: notebook.description,
          color: notebook.color,
          notesCount: 0
        }
      ]);
    }
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = () => {
    if (notebookToDelete) {
      setNotebooks(notebooks.filter((n) => n.id !== notebookToDelete));
      setIsDeleteModalOpen(false);
      setNotebookToDelete(null);
    }
  };

  // Componente de Sidebar (reutilizado do Dashboard)
  const Sidebar = () => {
    return (
      <div className="w-64 bg-indigo-800 text-white h-full fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-8">NoteSync</h1>

          <nav className="space-y-2">
            <a href="/dashboard" className="block py-2.5 px-4 rounded hover:bg-indigo-700">
              Dashboard
            </a>
            <a
              href="/dashboard/notebooks"
              className="block py-2.5 px-4 rounded bg-indigo-900 hover:bg-indigo-700"
            >
              Cadernos
            </a>
            <a href="/dashboard/notes" className="block py-2.5 px-4 rounded hover:bg-indigo-700">
              Notas
            </a>
            <a href="/dashboard/tags" className="block py-2.5 px-4 rounded hover:bg-indigo-700">
              Etiquetas
            </a>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <a href="/dashboard/settings" className="block py-2.5 px-4 rounded hover:bg-indigo-700">
            Configurações
          </a>
          <button
            className="block w-full text-left py-2.5 px-4 rounded hover:bg-indigo-700"
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-100 flex flex-col">
        <Sidebar />

        <div className="ml-64 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Meus Cadernos</h2>

            <div className="flex space-x-4">
              {/* Botões de visualização */}
              <div className="flex bg-white rounded-md shadow">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 ${viewMode === "grid" ? "bg-indigo-100 text-indigo-700" : "text-gray-800"}`}
                >
                  Grade
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 ${viewMode === "list" ? "bg-indigo-100 text-indigo-700" : "text-gray-800"}`}
                >
                  Lista
                </button>
              </div>

              {/* Botão de criar */}
              <button
                onClick={handleCreateNotebook}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <span className="mr-1">+</span> Novo Caderno
              </button>
            </div>
          </div>

          {/* Visualização em Grade */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onEdit={handleEditNotebook}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}

          {/* Visualização em Lista */}
          {viewMode === "list" && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Notas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-black uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notebooks.map((notebook) => (
                    <tr key={notebook.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${notebook.color} mr-3`}></div>
                          <div className="text-sm font-bold text-black">{notebook.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-black truncate max-w-xs">
                          {notebook.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black font-semibold">{notebook.notesCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                        <button
                          onClick={() => handleEditNotebook(notebook.id)}
                          className="text-indigo-700 hover:text-indigo-900 mr-3 font-bold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(notebook.id)}
                          className="text-red-700 hover:text-red-900 font-bold"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal de Criação/Edição */}
          <NotebookModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            notebook={currentNotebook}
            onSave={handleSaveNotebook}
          />

          {/* Modal de Confirmação de Exclusão */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
