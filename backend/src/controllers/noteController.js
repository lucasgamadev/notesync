const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controlador para gerenciamento de notas
 * Implementa operações CRUD e sistema de versionamento
 */

// Listar todas as notas do usuário (com filtros opcionais)
const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notebookId, tag } = req.query;

    // Construir filtro base
    let filter = { userId };

    // Adicionar filtro por caderno se especificado
    if (notebookId) {
      filter.notebookId = parseInt(notebookId);
    }

    // Buscar notas com filtros aplicados
    let notes;

    if (tag) {
      // Buscar notas com a tag específica
      notes = await prisma.note.findMany({
        where: {
          ...filter,
          tags: {
            some: {
              name: tag,
            },
          },
        },
        include: {
          tags: true,
          notebook: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else {
      // Buscar todas as notas do usuário com os filtros aplicados
      notes = await prisma.note.findMany({
        where: filter,
        include: {
          tags: true,
          notebook: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    res.json(notes);
  } catch (error) {
    console.error("Erro ao buscar notas:", error);
    res.status(500).json({ message: "Erro ao buscar notas", error: error.message });
  }
};

// Obter uma nota específica
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        tags: true,
        notebook: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    res.json(note);
  } catch (error) {
    console.error("Erro ao buscar nota:", error);
    res.status(500).json({ message: "Erro ao buscar nota", error: error.message });
  }
};

// Criar uma nova nota
const createNote = async (req, res) => {
  try {
    const { title, content, notebookId, tags: tagIds } = req.body;
    const userId = req.user.id;

    // Validar dados
    if (!title) {
      return res.status(400).json({ message: "O título da nota é obrigatório" });
    }

    // Verificar se o caderno existe
    if (notebookId) {
      const notebook = await storageService.getNotebookById(notebookId, userId);
      if (!notebook) {
        return res.status(404).json({ message: "Caderno não encontrado" });
      }
    }

    // Preparar tags se fornecidas
    let noteTags = [];
    if (tagIds && tagIds.length > 0) {
      const allTags = await storageService.getAllTags(userId);

      // Filtrar apenas as tags que existem
      noteTags = allTags.filter((tag) => tagIds.includes(tag.id));
    }

    // Criar a nota
    const newNote = await storageService.createNote(
      {
        title,
        content: content || "",
        notebookId: notebookId || null,
        tags: noteTags,
      },
      userId
    );

    // Buscar informações do caderno para incluir na resposta
    if (newNote.notebookId) {
      const notebook = await storageService.getNotebookById(newNote.notebookId, userId);
      if (notebook) {
        newNote.notebook = {
          id: notebook.id,
          name: notebook.name,
        };
      }
    }

    res.status(201).json(newNote);
  } catch (error) {
    console.error("Erro ao criar nota:", error);
    res.status(500).json({ message: "Erro ao criar nota", error: error.message });
  }
};

// Atualizar uma nota existente
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, notebookId, tags: tagIds } = req.body;
    const userId = req.user.id;

    // Verificar se a nota existe e pertence ao usuário
    const existingNote = await storageService.getNoteById(id, userId);

    if (!existingNote) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // Verificar se o caderno existe
    if (notebookId) {
      const notebook = await storageService.getNotebookById(notebookId, userId);
      if (!notebook) {
        return res.status(404).json({ message: "Caderno não encontrado" });
      }
    }

    // Preparar dados para atualização
    const updateData = {
      title: title || existingNote.title,
      content: content !== undefined ? content : existingNote.content,
      notebookId: notebookId || existingNote.notebookId,
    };

    // Atualizar tags se fornecidas
    if (tagIds) {
      const allTags = await storageService.getAllTags(userId);
      // Filtrar apenas as tags que existem
      updateData.tags = allTags.filter((tag) => tagIds.includes(tag.id));
    }

    // Atualizar a nota
    const updatedNote = await storageService.updateNote(id, updateData, userId);

    if (!updatedNote) {
      return res.status(404).json({ message: "Erro ao atualizar a nota" });
    }

    // Buscar informações do caderno para incluir na resposta
    if (updatedNote.notebookId) {
      const notebook = await storageService.getNotebookById(updatedNote.notebookId, userId);
      if (notebook) {
        updatedNote.notebook = {
          id: notebook.id,
          name: notebook.name,
        };
      }
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("Erro ao atualizar nota:", error);
    res.status(500).json({ message: "Erro ao atualizar nota", error: error.message });
  }
};

// Excluir uma nota
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Excluir a nota usando o serviço de armazenamento
    const deleted = await storageService.deleteNote(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    res.json({ message: "Nota excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir nota:", error);
    res.status(500).json({ message: "Erro ao excluir nota", error: error.message });
  }
};

// Obter versões anteriores de uma nota
// Nota: No sistema baseado em JSON, não implementamos versionamento ainda
const getNoteVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a nota existe e pertence ao usuário
    const note = await storageService.getNoteById(id, userId);

    if (!note) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // No sistema baseado em JSON, retornamos um array vazio por enquanto
    // Futuramente, podemos implementar um sistema de versionamento
    res.json([]);
  } catch (error) {
    console.error("Erro ao buscar versões da nota:", error);
    res.status(500).json({ message: "Erro ao buscar versões da nota", error: error.message });
  }
};

// Restaurar uma versão anterior
// Nota: No sistema baseado em JSON, não implementamos versionamento ainda
const restoreNoteVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const userId = req.user.id;

    // Verificar se a nota existe e pertence ao usuário
    const note = await storageService.getNoteById(id, userId);

    if (!note) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // No sistema baseado em JSON, retornamos um erro por enquanto
    // Futuramente, podemos implementar um sistema de versionamento
    return res.status(501).json({
      message: "Funcionalidade de versionamento não implementada no sistema baseado em JSON",
    });
  } catch (error) {
    console.error("Erro ao restaurar versão da nota:", error);
    res.status(500).json({ message: "Erro ao restaurar versão da nota", error: error.message });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNoteVersions,
  restoreNoteVersion,
};
