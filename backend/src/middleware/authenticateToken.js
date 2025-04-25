/**
 * Middleware para autenticação de tokens JWT
 * Verifica se o token é válido e adiciona o usuário à requisição
 */
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Obtém o header de autorização
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // Se não houver token, retorna erro 401 (Não autorizado)
  if (!token) {
    return res.status(401).json({ message: "Token de autenticação não fornecido" });
  }

  // Verifica se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado" });
    }

    // Adiciona o usuário à requisição para uso posterior
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
