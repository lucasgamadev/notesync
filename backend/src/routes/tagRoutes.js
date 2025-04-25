const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const tagController = require("../controllers/tagController");

/**
 * Rotas para gerenciamento de etiquetas (tags)
 * Implementa CRUD completo e relações many-to-many com notas
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar todas as etiquetas do usuário
router.get("/", tagController.getAllTags);

// Obter uma etiqueta específica
router.get("/:id", tagController.getTagById);

// Criar uma nova etiqueta
router.post("/", tagController.createTag);

// Atualizar uma etiqueta existente
router.put("/:id", tagController.updateTag);

// Excluir uma etiqueta
router.delete("/:id", tagController.deleteTag);

// Obter notas por etiqueta
router.get("/:id/notes", tagController.getNotesByTag);

module.exports = router;
