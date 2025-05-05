const request = require('supertest');
const app = require('../../src/server');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../../src/config/jwt');
const path = require('path');
const fs = require('fs').promises;

describe('Autenticação - Testes de Integração', () => {
  const testDataDir = path.join(__dirname, '../test-data');
  const usersFile = path.join(testDataDir, 'users.json');

  beforeEach(async () => {
    await fs.mkdir(testDataDir, { recursive: true });
    
    // Setup usuário de teste
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      password: '$2b$10$7O0TlWbHBpFv.i79z74.oe8GDIFsLX4XLuha0sFVKpvzf1dWCV9eS', // test123
      name: 'Test User'
    };
    
    await fs.writeFile(usersFile, JSON.stringify([testUser], null, 2));

    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  describe('Fluxo de autenticação', () => {
    it('deve permitir login e acesso a rota protegida', async () => {
      // 1. Fazer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({
          email: 'test@example.com',
          password: 'test123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      const accessToken = loginResponse.body.accessToken;

      // 2. Acessar rota protegida com token
      const protectedResponse = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-client-fingerprint', 'test-fingerprint');

      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body).toHaveProperty('notes');
      expect(Array.isArray(protectedResponse.body.notes)).toBe(true);
    });

    it('deve rejeitar acesso a rota protegida sem token', async () => {
      const response = await request(app)
        .get('/api/notes');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Token de autenticação não fornecido');
    });

    it('deve rejeitar acesso com token inválido', async () => {
      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', 'Bearer token-invalido')
        .set('x-client-fingerprint', 'test-fingerprint');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Token inválido');
    });

    it('deve rejeitar acesso com token expirado', async () => {
      // Criar token expirado sem incluir jti no payload
      const expiredToken = jwt.sign(
        { 
          userId: 'test-user-id',
          fingerprint: 'test-fingerprint'
        },
        jwtConfig.secret,
        {
          algorithm: jwtConfig.algorithm,
          expiresIn: '-1h', // Token já expirado
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        }
      );

      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${expiredToken}`)
        .set('x-client-fingerprint', 'test-fingerprint');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Token expirado');
    });
  });

  describe('Validação de dados', () => {
    it('deve validar campos obrigatórios no login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email e senha são obrigatórios');
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('x-client-fingerprint', 'test-fingerprint')
        .send({
          email: 'email-invalido',
          password: 'test123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Credenciais inválidas');
    });
  });
});