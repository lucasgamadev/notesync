FROM node:20-alpine AS base

# Configuração do ambiente base
WORKDIR /app

# Etapa de instalação de dependências
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Etapa de build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa de produção
FROM base AS runner
ENV NODE_ENV production

# Copia os arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]