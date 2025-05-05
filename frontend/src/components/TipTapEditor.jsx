import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Componentes da barra de ferramentas
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("URL da imagem");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link", previousUrl);

    // cancelar
    if (url === null) {
      return;
    }

    // remover link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // atualizar link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="menu-bar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
        title="Negrito"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
        title="Itálico"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "is-active" : ""}
        title="Tachado"
      >
        <s>S</s>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "is-active" : ""}
        title="Código"
      >
        &lt;/&gt;
      </button>
      <button onClick={setLink} className={editor.isActive("link") ? "is-active" : ""} title="Link">
        🔗
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
        title="Título 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
        title="Título 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
        title="Título 3"
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
        title="Lista com marcadores"
      >
        • Lista
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
        title="Lista numerada"
      >
        1. Lista
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "is-active" : ""}
        title="Citação"
      >
        ""
      </button>
      <button onClick={addImage} title="Imagem">
        🖼️
      </button>
      <button onClick={addTable} title="Tabela">
        📊
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Linha horizontal"
      >
        ―
      </button>
      <button onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
        ↩️
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} title="Refazer">
        ↪️
      </button>
    </div>
  );
};

// Componente principal do editor
const TipTapEditor = ({ initialContent = "", onUpdate, noteId }) => {
  const [autosaveInterval, setAutosaveInterval] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [localContent, setLocalContent] = useLocalStorage(`note-${noteId}`, initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        validate: (href) => /^https?:\/\//.test(href)
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Comece a escrever..."
      })
    ],
    content: localContent || initialContent,
    autofocus: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setLocalContent(html);
      if (onUpdate) {
        onUpdate(html);
      }
      setLastSaved(new Date());
    }
  });

  // Configurar autosave
  useEffect(() => {
    if (editor && onUpdate) {
      const interval = setInterval(() => {
        const html = editor.getHTML();
        onUpdate(html);
        setLastSaved(new Date());
      }, 5000); // Autosave a cada 5 segundos

      setAutosaveInterval(interval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [editor, onUpdate]);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (autosaveInterval) {
        clearInterval(autosaveInterval);
      }
    };
  }, [autosaveInterval]);

  // Exportar para diferentes formatos
  const exportAs = (format) => {
    if (!editor) return;

    let content = "";
    let filename = `note-${noteId}-${new Date().toISOString().split("T")[0]}`;
    let mimeType = "";

    switch (format) {
      case "html":
        content = editor.getHTML();
        filename += ".html";
        mimeType = "text/html";
        break;
      case "text":
        content = editor.getText();
        filename += ".txt";
        mimeType = "text/plain";
        break;
      case "json":
        content = JSON.stringify(editor.getJSON());
        filename += ".json";
        mimeType = "application/json";
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-footer">
        <div className="autosave-status">
          {lastSaved && <span>Último salvamento: {lastSaved.toLocaleTimeString()}</span>}
        </div>

        <div className="export-options">
          <button onClick={() => exportAs("html")} title="Exportar como HTML">
            Exportar HTML
          </button>
          <button onClick={() => exportAs("text")} title="Exportar como Texto">
            Exportar Texto
          </button>
        </div>
      </div>

      <style jsx>{`
        .tiptap-editor {
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: hidden;
        }

        .menu-bar {
          display: flex;
          flex-wrap: wrap;
          padding: 8px;
          border-bottom: 1px solid #ccc;
          background-color: #f5f5f5;
        }

        .menu-bar button {
          margin-right: 4px;
          margin-bottom: 4px;
          padding: 4px 8px;
          border: 1px solid #ccc;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .menu-bar button:hover {
          background-color: #e9e9e9;
        }

        .menu-bar button.is-active {
          background-color: #e0e0e0;
          font-weight: bold;
        }

        .editor-content {
          padding: 16px;
          min-height: 300px;
          overflow-y: auto;
        }

        .editor-footer {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-top: 1px solid #ccc;
          background-color: #f5f5f5;
          font-size: 0.8rem;
        }

        .export-options button {
          margin-left: 8px;
          padding: 4px 8px;
          border: 1px solid #ccc;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .export-options button:hover {
          background-color: #e9e9e9;
        }

        .autosave-status {
          color: #666;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default TipTapEditor;
