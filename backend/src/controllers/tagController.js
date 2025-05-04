const storageService = require("../services/storageService");

/**
 * Controlador para gerenciamento de etiquetas (tags)
 * Implementa operações CRUD e relações many-to-many com notas
 */

// Listar todas as etiquetas do usuário
const getAllTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar tags usando o serviço de armazenamento
    const tags = await storageService.getAllTags(userId);

    // Ordenar tags por nome
    tags.sort((a, b) => a.name.localeCompare(b.name));

    res.json(tags);
  } catch (error) {
    console.error("Erro ao buscar etiquetas:", error);
    res.status(500).json({ message: "Erro ao buscar etiquetas", error: error.message });
  }
};

// Obter uma etiqueta específica
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar tag usando o serviço de armazenamento
    const tag = await storageService.getTagById(id, userId);

    if (!tag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    // Buscar notas associadas a esta tag
    const allNotes = await storageService.getAllNotes(userId);
    const notesWithTag = allNotes.filter(
      (note) => note.tags && note.tags.some((noteTag) => noteTag.id === id)
    );

    // Ordenar notas por data de atualização (mais recente primeiro)
    notesWithTag.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Adicionar notas ao objeto da tag
    const tagWithNotes = {
      ...tag,
      notes: notesWithTag,
    };

    res.json(tagWithNotes);
  } catch (error) {
    console.error("Erro ao buscar etiqueta:", error);
    res.status(500).json({ message: "Erro ao buscar etiqueta", error: error.message });
  }
};

// Criar uma nova etiqueta
const createTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color } = req.body;

    // Validar dados obrigatórios
    if (!name) {
      return res.status(400).json({ message: "Nome da etiqueta é obrigatório" });
    }

    // Verificar se já existe uma etiqueta com o mesmo nome para este usuário
    const existingTags = await storageService.getAllTags(userId);
    const tagExists = existingTags.some((tag) => tag.name.toLowerCase() === name.toLowerCase());

    if (tagExists) {
      return res.status(400).json({ message: "Já existe uma etiqueta com este nome" });
    }

    // Criar a etiqueta usando o serviço de armazenamento
    const newTag = await storageService.createTag({ name, color }, userId);

    res.status(201).json(newTag);
  } catch (error) {
    console.error("Erro ao criar etiqueta:", error);
    res.status(500).json({ message: "Erro ao criar etiqueta", error: error.message });
  }
};

// Atualizar uma etiqueta existente
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, color } = req.body;

    // Verificar se a etiqueta existe e pertence ao usuário
    const existingTag = await storageService.getTagById(id, userId);

    if (!existingTag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    // Verificar se já existe outra etiqueta com o mesmo nome para este usuário
    if (name && name !== existingTag.name) {
      const allTags = await storageService.getAllTags(userId);
      const duplicateTag = allTags.find(
        (tag) => tag.name.toLowerCase() === name.toLowerCase() && tag.id !== id
      );

      if (duplicateTag) {
        return res.status(400).json({ message: "Já existe uma etiqueta com este nome" });
      }
    }

    // Atualizar a etiqueta usando o serviço de armazenamento
    const updateData = {};
    if (name) updateData.name = name;
    if (color) updateData.color = color;

    const updatedTag = await storageService.updateTag(id, updateData, userId);

    res.json(updatedTag);
  } catch (error) {
    console.error("Erro ao atualizar etiqueta:", error);
    res.status(500).json({ message: "Erro ao atualizar etiqueta", error: error.message });
  }
};

// Excluir uma etiqueta
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a etiqueta existe e pertence ao usuário
    const tag = await storageService.getTagById(id, userId);

    if (!tag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    // Buscar todas as notas para remover a etiqueta delas
    const allNotes = await storageService.getAllNotes(userId);
    const notesWithTag = allNotes.filter(
      (note) => note.tags && note.tags.some((noteTag) => noteTag.id === id)
    );

    // Atualizar cada nota para remover a etiqueta
    for (const note of notesWithTag) {
      const updatedTags = note.tags.filter((tag) => tag.id !== id);
      await storageService.updateNote(note.id, { tags: updatedTags }, userId);
    }

    // Excluir a etiqueta usando o serviço de armazenamento
    const deleted = await storageService.deleteTag(id, userId);

    if (!deleted) {
      return res.status(500).json({ message: "Erro ao excluir a etiqueta" });
    }

    res.json({ message: "Etiqueta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir etiqueta:", error);
    res.status(500).json({ message: "Erro ao excluir etiqueta", error: error.message });
  }
};

// Obter notas por etiqueta
const getNotesByTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a etiqueta existe e pertence ao usuário
    const tag = await prisma.tag.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    // Buscar notas com esta etiqueta
    const notes = await prisma.note.findMany({
      where: {
        userId,
        tags: {
          some: {
            id: parseInt(id),
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

    res.json(notes);
  } catch (error) {
    console.error("Erro ao buscar notas por etiqueta:", error);
    res.status(500).json({ message: "Erro ao buscar notas por etiqueta", error: error.message });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getNotesByTag,
};
