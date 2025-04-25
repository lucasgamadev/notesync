const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controlador para funcionalidade de pesquisa
 * Implementa full-text search no PostgreSQL com filtros avançados
 */

// Realizar pesquisa avançada
const search = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, notebookId, tags, dateFrom, dateTo } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Termo de pesquisa é obrigatório" });
    }

    // Construir filtro base
    let filter = { userId };

    // Adicionar filtro por caderno se especificado
    if (notebookId) {
      filter.notebookId = parseInt(notebookId);
    }

    // Adicionar filtro por data se especificado
    if (dateFrom || dateTo) {
      filter.updatedAt = {};

      if (dateFrom) {
        filter.updatedAt.gte = new Date(dateFrom);
      }

      if (dateTo) {
        filter.updatedAt.lte = new Date(dateTo);
      }
    }

    // Construir filtro para tags
    let tagFilter = {};
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      tagFilter = {
        tags: {
          some: {
            name: {
              in: tagArray,
            },
          },
        },
      };
    }

    // Realizar pesquisa full-text
    const notes = await prisma.note.findMany({
      where: {
        ...filter,
        ...tagFilter,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
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

    // Adicionar destaque ao resultado da pesquisa
    const highlightedResults = notes.map((note) => {
      // Extrair um trecho do conteúdo que contém o termo de pesquisa
      let contentPreview = note.content;
      const queryLower = query.toLowerCase();
      const contentLower = contentPreview.toLowerCase();

      // Encontrar a posição do termo de pesquisa no conteúdo
      const queryIndex = contentLower.indexOf(queryLower);

      // Se o termo for encontrado, extrair um trecho ao redor dele
      if (queryIndex !== -1) {
        // Determinar o início e fim do trecho
        const previewStart = Math.max(0, queryIndex - 50);
        const previewEnd = Math.min(contentPreview.length, queryIndex + query.length + 50);

        // Extrair o trecho
        contentPreview = contentPreview.substring(previewStart, previewEnd);

        // Adicionar reticências se o trecho não começar no início ou não terminar no fim
        if (previewStart > 0) {
          contentPreview = "..." + contentPreview;
        }

        if (previewEnd < note.content.length) {
          contentPreview += "...";
        }
      } else {
        // Se o termo não for encontrado no conteúdo (pode estar no título),
        // extrair apenas o início do conteúdo
        contentPreview =
          contentPreview.substring(0, 100) + (contentPreview.length > 100 ? "..." : "");
      }

      return {
        ...note,
        contentPreview,
      };
    });

    res.json(highlightedResults);
  } catch (error) {
    console.error("Erro ao realizar pesquisa:", error);
    res.status(500).json({ message: "Erro ao realizar pesquisa", error: error.message });
  }
};

// Obter sugestões de pesquisa
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Buscar títulos de notas que correspondam ao termo de pesquisa
    const noteTitles = await prisma.note.findMany({
      where: {
        userId,
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        title: true,
      },
      distinct: ["title"],
      take: 5,
    });

    // Buscar nomes de etiquetas que correspondam ao termo de pesquisa
    const tagNames = await prisma.tag.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
      take: 5,
    });

    // Combinar resultados
    const suggestions = [
      ...noteTitles.map((note) => ({ type: "note", text: note.title })),
      ...tagNames.map((tag) => ({ type: "tag", text: tag.name })),
    ];

    // Ordenar por relevância (começando com o termo de pesquisa)
    suggestions.sort((a, b) => {
      const aStartsWith = a.text.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      const bStartsWith = b.text.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;

      if (aStartsWith !== bStartsWith) {
        return aStartsWith - bStartsWith;
      }

      return a.text.localeCompare(b.text);
    });

    res.json(suggestions.slice(0, 10)); // Limitar a 10 sugestões
  } catch (error) {
    console.error("Erro ao obter sugestões de pesquisa:", error);
    res.status(500).json({ message: "Erro ao obter sugestões de pesquisa", error: error.message });
  }
};

module.exports = {
  search,
  getSuggestions,
};
