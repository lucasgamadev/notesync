/**
 * Serviço de cache para o NoteSync
 * Implementa um sistema de cache em memória para otimizar o desempenho
 */

const loggerService = require('./loggerService');

// Cache em memória
const memoryCache = new Map();

// Configurações padrão
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hora em milissegundos

/**
 * Serviço de cache para otimização de desempenho
 */
const cacheService = {
  /**
   * Armazena um valor no cache
   * @param {string} key - Chave única para o item
   * @param {any} value - Valor a ser armazenado
   * @param {Object} options - Opções de configuração
   * @param {number} [options.ttl] - Tempo de vida em milissegundos
   * @param {string} [options.namespace] - Namespace para agrupar itens relacionados
   */
  set: (key, value, options = {}) => {
    const { ttl = DEFAULT_TTL, namespace = 'default' } = options;
    
    // Cria a chave composta com namespace
    const composedKey = `${namespace}:${key}`;
    
    // Calcula o tempo de expiração
    const expiresAt = Date.now() + ttl;
    
    // Armazena o valor com metadados
    memoryCache.set(composedKey, {
      value,
      expiresAt,
      createdAt: Date.now(),
      namespace
    });
    
    loggerService.debug(`Cache: item armazenado [${composedKey}]`, { ttl });
    
    return value;
  },
  
  /**
   * Recupera um valor do cache
   * @param {string} key - Chave do item
   * @param {Object} options - Opções de configuração
   * @param {string} [options.namespace] - Namespace do item
   * @returns {any|null} Valor armazenado ou null se não encontrado/expirado
   */
  get: (key, options = {}) => {
    const { namespace = 'default' } = options;
    const composedKey = `${namespace}:${key}`;
    
    // Verifica se o item existe no cache
    if (!memoryCache.has(composedKey)) {
      loggerService.debug(`Cache: miss [${composedKey}]`);
      return null;
    }
    
    // Recupera o item
    const cachedItem = memoryCache.get(composedKey);
    
    // Verifica se o item expirou
    if (cachedItem.expiresAt < Date.now()) {
      // Remove o item expirado
      memoryCache.delete(composedKey);
      loggerService.debug(`Cache: expirado [${composedKey}]`);
      return null;
    }
    
    loggerService.debug(`Cache: hit [${composedKey}]`);
    return cachedItem.value;
  },
  
  /**
   * Remove um item específico do cache
   * @param {string} key - Chave do item
   * @param {Object} options - Opções de configuração
   * @param {string} [options.namespace] - Namespace do item
   * @returns {boolean} True se o item foi removido, false caso contrário
   */
  delete: (key, options = {}) => {
    const { namespace = 'default' } = options;
    const composedKey = `${namespace}:${key}`;
    
    const result = memoryCache.delete(composedKey);
    
    if (result) {
      loggerService.debug(`Cache: item removido [${composedKey}]`);
    }
    
    return result;
  },
  
  /**
   * Limpa todos os itens de um namespace específico
   * @param {string} namespace - Namespace a ser limpo
   * @returns {number} Número de itens removidos
   */
  clearNamespace: (namespace) => {
    let count = 0;
    
    // Itera sobre todos os itens do cache
    for (const [key, item] of memoryCache.entries()) {
      if (item.namespace === namespace) {
        memoryCache.delete(key);
        count++;
      }
    }
    
    loggerService.debug(`Cache: namespace limpo [${namespace}]`, { itemsRemoved: count });
    return count;
  },
  
  /**
   * Limpa todo o cache
   * @returns {number} Número de itens removidos
   */
  clear: () => {
    const count = memoryCache.size;
    memoryCache.clear();
    loggerService.debug(`Cache: limpo completamente`, { itemsRemoved: count });
    return count;
  },
  
  /**
   * Limpa itens expirados do cache
   * @returns {number} Número de itens expirados removidos
   */
  purgeExpired: () => {
    const now = Date.now();
    let count = 0;
    
    // Itera sobre todos os itens do cache
    for (const [key, item] of memoryCache.entries()) {
      if (item.expiresAt < now) {
        memoryCache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      loggerService.debug(`Cache: itens expirados removidos`, { count });
    }
    
    return count;
  },
  
  /**
   * Retorna estatísticas do cache
   * @returns {Object} Estatísticas do cache
   */
  getStats: () => {
    const stats = {
      totalItems: memoryCache.size,
      namespaces: {},
      expiredItems: 0
    };
    
    const now = Date.now();
    
    // Coleta estatísticas por namespace
    for (const [key, item] of memoryCache.entries()) {
      // Conta itens por namespace
      if (!stats.namespaces[item.namespace]) {
        stats.namespaces[item.namespace] = 0;
      }
      stats.namespaces[item.namespace]++;
      
      // Conta itens expirados
      if (item.expiresAt < now) {
        stats.expiredItems++;
      }
    }
    
    return stats;
  }
};

// Configura limpeza periódica de itens expirados (a cada 5 minutos)
setInterval(() => {
  cacheService.purgeExpired();
}, 5 * 60 * 1000);

module.exports = cacheService;