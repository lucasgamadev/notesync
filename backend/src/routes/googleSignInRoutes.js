const express = require("express");
const router = express.Router();
const googleSignInController = require("../controllers/googleSignInController");

/**
 * Rotas para autenticação com Google Sign-In
 */

// Verifica o token ID do Google e autentica o usuário
router.post("/google/verify", googleSignInController.verifyGoogleToken);

module.exports = router;
