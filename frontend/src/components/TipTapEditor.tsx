"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useCallback } from 'react';
import './editor-personalizavel.css';
import './editor-contrast-fix.css';
import './editor-cursor-fix.css'; // Correção para o cursor invisível
import './editor-cursor-visibility.css'; // Configuração adicional para visibilidade do cursor
import './editor-loading.css'; // Estilos para o indicador de carregamento

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
  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * Força a visibilidade do cursor no elemento do editor
   * @param element - Elemento DOM do editor
   */
  const forceCursorVisibility = useCallback((element: HTMLElement) => {
    if (!element) return;
    
    // Define estilos essenciais para visibilidade do cursor
    element.style.setProperty('cursor', 'text', 'important');
    element.style.setProperty('caret-color', '#000000', 'important');
    element.style.setProperty('-webkit-caret-color', '#000000', 'important');
    element.style.setProperty('-moz-caret-color', '#000000', 'important');
    element.style.setProperty('user-select', 'text', 'important');
    element.style.setProperty('-webkit-user-select', 'text', 'important');
    element.style.setProperty('-moz-user-select', 'text', 'important');
  }, []);

  /**
   * Configura observadores para manter o cursor visível
   * @param editorElement - Elemento do editor ProseMirror
   */
  const setupCursorObserver = useCallback((editorElement: HTMLElement) => {
    if (!editorElement) return undefined;
    
    // Força cursor visível imediatamente
    forceCursorVisibility(editorElement);
    
    // Event listeners para garantir cursor visível
    const events = ['mouseenter', 'mouseover', 'mousemove', 'focus', 'click'] as const;
    const eventHandlers = new Map<string, () => void>();
    
    events.forEach(eventType => {
      const handler = () => forceCursorVisibility(editorElement);
      eventHandlers.set(eventType, handler);
      editorElement.addEventListener(eventType, handler, { passive: true });
    });
    
    // Força cursor visível periodicamente
    const intervalId = setInterval(() => {
      forceCursorVisibility(editorElement);
    }, 100);
    
    // Cleanup function
    return () => {
      clearInterval(intervalId);
      events.forEach(eventType => {
        const handler = eventHandlers.get(eventType);
        if (handler) {
          editorElement.removeEventListener(eventType, handler);
        }
      });
      eventHandlers.clear();
    };
  }, [forceCursorVisibility]);
  // Inicializa o editor com as extensões básicas
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: editorContent,
    editable: !readOnly,
    immediatelyRender: false, // Corrige problemas de hidratação SSR
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
        'data-placeholder': placeholder,
      },
      handleDOMEvents: {
        focus: (view) => {
          // Força a visibilidade do cursor quando o editor recebe foco
          const element = view.dom as HTMLElement;
          if (element) {
            element.style.caretColor = '#000000';
            element.style.cursor = 'text';
          }
          return false;
        },
        mouseenter: (view) => {
          // Garante que o cursor permaneça visível quando o mouse entra no editor
          const element = view.dom as HTMLElement;
          if (element) {
            element.style.cursor = 'text';
          }
          return false;
        },
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

  // Configura a correção do cursor quando o editor estiver pronto
  useEffect(() => {
    if (!editor || !editorRef.current) return;
    
    const proseMirrorElement = editorRef.current.querySelector('.ProseMirror') as HTMLElement;
    if (proseMirrorElement) {
      const cleanup = setupCursorObserver(proseMirrorElement);
      return cleanup;
    }
  }, [editor, setupCursorObserver]);

  // Cleanup do editor quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <span>Carregando editor...</span>
      </div>
    );
  }

  return (
    <div className="editor-personalizavel">
      {/* Barra de ferramentas do editor */}
      <div className="menu-bar">
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            type="button"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            type="button"
          >
            <s>S</s>
          </button>
        </div>
        
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            type="button"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            type="button"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            type="button"
          >
            H3
          </button>
        </div>
        
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            type="button"
          >
            • Lista
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            type="button"
          >
            1. Lista
          </button>
        </div>
        
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
            type="button"
          >
            " Citação
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            type="button"
          >
            &lt;/&gt; Código
          </button>
        </div>
      </div>
      
      <div className="editor-with-visible-cursor" ref={editorRef}>
        <div className="editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default TipTapEditor;