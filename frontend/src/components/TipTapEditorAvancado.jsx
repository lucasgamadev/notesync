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
import { EditorContent, useEditor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode, FaLink, FaUnlink, 
  FaListUl, FaListOl, FaQuoteRight, FaImage, FaTable, FaRulerHorizontal, 
  FaUndo, FaRedo, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, 
  FaHighlighter, FaSuperscript, FaSubscript, FaHeading, FaFont, FaFileExport, 
  FaMarkdown, FaHtml5, FaFileCode, FaPlus, FaMinus, FaEraser, FaCheck } from 'react-icons/fa';
import { MdFormatColorText, MdFormatIndentIncrease, MdFormatIndentDecrease, 
  MdOutlineInsertEmoticon, MdOutlineAttachFile, MdOutlineFormatClear } from 'react-icons/md';
import "./editor-contrast-fix.css";
import "./toolbar-horizontal.css";

/**
 * Componente para criar extensões personalizadas do TipTap
 * @param {Object} options - Opções da extensão
 * @returns {Extension} - Extensão TipTap personalizada
 */
const createCustomExtension = (options) => {
  return Extension.create({
    name: options.name,
    addOptions() {
      return options.options || {};
    },
    addAttributes() {
      return options.attributes || {};
    },
    parseHTML() {
      return options.parseHTML || [];
    },
    renderHTML({ HTMLAttributes }) {
      return options.renderHTML ? options.renderHTML(HTMLAttributes) : [];
    },
    addCommands() {
      return options.commands || {};
    },
    addKeyboardShortcuts() {
      return options.shortcuts || {};
    },
  });
};

/**
 * Componente da barra de ferramentas avançada
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.editor - Instância do editor TipTap
 * @param {Array} props.customButtons - Botões personalizados para a barra de ferramentas
 * @param {Function} props.onExtensionToggle - Função chamada quando uma extensão é ativada/desativada
 */
