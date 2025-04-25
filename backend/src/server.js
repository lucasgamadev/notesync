const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// Rotas base
app.get("/", (req, res) => {
  res.json({ message: "API NoteSync funcionando!" });
});

// Importação das rotas (serão implementadas posteriormente)
// const authRoutes = require('./routes/authRoutes');
// const notebookRoutes = require('./routes/notebookRoutes');
// const noteRoutes = require('./routes/noteRoutes');
// const tagRoutes = require('./routes/tagRoutes');
// const searchRoutes = require('./routes/searchRoutes');
// const userRoutes = require('./routes/userRoutes');

// Configuração das rotas
// app.use('/api/auth', authRoutes);
// app.use('/api/notebooks', notebookRoutes);
// app.use('/api/notes', noteRoutes);
// app.use('/api/tags', tagRoutes);
// app.use('/api/search', searchRoutes);
// app.use('/api/users', userRoutes);

// Rota para tratamento de 404
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// Inicializa o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; // Exporta para testes
