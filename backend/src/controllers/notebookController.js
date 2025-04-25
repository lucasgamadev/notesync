const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controlador de cadernos
 * Gerencia operações CRUD para cadernos
 */

/**
 * Lista todos os cadernos do usuário
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.getAllNotebooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const notebooks = await prisma.notebook.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    res.json(notebooks);
  } catch (error) {
    console.error("Erro ao buscar cadernos:", error);
    res.status(500).json({ message: "Erro ao buscar cadernos" });
  }
};

/**
 * Busca um caderno específico pelo ID
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.getNotebookById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        notes: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            updatedAt: true,
            createdAt: true,
            tags: true,
          },
        },
      },
    });

    if (!notebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    res.json(notebook);
  } catch (error) {
    console.error("Erro ao buscar caderno:", error);
    res.status(500).json({ message: "Erro ao buscar caderno" });
  }
};

/**
 * Cria um novo caderno
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.createNotebook = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    // Validação básica
    if (!title) {
      return res.status(400).json({ message: "O título é obrigatório" });
    }

    const notebook = await prisma.notebook.create({
      data: {
        title,
        description,
        userId,
      },
    });

    res.status(201).json(notebook);
  } catch (error) {
    console.error("Erro ao criar caderno:", error);
    res.status(500).json({ message: "Erro ao criar caderno" });
  }
};

/**
 * Atualiza um caderno existente
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.updateNotebook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    // Validação básica
    if (!title) {
      return res.status(400).json({ message: "O título é obrigatório" });
    }

    // Verifica se o caderno existe e pertence ao usuário
    const existingNotebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNotebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    // Atualiza o caderno
    const notebook = await prisma.notebook.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    res.json(notebook);
  } catch (error) {
    console.error("Erro ao atualizar caderno:", error);
    res.status(500).json({ message: "Erro ao atualizar caderno" });
  }
};

/**
 * Remove um caderno
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.deleteNotebook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verifica se o caderno existe e pertence ao usuário
    const existingNotebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNotebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    // Remove o caderno
    await prisma.notebook.delete({
      where: { id },
    });

    res.json({ message: "Caderno removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover caderno:", error);
    res.status(500).json({ message: "Erro ao remover caderno" });
  }
};
