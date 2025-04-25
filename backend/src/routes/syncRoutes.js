const express = require("express");
const router = express.Router();
const syncController = require("../controllers/syncController");
const authenticateToken = require("../middleware/authenticateToken");

/**
 * Rotas para sincronização com Google Drive
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Sincroniza um caderno específico
router.post("/notebook/:notebookId", syncController.syncNotebook);

// Sincroniza todas as notas do usuário
router.post("/all", syncController.syncAllNotes);

// Obtém status de sincronização
router.get("/status", syncController.getSyncStatus);

module.exports = router;
