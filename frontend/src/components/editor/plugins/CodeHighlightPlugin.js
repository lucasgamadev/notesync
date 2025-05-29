/**
 * Plugin para adicionar suporte a blocos de código com syntax highlighting
 * Permite criar e editar blocos de código com destaque de sintaxe para várias linguagens
 * 
 * Carrega linguagens dinamicamente para melhor desempenho
 */

import { Extension } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/core';
import { FaCode } from 'react-icons/fa';
import './styles/code-highlight.css';

// Linguagens suportadas e seus aliases
const SUPPORTED_LANGUAGES = {
  javascript: ['js', 'jsx'],
  typescript: ['ts', 'tsx'],
  xml: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist'],
  css: ['css', 'scss', 'sass', 'less'],
  python: ['py', 'py3', 'python3'],
  java: ['java'],
  csharp: ['csharp', 'cs', 'c#'],
  php: ['php', 'php3', 'php4', 'php5', 'php6', 'php7'],
  ruby: ['rb', 'gemspec', 'podspec', 'thor', 'irb'],
  go: ['go'],
  json: ['json', 'json5', 'jsonc'],
  markdown: ['md', 'markdown', 'mkd'],
  sql: ['sql', 'mysql', 'pgsql', 'postgres', 'postgresql'],
  bash: ['bash', 'sh', 'shell', 'zsh'],
  // Adicione mais linguagens conforme necessário
};

// Cache para linguagens já carregadas
const loadedLanguages = new Set();

/**
 * Carrega dinamicamente uma linguagem de destaque de sintaxe
 * @param {string} language - Nome da linguagem a ser carregada
 * @returns {Promise<boolean>} - True se o carregamento for bem-sucedido
 */
const loadLanguage = async (language) => {
  // Verifica se a linguagem já foi carregada
  if (loadedLanguages.has(language)) return true;

  try {
    // Tenta carregar o módulo da linguagem
    const langModule = await import(`highlight.js/lib/languages/${language}`);
    lowlight.registerLanguage(language, langModule.default);
    loadedLanguages.add(language);
    return true;
  } catch (error) {
    console.warn(`Falha ao carregar suporte para ${language}:`, error);
    return false;
  }
};

/**
 * Obtém o nome canônico da linguagem a partir de um alias
 * @param {string} alias - Alias da linguagem
 * @returns {string} - Nome canônico da linguagem ou o próprio alias se não encontrado
 */
const getCanonicalLanguage = (alias) => {
  const lowerAlias = alias.toLowerCase();
  
  // Verifica se é um nome direto
  if (SUPPORTED_LANGUAGES[lowerAlias]) {
    return lowerAlias;
  }
  
  // Procura por aliases
  for (const [lang, aliases] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (aliases.includes(lowerAlias)) {
      return lang;
    }
  }
  
  // Se não encontrar, retorna o próprio alias (será tratado como texto simples)
  return lowerAlias;
};

