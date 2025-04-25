const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controlador para gerenciamento de etiquetas (tags)
 * Implementa operações CRUD e relações many-to-many com notas
 */

// Listar todas as etiquetas do usuário
const getAllTags = async (req, res) => {
  try {
    const userId = req.user.id;

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Formatar a resposta para incluir a contagem de notas
    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      noteCount: tag._count.notes,
    }));

    res.json(formattedTags);
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

    const tag = await prisma.tag.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        notes: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
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
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    res.json(tag);
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
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existingTag) {
      return res.status(400).json({ message: "Já existe uma etiqueta com este nome" });
    }

    // Criar a etiqueta
    const newTag = await prisma.tag.create({
      data: {
        name,
        color,
        user: {
          connect: { id: userId },
        },
      },
    });

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
    const existingTag = await prisma.tag.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingTag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    // Verificar se já existe outra etiqueta com o mesmo nome para este usuário
    if (name && name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          name,
          userId,
          id: { not: parseInt(id) },
        },
      });

      if (duplicateTag) {
        return res.status(400).json({ message: "Já existe uma etiqueta com este nome" });
      }
    }

    // Atualizar a etiqueta
    const updateData = {};
    if (name) updateData.name = name;
    if (color) updateData.color = color;

    const updatedTag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

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
    const tag = await prisma.tag.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Etiqueta não encontrada" });
    }

    // Desconectar a etiqueta de todas as notas antes de excluí-la
    await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        notes: {
          set: [],
        },
      },
    });

    // Excluir a etiqueta
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

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
