/**
 * Serviço de logging para o NoteSync
 * Implementa um sistema de logging centralizado usando Winston
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Garantir que o diretório de logs exista
const logDir = path.join(__dirname, '../../logs');
fs.ensureDirSync(logDir);

// Configuração de formatos
const { combine, timestamp, printf, colorize, json } = winston.format;

// Formato personalizado para logs de console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${timestamp} [${level}]: ${message} ${metaString}`;
});

// Criação do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'notesync-backend' },
  transports: [
    // Logs de erro em arquivo separado
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Todos os logs em arquivo
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Adicionar transporte de console em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp(),
      consoleFormat
    ),
  }));
}

// Métodos de logging
const loggerService = {
  /**
   * Registra uma mensagem de erro
   * @param {string} message - Mensagem de erro
   * @param {Object} [metadata] - Metadados adicionais
   */
  error: (message, metadata = {}) => {
    logger.error(message, metadata);
  },

  /**
   * Registra uma mensagem de aviso
   * @param {string} message - Mensagem de aviso
   * @param {Object} [metadata] - Metadados adicionais
   */
  warn: (message, metadata = {}) => {
    logger.warn(message, metadata);
  },

  /**
   * Registra uma mensagem informativa
   * @param {string} message - Mensagem informativa
   * @param {Object} [metadata] - Metadados adicionais
   */
  info: (message, metadata = {}) => {
    logger.info(message, metadata);
  },

  /**
   * Registra uma mensagem de depuração
   * @param {string} message - Mensagem de depuração
   * @param {Object} [metadata] - Metadados adicionais
   */
  debug: (message, metadata = {}) => {
    logger.debug(message, metadata);
  },

  /**
   * Registra uma requisição HTTP
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {number} time - Tempo de processamento em ms
   */
  httpRequest: (req, res, time) => {
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: time,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });
  },

  /**
   * Registra uma operação de sincronização
   * @param {string} userId - ID do usuário
   * @param {string} operation - Tipo de operação
   * @param {Object} details - Detalhes da operação
   */
  syncOperation: (userId, operation, details = {}) => {
    logger.info(`Sync operation: ${operation}`, {
      userId,
      operation,
      ...details,
    });
  },

  /**
   * Registra um erro de sincronização
   * @param {string} userId - ID do usuário
   * @param {string} operation - Tipo de operação
   * @param {Error} error - Objeto de erro
   */
  syncError: (userId, operation, error) => {
    logger.error(`Sync error: ${operation}`, {
      userId,
      operation,
      error: error.message,
      stack: error.stack,
    });
  },
};

module.exports = loggerService;