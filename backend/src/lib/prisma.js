// Arquivo de configuração do Prisma Client
const { PrismaClient } = require("@prisma/client");

/**
 * Instância global do Prisma Client para ser utilizada em toda a aplicação
 * Evita múltiplas conexões com o banco de dados durante o desenvolvimento
 */
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

module.exports = prisma;
