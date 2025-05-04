const storageService = require("../services/storageService");

/**
 * Controlador para funcionalidade de pesquisa
 * Implementa pesquisa em arquivos JSON com filtros avançados
 */

// Realizar pesquisa avançada
const search = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, notebookId, tags, dateFrom, dateTo } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Termo de pesquisa é obrigatório" });
    }

    // Buscar todas as notas do usuário
    let notes = await storageService.getAllNotes(userId);

    // Aplicar filtro por caderno se especificado
    if (notebookId) {
      notes = notes.filter((note) => note.notebookId === notebookId);
    }

    // Aplicar filtro por data se especificado
    if (dateFrom || dateTo) {
      notes = notes.filter((note) => {
        const updatedAt = new Date(note.updatedAt);
        if (dateFrom && new Date(dateFrom) > updatedAt) {
          return false;
        }
        if (dateTo && new Date(dateTo) < updatedAt) {
          return false;
        }
        return true;
      });
    }

    // Aplicar filtro por tags se especificado
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      notes = notes.filter(
        (note) => note.tags && note.tags.some((tag) => tagArray.includes(tag.name))
      );
    }

    // Realizar pesquisa no título e conteúdo
    const queryLower = query.toLowerCase();
    notes = notes.filter((note) => {
      return (
        (note.title && note.title.toLowerCase().includes(queryLower)) ||
        (note.content && note.content.toLowerCase().includes(queryLower))
      );
    });

    // Ordenar por data de atualização (mais recente primeiro)
    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Adicionar destaque ao resultado da pesquisa
    const highlightedResults = notes.map((note) => {
      // Extrair um trecho do conteúdo que contém o termo de pesquisa
      let contentPreview = note.content || "";
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
        contentPreview
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

    // Buscar todas as notas e tags do usuário
    const notes = await storageService.getAllNotes(userId);
    const tags = await storageService.getAllTags(userId);

    const queryLower = query.toLowerCase();

    // Filtrar títulos de notas que correspondam ao termo de pesquisa
    const noteTitles = notes
      .filter((note) => note.title && note.title.toLowerCase().includes(queryLower))
      .map((note) => ({ title: note.title }))
      .slice(0, 5);

    // Filtrar nomes de etiquetas que correspondam ao termo de pesquisa
    const tagNames = tags
      .filter((tag) => tag.name && tag.name.toLowerCase().includes(queryLower))
      .map((tag) => ({ name: tag.name }))
      .slice(0, 5);

    // Combinar resultados
    const suggestions = [
      ...noteTitles.map((note) => ({ type: "note", text: note.title })),
      ...tagNames.map((tag) => ({ type: "tag", text: tag.name }))
    ];

    // Ordenar por relevância (começando com o termo de pesquisa)
    suggestions.sort((a, b) => {
      const aStartsWith = a.text.toLowerCase().startsWith(queryLower) ? 0 : 1;
      const bStartsWith = b.text.toLowerCase().startsWith(queryLower) ? 0 : 1;

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
  getSuggestions
};
