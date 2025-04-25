const express = require("express");
const router = express.Router();
const googleAuthController = require("../controllers/googleAuthController");
const authenticateToken = require("../middleware/authenticateToken");

/**
 * Rotas para autenticação e integração com Google Drive
 */

// Inicia o fluxo de autenticação OAuth
router.get("/google/login", authenticateToken, googleAuthController.googleLogin);

// Callback para processar o código de autorização
router.get("/google/callback", googleAuthController.googleCallback);

// Verifica status da conexão com Google Drive
router.get("/google/status", authenticateToken, googleAuthController.checkGoogleDriveStatus);

// Desconecta a conta do Google Drive
router.delete("/google/disconnect", authenticateToken, googleAuthController.disconnectGoogleDrive);

module.exports = router;
