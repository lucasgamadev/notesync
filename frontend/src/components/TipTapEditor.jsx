import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import "./editor-contrast-fix.css"; // Importação do CSS de correção de contraste


// Componentes da barra de ferramentas
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const colors = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
  ];

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

  const setColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setHighlight = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setShowHighlightPicker(false);
  };

  return (
    <div className="menu-bar">
      {/* Grupo 1: Formatação de texto básica */}
      <div className="menu-group" data-tooltip="Formatação de texto">
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
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          title="Sublinhado"
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
          title="Tachado"
        >
          <s>S</s>
        </button>
      </div>

      {/* Grupo 2: Cores e destaques */}
      <div className="menu-group" data-tooltip="Cores e destaques">
        <div className="color-picker-container">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={editor.isActive("textStyle") ? "is-active" : ""}
            title="Cor do texto"
          >
            <span style={{ color: editor.getAttributes("textStyle").color || "#4338ca" }}>A</span>
          </button>
          {showColorPicker && (
            <div className="color-picker">
              {colors.map((color) => (
                <div
                  key={color}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => setColor(color)}
                  title={color}
                />
              ))}
              <button
                className="color-reset"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
              >
                Remover cor
              </button>
            </div>
          )}
        </div>
        <div className="color-picker-container">
          <button
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className={editor.isActive("highlight") ? "is-active" : ""}
            title="Destacar texto"
          >
            <span style={{ backgroundColor: "yellow", padding: "0 2px" }}>A</span>
          </button>
          {showHighlightPicker && (
            <div className="color-picker">
              {colors.map((color) => (
                <div
                  key={color}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => setHighlight(color)}
                  title={color}
                />
              ))}
              <button
                className="color-reset"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightPicker(false);
                }}
              >
                Remover destaque
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grupo 3: Formatação avançada */}
      <div className="menu-group" data-tooltip="Formatação avançada">
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "is-active" : ""}
          title="Sobrescrito"
        >
          x<sup>2</sup>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive("subscript") ? "is-active" : ""}
          title="Subscrito"
        >
          x<sub>2</sub>
        </button>
      </div>

      {/* Grupo 4: Títulos */}
      <div className="menu-group" data-tooltip="Títulos">
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
      </div>

      {/* Grupo 5: Alinhamento */}
      <div className="menu-group" data-tooltip="Alinhamento">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          title="Alinhar à esquerda"
        >
          <span className="icon-align">⫷</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
          title="Centralizar"
        >
          <span className="icon-align">⫶</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          title="Alinhar à direita"
        >
          <span className="icon-align">⫸</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}
          title="Justificar"
        >
          <span className="icon-align">⫸⫷</span>
        </button>
      </div>

      {/* Grupo 6: Listas e citações */}
      <div className="menu-group" data-tooltip="Listas e citações">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          title="Lista com marcadores"
        >
          <span className="icon-list">•</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          title="Lista numerada"
        >
          <span className="icon-list">1.</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          title="Citação"
        >
          <span className="icon-quote">""</span>
        </button>
      </div>

      {/* Grupo 7: Inserção de elementos */}
      <div className="menu-group" data-tooltip="Inserir elementos">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
          title="Código"
        >
          <span className="icon-code">&lt;/&gt;</span>
        </button>
        <button onClick={setLink} className={editor.isActive("link") ? "is-active" : ""} title="Link">
          <span className="icon-link">🔗</span>
        </button>
        {editor.isActive("link") && (
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remover link"
            className="remove-link-button"
          >
            <span className="icon-unlink">🔗❌</span>
          </button>
        )}
        <button onClick={addImage} title="Imagem" className="insert-button">
          <span className="icon-image">🖼️</span>
        </button>
        <button onClick={addTable} title="Tabela" className="insert-button">
          <span className="icon-table">📊</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha horizontal"
          className="insert-button"
        >
          <span className="icon-hr">―</span>
        </button>
      </div>

      {/* Grupo 8: Histórico */}
      <div className="menu-group" data-tooltip="Histórico">
        <button onClick={() => editor.chain().focus().undo().run()} title="Desfazer" className="history-button">
          <span className="icon-undo">↩️</span>
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} title="Refazer" className="history-button">
          <span className="icon-redo">↪️</span>
        </button>
      </div>
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
      }),
      // Novas extensões
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"]
      }),
      Underline,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Typography
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
          <button onClick={() => exportAs("html")} title="Exportar como HTML" className="export-button">
            <span className="export-icon">📄</span> HTML
          </button>
          <button onClick={() => exportAs("text")} title="Exportar como Texto" className="export-button">
            <span className="export-icon">📝</span> Texto
          </button>
        </div>
      </div>

      <style jsx>{`
        .tiptap-editor {
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .menu-bar {
          display: flex;
          flex-wrap: wrap;
          padding: 10px;
          border-bottom: 1px solid #ccc;
          background-color: #f8f9fa;
          gap: 10px;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .menu-group {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
          background-color: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          position: relative;
        }
        
        .menu-group[data-tooltip]:hover::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          z-index: 20;
          opacity: 0.9;
        }

        .menu-bar button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          background-color: white;
          border: none;
          border-right: 1px solid #eee;
          cursor: pointer;
          font-size: 14px;
          color: #4b5563;
          height: 36px;
          min-width: 36px;
          transition: all 0.2s ease;
        }

        .menu-group button:last-child {
          border-right: none;
        }

        .menu-bar button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .menu-bar button.is-active {
          background-color: #e0e7ff;
          color: #4f46e5;
          font-weight: 500;
        }
        
        .icon-align, .icon-list, .icon-quote, .icon-code, .icon-link, 
        .icon-unlink, .icon-image, .icon-table, .icon-hr, .icon-undo, .icon-redo {
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .insert-button {
          background-color: #f0f9ff !important;
        }
        
        .insert-button:hover {
          background-color: #e0f2fe !important;
        }
        
        .history-button {
          background-color: #f9fafb !important;
        }
        
        .remove-link-button {
          background-color: #fee2e2 !important;
          color: #b91c1c !important;
        }
        
        .remove-link-button:hover {
          background-color: #fecaca !important;
        }

        .color-picker-container {
          position: relative;
        }

        .color-picker {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 10;
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 4px;
          padding: 8px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 220px;
        }

        .color-swatch {
          width: 18px;
          height: 18px;
          border-radius: 2px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        .color-reset {
          grid-column: span 10;
          margin-top: 4px;
          padding: 4px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
        }

        .editor-content {
          padding: 16px;
          min-height: 300px;
          overflow-y: auto;
          background-color: white;
          color: #333;
        }

        .editor-content p {
          margin-bottom: 0.75em;
        }

        .editor-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          border-top: 1px solid #d1d5db;
          background-color: #f8f9fa;
          font-size: 0.85rem;
          box-shadow: 0 -1px 2px rgba(0,0,0,0.03);
        }

        .export-options {
          display: flex;
          gap: 8px;
        }
        
        .export-options button.export-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border: 1px solid #d1d5db;
          background-color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #4b5563;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .export-options button.export-button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
          color: #111827;
        }
        
        .export-icon {
          font-size: 14px;
        }

        .autosave-status {
          display: flex;
          align-items: center;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #f3f4f6;
          color: #4b5563;
        }
        
        .autosave-status span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .autosave-status span::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
          margin-right: 4px;
        }

        @media (max-width: 768px) {
          .menu-bar {
            padding: 6px;
            gap: 6px;
            overflow-x: auto;
            flex-wrap: nowrap;
            justify-content: flex-start;
            scrollbar-width: thin;
          }
          
          .menu-bar::-webkit-scrollbar {
            height: 4px;
          }
          
          .menu-bar::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 4px;
          }
          
          .menu-group {
            flex-shrink: 0;
          }
          
          .menu-bar button {
            padding: 4px 6px;
            height: 32px;
            min-width: 32px;
            font-size: 12px;
          }
          
          .editor-content {
            padding: 12px;
            min-height: 200px;
          }
          
          /* Ocultar tooltips em dispositivos móveis */
          .menu-group[data-tooltip]:hover::before {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TipTapEditor;
