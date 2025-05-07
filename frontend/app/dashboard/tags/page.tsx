"use client";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useState } from "react";

// Componente de Card para Etiqueta
const TagCard = ({
  tag,
  onEdit,
  onDelete
}: {
  tag: { id: number; name: string; color: string; notesCount: number };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-2">
          <div className={`w-4 h-4 rounded-full ${tag.color} mr-2`}></div>
          <h3 className="text-lg font-bold text-black">{tag.name}</h3>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-black font-semibold">{tag.notesCount} notas</span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(tag.id)}
              className="p-1.5 text-gray-800 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(tag.id)}
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

// Componente de Modal para Criar/Editar Etiqueta
const TagModal = ({
  isOpen,
  onClose,
  tag,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  tag: { id?: number; name: string; color: string } | null;
  onSave: (tag: { id?: number; name: string; color: string }) => void;
}) => {
  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState(tag?.color || "bg-indigo-500");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: tag?.id,
      name,
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
    { value: "bg-blue-500", label: "Azul" },
    { value: "bg-pink-500", label: "Rosa" },
    { value: "bg-orange-500", label: "Laranja" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">
          {tag?.id ? "Editar Etiqueta" : "Nova Etiqueta"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tag-name" className="block text-sm font-semibold text-black mb-1">Nome</label>
            <input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Digite o nome da etiqueta"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-1">Cor</label>
            <div className="flex flex-wrap gap-2">
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
              className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200"
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
        <h2 className="text-xl font-semibold mb-4 text-black">Confirmar Exclusão</h2>
        <p className="mb-6 text-black">
          Tem certeza que deseja excluir esta etiqueta? Esta ação não pode ser desfeita.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200"
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

// Página de Gerenciamento de Etiquetas
export default function TagsPage() {
  // Estado para etiquetas (dados de exemplo)
  const [tags, setTags] = useState([
    {
      id: 1,
      name: "Importante",
      color: "bg-red-500",
      notesCount: 8
    },
    {
      id: 2,
      name: "Pessoal",
      color: "bg-blue-500",
      notesCount: 5
    },
    {
      id: 3,
      name: "Trabalho",
      color: "bg-green-500",
      notesCount: 12
    },
    {
      id: 4,
      name: "Estudo",
      color: "bg-purple-500",
      notesCount: 7
    },
    {
      id: 5,
      name: "Ideias",
      color: "bg-yellow-500",
      notesCount: 3
    }
  ]);

  // Estado para modal de criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<{
    id?: number;
    name: string;
    color: string;
  } | null>(null);

  // Estado para modal de confirmação de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<number | null>(null);

  // Estado para visualização (grade ou lista)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Função para abrir modal de criação
  const handleCreateTag = () => {
    setCurrentTag(null);
    setIsModalOpen(true);
  };

  // Função para abrir modal de edição
  const handleEditTag = (id: number) => {
    const tag = tags.find((t) => t.id === id);
    if (tag) {
      setCurrentTag({
        id: tag.id,
        name: tag.name,
        color: tag.color
      });
      setIsModalOpen(true);
    }
  };

  // Função para abrir modal de confirmação de exclusão
  const handleDeleteClick = (id: number) => {
    setTagToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Função para salvar etiqueta (criar ou editar)
  const handleSaveTag = (tag: {
    id?: number;
    name: string;
    color: string;
  }) => {
    if (tag.id) {
      // Editar etiqueta existente
      setTags(tags.map((t) => (t.id === tag.id ? { ...t, ...tag } : t)));
    } else {
      // Criar nova etiqueta
      const newId = Math.max(0, ...tags.map((t) => t.id)) + 1;
      setTags([
        ...tags,
        {
          id: newId,
          name: tag.name,
          color: tag.color,
          notesCount: 0
        }
      ]);
    }
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = () => {
    if (tagToDelete) {
      setTags(tags.filter((t) => t.id !== tagToDelete));
      setIsDeleteModalOpen(false);
      setTagToDelete(null);
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
            <a href="/dashboard/notebooks" className="block py-2.5 px-4 rounded hover:bg-indigo-700">
              Cadernos
            </a>
            <a href="/dashboard/notes" className="block py-2.5 px-4 rounded hover:bg-indigo-700">
              Notas
            </a>
            <a
              href="/dashboard/tags"
              className="block py-2.5 px-4 rounded bg-indigo-900 hover:bg-indigo-700"
            >
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
            <h2 className="text-2xl font-bold text-blue-700">Minhas Etiquetas</h2>

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
                onClick={handleCreateTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <span className="mr-1">+</span> Nova Etiqueta
              </button>
            </div>
          </div>

          {/* Visualização em Grade */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tags.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEditTag}
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
                      Nome
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
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${tag.color} mr-3`}></div>
                          <div className="text-sm font-bold text-black">{tag.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black font-semibold">{tag.notesCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                        <button
                          onClick={() => handleEditTag(tag.id)}
                          className="text-indigo-700 hover:text-indigo-900 mr-3 font-bold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tag.id)}
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
          <TagModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            tag={currentTag}
            onSave={handleSaveTag}
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
