'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { EditorContent, BubbleMenu as TiptapBubbleMenu } from '@tiptap/react'; // Removido useEditor não utilizado
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';

import { Toolbar } from './editor/Toolbar';
import { BubbleMenu } from './editor/BubbleMenu';
import { useTipTapEditor } from '../hooks/useTipTapEditor';

import './editor-personalizavel.css';
import './editor-contrast-fix.css';
import './editor-cursor-fix.css';
import './editor-cursor-visibility.css';
import './editor-loading.css';

export interface RichTextEditorProps {
  initialContent?: string;
  content?: string;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  showToolbar?: boolean;
  showFloatingMenu?: boolean;
  onChange?: (content: string) => void;
  onUpdate?: (content: string) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  content = '',
  placeholder = 'Comece a escrever...',
  readOnly = false,
  autoFocus = true,
  showToolbar = true,
  showFloatingMenu = true,
  onChange,
  onUpdate,
  onThemeChange,
}) => {
  // Configuração das extensões do editor
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false, // Usamos a versão com highlight de sintaxe
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
        defaultLanguage: 'plaintext',
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Título ${node.attrs.level}`;
          }
          return placeholder;
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Color,
      Highlight,
      TextStyle,
      Superscript,
      Subscript,
    ],
    [placeholder]
  );

  const {
    editor,
    theme,
    toggleTheme,
    isMounted,
  } = useTipTapEditor({
    initialContent,
    content,
    placeholder,
    readOnly,
    autoFocus,
    onChange,
    onUpdate,
    onThemeChange,
    // @ts-expect-error - extensions é usado internamente pelo hook
    extensions,
  });

  // Efeito para forçar a visibilidade do cursor
  useEffect(() => {
    if (!editor || !isMounted) return;

    const element = editor.view.dom as HTMLElement;
    if (!element) return;

      const forceCursorVisibility = () => {
      element.style.caretColor = theme === 'dark' ? '#ffffff' : '#000000';
      element.style.setProperty('--caret-color', theme === 'dark' ? '#ffffff' : '#000000', 'important');
    };

    forceCursorVisibility();

    const observer = new MutationObserver(forceCursorVisibility);
    observer.observe(element, { attributes: true, childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [editor, theme, isMounted]);

  // Manipuladores de eventos
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      // Aqui você pode implementar o upload da imagem para um servidor
      // Por enquanto, vamos apenas criar uma URL local para a imagem
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  }, [editor]);

  // Se não estiver montado, mostra um carregador
  if (!isMounted) {
    return (
      <div className="editor-loading">
        <div className="editor-loading-spinner" />
        <p>Carregando editor...</p>
      </div>
    );
  }

  return (
    <div className={`editor-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {showToolbar && editor && (
        <Toolbar
          editor={editor}
          onInsertImage={handleImageUpload}
          onInsertLink={() => {
            const url = window.prompt('Digite a URL do link:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
      )}

      <div className="editor-content-wrapper">
        <EditorContent editor={editor} className="editor-content" />
        
        {showFloatingMenu && editor && (
          <TiptapBubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bubble-menu-wrapper"
          >
            <BubbleMenu editor={editor} />
          </TiptapBubbleMenu>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
