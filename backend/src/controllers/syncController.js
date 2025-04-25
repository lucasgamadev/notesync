const syncService = require("../services/syncService");

/**
 * Controlador de sincronização com Google Drive
 * Gerencia endpoints para sincronização de notas e cadernos
 */

/**
 * Sincroniza um caderno específico com o Google Drive
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.syncNotebook = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { notebookId } = req.params;

    if (!notebookId) {
      return res.status(400).json({ message: "ID do caderno é obrigatório" });
    }

    // Executa sincronização
    const result = await syncService.syncNotebook(req.user.id, parseInt(notebookId));

    res.json({
      message: "Caderno sincronizado com sucesso",
      result,
    });
  } catch (error) {
    console.error("Erro ao sincronizar caderno:", error);
    res.status(500).json({
      message: "Erro ao sincronizar caderno",
      error: error.message,
    });
  }
};

/**
 * Sincroniza todas as notas do usuário com o Google Drive
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.syncAllNotes = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Executa sincronização
    const result = await syncService.syncAllUserNotes(req.user.id);

    res.json({
      message: "Todas as notas sincronizadas com sucesso",
      result,
    });
  } catch (error) {
    console.error("Erro ao sincronizar todas as notas:", error);
    res.status(500).json({
      message: "Erro ao sincronizar notas",
      error: error.message,
    });
  }
};

/**
 * Verifica o status de sincronização do usuário
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.getSyncStatus = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Busca informações do usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        googleDriveConnected: true,
        lastGoogleSyncAt: true,
        notebooks: {
          select: {
            id: true,
            title: true,
            lastSyncedAt: true,
            googleDriveFolderId: true,
            _count: {
              select: { notes: true },
            },
          },
        },
      },
    });

    res.json({
      connected: user.googleDriveConnected,
      lastSync: user.lastGoogleSyncAt,
      notebooks: user.notebooks.map((notebook) => ({
        id: notebook.id,
        title: notebook.title,
        lastSyncedAt: notebook.lastSyncedAt,
        hasDriveFolder: !!notebook.googleDriveFolderId,
        noteCount: notebook._count.notes,
      })),
    });
  } catch (error) {
    console.error("Erro ao obter status de sincronização:", error);
    res.status(500).json({
      message: "Erro ao obter status de sincronização",
      error: error.message,
    });
  }
};
