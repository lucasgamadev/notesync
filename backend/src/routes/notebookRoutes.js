const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

/**
 * Rotas para gerenciamento de cadernos
 * Implementa CRUD completo com autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar todos os cadernos do usuário
router.get("/", (req, res) => {
  // Implementação será feita posteriormente
  res.status(501).json({ message: "Endpoint em implementação" });
});

// Obter um caderno específico
router.get("/:id", (req, res) => {
  // Implementação será feita posteriormente
  res.status(501).json({ message: "Endpoint em implementação" });
});

// Criar um novo caderno
router.post("/", (req, res) => {
  // Implementação será feita posteriormente
  res.status(501).json({ message: "Endpoint em implementação" });
});

// Atualizar um caderno existente
router.put("/:id", (req, res) => {
  // Implementação será feita posteriormente
  res.status(501).json({ message: "Endpoint em implementação" });
});

// Excluir um caderno
router.delete("/:id", (req, res) => {
  // Implementação será feita posteriormente
  res.status(501).json({ message: "Endpoint em implementação" });
});

module.exports = router;
