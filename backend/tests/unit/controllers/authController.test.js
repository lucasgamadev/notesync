const request = require('supertest');
const app = require('../../../src/server');
const { createTestData } = require('../../helpers/testHelpers');
const path = require('path');
const fs = require('fs').promises;

describe('AuthController', () => {
  const testDataDir = path.join(__dirname, '../../test-data');
  const usersFile = path.join(testDataDir, 'users.json');

  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    
    // Setup dados iniciais
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      password: '$2b$10$YaB6xpBcJe8kJ7N8uI3Xb.kuoLC7OtGV0N2qhgA6UyEYZ.W4.IhK2', // test123
      name: 'Test User'
    };
    
    await fs.writeFile(usersFile, JSON.stringify([testUser], null, 2));
  });

  describe('POST /api/auth/login', () => {
    it('deve retornar tokens quando credenciais são válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({
          email: 'test@example.com',
          password: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual(
        expect.objectContaining({
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        })
      );
    });

    it('deve retornar erro 401 quando senha está incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({
          email: 'test@example.com',
          password: 'senha-errada'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('deve retornar erro 401 quando email não existe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({
          email: 'naoexiste@example.com',
          password: 'test123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('deve retornar erro 400 quando campos obrigatórios estão ausentes', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email e senha são obrigatórios');
    });
  });
});