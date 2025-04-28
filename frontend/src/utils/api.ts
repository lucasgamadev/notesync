import axios from "axios";
import mockApi from "./mockApi";

// Flag para controlar se devemos usar o mock API em vez do backend real
const USE_MOCK_API = true; // Altere para false quando quiser usar o backend real

// Criando instância do axios com URL base da API
// Utilizando o proxy configurado no Next.js para redirecionar para http://localhost:5000/api
const api = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para adicionar token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função para substituir as chamadas de API pelo mock quando necessário
const apiProxy = {
  get: async (url: string) => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] GET ${url}`);
      return mockApi.get(url);
    }
    return api.get(url);
  },
  post: async (url: string, data: any) => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] POST ${url}`, data);
      return mockApi.post(url, data);
    }
    return api.post(url, data);
  },
  put: async (url: string, data: any) => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] PUT ${url}`, data);
      return mockApi.put(url, data);
    }
    return api.put(url, data);
  },
  delete: async (url: string) => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] DELETE ${url}`);
      return mockApi.delete(url);
    }
    return api.delete(url);
  }
};

// Interceptor para lidar com erros de autenticação (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token usando o refreshToken
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Se não tiver refresh token, redirecionar para login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Usando a instância api para garantir que a requisição passe pelo proxy do Next.js
        const response = await api.post(`/auth/refresh-token`, {
          refreshToken
        });

        // Armazenar os novos tokens
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        // Atualizar o header com o novo token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

        // Repetir a requisição original com o novo token
        // Usando a instância api para manter a consistência
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar ao renovar o token, limpar localStorage e redirecionar para login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default USE_MOCK_API ? apiProxy : api;
