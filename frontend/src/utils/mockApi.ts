import { AxiosResponse } from 'axios';

// Tipos para as notas e tags
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  notebookId: string;
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
  notes: [] as Note[],
  tags: [
    { id: 'tag1', name: 'Importante' },
    { id: 'tag2', name: 'Trabalho' },
    { id: 'tag3', name: 'Pessoal' },
    { id: 'tag4', name: 'Estudo' },
  ] as Tag[],
  notebooks: [
    { id: 'notebook1', name: 'Geral', userId: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'notebook2', name: 'Trabalho', userId: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ] as Notebook[],
};

// Função para criar resposta simulada
const createResponse = <T>(data: T): Promise<AxiosResponse<T>> => {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });
};

// Função para simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Mock
const mockApi = {
  // Notas
  get: async (url: string): Promise<AxiosResponse<any>> => {
    await delay(300); // Simular latência de rede
    
    // Buscar todas as notas
    if (url === '/notes') {
      return createResponse(mockData.notes);
    }
    
    // Buscar nota específica
    if (url.startsWith('/notes/')) {
      const noteId = url.split('/')[2];
      const note = mockData.notes.find(n => n.id === noteId);
      
      if (note) {
        return createResponse(note);
      }
      
      // Se for uma nota temporária (criada sem backend)
      if (noteId.startsWith('temp-')) {
        // Criar uma nota temporária para exibição
        const tempNote: Note = {
          id: noteId,
          title: 'Nota Temporária',
          content: '<p>Conteúdo da nota temporária</p>',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          notebookId: '',
        };
        return createResponse(tempNote);
      }
      
      throw new Error('Nota não encontrada');
    }
    
    // Buscar tags
    if (url === '/tags') {
      return createResponse(mockData.tags);
    }
    
    // Buscar cadernos
    if (url === '/notebooks') {
      return createResponse(mockData.notebooks);
    }
    
    throw new Error(`URL não suportada: ${url}`);
  },
  
  post: async (url: string, data: any): Promise<AxiosResponse<any>> => {
    await delay(300); // Simular latência de rede
    
    // Criar nova nota
    if (url === '/notes') {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: data.title,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags ? mockData.tags.filter(tag => data.tags.includes(tag.id)) : [],
        notebookId: data.notebookId || '',
      };
      
      mockData.notes.push(newNote);
      return createResponse(newNote);
    }
    
    throw new Error(`URL não suportada: ${url}`);
  },
  
  put: async (url: string, data: any): Promise<AxiosResponse<any>> => {
    await delay(300); // Simular latência de rede
    
    // Atualizar nota existente
    if (url.startsWith('/notes/')) {
      const noteId = url.split('/')[2];
      const noteIndex = mockData.notes.findIndex(n => n.id === noteId);
      
      if (noteIndex >= 0) {
        // Atualizar nota existente
        const updatedNote: Note = {
          ...mockData.notes[noteIndex],
          title: data.title,
          content: data.content,
          updatedAt: new Date().toISOString(),
          tags: data.tags ? mockData.tags.filter(tag => data.tags.includes(tag.id)) : [],
          notebookId: data.notebookId || '',
        };
        
        mockData.notes[noteIndex] = updatedNote;
        return createResponse(updatedNote);
      }
      
      // Se for uma nota temporária (criada sem backend)
      if (noteId.startsWith('temp-')) {
        // Criar uma nova nota a partir da temporária
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: data.title,
          content: data.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: data.tags ? mockData.tags.filter(tag => data.tags.includes(tag.id)) : [],
          notebookId: data.notebookId || '',
        };
        
        mockData.notes.push(newNote);
        return createResponse(newNote);
      }
      
      throw new Error('Nota não encontrada');
    }
    
    throw new Error(`URL não suportada: ${url}`);
  },
  
  delete: async (url: string): Promise<AxiosResponse<any>> => {
    await delay(300); // Simular latência de rede
    
    // Excluir nota
    if (url.startsWith('/notes/')) {
      const noteId = url.split('/')[2];
      const noteIndex = mockData.notes.findIndex(n => n.id === noteId);
      
      if (noteIndex >= 0) {
        const deletedNote = mockData.notes[noteIndex];
        mockData.notes.splice(noteIndex, 1);
        return createResponse({ success: true, deletedNote });
      }
      
      throw new Error('Nota não encontrada');
    }
    
    throw new Error(`URL não suportada: ${url}`);
  },
};

export default mockApi;