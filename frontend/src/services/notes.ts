import api from './api';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  // Adicione outros campos conforme necessário
}

class NotesService {
  // Busca todas as notas do usuário
  static async getAllNotes(): Promise<Note[]> {
    try {
      const response = await api.get<Note[]>('/notes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw error;
    }
  }

  // Busca uma nota específica pelo ID
  static async getNoteById(id: string): Promise<Note> {
    try {
      const response = await api.get<Note>(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar nota ${id}:`, error);
      throw error;
    }
  }

  // Cria uma nova nota
  static async createNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const response = await api.post<Note>('/notes', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      throw error;
    }
  }

  // Atualiza uma nota existente
  static async updateNote(id: string, data: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note> {
    try {
      const response = await api.put<Note>(`/notes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar nota ${id}:`, error);
      throw error;
    }
  }

  // Exclui uma nota
  static async deleteNote(id: string): Promise<void> {
    try {
      await api.delete(`/notes/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir nota ${id}:`, error);
      throw error;
    }
  }

  // Busca as notas recentes do usuário
  static async getRecentNotes(limit: number = 5): Promise<Note[]> {
    try {
      const response = await api.get<Note[]>('/notes/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notas recentes:', error);
      throw error;
    }
  }
}

export default NotesService;
