const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../src/config/jwt');

// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';

// Mock do sistema de arquivos para testes
const TEST_DATA_DIR = path.join(__dirname, 'test-data');

// Helpers globais
global.createTestUser = async () => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2b$10$7O0TlWbHBpFv.i79z74.oe8GDIFsLX4XLuha0sFVKpvzf1dWCV9eS', // test123
    name: 'Test User'
  };
};

global.generateAuthToken = (userId, fingerprint = 'test-fingerprint') => {
  return jwt.sign(
    { 
      userId,
      fingerprint
    },
    jwtConfig.secret,
    jwtConfig.getSignOptions()
  );
};

// Setup antes de todos os testes
beforeAll(async () => {
  // Criar diretório de dados de teste se não existir
  try {
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
});

// Cleanup após cada teste
afterEach(async () => {
  // Limpar arquivos de teste
  try {
    const files = await fs.readdir(TEST_DATA_DIR);
    await Promise.all(
      files.map(file => fs.unlink(path.join(TEST_DATA_DIR, file)))
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  
  // Limpar todos os mocks
  jest.clearAllMocks();
});

// Cleanup após todos os testes
afterAll(async () => {
  // Remover diretório de teste
  try {
    await fs.rm(TEST_DATA_DIR, { recursive: true }).catch(() => {
      return fs.rmdir(TEST_DATA_DIR, { recursive: true });
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // Fechar qualquer servidor que possa estar aberto
  const server = require('../src/server');
  if (server.close) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Mock do storageService para testes
jest.mock('../src/services/storageService', () => ({
  initStorage: jest.fn().mockResolvedValue(true),
  getUserByEmail: jest.fn().mockImplementation(async (email) => {
    if (email === 'test@example.com') {
      return {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$10$7O0TlWbHBpFv.i79z74.oe8GDIFsLX4XLuha0sFVKpvzf1dWCV9eS', // test123
        name: 'Test User'
      };
    }
    return null;
  }),
  getUserById: jest.fn().mockImplementation(async (id) => {
    if (id === 'test-user-id') {
      return {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$10$7O0TlWbHBpFv.i79z74.oe8GDIFsLX4XLuha0sFVKpvzf1dWCV9eS', // test123
        name: 'Test User'
      };
    }
    return null;
  }),
  createUser: jest.fn().mockImplementation(async (user) => ({
    ...user,
    id: 'test-user-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
}));

// Mock do controlador de notas
jest.mock('../src/controllers/noteController', () => ({
  getAllNotes: jest.fn((req, res) => res.json({ notes: [] })),
  getNoteById: jest.fn((req, res) => res.json({ note: null })),
  createNote: jest.fn((req, res) => res.json({ note: null })),
  updateNote: jest.fn((req, res) => res.json({ note: null })),
  deleteNote: jest.fn((req, res) => res.status(204).send()),
  getNoteVersions: jest.fn((req, res) => res.json({ versions: [] })),
  restoreNoteVersion: jest.fn((req, res) => res.json({ note: null })),
  createNoteVersion: jest.fn((req, res) => res.json({ version: null })),
  syncNote: jest.fn((req, res) => res.json({ note: null })),
  getNoteSync: jest.fn((req, res) => res.json({ syncStatus: 'success' })),
  searchNotes: jest.fn((req, res) => res.json({ results: [] })),
  getNoteTags: jest.fn((req, res) => res.json({ tags: [] })),
  updateNoteTags: jest.fn((req, res) => res.json({ tags: [] }))
}));