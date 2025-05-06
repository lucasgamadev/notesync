const express = require("express");
const expressValidator = require("express-validator");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const storageService = require("./services/storageService");
const loggerService = require("./services/loggerService");
const loggingMiddleware = require("./middleware/loggingMiddleware");

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o app Express
const app = express();

// Configuração do CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Configuração do Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100 // limite de 100 requisições por windowMs
});

// Rate limit específico para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5, // limite de 5 tentativas por hora
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet()); // Headers de segurança
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" })); // Limita o tamanho do payload
app.use(express.urlencoded({ extended: true }));
app.use(limiter); // Rate limiting global
app.use(loggingMiddleware); // Logging de requisições HTTP

// Inicializa o sistema de armazenamento JSON
storageService.initStorage().catch((err) => {
  loggerService.error("Falha ao inicializar o sistema de armazenamento", { error: err.message });
  process.exit(1);
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
app.use("/api/auth", authLimiter); // Rate limiting específico para auth
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

// Middleware para tratamento de erros - movido para depois das rotas
app.use((err, req, res, next) => {
  loggerService.error("Erro interno do servidor", { error: err.message, stack: err.stack });
  res.status(500).json({
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Inicializa o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  loggerService.info(`Servidor rodando na porta ${PORT} com armazenamento JSON`);
  console.log(`Servidor rodando na porta ${PORT} com armazenamento JSON`);
});

module.exports = app; // Exporta para testes
