/**
 * Registro central de plugins para o editor
 * Este arquivo exporta todos os plugins disponíveis para uso no editor
 */

import diagramPlugin from './DiagramPlugin';
import codeHighlightPlugin from './CodeHighlightPlugin';
import tableEnhancedPlugin from './TableEnhancedPlugin';
import historyEnhancedPlugin from './HistoryEnhancedPlugin';

// Exporta todos os plugins disponíveis
const availablePlugins = {
  diagram: diagramPlugin,
  codeHighlight: codeHighlightPlugin,
  tableEnhanced: tableEnhancedPlugin,
  historyEnhanced: historyEnhancedPlugin,
};

/**
 * Função para registrar todos os plugins no sistema de plugins
 * @param {Object} pluginSystem - Sistema de plugins do editor
 */
export const registerAllPlugins = (pluginSystem) => {
  Object.values(availablePlugins).forEach(plugin => {
    pluginSystem.registerPlugin(plugin.id, plugin);
  });
};

/**
 * Função para obter um plugin específico pelo ID
 * @param {string} id - ID do plugin
 * @returns {Object} - Plugin correspondente ou undefined
 */
export const getPluginById = (id) => {
  return availablePlugins[id];
};

/**
 * Função para obter todos os plugins disponíveis
 * @returns {Object} - Mapa de todos os plugins disponíveis
 */
export const getAllPlugins = () => {
  return availablePlugins;
};

export default availablePlugins;