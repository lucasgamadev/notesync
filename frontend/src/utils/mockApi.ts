import { BaseNote, MockNote, MockTag, MockNotebook, MockData, MockResponse } from "../types/mockApi";

// Dados mockados para desenvolvimento sem backend
const mockData: MockData = {
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
      tags: [
        { id: '1', name: 'importante', createdAt: new Date('2023-01-01T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-01T12:00:00Z').toISOString() },
        { id: '2', name: 'trabalho', createdAt: new Date('2023-01-01T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-01T12:00:00Z').toISOString() }
      ],
      notebookId: '1',
      createdAt: new Date('2023-01-01T12:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T12:00:00Z').toISOString()
    },
    {
      id: '2',
      title: 'Segunda Nota',
      content: 'Conteúdo da segunda nota',
      tags: [
        { id: '3', name: 'pessoal', createdAt: new Date('2023-01-02T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-02T12:00:00Z').toISOString() }
      ],
      notebookId: '2',
      createdAt: new Date('2023-01-02T12:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-02T12:30:00Z').toISOString()
    }
  ] as MockNote[],
  tags: [
    { id: '1', name: 'importante', createdAt: new Date('2023-01-01T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-01T12:00:00Z').toISOString() },
    { id: '2', name: 'trabalho', createdAt: new Date('2023-01-01T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-01T12:00:00Z').toISOString() },
    { id: '3', name: 'pessoal', createdAt: new Date('2023-01-02T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-02T12:00:00Z').toISOString() }
  ] as MockTag[],
  notebooks: [
    {
      id: '1',
      name: 'Trabalho',
      userId: 'user1',
      createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T00:00:00Z').toISOString()
    },
    {
      id: '2',
      name: 'Pessoal',
      userId: 'user1',
      createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T00:00:00Z').toISOString()
    }
  ] as MockNotebook[]
};

