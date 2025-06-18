// Tipos para o mock API
export interface BaseNote {
  title: string;
  content: string;
  tags: MockTag[];
  notebookId: string;
}

export interface MockNote extends BaseNote {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockNotebook {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockData {
  notes: MockNote[];
  tags: MockTag[];
  notebooks: MockNotebook[];
}

export interface MockResponse<T> {
  data: {
    data: T;
    message?: string;
    success: boolean;
  };
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: {
    url?: string;
    method?: string;
    data?: unknown;
    params?: Record<string, unknown>;
  };
}
