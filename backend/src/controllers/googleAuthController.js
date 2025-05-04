const driveService = require("../services/driveService");
const storageService = require("../services/storageService");

/**
 * Controlador para autenticação com Google Drive
 * Gerencia login, callback e armazenamento de tokens
 */

/**
 * Inicia o fluxo de autenticação com Google Drive
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.googleLogin = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Gera URL de autorização
    const authUrl = driveService.getAuthUrl(req.user.id);

    // Retorna URL para o frontend redirecionar
    res.json({ authUrl });
  } catch (error) {
    console.error("Erro ao iniciar autenticação Google:", error);
    res.status(500).json({ message: "Erro ao iniciar autenticação com Google Drive" });
  }
};

/**
 * Processa o callback da autenticação OAuth
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Verifica se o código e o state foram recebidos
    if (!code || !state) {
      return res.status(400).json({ message: "Parâmetros inválidos" });
    }

    // O state contém o ID do usuário
    const userId = state;

    // Obtém tokens a partir do código
    const tokens = await driveService.getTokensFromCode(code);

    // Busca o usuário no armazenamento JSON
    const user = await storageService.getUserById(userId);
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?google_auth=error`);
    }

    // Atualiza os tokens no armazenamento JSON
    await storageService.updateUser(userId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      googleTokenExpiry: new Date(Date.now() + tokens.expiry_date).toISOString(),
      googleDriveConnected: true
    });

    // Cria pasta raiz do usuário no Google Drive
    const auth = driveService.setupOAuth2Client(tokens);
    const rootFolderId = await driveService.createFolderIfNotExists(auth, "NoteSync");

    // Armazena ID da pasta raiz
    await storageService.updateUser(userId, {
      googleDriveRootFolder: rootFolderId
    });

    // Redireciona para o frontend com sucesso
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?google_auth=success`);
  } catch (error) {
    console.error("Erro no callback Google:", error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?google_auth=error`);
  }
};

/**
 * Verifica o status da conexão com Google Drive
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.checkGoogleDriveStatus = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Busca informações do usuário no armazenamento JSON
    const user = await storageService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se o usuário tem conexão com Google Drive
    if (!user.googleDriveConnected) {
      return res.json({ connected: false });
    }

    // Verifica se o token expirou
    const tokenExpired = new Date(user.googleTokenExpiry) < new Date();

    res.json({
      connected: true,
      tokenExpired
    });
  } catch (error) {
    console.error("Erro ao verificar status do Google Drive:", error);
    res.status(500).json({ message: "Erro ao verificar status do Google Drive" });
  }
};

/**
 * Desconecta a conta do Google Drive
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.disconnectGoogleDrive = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Remove tokens e informações do Google Drive usando o armazenamento JSON
    await storageService.updateUser(req.user.id, {
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      googleDriveConnected: false,
      googleDriveRootFolder: null
    });

    res.json({ message: "Desconectado do Google Drive com sucesso" });
  } catch (error) {
    console.error("Erro ao desconectar Google Drive:", error);
    res.status(500).json({ message: "Erro ao desconectar do Google Drive" });
  }
};
