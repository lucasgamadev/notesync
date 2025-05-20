/**
 * Plugin para melhorar as funcionalidades de tabelas no editor
 * Adiciona recursos como redimensionamento, mesclagem de células e formatação avançada
 */

import { Extension } from '@tiptap/core';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Plugin, PluginKey } from 'prosemirror-state';
import { FaTable, FaColumns, FaRows, FaTrash, FaPlus } from 'react-icons/fa';
import { MdMergeType, MdGridOn } from 'react-icons/md';

// Extensão para tabelas com recursos avançados
const TableExtension = Table.configure({
  resizable: true,
  lastColumnResizable: true,
  cellMinWidth: 50,
  HTMLAttributes: {
    class: 'enhanced-table',
  },
});

// Extensão para células de tabela com recursos avançados
const TableCellExtension = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      colspan: {
        default: 1,
        parseHTML: element => {
          const colspan = element.getAttribute('colspan');
          return colspan ? parseInt(colspan, 10) : 1;
        },
        renderHTML: attributes => {
          if (attributes.colspan === 1) {
            return {};
          }
          
          return { colspan: attributes.colspan };
        },
      },
      rowspan: {
        default: 1,
        parseHTML: element => {
          const rowspan = element.getAttribute('rowspan');
          return rowspan ? parseInt(rowspan, 10) : 1;
        },
        renderHTML: attributes => {
          if (attributes.rowspan === 1) {
            return {};
          }
          
          return { rowspan: attributes.rowspan };
        },
      },
    };
  },
});

// Plugin para melhorar a experiência de edição de tabelas
const TableEditingPlugin = Extension.create({
  name: 'tableEditingPlugin',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableEditingPlugin'),
        props: {
          handleDOMEvents: {
            // Adiciona manipuladores de eventos para interação com tabelas
            click: (view, event) => {
              // Implementação de clique em células para seleção
              return false;
            },
          },
        },
      }),
    ];
  },
});

// Configuração do plugin para o sistema de plugins
const tableEnhancedPlugin = {
  id: 'tableEnhanced',
  name: 'Tabelas Avançadas',
  description: 'Adiciona recursos avançados para tabelas, como redimensionamento, mesclagem de células e formatação',
  
  // Extensões TipTap fornecidas pelo plugin
  extensions: [
    TableExtension,
    TableRow,
    TableHeader,
    TableCellExtension,
    TableEditingPlugin,
  ],
  
  // Botões para a barra de ferramentas
  buttons: [
    {
      name: 'insertTable',
      title: 'Inserir Tabela',
      icon: <FaTable />,
      onClick: (editor) => {
        if (editor) {
          const rows = prompt('Número de linhas:', '3');
          const cols = prompt('Número de colunas:', '3');
          
          if (rows && cols) {
            editor.chain().focus().insertTable({
              rows: parseInt(rows, 10),
              cols: parseInt(cols, 10),
              withHeaderRow: true,
            }).run();
          }
        }
      },
    },
    {
      name: 'addColumnBefore',
      title: 'Adicionar Coluna Antes',
      icon: <FaColumns />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().addColumnBefore().run();
        }
      },
    },
    {
      name: 'addColumnAfter',
      title: 'Adicionar Coluna Depois',
      icon: <FaPlus />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().addColumnAfter().run();
        }
      },
    },
    {
      name: 'deleteColumn',
      title: 'Excluir Coluna',
      icon: <FaTrash />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().deleteColumn().run();
        }
      },
    },
    {
      name: 'addRowBefore',
      title: 'Adicionar Linha Antes',
      icon: <FaRows />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().addRowBefore().run();
        }
      },
    },
    {
      name: 'addRowAfter',
      title: 'Adicionar Linha Depois',
      icon: <FaPlus />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().addRowAfter().run();
        }
      },
    },
    {
      name: 'deleteRow',
      title: 'Excluir Linha',
      icon: <FaTrash />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().deleteRow().run();
        }
      },
    },
    {
      name: 'mergeCells',
      title: 'Mesclar Células',
      icon: <MdMergeType />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().mergeCells().run();
        }
      },
    },
    {
      name: 'splitCell',
      title: 'Dividir Célula',
      icon: <MdGridOn />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().splitCell().run();
        }
      },
    },
    {
      name: 'deleteTable',
      title: 'Excluir Tabela',
      icon: <FaTrash />,
      onClick: (editor) => {
        if (editor) {
          editor.chain().focus().deleteTable().run();
        }
      },
    },
  ],
  
  // Comandos fornecidos pelo plugin
  commands: {
    insertTable: (editor, attrs) => {
      editor.chain().focus().insertTable(attrs).run();
    },
    setCellBackgroundColor: (editor, color) => {
      editor.chain().focus().updateAttributes('tableCell', { backgroundColor: color }).run();
    },
  },
  
  // Função de inicialização do plugin
  setup: (editor) => {
    // Adiciona estilos CSS para as tabelas
    const style = document.createElement('style');
    style.textContent = `
      .enhanced-table {
        border-collapse: collapse;
        margin: 1em 0;
        overflow: hidden;
        width: 100%;
      }
      
      .enhanced-table td, .enhanced-table th {
        border: 1px solid #e1e4e8;
        box-sizing: border-box;
        min-width: 1em;
        padding: 0.5em 1em;
        position: relative;
        vertical-align: top;
      }
      
      .enhanced-table th {
        background-color: #f6f8fa;
        font-weight: bold;
        text-align: left;
      }
      
      .enhanced-table .selectedCell:after {
        background: rgba(200, 200, 255, 0.4);
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        z-index: 2;
      }
      
      .tableWrapper {
        overflow-x: auto;
      }
      
      .resize-cursor {
        cursor: col-resize;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Limpeza ao desativar o plugin
      style.remove();
    };
  },
};

export default tableEnhancedPlugin;