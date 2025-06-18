// Tipos para os dados da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

// Tipo para dados genéricos que podem ser enviados nas requisições POST/PUT
export type RequestData = Record<string, unknown>;

// Tipos para os parâmetros das funções da API
export interface ApiParams<T = unknown> {
  url: string;
  data?: T;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para os erros da API
export interface ApiError extends Error {
  status?: number;
  response?: {
    data: {
      message: string;
      statusCode: number;
      error?: string;
    };
  };
}

export type ApiMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
