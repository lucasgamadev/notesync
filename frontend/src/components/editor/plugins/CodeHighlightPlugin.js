/**
 * Plugin para adicionar suporte a blocos de código com syntax highlighting
 * Permite criar e editar blocos de código com destaque de sintaxe para várias linguagens
 */

import { Extension } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/core';
import { FaCode } from 'react-icons/fa';

// Importações para linguagens comuns
// Nota: Na implementação real, você pode importar mais linguagens conforme necessário
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';

// Registra as linguagens no lowlight
lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('html', html);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('java', java);
lowlight.registerLanguage('csharp', csharp);
lowlight.registerLanguage('php', php);
lowlight.registerLanguage('ruby', ruby);
lowlight.registerLanguage('go', go);
lowlight.registerLanguage('json', json);
lowlight.registerLanguage('markdown', markdown);
lowlight.registerLanguage('sql', sql);
lowlight.registerLanguage('bash', bash);

// Extensão para blocos de código com syntax highlighting
const CodeBlockExtension = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: 'javascript',
});

// Plugin para melhorar a experiência de edição de código
const CodeEditorPlugin = Extension.create({
  name: 'codeEditorPlugin',
  
  addKeyboardShortcuts() {
    return {
      // Adiciona indentação com Tab dentro de blocos de código
      Tab: ({ editor }) => {
        if (editor.isActive('codeBlock')) {
          return editor.commands.insertContent('  ');
        }
        return false;
      },
    };
  },
});

// Configuração do plugin para o sistema de plugins
const codeHighlightPlugin = {
  id: 'codeHighlight',
  name: 'Destaque de Código',
  description: 'Adiciona suporte para blocos de código com destaque de sintaxe para várias linguagens',
  
  // Extensões TipTap fornecidas pelo plugin
  extensions: [
    CodeBlockExtension,
    CodeEditorPlugin,
  ],
  
  // Botões para a barra de ferramentas
  buttons: [
    {
      name: 'codeBlock',
      title: 'Bloco de Código',
      icon: <FaCode />,
      onClick: (editor) => {
        if (editor) {
          if (editor.isActive('codeBlock')) {
            editor.chain().focus().toggleCodeBlock().run();
          } else {
            const language = prompt('Linguagem (javascript, python, html, etc):', 'javascript');
            editor.chain().focus().toggleCodeBlock({ language: language || 'javascript' }).run();
          }
        }
      },
      isActive: (editor) => editor && editor.isActive('codeBlock'),
    },
  ],
  
  // Comandos fornecidos pelo plugin
  commands: {
    insertCodeBlock: (editor, attrs) => {
      editor.chain().focus().toggleCodeBlock(attrs).run();
    },
    setCodeBlockLanguage: (editor, language) => {
      if (editor.isActive('codeBlock')) {
        editor.chain().focus().updateAttributes('codeBlock', { language }).run();
      }
    },
  },
  
  // Função de inicialização do plugin
  setup: (editor) => {
    // Adiciona estilos CSS para os blocos de código
    const style = document.createElement('style');
    style.textContent = `
      pre {
        background-color: #282c34;
        color: #abb2bf;
        padding: 0.75em 1em;
        border-radius: 5px;
        font-family: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
        overflow-x: auto;
        position: relative;
      }
      
      pre::before {
        content: attr(data-language);
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.25em 0.5em;
        font-size: 0.75em;
        background-color: rgba(0, 0, 0, 0.3);
        color: #e6e6e6;
        border-bottom-left-radius: 4px;
      }
      
      code {
        font-family: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
      }
      
      .hljs-comment,
      .hljs-quote {
        color: #5c6370;
        font-style: italic;
      }

      .hljs-doctag,
      .hljs-keyword,
      .hljs-formula {
        color: #c678dd;
      }

      .hljs-section,
      .hljs-name,
      .hljs-selector-tag,
      .hljs-deletion,
      .hljs-subst {
        color: #e06c75;
      }

      .hljs-literal {
        color: #56b6c2;
      }

      .hljs-string,
      .hljs-regexp,
      .hljs-addition,
      .hljs-attribute,
      .hljs-meta-string {
        color: #98c379;
      }

      .hljs-built_in,
      .hljs-class .hljs-title {
        color: #e6c07b;
      }

      .hljs-variable,
      .hljs-template-variable,
      .hljs-type,
      .hljs-selector-class,
      .hljs-selector-attr,
      .hljs-selector-pseudo,
      .hljs-number {
        color: #d19a66;
      }

      .hljs-symbol,
      .hljs-bullet,
      .hljs-link,
      .hljs-meta,
      .hljs-selector-id,
      .hljs-title {
        color: #61aeee;
      }

      .hljs-emphasis {
        font-style: italic;
      }

      .hljs-strong {
        font-weight: bold;
      }

      .hljs-link {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Limpeza ao desativar o plugin
      style.remove();
    };
  },
};

export default codeHighlightPlugin;