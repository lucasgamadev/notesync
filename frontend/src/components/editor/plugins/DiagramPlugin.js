/**
 * Plugin para adicionar suporte a diagramas no editor
 * Permite criar e editar diagramas usando a biblioteca Mermaid
 */

import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { FaProjectDiagram } from 'react-icons/fa';

// Extensão para o nó de diagrama
const DiagramNode = Node.create({
  name: 'diagram',
  group: 'block',
  content: 'text*',
  marks: '',
  isolating: true,
  
  addAttributes() {
    return {
      diagramType: {
        default: 'flowchart',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="diagram"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-type': 'diagram', class: 'diagram-container' }, 0];
  },

  addCommands() {
    return {
      insertDiagram: (attributes) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: 'text',
                text: 'graph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;',
              },
            ],
          })
          .run();
      },
    };
  },
});

// Plugin para renderizar diagramas
const DiagramPlugin = Extension.create({
  name: 'diagramPlugin',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('diagramPlugin'),
        view: () => {
          return {
            update: (view, prevState) => {
              // Encontra todos os nós de diagrama e renderiza
              const diagramNodes = document.querySelectorAll('.diagram-container');
              
              diagramNodes.forEach(node => {
                if (!node.getAttribute('data-rendered')) {
                  const content = node.textContent;
                  
                  // Aqui você pode integrar com a biblioteca Mermaid
                  // Exemplo: mermaid.render('diagram-' + Math.random(), content, (svg) => { ... })
                  
                  // Marca como renderizado para evitar re-renderização
                  node.setAttribute('data-rendered', 'true');
                  
                  // Adiciona um placeholder para visualização
                  const placeholder = document.createElement('div');
                  placeholder.className = 'diagram-preview';
                  placeholder.innerHTML = `<div class="diagram-placeholder">Diagrama: ${content.split('\n')[0]}</div>`;
                  
                  // Mantém o conteúdo original em um elemento oculto
                  const codeElement = document.createElement('pre');
                  codeElement.style.display = 'none';
                  codeElement.textContent = content;
                  
                  node.innerHTML = '';
                  node.appendChild(placeholder);
                  node.appendChild(codeElement);
                }
              });
            },
          };
        },
      }),
    ];
  },
});

// Configuração do plugin para o sistema de plugins
const diagramPlugin = {
  id: 'diagram',
  name: 'Diagramas',
  description: 'Adiciona suporte para criação de diagramas usando a sintaxe Mermaid',
  
  // Extensões TipTap fornecidas pelo plugin
  extensions: [
    DiagramNode,
    DiagramPlugin,
  ],
  
  // Botões para a barra de ferramentas
  buttons: [
    {
      name: 'insertDiagram',
      title: 'Inserir Diagrama',
      icon: <FaProjectDiagram />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().insertDiagram({ diagramType: 'flowchart' }).run();
        }
      },
    },
  ],
  
  // Comandos fornecidos pelo plugin
  commands: {
    insertDiagram: (editor, attrs) => {
      editor.chain().focus().insertDiagram(attrs).run();
    },
  },
  
  // Função de inicialização do plugin
  setup: (editor) => {
    // Adiciona estilos CSS para os diagramas
    const style = document.createElement('style');
    style.textContent = `
      .diagram-container {
        margin: 1em 0;
        padding: 1em;
        background-color: #f8f9fa;
        border: 1px solid #e1e4e8;
        border-radius: 4px;
      }
      
      .diagram-placeholder {
        padding: 1em;
        background-color: #f0f4f8;
        border: 1px dashed #ccc;
        border-radius: 4px;
        color: #666;
        font-family: monospace;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Limpeza ao desativar o plugin
      style.remove();
    };
  },
};

export default diagramPlugin;