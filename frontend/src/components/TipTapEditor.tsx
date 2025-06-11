"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { FaUndo, FaRedo, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListUl, FaListOl, FaQuoteLeft, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage, FaTable, FaSun, FaMoon, FaTextHeight } from 'react-icons/fa';
import { BiHeading, BiCodeBlock } from 'react-icons/bi';
import { getExtensions } from '../config/tiptap-extensions';

// Importar estilos
import './editor-personalizavel.css';
import './editor-contrast-fix.css';
import './editor-cursor-fix.css';
import './editor-cursor-visibility.css';
import './editor-loading.css';

// Tipos para as propriedades do editor
interface TipTapEditorProps {
  initialContent?: string;
  content?: string;
  onChange?: (content: string) => void;
  onUpdate?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
  showFloatingMenu?: boolean;
  theme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

// Tipos para os botões da barra de ferramentas
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
  className?: string;
  shortcut?: string;
}

// Tipos para os itens do menu suspenso
interface DropdownItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  shortcut?: string;
  type?: 'divider' | 'item';
}

// Tipos para o menu suspenso
interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  tooltip: string;
  isActive?: boolean;
  disabled?: boolean;
  align?: 'left' | 'right';
}

// Componente de botão da barra de ferramentas
const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  icon, 
  tooltip, 
  disabled = false,
  className = ''
}: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    className={`toolbar-button ${isActive ? 'is-active' : ''} ${className}`}
    disabled={disabled}
    data-tooltip={tooltip}
    type="button"
  >
    {icon}
  </button>
);

