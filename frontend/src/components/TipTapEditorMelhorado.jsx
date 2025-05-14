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
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode, FaLink, FaUnlink, FaListUl, FaListOl, FaQuoteRight, FaImage, FaTable, FaRulerHorizontal, FaUndo, FaRedo, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaHighlighter, FaSuperscript, FaSubscript } from 'react-icons/fa';
import { MdFormatColorText } from 'react-icons/md';

// Componentes da barra de ferramentas
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [highlightPickerVisible, setHighlightPickerVisible] = useState(false);

  const colors = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
  ];

  const highlights = [
    "#ffff00", "#00ffff", "#ff9900", "#ff00ff", "#00ff00", "#4a86e8", "#9900ff", "#f3f3f3", "#d9d9d9", "#cccccc"
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

  const setTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setColorPickerVisible(false);
  };

  const setHighlight = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setHighlightPickerVisible(false);
  };

  return (
    <div className="menu-bar">
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          title="Negrito"
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          title="Itálico"
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          title="Sublinhado"
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
          title="Tachado"
        >
          <FaStrikethrough />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "is-active" : ""}
          title="Sobrescrito"
        >
          <FaSuperscript />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive("subscript") ? "is-active" : ""}
          title="Subscrito"
        >
          <FaSubscript />
        </button>
      </div>

      <div className="menu-group">
        <div className="color-picker-container">
          <button 
            onClick={() => setColorPickerVisible(!colorPickerVisible)} 
            title="Cor do texto"
            className={editor.isActive("textStyle") ? "is-active" : ""}
          >
            <MdFormatColorText />
          </button>
          {colorPickerVisible && (
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                  className="color-swatch"
                />
              ))}
              <button 
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setColorPickerVisible(false);
                }}
                className="color-reset"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        <div className="color-picker-container">
          <button 
            onClick={() => setHighlightPickerVisible(!highlightPickerVisible)} 
            title="Destacar texto"
            className={editor.isActive("highlight") ? "is-active" : ""}
          >
            <FaHighlighter />
          </button>
          {highlightPickerVisible && (
            <div className="color-picker">
              {highlights.map((color) => (
                <button
                  key={color}
                  style={{ backgroundColor: color }}
                  onClick={() => setHighlight(color)}
                  className="color-swatch"
                />
              ))}
              <button 
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setHighlightPickerVisible(false);
                }}
                className="color-reset"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="menu-group">
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

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          title="Alinhar à esquerda"
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
          title="Centralizar"
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          title="Alinhar à direita"
        >
          <FaAlignRight />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}
          title="Justificar"
        >
          <FaAlignJustify />
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          title="Lista com marcadores"
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          title="Lista numerada"
        >
          <FaListOl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          title="Citação"
        >
          <FaQuoteRight />
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
          title="Código"
        >
          <FaCode />
        </button>
        <button onClick={setLink} className={editor.isActive("link") ? "is-active" : ""} title="Link">
          <FaLink />
        </button>
        {editor.isActive("link") && (
          <button 
            onClick={() => editor.chain().focus().unsetLink().run()} 
            title="Remover link"
          >
            <FaUnlink />
          </button>
        )}
        <button onClick={addImage} title="Imagem">
          <FaImage />
        </button>
        <button onClick={addTable} title="Tabela">
          <FaTable />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha horizontal"
        >
          <FaRulerHorizontal />
        </button>
      </div>

      <div className="menu-group">
        <button onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
          <FaUndo />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} title="Refazer">
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

// Componente principal do editor
const TipTapEditorMelhorado = ({ initialContent = "", onUpdate, noteId }) => {
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
      TextStyle,
      Color,
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
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .menu-bar {
          display: flex;
          flex-wrap: wrap;
          padding: 8px;
          border-bottom: 1px solid #ccc;
          background-color: #f5f5f5;
          gap: 8px;
        }

        .menu-group {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          background-color: white;
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
          color: #444;
          height: 32px;
          min-width: 32px;
        }

        .menu-group button:last-child {
          border-right: none;
        }

        .menu-bar button:hover {
          background-color: #f0f0f0;
        }

        .menu-bar button.is-active {
          background-color: #e0e7ff;
          color: #4f46e5;
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
        }

        .editor-content p {
          margin-bottom: 0.75em;
        }

        .editor-footer {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
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
          font-size: 12px;
        }

        .export-options button:hover {
          background-color: #e9e9e9;
        }

        .autosave-status {
          color: #666;
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .menu-bar {
            padding: 4px;
            gap: 4px;
          }
          
          .menu-bar button {
            padding: 4px 6px;
            height: 28px;
            min-width: 28px;
            font-size: 12px;
          }
          
          .editor-content {
            padding: 12px;
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default TipTapEditorMelhorado;