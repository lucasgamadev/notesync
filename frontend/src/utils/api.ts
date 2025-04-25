import axios from "axios";

// Criando instância do axios com URL base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          refreshToken
        });

        // Armazenar os novos tokens
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        // Atualizar o header com o novo token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

        // Repetir a requisição original com o novo token
        return axios(originalRequest);
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

export default api;