// Função para criar resposta simulada
const createResponse = <T>(data: T): Promise<MockResponse<T>> => {
  return Promise.resolve({
    data: {
      data,
      success: true,
      message: 'Operação realizada com sucesso'
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
  });
};

// Função para simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Mock
const mockApi: {
  get: (url: string, config?: { params?: Record<string, unknown> }) => Promise<MockResponse<unknown>>;
  post: (url: string, data?: unknown, config?: { params?: Record<string, unknown> }) => Promise<MockResponse<unknown>>;
  put: (url: string, data?: unknown, config?: { params?: Record<string, unknown> }) => Promise<MockResponse<unknown>>;
  delete: (url: string, config?: { params?: Record<string, unknown> }) => Promise<MockResponse<unknown>>;
} = {
  // Notas
  get: async (url: string, _config?: { params?: Record<string, unknown> }): Promise<MockResponse<unknown>> => {
    // Usar _config para evitar avisos de variável não utilizada
    if (_config) { /* noop */ }
    await delay(300); // Simular latência de rede

    // Buscar todas as notas
    if (url === "/notes" || url === "/api/notes") {
      return createResponse(mockData.notes);
    }

    // Buscar nota por ID
    const noteMatch = /^\/notes\/([^/]+)$/.exec(url);
    if (noteMatch) {
      const noteId = noteMatch[1];
      const note = mockData.notes.find((n: MockNote) => n.id === noteId);
      if (note) {
        return createResponse(note);
      } else {
        // Se for uma nota temporária (criada sem backend)
        if (noteId.startsWith("temp-")) {
          const tempNote: MockNote = {
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
        throw new Error(`Nota com ID ${noteId} não encontrada`);
      }
    }

    // Buscar notas por tag
    const tagMatch = /^\/tags\/([^/]+)\/notes$/.exec(url);
    if (tagMatch) {
      const tagName = tagMatch[1];
      const notes = mockData.notes.filter((note: MockNote) => 
        note.tags.some(tag => tag.name === tagName)
      );
      return createResponse(notes);
    }

    // Buscar notas por caderno
    const notebookMatch = /^\/notebooks\/([^/]+)\/notes$/.exec(url);
    if (notebookMatch) {
      const notebookId = notebookMatch[1];
      const notes = mockData.notes.filter((note: MockNote) => note.notebookId === notebookId);
      return createResponse(notes);
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

  post: async (url: string, data?: unknown, _config?: { params?: Record<string, unknown> }): Promise<MockResponse<unknown>> => {
    // Usar _config para evitar avisos de variável não utilizada
    if (_config) { /* noop */ }
    await delay(300); // Simular latência de rede

    // Criar nova nota
    if (url === "/notes") {
      const noteData = data as Partial<BaseNote>;
      const newNote: MockNote = {
        id: `note-${Date.now()}`,
        title: noteData.title || 'Nova Nota',
        content: noteData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: noteData.tags ? mockData.tags.filter(tag => 
          Array.isArray(noteData.tags) && noteData.tags.some(t => 
            typeof t === 'string' ? t === tag.id : 'id' in t && t.id === tag.id
          )
        ) || [] : [],
        notebookId: noteData.notebookId || ''
      };

      mockData.notes.push(newNote);
      return createResponse(newNote);
    }

    // Criar nova tag
    if (url === "/tags") {
      const tagData = data as { name: string };
      const newTag: MockTag = {
        id: `tag-${Date.now()}`,
        name: tagData.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.tags.push(newTag);
      return createResponse(newTag);
    }

    // Criar novo caderno
    if (url === "/notebooks") {
      const notebookData = data as { name: string };
      const newNotebook: MockNotebook = {
        id: `notebook-${Date.now()}`,
        name: notebookData.name,
        userId: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.notebooks.push(newNotebook);
      return createResponse(newNotebook);
    }

    throw new Error(`URL não suportada: ${url}`);
  },

  put: async (url: string, data?: unknown, _config?: { params?: Record<string, unknown> }): Promise<MockResponse<unknown>> => {
    // Usar _config para evitar avisos de variável não utilizada
    if (_config) { /* noop */ }
    const noteData = data as Partial<BaseNote>;
    await delay(300); // Simular latência de rede

    // Atualizar nota existente
    if (url.startsWith("/notes/")) {
      const noteId = url.split("/")[2];
      const noteIndex = mockData.notes.findIndex((n) => n.id === noteId);

      if (noteIndex >= 0) {
        // Atualizar nota existente
        const updatedNote: MockNote = {
          ...mockData.notes[noteIndex],
          title: noteData.title || mockData.notes[noteIndex].title,
          content: noteData.content || mockData.notes[noteIndex].content,
          updatedAt: new Date().toISOString(),
          tags: noteData.tags ? mockData.tags.filter(tag => 
            noteData.tags?.some(t => typeof t === 'string' ? t === tag.id : t.id === tag.id)
          ) || [] : mockData.notes[noteIndex].tags,
          notebookId: noteData.notebookId || mockData.notes[noteIndex].notebookId
        };

        mockData.notes[noteIndex] = updatedNote;
        return createResponse(updatedNote);
      }

      // Se for uma nota temporária (criada sem backend)
      if (noteId.startsWith("temp-")) {
        // Criar uma nova nota a partir da temporária
        const newNote: MockNote = {
          id: `note-${Date.now()}`,
          title: noteData.title || 'Nova Nota',
          content: noteData.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: noteData.tags ? mockData.tags.filter(tag => 
            noteData.tags?.some(t => typeof t === 'string' ? t === tag.id : t.id === tag.id)
          ) || [] : [],
          notebookId: noteData.notebookId || ''
        };

        mockData.notes.push(newNote);
        return createResponse(newNote);
      }

      throw new Error("Nota não encontrada");
    }

    throw new Error(`URL não suportada: ${url}`);
  },

  delete: async (url: string, _config?: { params?: Record<string, unknown> }): Promise<MockResponse<unknown>> => {
    // Usar _config para evitar avisos de variável não utilizada
    if (_config) { /* noop */ }
    await delay(300); // Simular latência de rede

    // Excluir nota
    if (url.startsWith("/notes/")) {
      const noteId = url.split("/")[2];
      const noteIndex = mockData.notes.findIndex((n) => n.id === noteId);

      if (noteIndex >= 0) {
        const deletedNote = mockData.notes[noteIndex];
        mockData.notes.splice(noteIndex, 1);
        return createResponse({ success: true, deletedNote } as { success: boolean; deletedNote: MockNote });
      }

      throw new Error("Nota não encontrada");
    }

    throw new Error(`URL não suportada: ${url}`);
  }
};

export default mockApi;
