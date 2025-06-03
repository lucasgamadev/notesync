import React from 'react';
import { Editor } from '@tiptap/react';
import { FaUndo, FaRedo, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListUl, FaListOl, FaQuoteLeft, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage, FaTable, FaSun, FaMoon } from 'react-icons/fa';
import { BiHeading, BiCodeBlock } from 'react-icons/bi';
import { ToolbarButton } from './ToolbarButton';
// Removendo import não utilizado
// import { Dropdown } from './Dropdown';

interface ToolbarProps {
  editor: Editor | null;
  onInsertImage: () => void;
  onInsertLink: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  // Removendo props não utilizadas
  // onInsertImage,
  // onInsertLink,
  onToggleTheme,
  theme,
}) => {
  if (!editor) return null;

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    
    const url = window.prompt('URL da imagem');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const items = [
    {
      icon: <FaBold />,
      title: 'Negrito',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: <FaItalic />,
      title: 'Itálico',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: <FaUnderline />,
      title: 'Sublinhado',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: <FaStrikethrough />,
      title: 'Tachado',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    { type: 'divider' },
    {
      icon: <BiHeading />,
      title: 'Título',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <FaListUl />,
      title: 'Lista não ordenada',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: <FaListOl />,
      title: 'Lista ordenada',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: <FaQuoteLeft />,
      title: 'Citação',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: <BiCodeBlock />,
      title: 'Bloco de código',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    { type: 'divider' },
    {
      icon: <FaAlignLeft />,
      title: 'Alinhar à esquerda',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: () => editor.isActive({ textAlign: 'left' }),
    },
    {
      icon: <FaAlignCenter />,
      title: 'Centralizar',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: () => editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: <FaAlignRight />,
      title: 'Alinhar à direita',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: () => editor.isActive({ textAlign: 'right' }),
    },
    { type: 'divider' },
    {
      icon: <FaLink />,
      title: 'Adicionar link',
      action: setLink,
    },
    {
      icon: <FaImage />,
      title: 'Inserir imagem',
      action: addImage,
    },
    {
      icon: <FaTable />,
      title: 'Inserir tabela',
      action: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer"
        >
          <FaUndo />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer"
        >
          <FaRedo />
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        {items.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={`divider-${index}`} className="toolbar-divider" />;
          }
          
          return (
            <ToolbarButton
              key={item.title}
              onClick={item.action}
              isActive={item.isActive?.()}
              title={item.title}
            >
              {item.icon}
            </ToolbarButton>
          );
        })}
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          onClick={onToggleTheme}
          title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? <FaMoon className="icon" /> : <FaSun className="icon" />}
        </ToolbarButton>
      </div>
    </div>
  );
};
