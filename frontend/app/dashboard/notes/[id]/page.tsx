"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

/**
 * Página de Edição de Nota
 *
 * Permite visualizar, editar ou criar uma nova nota com editor rich text.
 * Suporta formatação avançada, imagens, links e tabelas.
 * 
 * Modificado para ser exibido diretamente no painel lateral direito, sem modal.
 */
export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNewNote = params.id === "new";
  const [note, setNote] = useState<Partial<Note>>({
    title: "",
    content: "",
    tags: [],
    notebookId: ""
  });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notebooks, setNotebooks] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(!isNewNote);
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

  // Buscar dados da nota se não for nova
  useEffect(() => {
    if (!isNewNote) {
      const fetchNote = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/notes/${params.id}`);
          setNote(response.data);
          setSelectedTags(response.data.tags.map((tag: Tag) => tag.id));
          if (editor) {
            editor.commands.setContent(response.data.content);
          }
        } catch (err) {
          console.error("Erro ao buscar nota:", err);
          setError("Não foi possível carregar a nota. Por favor, tente novamente.");
        } finally {
          setLoading(false);
        }
      };

      fetchNote();
    }

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
  }, [isNewNote, params.id, editor !== undefined]);

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

      let response;
      if (isNewNote) {
        try {
          response = await axios.post("/api/notes", noteData);
          // Redirecionar para a página de edição após criar
          router.push(`/dashboard/notes/${response.data.id}`);
        } catch (err) {
          const apiErr = err as AxiosError;
          console.error("Erro na API ao criar nota:", apiErr);
          // Se o backend não estiver disponível, crie uma nota temporária e continue
          if (apiErr.code === "ECONNREFUSED" || apiErr.message?.includes("Network Error")) {
            console.log("Backend não disponível, criando nota temporária");
            // Simular resposta para desenvolvimento
            const tempId = "temp-" + Date.now();
            router.push(`/dashboard/notes/${tempId}`);
          } else {
            throw apiErr; // Re-lançar para ser capturado pelo catch externo
          }
        }
      } else {
        try {
          response = await axios.put(`/api/notes/${params.id}`, noteData);
          setNote(response.data);
        } catch (err) {
          const apiErr = err as AxiosError;
          console.error("Erro na API ao atualizar nota:", apiErr);
          // Se o backend não estiver disponível, apenas continue
          if (!(apiErr.code === "ECONNREFUSED" || apiErr.message?.includes("Network Error"))) {
            throw apiErr; // Re-lançar para ser capturado pelo catch externo
          }
        }
      }

      setSaveStatus("saved");
    } catch (err) {
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

  // Função para voltar à lista de notas
  const handleBack = () => {
    router.push("/dashboard/notes");
  };

  // Renderizar barra de ferramentas do editor
  const renderToolbar = () => {
    if (!editor) return null;

    return (
      <div className="border border-gray-300 rounded-t-md p-2 flex flex-wrap gap-2 bg-indigo-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive("bold") ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Negrito"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor.isActive("italic") ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Itálico"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Título 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Título 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${editor.isActive("bulletList") ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Lista com marcadores"
        >
          • Lista
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${editor.isActive("orderedList") ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Lista numerada"
        >
          1. Lista
        </button>
        <button
          onClick={() => {
            const url = window.prompt("URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-1 rounded ${editor.isActive("link") ? "bg-indigo-300 text-indigo-800" : "bg-white text-indigo-700 hover:bg-indigo-100"}`}
          title="Inserir link"
        >
          Link
        </button>
        <button
          onClick={() => {
            const url = window.prompt("URL da imagem:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-1 rounded bg-white text-indigo-700 hover:bg-indigo-100"
          title="Inserir imagem"
        >
          Imagem
        </button>
      </div>
    );
  };

  // Sidebar removida, agora usando o componente global do layout raiz

  return (
    <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          {isNewNote ? "Nova Nota" : "Editar Nota"}
        </h1>
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            ← Voltar para notas
          </button>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-gray-800 text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                Salvando...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-green-800 text-sm font-medium bg-green-100 px-2 py-1 rounded">
                Salvo
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-800 text-sm font-medium bg-red-100 px-2 py-1 rounded">
                Erro ao salvar
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !note.title}
              className={`bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed`}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
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
          <div className="space-y-4">
            {/* Título da nota */}
            <input
              type="text"
              placeholder="Título da nota"
              className="w-full px-4 py-2 text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
              value={note.title}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
            />

            {/* Seleção de caderno */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Caderno</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={note.notebookId || ""}
                onChange={(e) => setNote({ ...note, notebookId: e.target.value })}
              >
                <option value="">Selecione um caderno</option>
                {notebooks.map((notebook) => (
                  <option key={notebook.id} value={notebook.id}>
                    {notebook.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTags.includes(tag.id)
                        ? "bg-indigo-700 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de conteúdo */}
            <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
              {renderToolbar()}
              <EditorContent
                editor={editor}
                className="prose max-w-none p-4 min-h-[300px] focus:outline-none bg-white placeholder:text-gray-600"
              />
            </div>
          </div>
        )}
      </div>
  );
}

// Adicionar tipo para window
declare global {
  interface Window {
    saveTimeout: ReturnType<typeof setTimeout>;
  }
}
