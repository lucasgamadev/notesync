// Configurações de ambiente
const env = {
  // URL da API do backend
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  
  // Configurações de autenticação
  AUTH_TOKEN_KEY: 'notesync_auth_token',
  
  // Configurações do Google OAuth
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  // Modo de desenvolvimento
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

export default env;
