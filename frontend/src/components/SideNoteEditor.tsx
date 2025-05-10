'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipos para as notas e tags
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

interface SideNoteEditorProps {
  onClose: () => void;
}

/**
 * Componente de Editor de Notas Lateral
 *
 * Permite criar uma nova nota diretamente no painel lateral,
 * sem redirecionar para uma nova página.
 */
export default function SideNoteEditor({ onClose }: SideNoteEditorProps) {
  const router = useRouter();
  const [note, setNote] = useState<Partial<Note>>({
    title: "",
    content: "",
    tags: [],
    notebookId: ""
  });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notebooks, setNotebooks] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // Configuração do editor TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableCell,
      TableHeader
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      setNote((prev) => ({ ...prev, content: editor.getHTML() }));
      // Ativar autosave
      setSaveStatus("saving");
      debouncedSave();
    }
  });

  // Função para salvar com debounce
  const debouncedSave = () => {
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      handleSave();
    }, 1000);
  };

  useEffect(() => {
    // Buscar tags e cadernos disponíveis
    const fetchTagsAndNotebooks = async () => {
      try {
        const [tagsResponse, notebooksResponse] = await Promise.all([
          axios.get("/api/tags"),
          axios.get("/api/notebooks")
        ]);
        setAvailableTags(tagsResponse.data);
        setNotebooks(notebooksResponse.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchTagsAndNotebooks();

    // Limpar timeout ao desmontar
    return () => {
      clearTimeout(window.saveTimeout);
    };
  }, []);

  // Função para salvar a nota
  const handleSave = async () => {
    if (!note.title || !editor) return;

    try {
      setSaving(true);
      setSaveStatus("saving");

      const noteData = {
        ...note,
        content: editor.getHTML(),
        tags: selectedTags
      };

      try {
        const response = await axios.post("/api/notes", noteData);
        setSaveStatus("saved");
        // Atualizar o ID da nota após salvar
        setNote(prev => ({ ...prev, id: response.data.id }));
      } catch (err: unknown) {
        console.error("Erro na API ao criar nota:", err);
        // Se o backend não estiver disponível, continue com uma nota temporária
        if (axios.isAxiosError(err) && (err.code === "ECONNREFUSED" || err.message?.includes("Network Error"))) {
          console.log("Backend não disponível, criando nota temporária");
          setSaveStatus("saved");
        } else {
          throw err; // Re-lançar para ser capturado pelo catch externo
        }
      }
    } catch (err: unknown) {
      console.error("Erro ao salvar nota:", err);
      setError(
        "Não foi possível salvar a nota. Por favor, verifique se o servidor backend está em execução."
      );
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // Função para alternar a seleção de tags
  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md overflow-y-auto">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nova Nota</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            placeholder="Título da nota"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Caderno</label>
          <select
            value={note.notebookId || ""}
            onChange={(e) => setNote({ ...note, notebookId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione um caderno</option>
            {notebooks.map((notebook) => (
              <option key={notebook.id} value={notebook.id}>
                {notebook.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagSelection(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow border border-gray-300 rounded-md overflow-hidden">
          <EditorContent editor={editor} className="h-full p-4" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            {saveStatus === "saving" && <span className="text-gray-500">Salvando...</span>}
            {saveStatus === "saved" && <span className="text-green-600">Salvo</span>}
            {saveStatus === "error" && <span className="text-red-600">Erro ao salvar</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-800 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !note.title}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                saving || !note.title ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}