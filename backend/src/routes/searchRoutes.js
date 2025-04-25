const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const searchController = require("../controllers/searchController");

/**
 * Rotas para funcionalidade de pesquisa
 * Implementa full-text search com filtros avançados
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Realizar pesquisa avançada
router.get("/", searchController.search);

// Obter sugestões de pesquisa
router.get("/suggestions", searchController.getSuggestions);

module.exports = router;