// Componente de menu suspenso
const Dropdown = ({ 
  trigger, 
  items, 
  tooltip, 
  isActive = false, 
  disabled = false,
  align = 'left'
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <ToolbarButton
        onClick={() => setIsOpen(!isOpen)}
        isActive={isActive || isOpen}
        icon={trigger}
        tooltip={tooltip}
        disabled={disabled}
      />
      {isOpen && (
        <div className={`dropdown-menu ${align}-align`}>
          {items.map((item, index) => (
            <div key={index}>
              {item.type === 'divider' ? (
                <div className="dropdown-divider" />
              ) : (
                <button
                  className={`dropdown-item ${item.isActive ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.onClick) {
                      item.onClick();
                    }
                    setIsOpen(false);
                  }}
                  type="button"
                  disabled={!item.onClick}
                >
                  {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                  {item.label && <span className="dropdown-item-label">{item.label}</span>}
                  {item.shortcut && (
                    <span className="dropdown-item-shortcut">{item.shortcut}</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Componente de editor de texto rico baseado no TipTap
 * Permite edição formatada de notas com uma barra de ferramentas personalizável
 */
const TipTapEditor = ({ 
  content, 
  initialContent, 
  onChange, 
  onUpdate, 
  readOnly = false, 
  placeholder = 'Comece a escrever sua nota...',
  autoFocus = true,
  showToolbar = true,
  showFloatingMenu = true,
  onThemeChange
}: TipTapEditorProps) => {
  // Estado para controle do tema - sempre forçando o tema claro
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Efeito para aplicar o tema ao elemento raiz
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    
    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [theme, onThemeChange]);

  // Alternar entre temas claro e escuro
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      if (onThemeChange) {
        onThemeChange(newTheme);
      }
      return newTheme;
    });
  }, [onThemeChange]);

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
    
    // Força cursor visível periodicamente (com intervalo maior para melhor performance)
    const intervalId = setInterval(() => {
      if (document.contains(editorElement) && document.activeElement === editorElement) {
        forceCursorVisibility(editorElement);
      }
    }, 1000); // Aumentado para 1 segundo para melhor performance
    
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

  // Inicializa o editor com as extensões disponíveis
  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: editorContent,
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    injectCSS: true,
    onUpdate: ({ editor }) => {
      if (editor.isDestroyed) return;
      
      const html = editor.getHTML();
      // Chama o callback onUpdate se existir, caso contrário tenta usar onChange
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
    // Configurações adicionais para garantir visibilidade do cursor
    editorProps: {
      attributes: {
        class: 'editor-with-visible-cursor prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
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
    if (editor && !editor.isDestroyed) {
      const currentContent = initialContent || content || '';
      const editorContent = editor.getHTML();
      
      // Só atualiza se o conteúdo realmente mudou para evitar loops
      if (currentContent !== editorContent) {
        editor.commands.setContent(currentContent, false);
      }
    }
  }, [content, initialContent, editor]);

  // Configura a correção do cursor quando o editor estiver pronto
  useEffect(() => {
    if (!editor || !editorRef.current || editor.isDestroyed) return;
    
    // Aguarda um pouco para garantir que o DOM foi renderizado
    const timeoutId = setTimeout(() => {
      const proseMirrorElement = editorRef.current?.querySelector('.ProseMirror') as HTMLElement;
      if (proseMirrorElement) {
        const cleanup = setupCursorObserver(proseMirrorElement);
        return cleanup;
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [editor, setupCursorObserver]);

  // Cleanup do editor quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
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

  // Verifica se o editor está vazio
  const isEmpty = editor.isEmpty;

  return (
    <div className="editor-personalizavel" data-theme={theme}>
      {/* Barra de ferramentas do editor */}
      {showToolbar && (
        <div className="menu-bar">
          {/* Botão de desfazer/refazer */}
          <div className="menu-group">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              icon={<FaUndo />}
              tooltip="Desfazer (Ctrl+Z)"
              disabled={!editor.can().undo()}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              icon={<FaRedo />}
              tooltip="Refazer (Ctrl+Shift+Z)"
              disabled={!editor.can().redo()}
            />
          </div>
          
          {/* Formatação de texto */}
          <div className="menu-group">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={<FaBold />}
              tooltip="Negrito (Ctrl+B)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={<FaItalic />}
              tooltip="Itálico (Ctrl+I)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              icon={<FaUnderline />}
              tooltip="Sublinhado (Ctrl+U)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              icon={<FaStrikethrough />}
              tooltip="Tachado (Ctrl+Shift+S)"
            />
            <Dropdown
              trigger={<FaTextHeight />}
              tooltip="Tamanho do texto"
              items={[
                {
                  label: 'Pequeno',
                  onClick: () => {
                    editor.chain().focus().setMark('textStyle', { fontSize: '0.875em' }).run();
                  },
                  isActive: editor.isActive('textStyle', { fontSize: '0.875em' })
                },
                {
                  label: 'Normal',
                  onClick: () => {
                    editor.chain().focus().setMark('textStyle', { fontSize: '1em' }).run();
                  },
                  isActive: !editor.isActive('textStyle', { fontSize: '0.875em' }) && 
                           !editor.isActive('textStyle', { fontSize: '1.25em' }) &&
                           !editor.isActive('textStyle', { fontSize: '1.5em' }) &&
                           !editor.isActive('textStyle', { fontSize: '2em' })
                },
                {
                  label: 'Grande',
                  onClick: () => {
                    editor.chain().focus().setMark('textStyle', { fontSize: '1.25em' }).run();
                  },
                  isActive: editor.isActive('textStyle', { fontSize: '1.25em' })
                },
                {
                  label: 'Muito Grande',
                  onClick: () => {
                    editor.chain().focus().setMark('textStyle', { fontSize: '1.5em' }).run();
                  },
                  isActive: editor.isActive('textStyle', { fontSize: '1.5em' })
                },
                {
                  label: 'Enorme',
                  onClick: () => {
                    editor.chain().focus().setMark('textStyle', { fontSize: '2em' }).run();
                  },
                  isActive: editor.isActive('textStyle', { fontSize: '2em' })
                },
              ]}
            />
          </div>
          
          {/* Cabeçalhos e parágrafos */}
          <div className="menu-group">
            <Dropdown
              trigger={<BiHeading />}
              tooltip="Estilos de texto"
              items={[
                {
                  label: 'Parágrafo',
                  onClick: () => editor.chain().focus().setParagraph().run(),
                  isActive: editor.isActive('paragraph'),
                  shortcut: 'Ctrl+Alt+0'
                },
                { type: 'divider' },
                {
                  label: 'Título 1',
                  onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                  isActive: editor.isActive('heading', { level: 1 }),
                  shortcut: 'Ctrl+Alt+1'
                },
                {
                  label: 'Título 2',
                  onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                  isActive: editor.isActive('heading', { level: 2 }),
                  shortcut: 'Ctrl+Alt+2'
                },
                {
                  label: 'Título 3',
                  onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                  isActive: editor.isActive('heading', { level: 3 }),
                  shortcut: 'Ctrl+Alt+3'
                },
              ]}
            />
          </div>
          
          {/* Listas */}
          <div className="menu-group">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={<FaListUl />}
              tooltip="Lista com marcadores (Ctrl+Shift+8)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={<FaListOl />}
              tooltip="Lista numerada (Ctrl+Shift+7)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleList('taskList', 'taskItem').run()}
              isActive={editor.isActive('taskList')}
              icon={<FaListUl />}
              tooltip="Lista de tarefas"
            />
          </div>
          
          {/* Blocos */}
          <div className="menu-group">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={<FaQuoteLeft />}
              tooltip="Citação (Ctrl+Shift+9)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              icon={<BiCodeBlock />}
              tooltip="Bloco de código (Ctrl+Alt+C)"
            />
          </div>
          
          {/* Alinhamento */}
          <div className="menu-group">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              icon={<FaAlignLeft />}
              tooltip="Alinhar à esquerda (Ctrl+Shift+L)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              icon={<FaAlignCenter />}
              tooltip="Centralizar (Ctrl+Shift+E)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              icon={<FaAlignRight />}
              tooltip="Alinhar à direita (Ctrl+Shift+R)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              icon={<FaAlignLeft className="justify" />}
              tooltip="Justificar (Ctrl+Shift+J)"
            />
          </div>
          
          {/* Tamanho do texto */}
          <div className="menu-group">
            <Dropdown
              trigger={<FaTextHeight />}
              tooltip="Tamanho do texto"
              items={[
                {
                  label: 'Pequeno',
                  onClick: () => document.execCommand('fontSize', false, '2'),
                  isActive: false
                },
                {
                  label: 'Normal',
                  onClick: () => document.execCommand('fontSize', false, '3'),
                  isActive: true
                },
                {
                  label: 'Grande',
                  onClick: () => document.execCommand('fontSize', false, '4'),
                  isActive: false
                },
                {
                  label: 'Muito Grande',
                  onClick: () => document.execCommand('fontSize', false, '5'),
                  isActive: false
                },
                {
                  label: 'Enorme',
                  onClick: () => document.execCommand('fontSize', false, '6'),
                  isActive: false
                },
              ]}
            />
          </div>
          
          {/* Links e mídia */}
          <div className="menu-group">
            <ToolbarButton
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl || 'https://');
                
                // Se o usuário cancelar
                if (url === null) {
                  return;
                }
                
                // Se a URL estiver vazia, remove o link
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                
                // Atualiza o link
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).focus().run();
              }}
              isActive={editor.isActive('link')}
              icon={<FaLink />}
              tooltip="Inserir link (Ctrl+K)"
            />
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('URL da imagem', 'https://');
                if (url) {
                  editor.chain().focus().insertContent(`<img src="${url}" alt="Imagem">`).run();
                }
              }}
              icon={<FaImage />}
              tooltip="Inserir imagem"
            />
            <ToolbarButton
              onClick={() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).focus().run();
              }}
              icon={<FaTable />}
              tooltip="Inserir tabela"
            />
          </div>
          
          {/* Tema */}
          <div className="menu-group">
            <ToolbarButton
              onClick={toggleTheme}
              icon={theme === 'dark' ? <FaSun /> : <FaMoon />}
              tooltip={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              className="theme-toggle"
            />
          </div>
        </div>
      )}
      
      {/* Menu flutuante para formatação rápida */}
      {showFloatingMenu && editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ 
            duration: 100,
            placement: 'top-start',
            arrow: true,
            interactive: true,
            appendTo: 'parent',
            maxWidth: 'none',
            zIndex: 50
          }}
          className="floating-menu"
          shouldShow={({ editor: currentEditor, state }) => {
            // Mostra apenas para seleção de texto
            const { selection } = state;
            const { empty } = selection;
            
            // Não mostra se não houver seleção
            if (empty || !currentEditor.isEditable) {
              return false;
            }
            
            // Não mostra em blocos de código
            if (currentEditor.isActive('codeBlock') || currentEditor.isActive('code')) {
              return false;
            }
            
            return true;
          }}
        >
          <div className="floating-menu-content">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={<FaBold />}
              tooltip="Negrito (Ctrl+B)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={<FaItalic />}
              tooltip="Itálico (Ctrl+I)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              icon={<FaUnderline />}
              tooltip="Sublinhado (Ctrl+U)"
            />
            <ToolbarButton
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl || 'https://');
                
                if (url === null) return;
                
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              isActive={editor.isActive('link')}
              icon={<FaLink />}
              tooltip="Link (Ctrl+K)"
            />
          </div>
        </BubbleMenu>
      )}
      
      {/* Área de edição principal */}
      <div className="editor-with-visible-cursor" ref={editorRef}>
        <div className="editor-content">
          <EditorContent 
            editor={editor} 
            className={`${isEmpty ? 'is-empty' : ''}`}
            data-placeholder={placeholder}
          />
          
          {/* Barra de status */}
          <div className="editor-status-bar">
            <div className="status-item">
              {editor.storage.characterCount?.characters() || 0} caracteres
            </div>
            <div className="status-item">
              {editor.storage.characterCount?.words() || 0} palavras
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipTapEditor;