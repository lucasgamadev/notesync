const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config/jwt");
const storageService = require("../services/storageService");

/**
 * Middleware para autenticação de tokens JWT
 * Implementa verificação robusta de tokens com proteções contra hijacking
 */
async function authenticateToken(req, res, next) {
  try {
    // Obtém o header de autorização
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Token de autenticação não fornecido" });
    }

    try {
      // Verifica o token com opções de segurança aprimoradas
      const decoded = jwt.verify(token, jwtConfig.secret, jwtConfig.getVerifyOptions());

      // Verifica se o token foi revogado
      if (jwtConfig.isTokenRevoked(decoded.jti)) {
        return res.status(403).json({ message: "Token foi revogado" });
      }

      // Proteção contra token hijacking - verifica fingerprint do cliente
      const clientFingerprint = req.headers["x-client-fingerprint"];
      if (decoded.fingerprint && decoded.fingerprint !== clientFingerprint) {
        jwtConfig.revokeToken(decoded.jti); // Revoga o token se detectar possível hijacking
        return res.status(403).json({ message: "Token inválido - possível token hijacking" });
      }

      // Busca o usuário
      const user = await storageService.getUserById(decoded.userId);
      if (!user) {
        return res.status(403).json({ message: "Usuário não encontrado" });
      }

      // Remove a senha antes de adicionar o usuário à requisição
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;

      // Verifica se o token precisa ser renovado
      if (jwtConfig.shouldRenewToken(decoded)) {
        const newToken = jwt.sign(
          { 
            userId: decoded.userId,
            fingerprint: clientFingerprint 
          },
          jwtConfig.secret,
          jwtConfig.getSignOptions()
        );
        
        // Adiciona o novo token ao header de resposta
        res.setHeader('X-New-Token', newToken);
      }

      next();
    } catch (error) {
      // Log detalhado do erro de verificação do token
      console.error("Erro na verificação do token:", {
        error: error.message,
        token: token.substring(0, 10) + '...', // Log parcial do token por segurança
        timestamp: new Date().toISOString()
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expirado" });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: "Token inválido" });
      }

      throw error; // Repassa outros erros para o handler global
    }
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = authenticateToken;
