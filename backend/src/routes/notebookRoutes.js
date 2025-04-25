const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const notebookController = require("../controllers/notebookController");

/**
 * Rotas para gerenciamento de cadernos
 * Implementa CRUD completo com autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar todos os cadernos do usuário
router.get("/", notebookController.getAllNotebooks);

// Obter um caderno específico
router.get("/:id", notebookController.getNotebookById);

// Criar um novo caderno
router.post("/", notebookController.createNotebook);

// Atualizar um caderno existente
router.put("/:id", notebookController.updateNotebook);

// Excluir um caderno
router.delete("/:id", notebookController.deleteNotebook);

module.exports = router;
