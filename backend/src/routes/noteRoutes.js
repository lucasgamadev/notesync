const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const noteController = require("../controllers/noteController");

/**
 * Rotas para gerenciamento de notas
 * Implementa CRUD completo com autenticação e suporte a rich text
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar todas as notas do usuário (com filtros opcionais)
router.get("/", noteController.getAllNotes);

// Obter uma nota específica
router.get("/:id", noteController.getNoteById);

// Criar uma nova nota
router.post("/", noteController.createNote);

// Atualizar uma nota existente
router.put("/:id", noteController.updateNote);

// Excluir uma nota
router.delete("/:id", noteController.deleteNote);

// Obter versões anteriores de uma nota
router.get("/:id/versions", noteController.getNoteVersions);

// Restaurar uma versão anterior
router.post("/:id/restore/:versionId", noteController.restoreNoteVersion);

module.exports = router;
