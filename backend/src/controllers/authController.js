const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtConfig } = require("../config/jwt");
const storageService = require("../services/storageService");

/**
 * Controlador de autenticação
 * Implementa gerenciamento seguro de tokens com logging
 */

// Função para registrar eventos de autenticação
const logAuthEvent = (event, userId = null, success = true, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    success,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown',
    ...details
  };
  
  console.log('Auth Event:', JSON.stringify(logEntry));
  // Em produção, enviar para sistema de logging centralizado
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const clientFingerprint = req.headers['x-client-fingerprint'];

    // Validação robusta
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres" });
    }

    // Verifica se o usuário já existe
    const existingUser = await storageService.getUserByEmail(email);
    if (existingUser) {
      logAuthEvent('register_failed', null, false, {
        reason: 'email_exists',
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(409).json({ message: "Usuário já existe" });
    }

    // Hash da senha com custo alto para maior segurança
    const hashedPassword = await bcrypt.hash(password, 12);

    // Cria o usuário
    const user = await storageService.createUser({
      name,
      email,
      password: hashedPassword
    });

    // Gera tokens com fingerprint do cliente
    const accessToken = generateAccessToken(user.id, clientFingerprint);
    const refreshToken = generateRefreshToken(user.id, clientFingerprint);

    // Remove a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    logAuthEvent('register_success', user.id, true, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    logAuthEvent('register_error', null, false, {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientFingerprint = req.headers['x-client-fingerprint'];

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    const user = await storageService.getUserByEmail(email);
    if (!user) {
      logAuthEvent('login_failed', null, false, {
        reason: 'invalid_credentials',
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logAuthEvent('login_failed', user.id, false, {
        reason: 'invalid_password',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const accessToken = generateAccessToken(user.id, clientFingerprint);
    const refreshToken = generateRefreshToken(user.id, clientFingerprint);

    const { password: _, ...userWithoutPassword } = user;

    logAuthEvent('login_success', user.id, true, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      message: "Login realizado com sucesso",
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    logAuthEvent('login_error', null, false, {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const clientFingerprint = req.headers['x-client-fingerprint'];

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token é obrigatório" });
    }

    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret, jwtConfig.getVerifyOptions());

      // Verifica se o token foi revogado
      if (jwtConfig.isTokenRevoked(decoded.jti)) {
        logAuthEvent('refresh_token_failed', decoded.userId, false, {
          reason: 'token_revoked',
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
        return res.status(403).json({ message: "Refresh token foi revogado" });
      }

      // Verifica o fingerprint do cliente
      if (decoded.fingerprint && decoded.fingerprint !== clientFingerprint) {
        jwtConfig.revokeToken(decoded.jti);
        logAuthEvent('refresh_token_failed', decoded.userId, false, {
          reason: 'fingerprint_mismatch',
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
        return res.status(403).json({ message: "Refresh token inválido" });
      }

      const user = await storageService.getUserById(decoded.userId);
      if (!user) {
        return res.status(403).json({ message: "Usuário não encontrado" });
      }

      const accessToken = generateAccessToken(user.id, clientFingerprint);

      logAuthEvent('refresh_token_success', user.id, true, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ accessToken });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ message: "Refresh token expirado" });
      }
      throw error;
    }
  } catch (error) {
    logAuthEvent('refresh_token_error', null, false, {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    console.error("Erro ao renovar token:", error);
    res.status(500).json({ message: "Erro ao renovar token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.jti) {
          // Revoga tanto o access token quanto o refresh token
          jwtConfig.revokeToken(decoded.jti);
          
          logAuthEvent('logout_success', decoded.userId, true, {
            tokenId: decoded.jti,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          });
        }
      } catch (error) {
        console.error("Erro ao decodificar token no logout:", error);
      }
    }

    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    logAuthEvent('logout_error', null, false, {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    console.error("Erro ao fazer logout:", error);
    res.status(500).json({ message: "Erro ao fazer logout" });
  }
};

const generateAccessToken = (userId, fingerprint) => {
  return jwt.sign(
    { 
      userId,
      fingerprint
    },
    jwtConfig.secret,
    jwtConfig.getSignOptions()
  );
};

const generateRefreshToken = (userId, fingerprint) => {
  return jwt.sign(
    { 
      userId,
      fingerprint
    },
    jwtConfig.refreshSecret,
    jwtConfig.getSignOptions(true)
  );
};

module.exports = exports;
