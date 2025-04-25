/**
 * Middleware para autenticação de tokens JWT
 * Verifica se o token é válido e adiciona o usuário à requisição
 */
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "seu_jwt_secret_aqui";

async function authenticateToken(req, res, next) {
  try {
    // Obtém o header de autorização
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    // Se não houver token, retorna erro 401 (Não autorizado)
    if (!token) {
      return res.status(401).json({ message: "Token de autenticação não fornecido" });
    }

    // Verifica se o token é válido
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido ou expirado" });
      }

      try {
        // Busca o usuário no banco de dados
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true }, // Exclui a senha
        });

        if (!user) {
          return res.status(403).json({ message: "Usuário não encontrado" });
        }

        // Adiciona o usuário à requisição para uso posterior
        req.user = user;
        next();
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }
    });
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = authenticateToken;
