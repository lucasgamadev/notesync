const crypto = require('crypto');

// Lista negra de tokens (em memória - em produção usar Redis)
const revokedTokens = new Set();

const jwtConfig = {
  // Configurações principais
  secret: process.env.JWT_SECRET || 'test-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
  accessTokenExpires: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpires: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Configurações adicionais de segurança
  issuer: process.env.JWT_ISSUER || 'test-issuer',
  audience: process.env.JWT_AUDIENCE || 'test-audience',
  algorithm: 'HS256', // Alterado para HS256 para maior compatibilidade
  
  // Configurações de renovação automática
  renewBeforeExpiration: 5 * 60, // 5 minutos em segundos

  // Funções de utilidade
  generateTokenId: () => crypto.randomBytes(32).toString('hex'),
  
  // Gerenciamento de tokens revogados
  revokeToken: (tokenId) => {
    revokedTokens.add(tokenId);
  },
  
  isTokenRevoked: (tokenId) => revokedTokens.has(tokenId),
  
  // Opções padrão para geração de tokens
  getSignOptions: (isRefreshToken = false) => ({
    algorithm: jwtConfig.algorithm,
    expiresIn: isRefreshToken ? jwtConfig.refreshTokenExpires : jwtConfig.accessTokenExpires,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    jwtid: jwtConfig.generateTokenId()
  }),

  // Opções padrão para verificação de tokens
  getVerifyOptions: () => ({
    algorithms: [jwtConfig.algorithm],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  }),

  // Função para verificar se o token precisa ser renovado
  shouldRenewToken: (decodedToken) => {
    const expirationTime = decodedToken.exp * 1000; // Converter para milissegundos
    const currentTime = Date.now();
    return (expirationTime - currentTime) / 1000 <= jwtConfig.renewBeforeExpiration;
  }
};

module.exports = { jwtConfig };