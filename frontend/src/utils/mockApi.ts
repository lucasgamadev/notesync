import { AxiosResponse, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

// Tipos para as notas e tags
interface BaseNote {
  title: string;
  content: string;
  tags: Tag[];
  notebookId: string;
}

interface Note extends BaseNote {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Notebook {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Dados mockados para desenvolvimento sem backend
const mockData = {
  notes: [
    {
      id: "note1",
      title: "Bem-vindo ao NoteSync",
      content: "<p>Esta é sua primeira nota no NoteSync. Comece a organizar suas ideias!</p>",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [{ id: "tag1", name: "Importante" }],
      notebookId: "notebook1"
    },
    {
      id: "note2",
      title: "Dicas para produtividade",
      content:
        "<p>1. Faça listas de tarefas</p><p>2. Estabeleça prioridades</p><p>3. Elimine distrações</p>",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      tags: [
        { id: "tag2", name: "Trabalho" },
        { id: "tag4", name: "Estudo" }
      ],
      notebookId: "notebook2"
    },
    {
      id: "note3",
      title: "Ideias para o fim de semana",
      content: "<p>- Visitar o parque</p><p>- Assistir ao novo filme</p><p>- Ler um livro</p>",
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      tags: [{ id: "tag3", name: "Pessoal" }],
      notebookId: "notebook1"
    }
  ] as Note[],
  tags: [
    { id: "tag1", name: "Importante" },
    { id: "tag2", name: "Trabalho" },
    { id: "tag3", name: "Pessoal" },
    { id: "tag4", name: "Estudo" }
  ] as Tag[],
  notebooks: [
    {
      id: "notebook1",
      name: "Geral",
      userId: "user1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "notebook2",
      name: "Trabalho",
      userId: "user1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Notebook[]
};

// Função para criar resposta simulada
const createResponse = <T>(data: T): Promise<AxiosResponse<T>> => {
  const response: AxiosResponse<T> = {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
      // Adicionando propriedades obrigatórias do InternalAxiosRequestConfig
      url: '',
      method: 'get',
      data: undefined,
      params: {},
      timeout: 0,
      withCredentials: false,
      responseType: 'json',
      xsrfCookieName: '',
      xsrfHeaderName: '',
      maxContentLength: -1,
      maxBodyLength: -1,
      validateStatus: () => true,
      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false,
      },
    } as unknown as InternalAxiosRequestConfig
  };
  return Promise.resolve(response);
};

// Função para simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Mock
const mockApi = {
  // Notas
  get: async (url: string): Promise<AxiosResponse<Note[] | Note | Tag[] | Notebook[]>> => {
    await delay(300); // Simular latência de rede

    // Buscar todas as notas
    if (url === "/notes") {
      return createResponse(mockData.notes);
    }

    // Buscar nota específica
    if (url.startsWith("/notes/")) {
      const noteId = url.split("/")[2];
      const note = mockData.notes.find((n) => n.id === noteId);

      if (note) {
        return createResponse(note);
      }

      // Se for uma nota temporária (criada sem backend)
      if (noteId.startsWith("temp-")) {
        // Criar uma nota temporária para exibição
        const tempNote: Note = {
          id: noteId,
          title: "Nota Temporária",
          content: "<p>Conteúdo da nota temporária</p>",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          notebookId: ""
        };
        return createResponse(tempNote);
      }

      throw new Error("Nota não encontrada");
    }

    // Buscar tags
    if (url === "/tags" || url === "/api/tags") {
      return createResponse(mockData.tags);
    }

    // Buscar cadernos
    if (url === "/notebooks" || url === "/api/notebooks") {
      return createResponse(mockData.notebooks);
    }

    throw new Error(`URL não suportada: ${url}`);
  },

  post: async (url: string, data: Partial<BaseNote>): Promise<AxiosResponse<Note | Tag | Notebook>> => {
    await delay(300); // Simular latência de rede

    // Criar nova nota
    if (url === "/notes") {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: data.title || 'Nova Nota',
        content: data.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags ? mockData.tags.filter(tag => 
          data.tags?.some(t => typeof t === 'string' ? t === tag.id : t.id === tag.id)
        ) || [] : [],
        notebookId: data.notebookId || ''
      };

      mockData.notes.push(newNote);
      return createResponse(newNote);
    }

    throw new Error(`URL não suportada: ${url}`);
  },

  put: async (url: string, data: Partial<BaseNote>): Promise<AxiosResponse<Note | Tag | Notebook>> => {
    await delay(300); // Simular latência de rede

    // Atualizar nota existente
    if (url.startsWith("/notes/")) {
      const noteId = url.split("/")[2];
      const noteIndex = mockData.notes.findIndex((n) => n.id === noteId);

      if (noteIndex >= 0) {
        // Atualizar nota existente
        const updatedNote: Note = {
          ...mockData.notes[noteIndex],
          title: data.title || mockData.notes[noteIndex].title,
          content: data.content || mockData.notes[noteIndex].content,
          updatedAt: new Date().toISOString(),
          tags: data.tags ? mockData.tags.filter(tag => 
            data.tags?.some(t => typeof t === 'string' ? t === tag.id : t.id === tag.id)
          ) || [] : mockData.notes[noteIndex].tags,
          notebookId: data.notebookId || mockData.notes[noteIndex].notebookId
        };

        mockData.notes[noteIndex] = updatedNote;
        return createResponse(updatedNote);
      }

      // Se for uma nota temporária (criada sem backend)
      if (noteId.startsWith("temp-")) {
        // Criar uma nova nota a partir da temporária
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: data.title || 'Nova Nota',
          content: data.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: data.tags ? mockData.tags.filter(tag => 
            data.tags?.some(t => typeof t === 'string' ? t === tag.id : t.id === tag.id)
          ) || [] : [],
          notebookId: data.notebookId || ''
        };

        mockData.notes.push(newNote);
        return createResponse(newNote);
      }

      throw new Error("Nota não encontrada");
    }

    throw new Error(`URL não suportada: ${url}`);
  },

  delete: async (url: string): Promise<AxiosResponse<{ success: boolean; deletedNote: Note }>> => {
    await delay(300); // Simular latência de rede

    // Excluir nota
    if (url.startsWith("/notes/")) {
      const noteId = url.split("/")[2];
      const noteIndex = mockData.notes.findIndex((n) => n.id === noteId);

      if (noteIndex >= 0) {
        const deletedNote = mockData.notes[noteIndex];
        mockData.notes.splice(noteIndex, 1);
        return createResponse({ success: true, deletedNote } as { success: boolean; deletedNote: Note });
      }

      throw new Error("Nota não encontrada");
    }

    throw new Error(`URL não suportada: ${url}`);
  }
};

export default mockApi;
