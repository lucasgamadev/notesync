const request = require('supertest');
const app = require('../../src/server');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

const testHelpers = {
  // Helper para fazer requisições HTTP autenticadas
  createAuthenticatedRequest: (userId = 'test-user-id') => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    return request(app).set('Authorization', `Bearer ${token}`);
  },

  // Helper para criar dados de teste
  createTestData: {
    note: (overrides = {}) => ({
      id: 'test-note-id',
      title: 'Test Note',
      content: 'Test content',
      userId: 'test-user-id',
      notebookId: 'test-notebook-id',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }),

    notebook: (overrides = {}) => ({
      id: 'test-notebook-id',
      name: 'Test Notebook',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }),

    tag: (overrides = {}) => ({
      id: 'test-tag-id',
      name: 'Test Tag',
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      ...overrides
    })
  },

  // Helper para manipular arquivos de teste
  files: {
    readTestJson: async (filename) => {
      const filePath = path.join(__dirname, '..', 'test-data', filename);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    },

    writeTestJson: async (filename, data) => {
      const filePath = path.join(__dirname, '..', 'test-data', filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }
  },

  // Helper para limpar dados de teste
  cleanup: async () => {
    const testDataDir = path.join(__dirname, '..', 'test-data');
    try {
      const files = await fs.readdir(testDataDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(testDataDir, file)))
      );
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
};

module.exports = testHelpers;