const { sanitizeParam, sanitizeBody } = require('express-validator');

// Middleware de sanitização para parâmetros comuns
const sanitizeCommonFields = [
  // Sanitiza campos de texto
  sanitizeBody('title').trim().escape(),
  sanitizeBody('content').trim(),
  sanitizeBody('description').trim().escape(),
  sanitizeBody('name').trim().escape(),
  
  // Sanitiza campos de email
  sanitizeBody('email').trim().normalizeEmail(),
  
  // Sanitiza IDs e slugs
  sanitizeParam('id').trim().escape(),
  sanitizeParam('slug').trim().escape(),
  
  // Remove caracteres especiais de tags
  sanitizeBody('tags.*').trim().escape(),
  
  // Sanitiza URLs
  sanitizeBody('url').trim().escape(),
];

// Middleware de sanitização para notas
const sanitizeNote = [
  ...sanitizeCommonFields,
  sanitizeBody('content').customSanitizer(value => {
    // Permite tags HTML básicas seguras para o editor
    return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }),
];

// Middleware de sanitização para autenticação
const sanitizeAuth = [
  sanitizeBody('email').trim().normalizeEmail(),
  sanitizeBody('password').trim(),
  sanitizeBody('name').trim().escape(),
];

module.exports = {
  sanitizeCommonFields,
  sanitizeNote,
  sanitizeAuth
};