// Carrega as linguagens mais comuns por padrão
const DEFAULT_LANGUAGES = ['javascript', 'html', 'css', 'json', 'bash'];
DEFAULT_LANGUAGES.forEach(lang => loadLanguage(lang));

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
  // Função para validar e normalizar a linguagem
  validateLanguage: (language) => {
    if (!language) return 'javascript'; // Valor padrão
    
    const normalizedLang = getCanonicalLanguage(language);
    
    // Se a linguagem não estiver carregada, tenta carregar
    if (!loadedLanguages.has(normalizedLang) && SUPPORTED_LANGUAGES[normalizedLang]) {
      loadLanguage(normalizedLang).catch(console.error);
    }
    
    return normalizedLang;
  },
  
  // Função para obter a lista de linguagens suportadas
  getSupportedLanguages: () => Object.keys(SUPPORTED_LANGUAGES).sort(),
  
  // Verifica se uma linguagem é suportada
  isLanguageSupported: (language) => {
    if (!language) return false;
    const normalizedLang = getCanonicalLanguage(language);
    return normalizedLang in SUPPORTED_LANGUAGES;
  },
  
  // Carrega uma linguagem se necessário
  ensureLanguageLoaded: async (language) => {
    const normalizedLang = getCanonicalLanguage(language);
    if (!loadedLanguages.has(normalizedLang) && SUPPORTED_LANGUAGES[normalizedLang]) {
      return loadLanguage(normalizedLang);
    }
    return Promise.resolve();
  },
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
      onClick: async (editor) => {
        if (!editor) return;
        
        if (editor.isActive('codeBlock')) {
          editor.chain().focus().toggleCodeBlock().run();
          return;
        }
        
        // Obtém a linguagem atual do bloco de código, se existir
        const currentLanguage = editor.getAttributes('codeBlock').language || 'javascript';
        
        // Cria um diálogo personalizado para melhor UX
        const language = window.prompt(
          'Digite o nome da linguagem de programação (ex: javascript, python, html):',
          currentLanguage
        );
        
        if (language === null) return; // Usuário cancelou
        
        // Valida e normaliza a linguagem
        const validLanguage = codeHighlightPlugin.validateLanguage(language);
        
        // Atualiza ou insere o bloco de código
        editor.chain()
          .focus()
          .toggleCodeBlock({ language: validLanguage })
          .run();
        
        // Se a linguagem não estiver carregada, carrega em segundo plano
        if (SUPPORTED_LANGUAGES[validLanguage] && !loadedLanguages.has(validLanguage)) {
          await loadLanguage(validLanguage);
          // Força a atualização do editor para aplicar o destaque
          const { from } = editor.state.selection;
          editor.view.dispatch(editor.view.state.tr.setSelection(
            editor.state.selection.constructor.near(editor.state.doc.resolve(from))
          ));
        }
      },
      isActive: (editor) => editor && editor.isActive('codeBlock'),
    },
  ],
  
  // Comandos fornecidos pelo plugin
  commands: {
    insertCodeBlock: (editor, attrs) => {
      const language = attrs?.language || 'javascript';
      const validLanguage = codeHighlightPlugin.validateLanguage(language);
      return editor.chain().focus().toggleCodeBlock({ language: validLanguage }).run();
    },
    setCodeBlockLanguage: (editor, language) => {
      if (editor.isActive('codeBlock')) {
        const validLanguage = codeHighlightPlugin.validateLanguage(language);
        return editor.chain().focus().updateAttributes('codeBlock', { language: validLanguage }).run();
      }
      return false;
    },
    // Adiciona um comando para validar e definir a linguagem
    setValidLanguage: (editor, language) => {
      if (!editor) return false;
      
      const validLanguage = codeHighlightPlugin.validateLanguage(language);
      if (editor.isActive('codeBlock')) {
        return editor.chain().focus().updateAttributes('codeBlock', { 
          language: validLanguage 
        }).run();
      }
      return false;
    },
    // Verifica se uma linguagem é suportada
    isLanguageSupported: (_, language) => {
      return codeHighlightPlugin.isLanguageSupported(language);
    },
  },
  
  // Função de inicialização do plugin
  setup: (editor) => {
    // Adiciona manipulador para atualizar a linguagem quando o bloco de código for criado
    editor.on('update', () => {
      const codeBlocks = document.querySelectorAll('pre[data-language]');
      
      codeBlocks.forEach(block => {
        const language = block.getAttribute('data-language');
        if (language && SUPPORTED_LANGUAGES[language] && !loadedLanguages.has(language)) {
          loadLanguage(language).then(() => {
            // Força a atualização do destaque de sintaxe
            const content = block.textContent;
            block.textContent = content;
          });
        }
      });
    });
    
    // Retorna uma função vazia para limpeza (os estilos são gerenciados pelo CSS importado)
    return () => {};
  },
};

export default codeHighlightPlugin;