const { PrismaClient } = require("@prisma/client");
const driveService = require("./driveService");
const fs = require("fs");
const path = require("path");
const os = require("os");

const prisma = new PrismaClient();

/**
 * Serviço de sincronização com Google Drive
 * Gerencia sincronização de notas e cadernos com Google Drive
 */

// Diretório temporário para arquivos
const TEMP_DIR = path.join(os.tmpdir(), "notesync");

// Garante que o diretório temporário existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Obtém tokens de acesso do usuário e configura cliente OAuth
 * @param {number} userId - ID do usuário
 * @returns {Object} Cliente OAuth configurado e tokens
 */
async function getAuthClientForUser(userId) {
  // Busca tokens do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
      googleDriveRootFolder: true,
    },
  });

  if (!user.googleAccessToken || !user.googleRefreshToken) {
    throw new Error("Usuário não conectado ao Google Drive");
  }

  // Verifica se o token expirou
  const tokenExpired = new Date(user.googleTokenExpiry) < new Date();

  // Configura tokens
  const tokens = {
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: new Date(user.googleTokenExpiry).getTime(),
  };

  // Renova token se necessário
  const updatedTokens = tokenExpired ? await driveService.refreshTokenIfNeeded(tokens) : tokens;

  // Se o token foi renovado, atualiza no banco
  if (tokenExpired) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: updatedTokens.access_token,
        googleTokenExpiry: new Date(Date.now() + updatedTokens.expiry_date),
      },
    });
  }

  // Configura cliente OAuth
  const auth = driveService.setupOAuth2Client(updatedTokens);

  return {
    auth,
    rootFolderId: user.googleDriveRootFolder,
  };
}

/**
 * Sincroniza um caderno com o Google Drive
 * @param {number} userId - ID do usuário
 * @param {number} notebookId - ID do caderno
 * @returns {Object} Resultado da sincronização
 */
exports.syncNotebook = async (userId, notebookId) => {
  try {
    // Obtém cliente autenticado
    const { auth, rootFolderId } = await getAuthClientForUser(userId);

    if (!rootFolderId) {
      throw new Error("Pasta raiz no Google Drive não encontrada");
    }

    // Busca informações do caderno
    const notebook = await prisma.notebook.findUnique({
      where: { id: notebookId, userId },
      include: { notes: true },
    });

    if (!notebook) {
      throw new Error("Caderno não encontrado");
    }

    // Cria pasta para o caderno se não existir
    let notebookFolderId = notebook.googleDriveFolderId;

    if (!notebookFolderId) {
      notebookFolderId = await driveService.createFolderIfNotExists(
        auth,
        notebook.title,
        rootFolderId
      );

      // Atualiza ID da pasta no banco
      await prisma.notebook.update({
        where: { id: notebookId },
        data: { googleDriveFolderId: notebookFolderId },
      });
    }

    // Sincroniza cada nota do caderno
    const syncResults = [];

    for (const note of notebook.notes) {
      try {
        const result = await syncNote(auth, notebookFolderId, note);
        syncResults.push({
          noteId: note.id,
          title: note.title,
          status: "success",
          ...result,
        });
      } catch (error) {
        syncResults.push({
          noteId: note.id,
          title: note.title,
          status: "error",
          error: error.message,
        });
      }
    }

    // Atualiza timestamp de última sincronização
    await prisma.notebook.update({
      where: { id: notebookId },
      data: { lastSyncedAt: new Date() },
    });

    return {
      notebookId,
      title: notebook.title,
      syncedNotes: syncResults,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Erro ao sincronizar caderno:", error);
    throw new Error(`Falha ao sincronizar caderno: ${error.message}`);
  }
};

/**
 * Sincroniza uma nota com o Google Drive
 * @param {OAuth2Client} auth - Cliente OAuth2 autenticado
 * @param {string} folderId - ID da pasta no Drive
 * @param {Object} note - Objeto da nota
 * @returns {Object} Resultado da sincronização
 */
async function syncNote(auth, folderId, note) {
  // Verifica se a nota já tem arquivo no Drive
  let fileId = note.googleDriveFileId;
  let action = "updated";

  // Cria arquivo temporário com conteúdo da nota
  const tempFilePath = path.join(TEMP_DIR, `${note.id}_${Date.now()}.md`);

  // Prepara conteúdo da nota (título + conteúdo)
  const noteContent = `# ${note.title}\n\n${note.content}`;

  // Escreve conteúdo no arquivo temporário
  fs.writeFileSync(tempFilePath, noteContent, "utf8");

  try {
    if (fileId) {
      // Atualiza arquivo existente
      // Implementação da atualização de arquivo no Drive
      // (Depende da API específica do Google Drive)
    } else {
      // Cria novo arquivo
      fileId = await driveService.uploadFile(auth, tempFilePath, `${note.title}.md`, folderId);

      // Atualiza ID do arquivo no banco
      await prisma.note.update({
        where: { id: note.id },
        data: {
          googleDriveFileId: fileId,
          lastSyncedAt: new Date(),
        },
      });

      action = "created";
    }

    return { action, fileId };
  } finally {
    // Remove arquivo temporário
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

/**
 * Sincroniza todas as notas de um usuário
 * @param {number} userId - ID do usuário
 * @returns {Object} Resultado da sincronização
 */
exports.syncAllUserNotes = async (userId) => {
  try {
    // Busca todos os cadernos do usuário
    const notebooks = await prisma.notebook.findMany({
      where: { userId },
    });

    const results = [];

    // Sincroniza cada caderno
    for (const notebook of notebooks) {
      try {
        const result = await this.syncNotebook(userId, notebook.id);
        results.push({
          notebookId: notebook.id,
          status: "success",
          result,
        });
      } catch (error) {
        results.push({
          notebookId: notebook.id,
          status: "error",
          error: error.message,
        });
      }
    }

    // Atualiza timestamp de última sincronização do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { lastGoogleSyncAt: new Date() },
    });

    return {
      userId,
      syncedNotebooks: results,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Erro ao sincronizar notas do usuário:", error);
    throw new Error(`Falha ao sincronizar notas: ${error.message}`);
  }
};

/**
 * Agenda sincronização periódica para todos os usuários
 * @param {number} intervalMinutes - Intervalo em minutos
 */
exports.scheduleSyncForAllUsers = (intervalMinutes = 60) => {
  const intervalMs = intervalMinutes * 60 * 1000;

  setInterval(async () => {
    try {
      console.log(`Iniciando sincronização agendada: ${new Date()}`);

      // Busca usuários com Google Drive conectado
      const users = await prisma.user.findMany({
        where: { googleDriveConnected: true },
        select: { id: true },
      });

      // Sincroniza para cada usuário
      for (const user of users) {
        try {
          await this.syncAllUserNotes(user.id);
          console.log(`Sincronização concluída para usuário ${user.id}`);
        } catch (error) {
          console.error(`Erro ao sincronizar usuário ${user.id}:`, error);
        }
      }

      console.log(`Sincronização agendada concluída: ${new Date()}`);
    } catch (error) {
      console.error("Erro na sincronização agendada:", error);
    }
  }, intervalMs);

  console.log(`Sincronização agendada configurada a cada ${intervalMinutes} minutos`);
};
