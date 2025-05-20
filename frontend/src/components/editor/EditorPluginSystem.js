/**
 * Sistema de plugins para o editor TipTap
 * Este módulo fornece uma API para registrar, gerenciar e utilizar plugins personalizados no editor
 */

/**
 * Classe que gerencia o sistema de plugins do editor
 */
class EditorPluginSystem {
  constructor() {
    this.plugins = {};
    this.macros = {};
    this.hooks = {
      beforeCreate: [],
      created: [],
      beforeUpdate: [],
      updated: [],
      beforeDestroy: [],
      destroyed: []
    };
  }

  /**
   * Registra um novo plugin no sistema
   * @param {string} name - Nome único do plugin
   * @param {Object} plugin - Configuração do plugin
   * @param {Function} plugin.setup - Função de inicialização do plugin
   * @param {Object} plugin.commands - Comandos fornecidos pelo plugin
   * @param {Object} plugin.buttons - Botões para a barra de ferramentas
   * @param {Array} plugin.extensions - Extensões TipTap fornecidas pelo plugin
   * @returns {boolean} - Sucesso do registro
   */
  registerPlugin(name, plugin) {
    if (this.plugins[name]) {
      console.warn(`Plugin '${name}' já está registrado. Use updatePlugin para atualizá-lo.`);
      return false;
    }

    this.plugins[name] = {
      ...plugin,
      enabled: true,
      id: name
    };

    return true;
  }

  /**
   * Atualiza um plugin existente
   * @param {string} name - Nome do plugin
   * @param {Object} updates - Atualizações para o plugin
   * @returns {boolean} - Sucesso da atualização
   */
  updatePlugin(name, updates) {
    if (!this.plugins[name]) {
      console.warn(`Plugin '${name}' não encontrado.`);
      return false;
    }

    this.plugins[name] = {
      ...this.plugins[name],
      ...updates
    };

    return true;
  }

  /**
   * Remove um plugin do sistema
   * @param {string} name - Nome do plugin
   * @returns {boolean} - Sucesso da remoção
   */
  unregisterPlugin(name) {
    if (!this.plugins[name]) {
      return false;
    }

    delete this.plugins[name];
    return true;
  }

  /**
   * Ativa ou desativa um plugin
   * @param {string} name - Nome do plugin
   * @param {boolean} enabled - Estado de ativação
   * @returns {boolean} - Sucesso da operação
   */
  togglePlugin(name, enabled) {
    if (!this.plugins[name]) {
      return false;
    }

    this.plugins[name].enabled = enabled !== undefined ? enabled : !this.plugins[name].enabled;
    return true;
  }

  /**
   * Registra uma nova macro (sequência de comandos)
   * @param {string} name - Nome da macro
   * @param {Object} macro - Configuração da macro
   * @param {Array} macro.commands - Lista de comandos a serem executados
   * @param {string} macro.description - Descrição da macro
   * @param {string} macro.shortcut - Atalho de teclado (opcional)
   * @returns {boolean} - Sucesso do registro
   */
  registerMacro(name, macro) {
    if (this.macros[name]) {
      console.warn(`Macro '${name}' já está registrada.`);
      return false;
    }

    this.macros[name] = {
      ...macro,
      id: name
    };

    return true;
  }

  /**
   * Remove uma macro do sistema
   * @param {string} name - Nome da macro
   * @returns {boolean} - Sucesso da remoção
   */
  unregisterMacro(name) {
    if (!this.macros[name]) {
      return false;
    }

    delete this.macros[name];
    return true;
  }

  /**
   * Executa uma macro no editor
   * @param {string} name - Nome da macro
   * @param {Object} editor - Instância do editor TipTap
   * @returns {boolean} - Sucesso da execução
   */
  executeMacro(name, editor) {
    if (!this.macros[name] || !editor) {
      return false;
    }

    const macro = this.macros[name];
    
    try {
      macro.commands.forEach(command => {
        if (typeof command === 'function') {
          command(editor);
        } else if (typeof command === 'object') {
          const { name, args } = command;
          if (editor.commands[name]) {
            editor.chain().focus()[name](...(args || [])).run();
          }
        }
      });
      return true;
    } catch (error) {
      console.error(`Erro ao executar macro '${name}':`, error);
      return false;
    }
  }

  /**
   * Adiciona um callback a um hook específico
   * @param {string} hookName - Nome do hook
   * @param {Function} callback - Função de callback
   * @returns {Function} - Função para remover o hook
   */
  addHook(hookName, callback) {
    if (!this.hooks[hookName]) {
      console.warn(`Hook '${hookName}' não existe.`);
      return () => {};
    }

    this.hooks[hookName].push(callback);
    
    // Retorna uma função para remover o hook
    return () => {
      this.hooks[hookName] = this.hooks[hookName].filter(cb => cb !== callback);
    };
  }

  /**
   * Executa todos os callbacks registrados para um hook específico
   * @param {string} hookName - Nome do hook
   * @param {...any} args - Argumentos para passar para os callbacks
   */
  runHook(hookName, ...args) {
    if (!this.hooks[hookName]) {
      return;
    }

    this.hooks[hookName].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Erro ao executar hook '${hookName}':`, error);
      }
    });
  }

  /**
   * Obtém todos os plugins ativos
   * @returns {Array} - Lista de plugins ativos
   */
  getActivePlugins() {
    return Object.values(this.plugins).filter(plugin => plugin.enabled);
  }

  /**
   * Obtém todas as extensões TipTap dos plugins ativos
   * @returns {Array} - Lista de extensões
   */
  getExtensions() {
    return this.getActivePlugins()
      .filter(plugin => plugin.extensions && plugin.extensions.length)
      .flatMap(plugin => plugin.extensions);
  }

  /**
   * Obtém todos os botões da barra de ferramentas dos plugins ativos
   * @returns {Array} - Lista de botões
   */
  getToolbarButtons() {
    return this.getActivePlugins()
      .filter(plugin => plugin.buttons && plugin.buttons.length)
      .flatMap(plugin => plugin.buttons.map(button => ({
        ...button,
        pluginId: plugin.id
      })));
  }

  /**
   * Obtém todas as macros registradas
   * @returns {Object} - Mapa de macros
   */
  getMacros() {
    return this.macros;
  }
}

// Exporta uma instância única do sistema de plugins
const pluginSystem = new EditorPluginSystem();
export default pluginSystem;