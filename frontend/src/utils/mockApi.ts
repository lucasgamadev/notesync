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
      tags: ["tag1"],
      notebookId: "notebook1",
      _mockTags: [{ id: "tag1", name: "Importante", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
    },
    {
      id: "note2",
      title: "Dicas para produtividade",
      tags: ['1', '2'],
      notebookId: '1',
      createdAt: new Date('2023-01-01T12:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T12:00:00Z').toISOString(),
      _mockTags: [
        { id: '1', name: 'importante', createdAt: new Date('2023-01-01T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-01T12:00:00Z').toISOString() },
        { id: '2', name: 'trabalho', createdAt: new Date('2023-01-01T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-01T12:00:00Z').toISOString() }
      ]
    },
    {
      id: '2',
      title: 'Segunda Nota',
      content: 'Conteúdo da segunda nota',
      tags: ['3'],
      notebookId: '2',
      createdAt: new Date('2023-01-02T12:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-02T12:30:00Z').toISOString(),
      _mockTags: [
        { id: '3', name: 'pessoal', createdAt: new Date('2023-01-02T12:00:00Z').toISOString(), updatedAt: new Date('2023-01-02T12:00:00Z').toISOString() }
      ]
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

// Função auxiliar para criar uma resposta de erro
const createErrorResponse = (status: number, message: string): Promise<MockResponse<null>> => {
  return Promise.resolve({
    data: {
      success: false,
      message,
      data: null
    },
    status,
    statusText: status === 404 ? 'Not Found' : 'Error',
    headers: {},
    config: {}
  });
};

// Função auxiliar para criar uma resposta simulada
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

// Função auxiliar para processar tags (converte entre string[] e MockTag[])
const processTags = (tags?: string[] | MockTag[]): { tagIds: string[], mockTags: MockTag[] } => {
  if (!tags || tags.length === 0) {
    return { tagIds: [], mockTags: [] };
  }

  // Se for um array de strings, retorna como está
  if (typeof tags[0] === 'string') {
    const tagIds = tags as string[];
    const mockTags = tagIds.map(id => {
      const existingTag = mockData.tags.find(t => t.id === id);
      return existingTag || { 
        id, 
        name: id, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
    });
    return { tagIds, mockTags };
  }

  // Se for um array de MockTag, extrai os IDs
  const mockTags = tags as MockTag[];
  const tagIds = mockTags.map(tag => tag.id);
  return { tagIds, mockTags };
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
      // Garante que as notas tenham as tags no formato correto
      const notes = mockData.notes.map(note => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _mockTags, ...noteWithoutTags } = note;
        return {
          ...noteWithoutTags,
          tags: note._mockTags ? note._mockTags.map(t => t.id) : []
        };
      });
      return createResponse(notes);
    }

    // Buscar nota por ID
    const noteMatch = /^\/notes\/([^/]+)$/.exec(url);
    if (noteMatch) {
      const noteId = noteMatch[1];
      const note = mockData.notes.find((n: MockNote) => n.id === noteId);
      if (note) {
        // Retorna a nota com as tags no formato correto
        const { _mockTags = [], ...noteWithoutTags } = note;
        const responseNote: MockNote = {
          ...noteWithoutTags,
          tags: _mockTags.map(t => t.id)
        };
        return createResponse(responseNote);
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
      const notes = mockData.notes.filter((note: MockNote) => {
        if (!note.tags || note.tags.length === 0) return false;
        
        // Verifica se é um array de strings
        if (typeof note.tags[0] === 'string') {
          return (note.tags as string[]).includes(tagName);
        }
        
        // Se for um array de objetos, verifica se tem a propriedade 'name'
        try {
          const tagsArray = note.tags as unknown[];
          return tagsArray.some(tag => 
            tag && 
            typeof tag === 'object' && 
            'name' in tag && 
            typeof (tag as { name: unknown }).name === 'string' &&
            (tag as { name: string }).name === tagName
          );
        } catch {
          return false;
        }
      });
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
      
      // Processa as tags se existirem
      const { tagIds, mockTags } = noteData.tags ? 
        processTags(noteData.tags) : 
        { tagIds: [], mockTags: [] };
      
      const newNote: MockNote = {
        id: `note-${Date.now()}`,
        title: noteData.title || 'Nova Nota',
        content: noteData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: tagIds,
        _mockTags: mockTags,
        notebookId: noteData.notebookId || ''
      };

      mockData.notes.push(newNote);
      return createResponse(newNote);
    }

    // Criar nova tag
    if (url === "/tags") {
      const tagData = data as { name: string };
      if (!tagData?.name) {
        throw new Error('O nome da tag é obrigatório');
      }
      
      // Verificar se já existe uma tag com o mesmo nome
      const existingTag = mockData.tags.find(t => t.name.toLowerCase() === tagData.name.toLowerCase());
      if (existingTag) {
        return createResponse(existingTag);
      }
      
      const newTag: MockTag = {
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        const existingNote = mockData.notes[noteIndex];
        
        // Processa as tags se fornecidas
        let tagUpdates: { tagIds: string[], mockTags: MockTag[] } | null = null;
        if (noteData.tags) {
          tagUpdates = processTags(noteData.tags);
        }
        
        const updatedNote: MockNote = {
          ...existingNote,
          title: noteData.title !== undefined ? noteData.title : existingNote.title,
          content: noteData.content !== undefined ? noteData.content : existingNote.content,
          updatedAt: new Date().toISOString(),
          notebookId: noteData.notebookId !== undefined ? noteData.notebookId : existingNote.notebookId
        };
        
        // Atualiza as tags se fornecidas
        if (tagUpdates) {
          updatedNote.tags = tagUpdates.tagIds;
          updatedNote._mockTags = tagUpdates.mockTags;
        }

        mockData.notes[noteIndex] = updatedNote;
        
        // Retorna a nota atualizada (sem o campo _mockTags na resposta)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _mockTags, ...responseNote } = updatedNote;
        return createResponse(responseNote);
      }

      // Se for uma nota temporária (criada sem backend)
      if (noteId.startsWith("temp-")) {
        // Processa as tags se fornecidas
        const { tagIds, mockTags } = noteData.tags ? 
          processTags(noteData.tags) : 
          { tagIds: [], mockTags: [] };
        
        // Criar uma nova nota a partir da temporária
        const newNote: MockNote = {
          id: `note-${Date.now()}`,
          title: noteData.title || 'Nova Nota',
          content: noteData.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: tagIds,
          _mockTags: mockTags,
          notebookId: noteData.notebookId || ''
        };

        mockData.notes.push(newNote);
        
        // Retorna a nova nota (sem o campo _mockTags na resposta)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _mockTags, ...responseNote } = newNote;
        return createResponse(responseNote);
      }
      
      // Se não encontrou a nota e não é temporária, retornar erro
      return createErrorResponse(404, `Nota com ID ${noteId} não encontrada`);
    }
    
    // Se a URL não for suportada, retornar erro
    return {
      data: {
        success: false,
        message: `URL não suportada: ${url}`,
        data: null
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {}
    };
  },

  delete: async (url: string, _config?: { params?: Record<string, unknown> }): Promise<MockResponse<unknown>> => {
    // Usar _config para evitar avisos de variável não utilizada
    if (_config) { /* noop */ }
    
    await delay(300); // Simular latência de rede

    // Deletar nota
    const noteMatch = /^\/notes\/([^/]+)$/.exec(url);
    if (noteMatch) {
      const noteId = noteMatch[1];
      const noteIndex = mockData.notes.findIndex((n: MockNote) => n.id === noteId);
      
      if (noteIndex === -1) {
        return createErrorResponse(404, `Nota com ID ${noteId} não encontrada`);
      }
      
      // Remove a nota do array
      const [deletedNote] = mockData.notes.splice(noteIndex, 1);
      
      // Remove o campo _mockTags da resposta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _mockTags, ...responseNote } = deletedNote;
      return createResponse(responseNote);
    }
    
    // Se a URL não for suportada, retornar erro
    return createErrorResponse(400, `URL não suportada: ${url}`);
  }
};

export default mockApi;
