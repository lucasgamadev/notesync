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
  javascript: ['js', 'jsx', 'mjs', 'cjs'],
  typescript: ['ts', 'tsx', 'mts', 'cts'],
  xml: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist', 'svg'],
  css: ['css', 'scss', 'sass', 'less', 'stylus'],
  python: ['py', 'py3', 'python3', 'pyi', 'pyw', 'pyc', 'pyd', 'pyo', 'pyw', 'pyz'],
  java: ['java', 'jsp', 'jspx', 'wss', 'do', 'action'],
  csharp: ['csharp', 'cs', 'c#', 'csx'],
  php: ['php', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phtml'],
  ruby: ['rb', 'gemspec', 'podspec', 'thor', 'irb', 'jbuilder', 'rabl', 'ru', 'rake', 'watchr'],
  go: ['go'],
  json: ['json', 'json5', 'jsonc', 'jsonl', 'jsonnet', 'jsonp'],
  markdown: ['md', 'markdown', 'mkd', 'mkdn', 'mdwn', 'mdown', 'mkd'],
  sql: ['sql', 'mysql', 'pgsql', 'postgres', 'postgresql', 'plpgsql', 'plsql', 'psql', 'oracle', 'hql'],
  bash: ['bash', 'sh', 'shell', 'zsh', 'fish', 'csh', 'ksh', 'tcsh', 'dash'],
  yaml: ['yaml', 'yml'],
  dockerfile: ['dockerfile', 'docker-compose'],
  toml: ['toml'],
  ini: ['ini', 'cfg', 'prefs', 'pro', 'properties'],
  makefile: ['makefile', 'make', 'mk', 'mak'],
  diff: ['diff', 'patch'],
  rust: ['rs', 'rs.in'],
  kotlin: ['kt', 'kts', 'ktm', 'kts'],
  swift: ['swift'],
  dart: ['dart'],
  c: ['c', 'h'],
  cpp: ['cpp', 'c++', 'cc', 'cp', 'cxx', 'h', 'h++', 'hh', 'hpp', 'hxx', 'inc', 'inl', 'ino', 'ipp', 'tcc', 'tpp'],
  csharp: ['cs', 'csx'],
  objectivec: ['m', 'mm', 'objc', 'objc++', 'objective-c++', 'obj-c++', 'h'],
  objectivecpp: ['mm', 'objc++', 'objective-c++', 'obj-c++'],
  r: ['r', 'rdata', 'rds', 'rda'],
  scala: ['scala', 'sc', 'sbt'],
  haskell: ['hs', 'lhs'],
  lua: ['lua'],
  perl: ['pl', 'pm', 'pod', 't', 'PL', 'psgi', 'perl'],
  powershell: ['ps1', 'psd1', 'psm1', 'ps1xml', 'psc1', 'pssc'],
  r: ['r', 'rdata', 'rds', 'rda'],
  ruby: ['rb', 'rbx', 'rjs', 'gemspec', 'podspec', 'thor', 'irb', 'jbuilder', 'rabl', 'ru', 'rake', 'watchr'],
  sass: ['sass', 'scss'],
  sql: ['sql', 'ddl', 'dml', 'pgsql', 'plpgsql', 'plsql', 'psql', 'oracle', 'hql'],
  vim: ['vim'],
  wasm: ['wat', 'wast'],
  xml: ['xml', 'xsd', 'rng', 'rss', 'svg'],
  yaml: ['yaml', 'yml']
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
  if (loadedLanguages.has(language)) {
    return true;
  }

  // Verifica se a linguagem é suportada
  if (!Object.keys(SUPPORTED_LANGUAGES).includes(language) && 
      !Object.values(SUPPORTED_LANGUAGES).some(aliases => aliases.includes(language))) {
    console.warn(`Linguagem não suportada: ${language}`);
    return false;
  }

  try {
    // Tenta carregar o módulo da linguagem
    const langModule = await import(
      /* webpackChunkName: "syntax-[request]" */
      `highlight.js/lib/languages/${language}`
    );
    
    // Registra a linguagem no lowlight
    lowlight.registerLanguage(language, langModule.default);
    
    // Adiciona ao cache
    loadedLanguages.add(language);
    
    console.log(`Linguagem carregada com sucesso: ${language}`);
    return true;
  } catch (error) {
    console.warn(`Falha ao carregar suporte para ${language}:`, error);
    // Remove do cache em caso de falha para permitir novas tentativas
    loadedLanguages.delete(language);
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

// Carrega as linguagens mais comuns por padrão de forma otimizada
const DEFAULT_LANGUAGES = ['javascript', 'html', 'css', 'json', 'bash', 'python', 'java', 'csharp', 'php', 'ruby', 'go'];

// Carrega as linguagens padrão de forma não-bloqueante
const loadDefaultLanguages = async () => {
  try {
    await Promise.allSettled(
      DEFAULT_LANGUAGES.map(lang => 
        loadLanguage(lang).catch(err => 
          console.warn(`Falha ao carregar linguagem padrão ${lang}:`, err)
        )
      )
    );
  } catch (error) {
    console.error('Erro ao carregar linguagens padrão:', error);
  }
};

// Inicia o carregamento das linguagens padrão
loadDefaultLanguages();

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