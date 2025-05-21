"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import './editor-personalizavel.css';
import './editor-contrast-fix.css';
import './editor-cursor-fix.css'; // Correção para o cursor invisível

// Tipos para as propriedades do editor
interface TipTapEditorProps {
  initialContent?: string;
  content?: string;
  onChange?: (content: string) => void;
  onUpdate?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  noteId?: string;
}

/**
 * Componente de editor de texto rico baseado no TipTap
 * Permite edição formatada de notas com uma barra de ferramentas
 */
const TipTapEditor = ({ content, initialContent, onChange, onUpdate, readOnly = false, placeholder = 'Comece a escrever sua nota...', noteId }: TipTapEditorProps) => {
  // Usa initialContent se fornecido, caso contrário usa content ou string vazia
  const editorContent = initialContent || content || '';
  // Inicializa o editor com as extensões básicas
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: editorContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Chama o callback onUpdate se existir, caso contrário tenta usar onChange
      if (typeof onUpdate === 'function') {
        onUpdate(html);
      } else if (typeof onChange === 'function') {
        onChange(html);
      }
    },
    // Configurações adicionais para garantir visibilidade do cursor
    editorProps: {
      attributes: {
        class: 'editor-with-visible-cursor',
      },
    },
  });

  // Atualiza o conteúdo do editor quando a prop content muda
  useEffect(() => {
    if (editor) {
      const currentContent = initialContent || content;
      if (currentContent !== undefined && currentContent !== editor.getHTML()) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [content, initialContent, editor]);

  if (!editor) {
    return <div>Carregando editor...</div>;
  }

  return (
    <div className="editor-personalizavel">
      {/* Barra de ferramentas do editor */}
      <div className="menu-bar">
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Negrito"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Itálico"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            title="Tachado"
          >
            <s>S</s>
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            title="Título 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Título 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            title="Título 3"
          >
            H3
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title="Lista com marcadores"
          >
            • Lista
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title="Lista numerada"
          >
            1. Lista
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            title="Bloco de código"
          >
            {`</>`}
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
            title="Citação"
          >
            ""
          </button>
        </div>
      </div>

      {/* Conteúdo do editor */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default TipTapEditor;