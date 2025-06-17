import axios from 'axios';
import env from '../config/env';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um interceptor para incluir o token de autenticação nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(env.AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adiciona um interceptor para tratar erros comuns
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Tratamento de erros HTTP
      switch (error.response.status) {
        case 401:
          // Redireciona para a página de login se não autenticado
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Acesso negado');
          break;
        case 404:
          console.error('Recurso não encontrado');
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
        default:
          console.error('Ocorreu um erro inesperado');
      }
    } else if (error.request) {
      console.error('Não foi possível se conectar ao servidor');
    } else {
      console.error('Erro ao configurar a requisição:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
