const storageService = require("../services/storageService");
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

    // Verifica se o caderno existe e pertence ao usuário
    const notebook = await storageService.getNotebookById(notebookId, req.user.id);

    if (!notebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    // Buscar todas as notas do caderno
    const notes = await storageService.getAllNotes(req.user.id, { notebookId });

    // Prepara os dados para exportação - no sistema baseado em JSON, esses dados já estão prontos para sincronização com o Google Drive
    const exportData = {
      notebook,
      notes
    };

    res.json({
      message: "Dados do caderno prontos para sincronização",
      data: exportData
    });
  } catch (error) {
    console.error("Erro ao sincronizar caderno:", error);
    res.status(500).json({
      message: "Erro ao sincronizar caderno",
      error: error.message
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

    // Obter todos os dados do usuário para sincronização
    const data = await storageService.getDataForSync(req.user.id);

    res.json({
      message: "Todos os dados prontos para sincronização",
      data
    });
  } catch (error) {
    console.error("Erro ao sincronizar todas as notas:", error);
    res.status(500).json({
      message: "Erro ao sincronizar notas",
      error: error.message
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

    // No sistema baseado em JSON, não temos uma tabela de usuários com lastSync
    // Podemos implementar isso no futuro armazenando metadados de sincronização

    res.json({
      lastSync: null, // Por enquanto, retornamos null
      status: "ready",
      storageType: "json"
    });
  } catch (error) {
    console.error("Erro ao obter status de sincronização:", error);
    res.status(500).json({
      message: "Erro ao obter status de sincronização",
      error: error.message
    });
  }
};

/**
 * Importa dados de sincronização do Google Drive
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.importSyncData = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ message: "Dados para importação são obrigatórios" });
    }

    // Importar os dados usando o serviço de armazenamento
    const success = await storageService.importDataFromSync(data, req.user.id);

    if (!success) {
      return res.status(500).json({ message: "Erro ao importar dados da sincronização" });
    }

    res.json({
      message: "Dados importados com sucesso"
    });
  } catch (error) {
    console.error("Erro ao importar dados de sincronização:", error);
    res.status(500).json({
      message: "Erro ao importar dados de sincronização",
      error: error.message
    });
  }
};
