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
    const userId = req.user.id;
    const { title, content, notebookId, tags } = req.body;

    // Validar dados obrigatórios
    if (!title || !content) {
      return res.status(400).json({ message: "Título e conteúdo são obrigatórios" });
    }

    // Verificar se o caderno existe e pertence ao usuário
    if (notebookId) {
      const notebook = await prisma.notebook.findUnique({
        where: {
          id: parseInt(notebookId),
          userId,
        },
      });

      if (!notebook) {
        return res.status(404).json({ message: "Caderno não encontrado" });
      }
    }

    // Criar a nota
    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        user: {
          connect: { id: userId },
        },
        notebook: notebookId
          ? {
              connect: { id: parseInt(notebookId) },
            }
          : undefined,
        // Criar versão inicial
        versions: {
          create: {
            content,
            userId,
          },
        },
      },
      include: {
        notebook: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Adicionar tags se fornecidas
    if (tags && tags.length > 0) {
      // Processar cada tag
      for (const tagName of tags) {
        // Verificar se a tag já existe
        let tag = await prisma.tag.findFirst({
          where: {
            name: tagName,
            userId,
          },
        });

        // Criar a tag se não existir
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId,
            },
          });
        }

        // Conectar a tag à nota
        await prisma.note.update({
          where: { id: newNote.id },
          data: {
            tags: {
              connect: { id: tag.id },
            },
          },
        });
      }

      // Buscar a nota atualizada com as tags
      const noteWithTags = await prisma.note.findUnique({
        where: { id: newNote.id },
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

      return res.status(201).json(noteWithTags);
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
    const userId = req.user.id;
    const { title, content, notebookId, tags } = req.body;

    // Verificar se a nota existe e pertence ao usuário
    const existingNote = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        tags: true,
      },
    });

    if (!existingNote) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // Verificar se o conteúdo foi alterado para criar uma nova versão
    const contentChanged = content && content !== existingNote.content;

    // Verificar se o caderno existe e pertence ao usuário
    if (notebookId) {
      const notebook = await prisma.notebook.findUnique({
        where: {
          id: parseInt(notebookId),
          userId,
        },
      });

      if (!notebook) {
        return res.status(404).json({ message: "Caderno não encontrado" });
      }
    }

    // Atualizar a nota
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (notebookId) {
      updateData.notebook = {
        connect: { id: parseInt(notebookId) },
      };
    }

    // Criar uma nova versão se o conteúdo foi alterado
    if (contentChanged) {
      updateData.versions = {
        create: {
          content,
          userId,
        },
      };
    }

    // Atualizar a nota
    let updatedNote = await prisma.note.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        notebook: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Atualizar tags se fornecidas
    if (tags) {
      // Desconectar todas as tags existentes
      await prisma.note.update({
        where: { id: parseInt(id) },
        data: {
          tags: {
            disconnect: existingNote.tags.map((tag) => ({ id: tag.id })),
          },
        },
      });

      // Adicionar novas tags
      for (const tagName of tags) {
        // Verificar se a tag já existe
        let tag = await prisma.tag.findFirst({
          where: {
            name: tagName,
            userId,
          },
        });

        // Criar a tag se não existir
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId,
            },
          });
        }

        // Conectar a tag à nota
        await prisma.note.update({
          where: { id: parseInt(id) },
          data: {
            tags: {
              connect: { id: tag.id },
            },
          },
        });
      }
    }

    // Buscar a nota atualizada com as tags
    updatedNote = await prisma.note.findUnique({
      where: { id: parseInt(id) },
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

    // Verificar se a nota existe e pertence ao usuário
    const note = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // Excluir todas as versões da nota
    await prisma.noteVersion.deleteMany({
      where: { noteId: parseInt(id) },
    });

    // Excluir a nota
    await prisma.note.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Nota excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir nota:", error);
    res.status(500).json({ message: "Erro ao excluir nota", error: error.message });
  }
};

// Obter versões anteriores de uma nota
const getNoteVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a nota existe e pertence ao usuário
    const note = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // Buscar todas as versões da nota
    const versions = await prisma.noteVersion.findMany({
      where: { noteId: parseInt(id) },
      orderBy: { createdAt: "desc" },
    });

    res.json(versions);
  } catch (error) {
    console.error("Erro ao buscar versões da nota:", error);
    res.status(500).json({ message: "Erro ao buscar versões da nota", error: error.message });
  }
};

// Restaurar uma versão anterior
const restoreNoteVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const userId = req.user.id;

    // Verificar se a nota existe e pertence ao usuário
    const note = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    // Buscar a versão específica
    const version = await prisma.noteVersion.findUnique({
      where: {
        id: parseInt(versionId),
        noteId: parseInt(id),
      },
    });

    if (!version) {
      return res.status(404).json({ message: "Versão não encontrada" });
    }

    // Criar uma nova versão com o conteúdo atual antes de restaurar
    await prisma.noteVersion.create({
      data: {
        content: note.content,
        noteId: parseInt(id),
        userId,
      },
    });

    // Atualizar a nota com o conteúdo da versão selecionada
    const updatedNote = await prisma.note.update({
      where: { id: parseInt(id) },
      data: { content: version.content },
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

    res.json(updatedNote);
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
