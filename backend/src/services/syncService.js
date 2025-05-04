/* eslint-disable prettier/prettier */
const driveService = require("./driveService");
const storageService = require("./storageService");
const fs = require("fs");
const path = require("path");
const os = require("os");

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
 * @param {string} userId - ID do usuário
 * @returns {Object} Cliente OAuth configurado e tokens
 */
async function getAuthClientForUser(userId) {
  // Busca tokens do usuário
  const user = await storageService.getUserById(userId);

  if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
    throw new Error("Usuário não conectado ao Google Drive");
  }

  // Verifica se o token expirou
  const tokenExpired = new Date(user.googleTokenExpiry) < new Date();

  // Configura tokens
  const tokens = {
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: new Date(user.googleTokenExpiry).getTime()
  };

  // Renova token se necessário
  if (tokenExpired) {
    const newTokens = await driveService.refreshTokenIfNeeded(tokens);
    
    // Atualiza tokens no banco de dados
    await storageService.updateUser(userId, {
      googleAccessToken: newTokens.access_token,
      googleRefreshToken: newTokens.refresh_token,
      googleTokenExpiry: new Date(Date.now() + newTokens.expiry_date).toISOString()
    });
    
    tokens.access_token = newTokens.access_token;
  }

  // Configura cliente OAuth
  const auth = driveService.setupOAuth2Client(tokens);
  
  return {
    auth,
    rootFolderId: user.googleDriveRootFolder
  };
}

/**
 * Sincroniza um caderno específico com o Google Drive
 * @param {string} userId - ID do usuário
 * @param {string} notebookId - ID do caderno a sincronizar
 * @returns {Object} Resultado da sincronização
 */
async function syncNotebook(userId, notebookId) {
  try {
    // Obtém cliente autenticado
    const { auth, rootFolderId } = await getAuthClientForUser(userId);
    
    // Busca informações do caderno
    const notebook = await storageService.getNotebookById(notebookId, userId);
    
    if (!notebook) {
      throw new Error("Caderno não encontrado");
    }
    
    // Cria pasta para o caderno se não existir
    const notebookFolderId = await driveService.createFolderIfNotExists(
      auth,
      notebook.title,
      rootFolderId
    );
    
    // Atualiza ID da pasta no caderno
    await storageService.updateNotebook(notebookId, {
      driveFolderId: notebookFolderId
    }, userId);
    
    // Busca notas do caderno
    const notes = await storageService.getAllNotes(userId, { notebookId });
    
    // Sincroniza cada nota
    const syncResults = await Promise.all(
      notes.map(note => syncNote(auth, note, notebookFolderId, userId))
    );
    
    return {
      notebookId,
      notebookTitle: notebook.title,
      notesSynced: syncResults.length,
      notes: syncResults
    };
  } catch (error) {
    console.error("Erro ao sincronizar caderno:", error);
    throw error;
  }
}

/**
 * Sincroniza uma nota específica com o Google Drive
 * @param {OAuth2Client} auth - Cliente OAuth2 configurado
 * @param {Object} note - Objeto da nota
 * @param {string} folderId - ID da pasta no Drive
 * @param {string} userId - ID do usuário
 * @returns {Object} Resultado da sincronização
 */
async function syncNote(auth, note, folderId, userId) {
  try {
    // Cria arquivo temporário com o conteúdo da nota
    const notePath = path.join(TEMP_DIR, `${note.id}.md`);
    fs.writeFileSync(notePath, note.content);
    
    // Verifica se a nota já tem um arquivo no Drive
    let fileId = note.driveFileId;
    
    if (fileId) {
      // Atualiza arquivo existente
      await driveService.updateFile(auth, fileId, notePath);
    } else {
      // Cria novo arquivo
      fileId = await driveService.uploadFile(
        auth,
        `${note.title}.md`,
        notePath,
        folderId
      );
      
      // Atualiza ID do arquivo na nota
      await storageService.updateNote(note.id, {
        driveFileId: fileId,
        lastSynced: new Date().toISOString()
      }, userId);
    }
    
    // Remove arquivo temporário
    fs.unlinkSync(notePath);
    
    return {
      noteId: note.id,
      noteTitle: note.title,
      driveFileId: fileId,
      synced: true
    };
  } catch (error) {
    console.error("Erro ao sincronizar nota:", error);
    return {
      noteId: note.id,
      noteTitle: note.title,
      error: error.message,
      synced: false
    };
  }
}

/**
 * Sincroniza todas as notas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Object} Resultado da sincronização
 */
async function syncAllUserNotes(userId) {
  try {
    // Obtém cliente autenticado
    const { auth, rootFolderId } = await getAuthClientForUser(userId);
    
    // Atualiza timestamp de sincronização do usuário
    await storageService.updateUser(userId, {
      lastSync: new Date().toISOString()
    });
    
    // Busca todos os cadernos do usuário
    const notebooks = await storageService.getAllNotebooks(userId);
    
    // Sincroniza cada caderno
    const syncResults = await Promise.all(
      notebooks.map(notebook => syncNotebook(userId, notebook.id))
    );
    
    return {
      userId,
      notebooksSynced: syncResults.length,
      notebooks: syncResults
    };
  } catch (error) {
    console.error("Erro ao sincronizar todas as notas:", error);
    throw error;
  }
}

/**
 * Verifica status de sincronização do usuário
 * @param {string} userId - ID do usuário
 * @returns {Object} Status de sincronização
 */
async function getSyncStatus(userId) {
  try {
    // Busca informações do usuário
    const user = await storageService.getUserById(userId);
    
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    
    return {
      lastSync: user.lastSync || null,
      googleDriveConnected: user.googleDriveConnected || false,
      googleTokenExpiry: user.googleTokenExpiry || null
    };
  } catch (error) {
    console.error("Erro ao verificar status de sincronização:", error);
    throw error;
  }
}

// Exporta funções do serviço
module.exports = {
  syncNotebook,
  syncAllUserNotes,
  getSyncStatus
};