const MenuBarAvancado = ({ editor, customButtons = [], onExtensionToggle }) => {
  if (!editor) {
    return null;
  }

  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [highlightPickerVisible, setHighlightPickerVisible] = useState(false);
  const [fontSizeMenuVisible, setFontSizeMenuVisible] = useState(false);
  const [customMenuVisible, setCustomMenuVisible] = useState(false);

  const colors = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
  ];

  const highlights = [
    "#ffff00", "#00ffff", "#ff9900", "#ff00ff", "#00ff00", "#4a86e8", "#9900ff", "#f3f3f3", "#d9d9d9", "#cccccc"
  ];

  const fontSizes = [
    { label: 'Pequeno', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Médio', value: '20px' },
    { label: 'Grande', value: '24px' },
    { label: 'Muito Grande', value: '32px' },
  ];

  // Funções para manipular o editor
  const addImage = useCallback(() => {
    const url = window.prompt("URL da imagem");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link", previousUrl);

    if (url === null) return; // Cancelado

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const setTextColor = useCallback((color) => {
    editor.chain().focus().setColor(color).run();
    setColorPickerVisible(false);
  }, [editor]);

  const setHighlight = useCallback((color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setHighlightPickerVisible(false);
  }, [editor]);

  const setFontSize = useCallback((size) => {
    editor.chain().focus().setFontSize(size).run();
    setFontSizeMenuVisible(false);
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  // Renderiza botões personalizados
  const renderCustomButtons = () => {
    return customButtons.map((button, index) => (
      <button
        key={`custom-${index}`}
        onClick={() => {
          if (button.onClick) button.onClick(editor);
          if (button.command) button.command(editor);
          if (onExtensionToggle) onExtensionToggle(button.name);
        }}
        className={button.isActive && button.isActive(editor) ? "is-active" : ""}
        title={button.title || `Extensão ${index + 1}`}
      >
        {button.icon || <FaPlus />}
      </button>
    ));
  };

  return (
    <div className="menu-bar">
      {/* Grupo: Formatação de texto básica */}
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

      {/* Grupo: Cores e tamanhos */}
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

        <div className="color-picker-container">
          <button 
            onClick={() => setFontSizeMenuVisible(!fontSizeMenuVisible)} 
            title="Tamanho da fonte"
          >
            <FaFont />
          </button>
          {fontSizeMenuVisible && (
            <div className="dropdown-menu">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className="dropdown-item"
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grupo: Títulos */}
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

      {/* Grupo: Alinhamento */}
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

      {/* Grupo: Listas e citações */}
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

      {/* Grupo: Indentação */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          title="Diminuir indentação"
        >
          <MdFormatIndentDecrease />
        </button>
        <button
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          title="Aumentar indentação"
        >
          <MdFormatIndentIncrease />
        </button>
      </div>

      {/* Grupo: Elementos especiais */}
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

      {/* Grupo: Limpar formatação */}
      <div className="menu-group">
        <button onClick={clearFormatting} title="Limpar formatação">
          <MdOutlineFormatClear />
        </button>
      </div>

      {/* Grupo: Desfazer/Refazer */}
      <div className="menu-group">
        <button onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
          <FaUndo />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} title="Refazer">
          <FaRedo />
        </button>
      </div>

      {/* Grupo: Extensões personalizadas */}
      {customButtons.length > 0 && (
        <div className="menu-group custom-extensions">
          <div className="color-picker-container">
            <button 
              onClick={() => setCustomMenuVisible(!customMenuVisible)} 
              title="Extensões personalizadas"
            >
              <FaPlus />
            </button>
            {customMenuVisible && (
              <div className="dropdown-menu">
                {renderCustomButtons()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente principal do editor avançado com suporte a extensões personalizadas
 * @param {Object} props - Propriedades do componente
 * @param {string} props.initialContent - Conteúdo inicial do editor
 * @param {Function} props.onUpdate - Função chamada quando o conteúdo é atualizado
 * @param {string} props.noteId - ID da nota sendo editada
 * @param {Array} props.customExtensions - Array de extensões personalizadas
 * @param {Array} props.customButtons - Array de botões personalizados para a barra de ferramentas
 * @param {Object} props.editorOptions - Opções adicionais para o editor
 */
const TipTapEditorAvancado = ({ 
  initialContent = "", 
  onUpdate, 
  noteId,
  customExtensions = [],
  customButtons = [],
  editorOptions = {}
}) => {
  const [autosaveInterval, setAutosaveInterval] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [localContent, setLocalContent] = useLocalStorage(`note-${noteId}`, initialContent);
  const [activeExtensions, setActiveExtensions] = useState([]);

  // Processa extensões personalizadas
  const processedCustomExtensions = useMemo(() => {
    return customExtensions.map(ext => {
      if (typeof ext === 'function') {
        return ext();
      } else if (typeof ext === 'object' && ext.name) {
        return createCustomExtension(ext);
      }
      return ext;
    });
  }, [customExtensions]);

  // Configuração do editor com extensões padrão e personalizadas
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        validate: (href) => /^https?:\/\//i.test(href)
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
      Typography,
      ...processedCustomExtensions
    ],
    content: localContent || initialContent,
    autofocus: editorOptions.autofocus !== false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setLocalContent(html);
      if (onUpdate) {
        onUpdate(html);
      }
      setLastSaved(new Date());
    },
    ...editorOptions
  });

  // Gerenciamento de extensões ativas
  const handleExtensionToggle = useCallback((extensionName) => {
    setActiveExtensions(prev => {
      if (prev.includes(extensionName)) {
        return prev.filter(name => name !== extensionName);
      } else {
        return [...prev, extensionName];
      }
    });
  }, []);

  // Configurar autosave
  useEffect(() => {
    if (editor && onUpdate) {
      const interval = setInterval(() => {
        const html = editor.getHTML();
        onUpdate(html);
        setLastSaved(new Date());
      }, editorOptions.autosaveInterval || 5000); // Autosave a cada 5 segundos por padrão

      setAutosaveInterval(interval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [editor, onUpdate, editorOptions.autosaveInterval]);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (autosaveInterval) {
        clearInterval(autosaveInterval);
      }
    };
  }, [autosaveInterval]);

  // Exportar para diferentes formatos
  const exportAs = useCallback((format) => {
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
      case "markdown":
        // Requer uma extensão para converter HTML para Markdown
        content = editor.getText(); // Fallback simples
        filename += ".md";
        mimeType = "text/markdown";
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
  }, [editor, noteId]);

  return (
    <div className="tiptap-editor-avancado">
      <MenuBarAvancado 
        editor={editor} 
        customButtons={customButtons} 
        onExtensionToggle={handleExtensionToggle} 
      />
      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-footer">
        <div className="autosave-status">
          {lastSaved && <span>Último salvamento: {lastSaved.toLocaleTimeString()}</span>}
        </div>

        <div className="export-options">
          <button onClick={() => exportAs("html")} title="Exportar como HTML" className="export-button">
            <FaHtml5 /> HTML
          </button>
          <button onClick={() => exportAs("text")} title="Exportar como Texto" className="export-button">
            <FaFileCode /> Texto
          </button>
          <button onClick={() => exportAs("markdown")} title="Exportar como Markdown" className="export-button">
            <FaMarkdown /> Markdown
          </button>
          <button onClick={() => exportAs("json")} title="Exportar como JSON" className="export-button">
            <FaFileExport /> JSON
          </button>
        </div>
      </div>

      <style jsx>{`
        .tiptap-editor-avancado {
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

        .export-options {
          display: flex;
          gap: 8px;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border: 1px solid #ccc;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .export-button:hover {
          background-color: #e9e9e9;
        }

        .autosave-status {
          color: #666;
          display: flex;
          align-items: center;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          min-width: 120px;
          padding: 4px 0;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .dropdown-item {
          padding: 6px 12px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }

        .dropdown-item:hover {
          background-color: #f0f0f0;
        }

        .custom-extensions button {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .editor-content {
            padding: 12px;
            min-height: 200px;
          }

          .export-options {
            flex-wrap: wrap;
          }

          .export-button {
            padding: 3px 6px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default TipTapEditorAvancado;