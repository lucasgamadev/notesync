const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const storageService = require("../services/storageService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configurações de JWT
const JWT_SECRET = process.env.JWT_SECRET || "seu_jwt_secret_aqui";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "seu_jwt_refresh_secret_aqui";
const JWT_EXPIRES_IN = "1h";
const JWT_REFRESH_EXPIRES_IN = "7d";

/**
 * Verifica o token de ID do Google e autentica o usuário
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token não fornecido" });
    }

    // Verifica o token com a API do Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Extrai informações do usuário do payload
    const { email, name, sub: googleId, picture } = payload;

    // Busca usuário pelo email
    let user = await storageService.getUserByEmail(email);

    // Se o usuário não existir, cria um novo
    if (!user) {
      user = await storageService.createUser({
        email,
        name,
        googleId,
        profilePicture: picture,
        isGoogleAccount: true
      });
    }
    // Se o usuário existir mas não tem googleId, atualiza-o
    else if (!user.googleId) {
      user = await storageService.updateUser(user.id, {
        googleId,
        profilePicture: picture || user.profilePicture,
        isGoogleAccount: true
      });
    }

    // Gera tokens JWT
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remove campos sensíveis
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "Login com Google realizado com sucesso",
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Erro ao verificar token do Google:", error);
    res.status(401).json({ message: "Token inválido ou erro na verificação" });
  }
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
