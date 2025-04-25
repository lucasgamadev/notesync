const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Controlador de autenticação
 * Gerencia registro, login, refresh token e logout de usuários
 */

// Configurações de JWT
const JWT_SECRET = process.env.JWT_SECRET || "seu_jwt_secret_aqui";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "seu_jwt_refresh_secret_aqui";
const JWT_EXPIRES_IN = "1h";
const JWT_REFRESH_EXPIRES_IN = "7d";

/**
 * Registra um novo usuário
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Usuário já existe" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Remove a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    // Gera tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

/**
 * Autentica um usuário
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Remove a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    // Gera tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: "Login realizado com sucesso",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
};

/**
 * Renova o token de acesso usando um refresh token
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token é obrigatório" });
    }

    // Verifica o refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Refresh token inválido ou expirado" });
      }

      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(403).json({ message: "Usuário não encontrado" });
      }

      // Gera novo access token
      const accessToken = generateAccessToken(user.id);

      res.json({
        accessToken,
      });
    });
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    res.status(500).json({ message: "Erro ao renovar token" });
  }
};

/**
 * Realiza o logout do usuário (invalidação de tokens seria implementada em um sistema real)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.logout = async (req, res) => {
  // Em uma implementação real, aqui seria feita a invalidação do token
  // Por exemplo, adicionando-o a uma lista negra em Redis
  res.json({ message: "Logout realizado com sucesso" });
};

/**
 * Gera um token de acesso JWT
 * @param {string} userId - ID do usuário
 * @returns {string} Token JWT
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Gera um refresh token JWT
 * @param {string} userId - ID do usuário
 * @returns {string} Refresh token JWT
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};
