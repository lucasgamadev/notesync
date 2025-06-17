import { jwtDecode } from 'jwt-decode';
import api from './api';
import env from '../config/env';

export interface User {
  id: string;
  email: string;
  name: string;
  // Adicione outros campos do usuário conforme necessário
}

interface AuthResponse {
  token: string;
  user: User;
}

interface DecodedToken {
  exp: number;
  // Adicione outros campos do token conforme necessário
}

class AuthService {
  // Verifica se o usuário está autenticado
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Verifica se o token expirou
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      this.clearAuth();
      return false;
    }
  }

  // Realiza o login
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      this.setAuth(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  // Realiza o login com Google
  static async loginWithGoogle(credential: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/google', { credential });
      this.setAuth(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      throw error;
    }
  }

  // Realiza o logout
  static logout(): void {
    this.clearAuth();
    // Redireciona para a página de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Obtém o token de autenticação
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(env.AUTH_TOKEN_KEY);
  }

  // Obtém os dados do usuário atual
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
      return null;
    }
  }

  // Define os dados de autenticação
  private static setAuth(data: AuthResponse): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(env.AUTH_TOKEN_KEY, data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  // Limpa os dados de autenticação
  private static clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(env.AUTH_TOKEN_KEY);
    localStorage.removeItem('user');
  }
}

export default AuthService;
