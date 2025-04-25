const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * Rotas de autenticação
 * Implementa endpoints para registro, login e refresh token
 */

// Rota para registro de usuário
router.post("/register", authController.register);

// Rota para login
router.post("/login", authController.login);

// Rota para refresh token
router.post("/refresh-token", authController.refreshToken);

// Rota para logout
router.post("/logout", authController.logout);

module.exports = router;
