/**
 * Serviço de Armazenamento em JSON
 *
 * Este serviço gerencia o armazenamento de dados em arquivos JSON,
 * substituindo o banco de dados Prisma para facilitar a sincronização com o Google Drive.
 */

const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Diretório onde os arquivos JSON serão armazenados
const DATA_DIR = path.join(__dirname, "..", "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");
const NOTEBOOKS_FILE = path.join(DATA_DIR, "notebooks.json");
const TAGS_FILE = path.join(DATA_DIR, "tags.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

/**
 * Inicializa o sistema de armazenamento, criando os diretórios e arquivos necessários
 */
async function initStorage() {
  try {
    // Verifica se o diretório de dados existe, se não, cria
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Inicializa os arquivos JSON se não existirem
    await initJsonFile(NOTES_FILE, []);
    await initJsonFile(NOTEBOOKS_FILE, []);
    await initJsonFile(TAGS_FILE, []);
    await initJsonFile(USERS_FILE, []);

    console.log("Sistema de armazenamento JSON inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar sistema de armazenamento:", error);
    throw error;
  }
}

/**
 * Inicializa um arquivo JSON se ele não existir
 */
async function initJsonFile(filePath, defaultData) {
  try {
    await fs.access(filePath);
  } catch (error) {
    // Arquivo não existe, cria com dados padrão
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    console.log(`Arquivo ${path.basename(filePath)} criado com sucesso`);
  }
}

/**
 * Lê dados de um arquivo JSON
 */
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${path.basename(filePath)}:`, error);
    // Se o arquivo não existir, retorna um array vazio
    if (error.code === "ENOENT") {
      await initJsonFile(filePath, []);
      return [];
    }
    throw error;
  }
}

/**
 * Escreve dados em um arquivo JSON
 */
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${path.basename(filePath)}:`, error);
    throw error;
  }
}

