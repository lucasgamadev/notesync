/**
 * Plugin para melhorar as funcionalidades de histórico e desfazer/refazer no editor
 * Adiciona recursos como histórico detalhado, pontos de restauração e navegação avançada
 */

import { Extension } from '@tiptap/core';
import { History } from '@tiptap/extension-history';
import { Plugin, PluginKey } from 'prosemirror-state';
import { FaUndo, FaRedo, FaHistory, FaBookmark } from 'react-icons/fa';

// Extensão para histórico com recursos avançados
const HistoryExtension = History.configure({
  depth: 100,
  newGroupDelay: 500,
});

// Plugin para adicionar funcionalidades avançadas ao histórico
const HistoryEnhancedPlugin = Extension.create({
  name: 'historyEnhancedPlugin',
  
  addStorage() {
    return {
      snapshots: [],
      currentIndex: -1,
    };
  },
  
  addCommands() {
    return {
      createSnapshot: () => ({ state, dispatch }) => {
        const snapshot = JSON.stringify(state.doc.toJSON());
        const { snapshots, currentIndex } = this.storage;
        
        // Remove snapshots futuros se estiver no meio do histórico
        const newSnapshots = snapshots.slice(0, currentIndex + 1);
        newSnapshots.push(snapshot);
        
        this.storage.snapshots = newSnapshots;
        this.storage.currentIndex = newSnapshots.length - 1;
        
        return true;
      },
      
      restoreSnapshot: (index) => ({ state, view, dispatch }) => {
        const { snapshots } = this.storage;
        
        if (index >= 0 && index < snapshots.length) {
          const snapshot = JSON.parse(snapshots[index]);
          const { schema } = state;
          const newDoc = schema.nodeFromJSON(snapshot);
          
          const transaction = state.tr.replaceWith(0, state.doc.content.size, newDoc);
          dispatch(transaction);
          
          this.storage.currentIndex = index;
          return true;
        }
        
        return false;
      },
      
      navigateHistory: (direction) => ({ state, view, dispatch }) => {
        const { snapshots, currentIndex } = this.storage;
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < snapshots.length) {
          return this.commands.restoreSnapshot(newIndex)({ state, view, dispatch });
        }
        
        return false;
      },
    };
  },
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('historyEnhancedPlugin'),
        state: {
          init() {
            return {
              changeCount: 0,
            };
          },
          apply(tr, value) {
            if (tr.docChanged) {
              return { changeCount: value.changeCount + 1 };
            }
            return value;
          },
        },
        view: (view) => {
          return {
            update: (view, prevState) => {
              const { state } = view;
              const { changeCount } = this.key.getState(state);
              const prevChangeCount = this.key.getState(prevState).changeCount;
              
              // Cria um snapshot automático a cada 10 alterações
              if (Math.floor(changeCount / 10) > Math.floor(prevChangeCount / 10)) {
                setTimeout(() => {
                  this.commands.createSnapshot()({ state, view, dispatch: view.dispatch });
                }, 0);
              }
            },
          };
        },
      }),
    ];
  },
});

// Configuração do plugin para o sistema de plugins
const historyEnhancedPlugin = {
  id: 'historyEnhanced',
  name: 'Histórico Avançado',
  description: 'Adiciona recursos avançados de histórico, pontos de restauração e navegação detalhada',
  
  // Extensões TipTap fornecidas pelo plugin
  extensions: [
    HistoryExtension,
    HistoryEnhancedPlugin,
  ],
  
  // Botões para a barra de ferramentas
  buttons: [
    {
      name: 'undo',
      title: 'Desfazer',
      icon: <FaUndo />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().undo().run();
        }
      },
    },
    {
      name: 'redo',
      title: 'Refazer',
      icon: <FaRedo />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().redo().run();
        }
      },
    },
    {
      name: 'createSnapshot',
      title: 'Criar Ponto de Restauração',
      icon: <FaBookmark />,
      onClick: (editor) => {
        if (editor) {
          editor.commands.createSnapshot();
          // Feedback visual para o usuário
          const notification = document.createElement('div');
          notification.className = 'editor-notification';
          notification.textContent = 'Ponto de restauração criado';
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
              notification.classList.remove('show');
              setTimeout(() => notification.remove(), 300);
            }, 2000);
          }, 0);
        }
      },
    },
    {
      name: 'showHistory',
      title: 'Histórico de Alterações',
      icon: <FaHistory />,
      onClick: (editor) => {
        if (editor) {
          // Aqui poderia abrir um modal com o histórico de snapshots
          alert('Funcionalidade de visualização de histórico em desenvolvimento');
        }
      },
    },
  ],
  
  // Comandos fornecidos pelo plugin
  commands: {
    createSnapshot: (editor) => {
      editor.commands.createSnapshot();
    },
    restoreSnapshot: (editor, index) => {
      editor.commands.restoreSnapshot(index);
    },
    navigateHistory: (editor, direction) => {
      editor.commands.navigateHistory(direction);
    },
  },
  
  // Função de inicialização do plugin
  setup: (editor) => {
    // Adiciona estilos CSS para notificações
    const style = document.createElement('style');
    style.textContent = `
      .editor-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4a86e8;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s, transform 0.3s;
        z-index: 1000;
      }
      
      .editor-notification.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
    
    // Cria um snapshot inicial
    setTimeout(() => {
      if (editor) {
        editor.commands.createSnapshot();
      }
    }, 500);
    
    return () => {
      // Limpeza ao desativar o plugin
      style.remove();
    };
  },
};

export default historyEnhancedPlugin;