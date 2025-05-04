const storageService = require("../services/storageService");

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

    // Buscar cadernos usando o serviço de armazenamento
    const notebooks = await storageService.getAllNotebooks(userId);

    // Para cada caderno, contar quantas notas estão associadas a ele
    const notes = await storageService.getAllNotes(userId);

    const notebooksWithCount = notebooks.map((notebook) => {
      const noteCount = notes.filter((note) => note.notebookId === notebook.id).length;
      return {
        ...notebook,
        _count: {
          notes: noteCount
        }
      };
    });

    res.json(notebooksWithCount);
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

    // Buscar caderno usando o serviço de armazenamento
    const notebook = await storageService.getNotebookById(id, userId);

    if (!notebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    // Buscar notas associadas a este caderno
    const notes = await storageService.getAllNotes(userId, { notebookId: id });

    // Adicionar notas ao objeto do caderno
    const notebookWithNotes = {
      ...notebook,
      notes
    };

    res.json(notebookWithNotes);
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

    // Criar o caderno usando o serviço de armazenamento
    const notebook = await storageService.createNotebook(
      {
        title,
        description: description || ""
      },
      userId
    );

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
    const existingNotebook = await storageService.getNotebookById(id, userId);

    if (!existingNotebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    // Preparar dados para atualização
    const updateData = {
      title,
      description
    };

    // Atualiza o caderno usando o serviço de armazenamento
    const notebook = await storageService.updateNotebook(id, updateData, userId);

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
    const notebook = await storageService.getNotebookById(id, userId);

    if (!notebook) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    // Verificar se o caderno tem notas associadas
    const notes = await storageService.getAllNotes(userId, { notebookId: id });

    if (notes.length > 0) {
      return res.status(400).json({
        message: "O caderno contém notas e não pode ser excluído. Exclua ou mova as notas primeiro"
      });
    }

    // Excluir o caderno usando o serviço de armazenamento
    const deleted = await storageService.deleteNotebook(id, userId);

    if (!deleted) {
      return res.status(500).json({ message: "Erro ao excluir o caderno" });
    }

    res.json({ message: "Caderno removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover caderno:", error);
    res.status(500).json({ message: "Erro ao remover caderno" });
  }
};
