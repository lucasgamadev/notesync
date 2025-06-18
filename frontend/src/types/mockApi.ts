// Tipos para o mock API
export interface BaseNote {
  title: string;
  content: string;
  tags?: string[]; // Alterado para string[] para ser consistente com a API real
  notebookId?: string; // Tornado opcional para consistência
}

export interface MockNote extends BaseNote {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Adicionando propriedades que podem ser usadas internamente pelo mock
  _mockTags?: MockTag[]; // Tags detalhadas para uso interno
}

export interface MockTag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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

// Ajustando para ser compatível com ApiResponse<T> quando usado com data
// mas ainda manter a estrutura de resposta HTTP completa para o mock
// O tipo T aqui representa o tipo de dado dentro de data.data
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
