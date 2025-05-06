/**
 * Middleware de logging para o NoteSync
 * Registra informações sobre requisições HTTP e tempo de resposta
 */
const loggerService = require("../services/loggerService");

/**
 * Middleware para registrar requisições HTTP
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (...args) {
    const responseTime = Date.now() - start;
    loggerService.httpRequest(req, res, responseTime);
    return originalSend.apply(res, args);
  };
  loggerService.info(`Requisição iniciada: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress
  });
  next();
};

module.exports = loggingMiddleware;
