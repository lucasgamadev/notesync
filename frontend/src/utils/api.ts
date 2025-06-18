import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import mockApi from "./mockApi";
import { ApiResponse, RequestData, ApiParams } from "../types/api";

// Flag para controlar se devemos usar o mock API em vez do backend real
const USE_MOCK_API = true; // Altere para false quando quiser usar o backend real

// Criando instância do axios com URL base da API
// Utilizando o proxy configurado no Next.js para redirecionar para http://localhost:5000/api
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para adicionar token de autenticação em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Função para substituir as chamadas de API pelo mock quando necessário
const apiProxy = {
  get: async <T = unknown>(url: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] GET ${url}`, { params });
      const response = await mockApi.get(url, { params });
      return response.data as unknown as ApiResponse<T>;
    }
    const response = await api.get<ApiResponse<T>>(url, { params });
    return response.data;
  },
  
  post: async <T = unknown, D = RequestData>(url: string, data?: D, config?: Omit<ApiParams<D>, 'url' | 'data'>): Promise<ApiResponse<T>> => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] POST ${url}`, { data, ...config });
      const response = await mockApi.post(url, data, config);
      return response.data as unknown as ApiResponse<T>;
    }
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },
  
  put: async <T = unknown, D = RequestData>(url: string, data?: D, config?: Omit<ApiParams<D>, 'url' | 'data'>): Promise<ApiResponse<T>> => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] PUT ${url}`, { data, ...config });
      const response = await mockApi.put(url, data, config);
      return response.data as unknown as ApiResponse<T>;
    }
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },
  
  delete: async <T = void>(url: string, config?: Omit<ApiParams, 'url'>): Promise<ApiResponse<T>> => {
    if (USE_MOCK_API) {
      console.log(`[MOCK API] DELETE ${url}`, { ...config });
      const response = await mockApi.delete(url, config);
      return response.data as unknown as ApiResponse<T>;
    }
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data;
  },
  
  // Nota: Removido o método patch já que não está implementado no mockApi
  // Se precisar de PATCH, implemente no mockApi primeiro
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