// Funções para manipulação de notas
async function getAllNotes(userId, filters = {}) {
  const notes = await readJsonFile(NOTES_FILE);
  let filteredNotes = notes.filter((note) => note.userId === userId);

  // Aplicar filtros adicionais
  if (filters.notebookId) {
    filteredNotes = filteredNotes.filter((note) => note.notebookId === filters.notebookId);
  }

  if (filters.tag) {
    filteredNotes = filteredNotes.filter((note) =>
      note.tags.some((tag) => tag.name === filters.tag)
    );
  }

  // Ordenar por data de atualização (mais recente primeiro)
  return filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function getNoteById(id, userId) {
  const notes = await readJsonFile(NOTES_FILE);
  return notes.find((note) => note.id === id && note.userId === userId);
}

async function createNote(noteData, userId) {
  const notes = await readJsonFile(NOTES_FILE);

  const newNote = {
    id: uuidv4(),
    ...noteData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Garantir que tags seja um array
    tags: noteData.tags || []
  };

  notes.push(newNote);
  await writeJsonFile(NOTES_FILE, notes);
  return newNote;
}

async function updateNote(id, noteData, userId) {
  const notes = await readJsonFile(NOTES_FILE);
  const noteIndex = notes.findIndex((note) => note.id === id && note.userId === userId);

  if (noteIndex === -1) {
    return null;
  }

  // Criar versão atualizada da nota
  const updatedNote = {
    ...notes[noteIndex],
    ...noteData,
    updatedAt: new Date().toISOString()
  };

  notes[noteIndex] = updatedNote;
  await writeJsonFile(NOTES_FILE, notes);
  return updatedNote;
}

async function deleteNote(id, userId) {
  const notes = await readJsonFile(NOTES_FILE);
  const filteredNotes = notes.filter((note) => !(note.id === id && note.userId === userId));

  if (filteredNotes.length === notes.length) {
    return false; // Nota não encontrada
  }

  await writeJsonFile(NOTES_FILE, filteredNotes);
  return true;
}

// Funções para manipulação de cadernos (notebooks)
async function getAllNotebooks(userId) {
  const notebooks = await readJsonFile(NOTEBOOKS_FILE);
  return notebooks.filter((notebook) => notebook.userId === userId);
}

async function getNotebookById(id, userId) {
  const notebooks = await readJsonFile(NOTEBOOKS_FILE);
  return notebooks.find((notebook) => notebook.id === id && notebook.userId === userId);
}

async function createNotebook(notebookData, userId) {
  const notebooks = await readJsonFile(NOTEBOOKS_FILE);

  const newNotebook = {
    id: uuidv4(),
    ...notebookData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notebooks.push(newNotebook);
  await writeJsonFile(NOTEBOOKS_FILE, notebooks);
  return newNotebook;
}

async function updateNotebook(id, notebookData, userId) {
  const notebooks = await readJsonFile(NOTEBOOKS_FILE);
  const notebookIndex = notebooks.findIndex(
    (notebook) => notebook.id === id && notebook.userId === userId
  );

  if (notebookIndex === -1) {
    return null;
  }

  const updatedNotebook = {
    ...notebooks[notebookIndex],
    ...notebookData,
    updatedAt: new Date().toISOString()
  };

  notebooks[notebookIndex] = updatedNotebook;
  await writeJsonFile(NOTEBOOKS_FILE, notebooks);
  return updatedNotebook;
}

async function deleteNotebook(id, userId) {
  const notebooks = await readJsonFile(NOTEBOOKS_FILE);
  const filteredNotebooks = notebooks.filter(
    (notebook) => !(notebook.id === id && notebook.userId === userId)
  );

  if (filteredNotebooks.length === notebooks.length) {
    return false; // Caderno não encontrado
  }

  await writeJsonFile(NOTEBOOKS_FILE, filteredNotebooks);
  return true;
}

// Funções para manipulação de tags
async function getAllTags(userId) {
  const tags = await readJsonFile(TAGS_FILE);
  return tags.filter((tag) => tag.userId === userId);
}

async function getTagById(id, userId) {
  const tags = await readJsonFile(TAGS_FILE);
  return tags.find((tag) => tag.id === id && tag.userId === userId);
}

async function createTag(tagData, userId) {
  const tags = await readJsonFile(TAGS_FILE);

  const newTag = {
    id: uuidv4(),
    ...tagData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tags.push(newTag);
  await writeJsonFile(TAGS_FILE, tags);
  return newTag;
}

async function updateTag(id, tagData, userId) {
  const tags = await readJsonFile(TAGS_FILE);
  const tagIndex = tags.findIndex((tag) => tag.id === id && tag.userId === userId);

  if (tagIndex === -1) {
    return null;
  }

  const updatedTag = {
    ...tags[tagIndex],
    ...tagData,
    updatedAt: new Date().toISOString()
  };

  tags[tagIndex] = updatedTag;
  await writeJsonFile(TAGS_FILE, tags);
  return updatedTag;
}

async function deleteTag(id, userId) {
  const tags = await readJsonFile(TAGS_FILE);
  const filteredTags = tags.filter((tag) => !(tag.id === id && tag.userId === userId));

  if (filteredTags.length === tags.length) {
    return false; // Tag não encontrada
  }

  await writeJsonFile(TAGS_FILE, filteredTags);
  return true;
}

// Funções para manipulação de usuários
async function getAllUsers() {
  return await readJsonFile(USERS_FILE);
}

async function getUserById(id) {
  const users = await readJsonFile(USERS_FILE);
  return users.find((user) => user.id === id);
}

async function getUserByEmail(email) {
  const users = await readJsonFile(USERS_FILE);
  return users.find((user) => user.email === email);
}

async function createUser(userData) {
  const users = await readJsonFile(USERS_FILE);

  // Verificar se o email já existe
  if (users.some((user) => user.email === userData.email)) {
    throw new Error("Email já cadastrado");
  }

  const newUser = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isGoogleAccount: userData.isGoogleAccount || false,
    googleDriveConnected: userData.googleDriveConnected || false
  };

  users.push(newUser);
  await writeJsonFile(USERS_FILE, users);
  return newUser;
}

async function updateUser(id, userData) {
  const users = await readJsonFile(USERS_FILE);
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  // Se houver atualização de email, verificar se já existe
  if (userData.email && userData.email !== users[userIndex].email) {
    const emailExists = users.some((user) => user.email === userData.email && user.id !== id);
    if (emailExists) {
      throw new Error("Email já cadastrado por outro usuário");
    }
  }

  const updatedUser = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  await writeJsonFile(USERS_FILE, users);
  return updatedUser;
}

async function deleteUser(id) {
  const users = await readJsonFile(USERS_FILE);
  const filteredUsers = users.filter((user) => user.id !== id);

  if (filteredUsers.length === users.length) {
    return false; // Usuário não encontrado
  }

  await writeJsonFile(USERS_FILE, filteredUsers);
  return true;
}

// Funções para sincronização com Google Drive
async function getDataForSync(userId) {
  const notes = await getAllNotes(userId);
  const notebooks = await getAllNotebooks(userId);
  const tags = await getAllTags(userId);

  return {
    notes,
    notebooks,
    tags
  };
}

async function importDataFromSync(data, userId) {
  try {
    // Ler dados atuais
    const currentNotes = await readJsonFile(NOTES_FILE);
    const currentNotebooks = await readJsonFile(NOTEBOOKS_FILE);
    const currentTags = await readJsonFile(TAGS_FILE);

    // Filtrar dados que não pertencem ao usuário atual
    const otherUsersNotes = currentNotes.filter((note) => note.userId !== userId);
    const otherUsersNotebooks = currentNotebooks.filter((notebook) => notebook.userId !== userId);
    const otherUsersTags = currentTags.filter((tag) => tag.userId !== userId);

    // Combinar dados importados com dados de outros usuários
    const newNotes = [...otherUsersNotes, ...data.notes];
    const newNotebooks = [...otherUsersNotebooks, ...data.notebooks];
    const newTags = [...otherUsersTags, ...data.tags];

    // Salvar dados combinados
    await writeJsonFile(NOTES_FILE, newNotes);
    await writeJsonFile(NOTEBOOKS_FILE, newNotebooks);
    await writeJsonFile(TAGS_FILE, newTags);

    return true;
  } catch (error) {
    console.error("Erro ao importar dados da sincronização:", error);
    return false;
  }
}

module.exports = {
  initStorage,
  // Notas
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  // Cadernos
  getAllNotebooks,
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  // Tags
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  // Usuários
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  // Sincronização
  getDataForSync,
  importDataFromSync,
  // Inicialização
  initStorage
};
