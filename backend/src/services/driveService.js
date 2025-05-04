const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const readline = require("readline");

/**
 * Serviço para integração com Google Drive
 * Gerencia autenticação, upload, download e sincronização de arquivos
 */

// Configurações do OAuth
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata"
];

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/auth/google/callback";

/**
 * Cria e configura o cliente OAuth2
 * @returns {OAuth2Client} Cliente OAuth2 configurado
 */
const createOAuth2Client = () => {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

/**
 * Gera URL de autorização para o Google Drive
 * @param {string} userId - ID do usuário para state
 * @returns {string} URL de autorização
 */
exports.getAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: userId, // Para identificar o usuário no callback
    prompt: "consent" // Força o prompt de consentimento para obter refresh_token
  });
};

/**
 * Obtém tokens a partir do código de autorização
 * @param {string} code - Código de autorização
 * @returns {Object} Tokens de acesso e refresh
 */
exports.getTokensFromCode = async (code) => {
  const oauth2Client = createOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("Erro ao obter tokens:", error);
    throw new Error("Falha ao obter tokens de acesso");
  }
};

/**
 * Configura o cliente OAuth2 com tokens existentes
 * @param {Object} tokens - Tokens de acesso e refresh
 * @returns {OAuth2Client} Cliente OAuth2 configurado com tokens
 */
exports.setupOAuth2Client = (tokens) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

/**
 * Verifica e renova token de acesso se necessário
 * @param {Object} tokens - Tokens de acesso e refresh
 * @returns {Object} Tokens atualizados
 */
exports.refreshTokenIfNeeded = async (tokens) => {
  const oauth2Client = exports.setupOAuth2Client(tokens);

  // Verifica se o token está expirado ou próximo de expirar
  const isTokenExpired = oauth2Client.isTokenExpiring();

  if (isTokenExpired) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      throw new Error("Falha ao renovar token de acesso");
    }
  }

  return tokens;
};

/**
 * Cria pasta no Google Drive se não existir
 * @param {OAuth2Client} auth - Cliente OAuth2 autenticado
 * @param {string} folderName - Nome da pasta
 * @param {string} parentId - ID da pasta pai (opcional)
 * @returns {string} ID da pasta criada ou existente
 */
exports.createFolderIfNotExists = async (auth, folderName, parentId = null) => {
  const drive = google.drive({ version: "v3", auth });

  // Busca se a pasta já existe
  const query = parentId
    ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  try {
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive"
    });

    // Se a pasta já existe, retorna o ID
    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Caso contrário, cria a pasta
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId && { parents: [parentId] })
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: "id"
    });

    return folder.data.id;
  } catch (error) {
    console.error("Erro ao criar pasta:", error);
    throw new Error("Falha ao criar pasta no Google Drive");
  }
};

/**
 * Faz upload de um arquivo para o Google Drive
 * @param {OAuth2Client} auth - Cliente OAuth2 autenticado
 * @param {string} filePath - Caminho local do arquivo
 * @param {string} fileName - Nome do arquivo no Drive
 * @param {string} folderId - ID da pasta no Drive
 * @returns {string} ID do arquivo criado
 */
exports.uploadFile = async (auth, filePath, fileName, folderId) => {
  const drive = google.drive({ version: "v3", auth });

  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      body: fs.createReadStream(filePath)
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id"
    });

    return file.data.id;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw new Error("Falha ao fazer upload do arquivo para o Google Drive");
  }
};

/**
 * Faz download de um arquivo do Google Drive
 * @param {OAuth2Client} auth - Cliente OAuth2 autenticado
 * @param {string} fileId - ID do arquivo no Drive
 * @param {string} destPath - Caminho de destino local
 * @returns {string} Caminho do arquivo baixado
 */
exports.downloadFile = async (auth, fileId, destPath) => {
  const drive = google.drive({ version: "v3", auth });

  try {
    // Obtém informações do arquivo
    const fileInfo = await drive.files.get({
      fileId,
      fields: "name"
    });

    const fileName = fileInfo.data.name;
    const filePath = path.join(destPath, fileName);

    // Cria stream de escrita
    const dest = fs.createWriteStream(filePath);

    // Faz o download
    const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });

    // Processa o stream
    return new Promise((resolve, reject) => {
      response.data
        .on("end", () => resolve(filePath))
        .on("error", (err) => reject(err))
        .pipe(dest);
    });
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    throw new Error("Falha ao fazer download do arquivo do Google Drive");
  }
};

/**
 * Lista arquivos em uma pasta do Drive
 * @param {OAuth2Client} auth - Cliente OAuth2 autenticado
 * @param {string} folderId - ID da pasta no Drive
 * @returns {Array} Lista de arquivos
 */
exports.listFiles = async (auth, folderId) => {
  const drive = google.drive({ version: "v3", auth });

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, modifiedTime)",
      spaces: "drive"
    });

    return response.data.files;
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    throw new Error("Falha ao listar arquivos do Google Drive");
  }
};

/**
 * Detecta conflitos entre versões de arquivos
 * @param {Object} localFile - Informações do arquivo local
 * @param {Object} driveFile - Informações do arquivo no Drive
 * @returns {boolean} True se houver conflito
 */
exports.detectConflict = (localFile, driveFile) => {
  // Implementação básica baseada em timestamps
  const localModified = new Date(localFile.modifiedTime);
  const driveModified = new Date(driveFile.modifiedTime);

  // Se ambos foram modificados desde a última sincronização
  return localModified > driveFile.lastSyncTime && driveModified > localFile.lastSyncTime;
};

/**
 * Resolve conflitos simples entre versões
 * @param {Object} localFile - Conteúdo do arquivo local
 * @param {Object} driveFile - Conteúdo do arquivo no Drive
 * @returns {Object} Arquivo mesclado
 */
exports.resolveSimpleConflict = (localFile, driveFile) => {
  // Implementação básica - pode ser expandida com algoritmos mais sofisticados
  // Por padrão, mantém a versão mais recente
  const localModified = new Date(localFile.modifiedTime);
  const driveModified = new Date(driveFile.modifiedTime);

  return localModified > driveModified ? localFile : driveFile;
};
