const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const storageService = require("./services/storageService");

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializa o sistema de armazenamento JSON
storageService.initStorage().catch((err) => {
  console.error("Falha ao inicializar o sistema de armazenamento:", err);
  process.exit(1);
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Rotas base
app.get("/", (req, res) => {
  res.json({ message: "API NoteSync funcionando!" });
});

// Importação das rotas
const authRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const googleSignInRoutes = require("./routes/googleSignInRoutes");
const notebookRoutes = require("./routes/notebookRoutes");
const noteRoutes = require("./routes/noteRoutes");
const tagRoutes = require("./routes/tagRoutes");
const searchRoutes = require("./routes/searchRoutes");
const syncRoutes = require("./routes/syncRoutes");
// const userRoutes = require('./routes/userRoutes');

// Configuração das rotas
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/auth", googleSignInRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/sync", syncRoutes);
// app.use('/api/users', userRoutes);

// Rota para tratamento de 404
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// Inicializa o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} com armazenamento JSON`);
});

module.exports = app; // Exporta para testes
