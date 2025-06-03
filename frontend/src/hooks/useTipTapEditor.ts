import { useCallback, useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react'; // Editor não está sendo usado
import { Extension } from '@tiptap/core';

export interface UseTipTapEditorProps {
  initialContent?: string;
  content?: string;
  // placeholder?: string; // Removido pois não está sendo usado
  readOnly?: boolean;
  autoFocus?: boolean;
  onUpdate?: (content: string) => void;
  onChange?: (content: string) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  extensions?: Extension[];
}

export const useTipTapEditor = ({
  initialContent = '',
  content = '',
  readOnly = false,
  autoFocus = true,
  onUpdate,
  onChange,
  onThemeChange,
  extensions = [],
}: UseTipTapEditorProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Configuração do editor
  const editor = useEditor({
    extensions,
    content: initialContent || content || '',
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    injectCSS: true,
    onUpdate: ({ editor: editorInstance }) => {
      if (editorInstance.isDestroyed) return;
      
      const html = editorInstance.getHTML();
      try {
        if (typeof onUpdate === 'function') {
          onUpdate(html);
        } else if (typeof onChange === 'function') {
          onChange(html);
        }
      } catch (error) {
        console.error('Erro ao executar callback de atualização:', error);
      }
    },
  });

  // Inicialização do editor
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      editor?.destroy();
    };
  }, [editor]);

  // Sincronização de conteúdo externo
  useEffect(() => {
    if (!editor || !isMounted) return;
    
    const editorContent = editor.getHTML();
    const newContent = initialContent || content || '';
    
    if (editorContent !== newContent) {
      editor.commands.setContent(newContent, false);
    }
  }, [content, initialContent, editor, isMounted]);

  // Atualiza as extensões quando elas mudarem
  useEffect(() => {
    if (!editor) return;
    
    // Atualiza as extensões se necessário
    editor.setOptions({
      extensions,
    });
  }, [editor, extensions]);

  // Toggle de tema
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      onThemeChange?.(newTheme);
      
      // Aplica o tema ao documento
      document.documentElement.setAttribute('data-theme', newTheme);
      
      return newTheme;
    });
  }, [onThemeChange]);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    editor,
    theme,
    toggleTheme,
    isMounted,
  } as const;
};
