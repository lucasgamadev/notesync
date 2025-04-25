FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências
RUN npm ci

# Gera o cliente Prisma
RUN npx prisma generate

# Copia o código fonte
COPY . .

# Expõe a porta da aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["npm", "start"]