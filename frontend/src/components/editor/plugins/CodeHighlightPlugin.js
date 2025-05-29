/**
 * @file Plugin de destaque de sintaxe para blocos de código no editor
 * @module CodeHighlightPlugin
 * @description Plugin para o editor TipTap que adiciona suporte a blocos de código com destaque de sintaxe para várias linguagens de programação.
 * Utiliza a biblioteca lowlight para destacar o código e carrega as linguagens dinamicamente para melhor desempenho.
 * 
 * @author Lucas Gama
 * @version 1.0.0
 */

import { Extension } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { FaCode } from 'react-icons/fa';
import './styles/code-highlight.css';

// Linguagens suportadas e seus aliases
const SUPPORTED_LANGUAGES = Object.freeze({
  javascript: ['js', 'jsx', 'mjs', 'cjs'],
  typescript: ['ts', 'tsx', 'mts', 'cts'],
  xml: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist', 'svg', 'rng'],
  css: ['css', 'scss', 'sass', 'less', 'stylus'],
  python: ['py', 'py3', 'python3', 'pyi', 'pyw', 'pyc', 'pyd', 'pyo', 'pyz'],
  java: ['java', 'jsp', 'jspx', 'wss', 'do', 'action'],
  csharp: ['csharp', 'cs', 'c#', 'csx'],
  php: ['php', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phtml'],
  ruby: [
    'rb', 'rbx', 'rjs', 'gemspec', 'podspec', 'thor', 'irb', 
    'jbuilder', 'rabl', 'ru', 'rake', 'watchr'
  ],
  go: ['go'],
  json: ['json', 'json5', 'jsonc', 'jsonl', 'jsonnet', 'jsonp'],
  markdown: ['md', 'markdown', 'mkd', 'mkdn', 'mdwn', 'mdown'],
  sql: [
    'sql', 'mysql', 'pgsql', 'postgres', 'postgresql', 
    'plpgsql', 'plsql', 'psql', 'oracle', 'hql', 'ddl', 'dml'
  ],
  bash: ['bash', 'sh', 'shell', 'zsh', 'fish', 'csh', 'ksh', 'tcsh', 'dash'],
  yaml: ['yaml', 'yml'],
  dockerfile: ['dockerfile', 'docker-compose'],
  toml: ['toml'],
  ini: ['ini', 'cfg', 'prefs', 'pro', 'properties'],
  makefile: ['makefile', 'make', 'mk', 'mak'],
  diff: ['diff', 'patch'],
  rust: ['rs', 'rs.in'],
  kotlin: ['kt', 'kts', 'ktm'],
  swift: ['swift'],
  dart: ['dart'],
  c: ['c', 'h'],
  cpp: ['cpp', 'c++', 'cc', 'cp', 'cxx', 'h', 'h++', 'hh', 'hpp', 'hxx', 'inc', 'inl', 'ino', 'ipp', 'tcc', 'tpp'],
  objectivec: ['m', 'mm', 'objc', 'objc++', 'objective-c++', 'obj-c++', 'h'],
  objectivecpp: ['mm', 'objc++', 'objective-c++', 'obj-c++'],
  r: ['r', 'rdata', 'rds', 'rda'],
  scala: ['scala', 'sc', 'sbt'],
  haskell: ['hs', 'lhs'],
  lua: ['lua'],
  perl: ['pl', 'pm', 'pod', 't', 'PL', 'psgi', 'perl'],
  powershell: ['ps1', 'psd1', 'psm1', 'ps1xml', 'psc1', 'pssc'],
  sass: ['sass', 'scss'],
  vim: ['vim'],
  wasm: ['wat', 'wast']
});

// Cache para linguagens já carregadas e em processo de carregamento
const languageState = {
  loaded: new Set(),
  loading: new Set(),
  failed: new Map() // Usando Map para armazenar o timestamp da falha
};

// Mapa para armazenar os callbacks de linguagens em carregamento
const languageLoadingCallbacks = new Map();

// Mapa de aliases para nomes canônicos (otimização para busca)
const languageAliasMap = (() => {
  const map = new Map();
  
  for (const [lang, aliases] of Object.entries(SUPPORTED_LANGUAGES)) {
    // Adiciona o próprio nome da linguagem
    map.set(lang, lang);
    
    // Adiciona todos os aliases
    for (const alias of aliases) {
      map.set(alias, lang);
    }
  }
  
  return map;
})();

/**
 * Carrega dinamicamente uma linguagem de destaque de sintaxe
 * @param {string} language - Nome da linguagem a ser carregada
 * @returns {Promise<boolean>} - True se o carregamento for bem-sucedido
 */
const loadLanguage = async (language) => {
  // Verificação de parâmetro vazio
  if (!language || typeof language !== 'string') {
    console.warn('Nome da linguagem não fornecido ou inválido');
    return false;
  }

  const normalizedLang = language.toLowerCase();
  
  // Verifica se a linguagem já foi carregada
  if (languageState.loaded.has(normalizedLang)) {
    return true;
  }
  
  // Verifica se a linguagem está em cooldown após falha
  if (languageState.failed.has(normalizedLang)) {
    const failedTime = languageState.failed.get(normalizedLang);
    if (Date.now() - failedTime < 30000) { // 30 segundos de cooldown
      console.warn(`Tentativa de recarregar linguagem ${normalizedLang} muito rápida após falha`);
      return false;
    }
    languageState.failed.delete(normalizedLang);
  }
  
  // Se já está carregando, retorna a promessa existente
  if (languageState.loading.has(normalizedLang)) {
    return new Promise((resolve) => {
      const callbacks = languageLoadingCallbacks.get(normalizedLang) || [];
      callbacks.push(resolve);
      languageLoadingCallbacks.set(normalizedLang, callbacks);
    });
  }
  
  // Marca como carregando
  languageState.loading.add(normalizedLang);
  
  try {
    // Obtém o nome canônico da linguagem (usado para referência futura)
    const canonicalLang = getCanonicalLanguage(normalizedLang);
    
    // Se a linguagem não for suportada, registra um aviso
    if (!languageAliasMap.has(normalizedLang) && normalizedLang !== canonicalLang) {
      console.warn(`Linguagem não mapeada: ${normalizedLang} (tratada como ${canonicalLang})`);
    }
    // Tenta carregar o módulo da linguagem
    const langModule = await import(
      /* webpackChunkName: "syntax-[request]" */
      `highlight.js/lib/languages/${normalizedLang}`
    );
    
    // Registra a linguagem no lowlight
    lowlight.registerLanguage(normalizedLang, langModule.default);
    
    // Atualiza o estado
    languageState.loaded.add(normalizedLang);
    languageState.loading.delete(normalizedLang);
    
    // Executa todos os callbacks pendentes
    const callbacks = languageLoadingCallbacks.get(normalizedLang) || [];
    callbacks.forEach(cb => cb(true));
    languageLoadingCallbacks.delete(normalizedLang);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Linguagem carregada: ${normalizedLang}`);
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`Falha ao carregar suporte para ${normalizedLang}:`, errorMessage);
    
    // Atualiza o estado
    languageState.loading.delete(normalizedLang);
    languageState.failed.set(normalizedLang, Date.now());
    
    // Rejeita todos os callbacks pendentes
    const callbacks = languageLoadingCallbacks.get(normalizedLang) || [];
    callbacks.forEach(cb => cb(false));
    languageLoadingCallbacks.delete(normalizedLang);
    
    return false;
  } finally {
    // Garante que a linguagem seja removida do estado de carregamento
    languageState.loading.delete(normalizedLang);
  }
};

/**
 * Obtém o nome canônico da linguagem a partir de um alias
 * @param {string} alias - Alias da linguagem
 * @returns {string} - Nome canônico da linguagem ou o próprio alias se não encontrado
 */
const getCanonicalLanguage = (alias) => {
  if (!alias || typeof alias !== 'string') {
    return 'plaintext';
  }
  
  const lowerAlias = alias.toLowerCase();
  // Se não encontrar, retorna 'plaintext' como fallback
  return languageAliasMap.get(lowerAlias) || 'plaintext';
};

// Carrega as linguagens mais comuns por padrão de forma otimizada
const DEFAULT_LANGUAGES = ['javascript', 'html', 'css', 'json', 'bash', 'python', 'java', 'csharp', 'php', 'ruby', 'go'];

// Atualiza a função loadLanguage existente para melhor tratamento de erros
const originalLoadLanguage = loadLanguage;
loadLanguage = async (language) => {
  if (!language || typeof language !== 'string') {
    console.warn('Nome da linguagem não fornecido ou inválido');
    return false;
  }

  const normalizedLang = getCanonicalLanguage(language);
  
  // Se já está carregada
  if (languageState.loaded.has(normalizedLang)) {
    return true;
  }
  
  // Se já está em processo de carregamento
  if (languageState.loading.has(normalizedLang)) {
    return new Promise((resolve) => {
      const checkLoaded = () => {
        if (languageState.loaded.has(normalizedLang)) {
          resolve(true);
        } else if (!languageState.loading.has(normalizedLang)) {
          resolve(false);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  }

  // Verifica se houve falha recente (dentro de 5 minutos)
  const lastFailure = languageState.failed.get(normalizedLang);
  if (lastFailure && (Date.now() - lastFailure) < 300000) {
    return false;
  }

  // Marca como carregando
  languageState.loading.add(normalizedLang);

  try {
    // Tenta carregar usando a implementação original primeiro
    const originalLoaded = await originalLoadLanguage(language);
    if (originalLoaded) {
      languageState.loaded.add(normalizedLang);
      languageState.failed.delete(normalizedLang);
      return true;
    }
    
    // Se a implementação original falhar, tenta carregar diretamente
    const langModule = await import(
      /* webpackChunkName: "syntax-[request]" */
      `highlight.js/lib/languages/${normalizedLang}`
    );
    
    // Registra a linguagem no lowlight
    if (langModule && langModule.default) {
      lowlight.register({ [normalizedLang]: langModule.default });
      languageState.loaded.add(normalizedLang);
      languageState.failed.delete(normalizedLang);
      return true;
    }
    
    throw new Error('Módulo de linguagem inválido');
  } catch (error) {
    const errorMessage = `Erro ao carregar a linguagem ${normalizedLang}: ${error.message || 'Erro desconhecido'}`;
    console.error(errorMessage, error);
    languageState.failed.set(normalizedLang, Date.now());
    
    // Log adicional para erros de rede
    if (error.message && error.message.includes('Failed to fetch')) {
      console.error('Erro de rede ao carregar a linguagem. Verifique sua conexão com a internet.');
    }
    
    return false;
  } finally {
    try {
      languageState.loading.delete(normalizedLang);
    } catch (cleanupError) {
      console.error('Erro ao limpar estado de carregamento:', cleanupError);
    }
  }
};

/**
 * Carrega as linguagens padrão de forma assíncrona
 * @returns {Promise<void>}
 */
const loadDefaultLanguages = async () => {
  try {
    console.log('Iniciando carregamento de linguagens padrão:', DEFAULT_LANGUAGES.join(', '));
    
    const results = await Promise.allSettled(
      DEFAULT_LANGUAGES.map(lang => 
        loadLanguage(lang).then(
          success => ({
            lang,
            success,
            error: null
          }),
          error => ({
            lang,
            success: false,
            error: error?.message || 'Erro desconhecido'
          })
        )
      )
    );
    
    // Log de resumo do carregamento
    const loaded = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - loaded;
    
    console.log(`Carregamento concluído: ${loaded} linguagens carregadas, ${failed} falhas`);
    
    // Log detalhado de falhas
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.success) {
        const lang = DEFAULT_LANGUAGES[index];
        console.warn(`Falha ao carregar linguagem ${lang}:`, result.value.error);
      }
    });
    
  } catch (error) {
    console.error('Erro inesperado ao carregar linguagens padrão:', error);
  } finally {
    console.log('Finalizado o carregamento de linguagens padrão');
  }
};

// Inicia o carregamento das linguagens padrão
loadDefaultLanguages();

// Cria uma instância de lowlight com suporte comum
const lowlight = createLowlight(common);

// Extensão para blocos de código com syntax highlighting
const CodeBlockExtension = CodeBlockLowlight.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight,
      defaultLanguage: 'javascript',
    };
  },
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
    // Retorna 'text' como padrão se não houver linguagem definida
    if (!language) return 'text';
    
    const normalizedLang = getCanonicalLanguage(language);
    
    // Se a linguagem não estiver carregada e for suportada, tenta carregar
    if (SUPPORTED_LANGUAGES[normalizedLang] && !languageState.loaded.has(normalizedLang)) {
      // Carrega em segundo plano sem bloquear
      loadLanguage(normalizedLang).catch(error => {
        console.error(`Erro ao carregar linguagem ${normalizedLang}:`, error);
      });
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
    if (languageState.loaded.has(normalizedLang)) {
      return Promise.resolve(true);
    }
    
    if (!SUPPORTED_LANGUAGES[normalizedLang]) {
      return Promise.resolve(false);
    }
    
    try {
      return await loadLanguage(normalizedLang);
    } catch (error) {
      console.error(`Erro ao carregar linguagem ${normalizedLang}:`, error);
      return false;
    }
  },
  
  // Verifica o estado de carregamento de uma linguagem
  getLanguageState: (language) => {
    const normalizedLang = getCanonicalLanguage(language);
    return {
      isLoaded: languageState.loaded.has(normalizedLang),
      isLoading: languageState.loading.has(normalizedLang),
      hasFailed: languageState.failed.has(normalizedLang)
    };
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
        
        // Se a linguagem não estiver carregada, tenta carregar
        if (SUPPORTED_LANGUAGES[validLanguage] && !languageState.loaded.has(validLanguage)) {
          try {
            // Tenta carregar a linguagem
            const loaded = await loadLanguage(validLanguage);
            
            if (loaded) {
              // Força a atualização do editor para aplicar o destaque
              const { from } = editor.state.selection;
              editor.view.dispatch(editor.view.state.tr.setSelection(
                editor.state.selection.constructor.near(editor.state.doc.resolve(from))
              ));
            } else {
              console.warn(`Não foi possível carregar o suporte para ${validLanguage}`);
            }
          } catch (error) {
            console.error(`Erro ao processar a linguagem ${validLanguage}:`, error);
          }
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
    if (!editor || !editor.view || !editor.view.dom) {
      console.error('Editor inválido ou não inicializado corretamente');
      return () => {};
    }
    // Função para processar blocos de código no editor
    const processCodeBlocks = () => {
      if (!editor.isEditable) return;
      
      const codeBlocks = editor.view.dom.querySelectorAll('pre[data-language]');
      
      codeBlocks.forEach(block => {
        const language = block.getAttribute('data-language');
        if (language && SUPPORTED_LANGUAGES[language] && !languageState.loaded.has(language)) {
          loadLanguage(language).then(success => {
            if (success) {
              // Força a atualização do destaque de sintaxe
              const content = block.textContent;
              block.textContent = content + ' '; // Adiciona e remove espaço para forçar atualização
              block.textContent = content;
            }
          });
        }
      });
    };
    
    // Adiciona manipulador para atualizar a linguagem quando o conteúdo mudar
    const updateHandler = () => {
      requestAnimationFrame(processCodeBlocks);
    };
    
    editor.on('update', updateHandler);
    
    // Processa os blocos iniciais
    updateHandler();
    
    // Função de limpeza
    return () => {
      if (editor && editor.off) {
        editor.off('update', updateHandler);
      }
    };
  },
};

export default codeHighlightPlugin;