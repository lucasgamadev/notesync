/**
 * Exemplo de controlador com uso de cache e logging
 * Este arquivo demonstra como utilizar os serviços de cache e logging implementados
 */

const loggerService = require("../services/loggerService");
const cacheService = require("../services/cacheService");
const cacheMiddleware = require("../middleware/cacheMiddleware");

/**
 * Exemplo de controlador que utiliza cache e logging
 */
const exampleCacheController = {
  /**
   * Middleware de cache para rotas específicas
   * Pode ser aplicado em rotas no arquivo de rotas
   */
  cacheMiddleware: cacheMiddleware({
    ttl: 10 * 60 * 1000, // 10 minutos
    namespace: "example"
  }),
  
  /**
   * Exemplo de método que utiliza o serviço de cache diretamente
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  getDataWithCache: async (req, res) => {
    try {
      const userId = req.user.id;
      const cacheKey = `user_data_${userId}`;
      
      // Tenta obter dados do cache primeiro
      let userData = cacheService.get(cacheKey, { namespace: "users" });
      
      if (!userData) {
        loggerService.info(`Cache miss para dados do usuário ${userId}`);
        
        // Simulação de busca de dados (em um caso real, seria uma consulta ao banco)
        userData = {
          id: userId,
          lastAccess: new Date().toISOString(),
          preferences: { theme: "dark", language: "pt-BR" }
        };
        
        // Armazena no cache para futuras requisições
        cacheService.set(cacheKey, userData, {
          namespace: "users",
          ttl: 30 * 60 * 1000 // 30 minutos
        });
        
        loggerService.info(`Dados do usuário ${userId} armazenados em cache`);
      } else {
        loggerService.info(`Cache hit para dados do usuário ${userId}`);
      }
      
      return res.json(userData);
    } catch (error) {
      loggerService.error("Erro ao obter dados do usuário", {
        error: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({
        message: "Erro ao processar requisição",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  },
  
  /**
   * Exemplo de método que invalida o cache
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  invalidateCache: (req, res) => {
    try {
      const userId = req.user.id;
      const cacheKey = `user_data_${userId}`;
      
      // Remove item específico do cache
      const removed = cacheService.delete(cacheKey, { namespace: "users" });
      
      loggerService.info(`Cache invalidado para usuário ${userId}`, { success: removed });
      
      return res.json({
        message: removed ? "Cache invalidado com sucesso" : "Item não encontrado no cache"
      });
    } catch (error) {
      loggerService.error("Erro ao invalidar cache", {
        error: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({
        message: "Erro ao processar requisição",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  },
  
  /**
   * Exemplo de método que retorna estatísticas do cache
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  getCacheStats: (req, res) => {
    try {
      // Obtém estatísticas do cache
      const stats = cacheService.getStats();
      
      loggerService.info("Estatísticas de cache solicitadas", { stats });
      
      return res.json(stats);
    } catch (error) {
      loggerService.error("Erro ao obter estatísticas de cache", {
        error: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({
        message: "Erro ao processar requisição",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
};

module.exports = exampleCacheController;