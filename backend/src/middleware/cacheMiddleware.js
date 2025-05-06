/**
 * Middleware de cache HTTP para o NoteSync
 * Implementa cache de respostas HTTP para melhorar o desempenho
 */

const cacheService = require('../services/cacheService');
const loggerService = require('../services/loggerService');

/**
 * Middleware para cache de respostas HTTP
 * @param {Object} options - Opções de configuração do cache
 * @param {number} [options.ttl] - Tempo de vida do cache em milissegundos
 * @param {string} [options.namespace] - Namespace para o cache
 * @param {Function} [options.keyGenerator] - Função para gerar a chave de cache
 * @returns {Function} Middleware Express
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    namespace = 'http',
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`
  } = options;

  return (req, res, next) => {
    // Ignora requisições não-GET por padrão
    if (req.method !== 'GET' && !options.cacheNonGetRequests) {
      return next();
    }

    // Gera a chave de cache
    const cacheKey = keyGenerator(req);

    // Tenta obter do cache
    const cachedResponse = cacheService.get(cacheKey, { namespace });

    if (cachedResponse) {
      // Registra o hit de cache
      loggerService.debug(`Cache HTTP: hit [${cacheKey}]`);

      // Restaura os headers da resposta em cache
      if (cachedResponse.headers) {
        for (const [key, value] of Object.entries(cachedResponse.headers)) {
          res.setHeader(key, value);
        }
      }

      // Adiciona header indicando que é uma resposta em cache
      res.setHeader('X-Cache', 'HIT');

      // Retorna a resposta em cache
      return res.status(cachedResponse.status).send(cachedResponse.data);
    }

    // Registra o miss de cache
    loggerService.debug(`Cache HTTP: miss [${cacheKey}]`);

    // Intercepta o método send para armazenar a resposta no cache
    const originalSend = res.send;
    res.send = function (body) {
      // Não armazena respostas de erro no cache
      if (res.statusCode >= 400) {
        return originalSend.apply(res, arguments);
      }

      // Armazena a resposta no cache
      const responseToCache = {
        data: body,
        status: res.statusCode,
        headers: res.getHeaders()
      };

      cacheService.set(cacheKey, responseToCache, { ttl, namespace });

      // Adiciona header indicando que é uma resposta não em cache
      res.setHeader('X-Cache', 'MISS');

      // Continua com o envio normal da resposta
      return originalSend.apply(res, arguments);
    };

    next();
  };
};

module.exports = cacheMiddleware;