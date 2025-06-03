import React from 'react';
import { Editor } from '@tiptap/react';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaLink, FaCode } from 'react-icons/fa';
import { ToolbarButton } from './ToolbarButton';

interface BubbleMenuProps {
  editor: Editor;
  className?: string;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({ editor, className = '' }) => {
  if (!editor) return null;

  return (
    <div className={`bubble-menu ${className}`}>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Negrito (Ctrl+B)"
      >
        <FaBold />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Itálico (Ctrl+I)"
      >
        <FaItalic />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Sublinhado (Ctrl+U)"
      >
        <FaUnderline />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Tachado (Ctrl+Shift+S)"
      >
        <FaStrikethrough />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Código (Ctrl+E)"
      >
        <FaCode />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('URL', previousUrl);

          if (url === null) return;
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }

          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        isActive={editor.isActive('link')}
        title="Adicionar link (Ctrl+K)"
      >
        <FaLink />
      </ToolbarButton>
    </div>
  );
};
