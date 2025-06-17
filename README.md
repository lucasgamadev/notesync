# NoteSync - Sistema Web de Notas com Sincronização em Nuvem

## Descrição do Projeto

O NoteSync é um sistema web moderno para criação e gerenciamento de notas organizadas por cadernos, oferecendo uma experiência intuitiva e eficiente para usuários que precisam manter suas anotações organizadas e acessíveis em qualquer dispositivo, mesmo offline.

## Funcionalidades Principais

- **Organização por Cadernos**: Crie e gerencie múltiplos cadernos para diferentes temas ou projetos
- **Notas Ricas**: Editor com suporte a formatação de texto, listas, imagens e anexos
- **Etiquetas e Categorias**: Organize suas notas com etiquetas personalizáveis
- **Sincronização em Nuvem**: Mantenha suas notas seguras e acessíveis em qualquer dispositivo
- **Modo Offline**: Acesse e edite suas notas mesmo sem conexão com a internet
- **Pesquisa Avançada**: Encontre rapidamente suas notas com busca por texto, etiquetas ou cadernos
- **Desempenho Otimizado**: Carregamento rápido e experiência fluida mesmo com muitas notas
- **Sincronização Bidirecional**: Alterações feitas offline são sincronizadas automaticamente

## Tecnologias Utilizadas

### Frontend

- **Next.js 14**: Framework React com renderização híbrida para melhor performance e SEO
- **TypeScript**: Tipagem estática para código mais seguro e manutenível
- **Tailwind CSS**: Framework CSS utilitário para design responsivo e customizável
- **TipTap**: Editor de texto rico baseado em ProseMirror
- **Zustand**: Gerenciamento de estado global simplificado
- **React Query**: Gerenciamento de estado do servidor e cache
- **IndexedDB**: Armazenamento local para suporte offline avançado

### Backend

- **Node.js**: Ambiente de execução JavaScript do lado do servidor
- **Express.js**: Framework web minimalista e flexível para Node.js
- **fs-extra**: Extensão do fs para manipulação de arquivos JSON
- **JWT**: Autenticação baseada em tokens
- **Google Drive API**: Integração para sincronização de dados
- **Zod**: Validação de dados e schemas
- **Winston**: Sistema de logging estruturado

### Armazenamento de Dados

- **IndexedDB**: Armazenamento local no navegador para suporte offline avançado
- **Arquivos JSON**: Armazenamento simples e portátil em formato JSON
- **Redis**: Cache distribuído para melhorar a performance

### DevOps

- **Docker**: Containerização para ambiente de desenvolvimento consistente
- **GitHub Actions**: CI/CD para automação de testes e deploy
- **Vercel/Netlify**: Hospedagem do frontend
- **Railway/Render**: Hospedagem do backend

## Documentação Técnica

- [Arquitetura Técnica](./docs/architecture.md): Diagrama e detalhes da arquitetura de microserviços
- [Esquema de Dados](./docs/data_schema.md): Estrutura dos dados e relacionamentos
- [Guia do IndexedDB](./docs/indexeddb-guide.md): Documentação detalhada sobre o armazenamento local
- [Workflow de Desenvolvimento](./docs/WORKFLOW.md): Processo de desenvolvimento completo
- [Workflow Frontend](./docs/WORKFLOW-FRONTEND.md): Detalhes específicos do desenvolvimento frontend
- [Requisitos](./docs/requirements.md): User stories e critérios de aceitação

## Como Iniciar o Desenvolvimento

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Docker e Docker Compose (opcional, para ambiente de desenvolvimento completo)
- Conta no Google Cloud Platform (para API do Google Drive)
- Redis (opcional, para cache distribuído)

### Configuração Inicial

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/notesync.git
cd notesync
```

2. **Configure o ambiente de desenvolvimento:**

```bash
# Instale as dependências do backend
cd backend
npm install

# Instale as dependências do frontend
cd ../frontend
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Backend
PORT=3001
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_aqui

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_google_client_id
```

4. **Inicie os serviços:**

```bash
# Em um terminal, inicie o backend
cd backend
npm run dev

# Em outro terminal, inicie o frontend
cd ../frontend
npm run dev
```

Acesse o aplicativo em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```text
notesync/
├── backend/               # Código-fonte do backend
│   ├── src/
│   │   ├── controllers/    # Controladores das rotas da API
│   │   ├── middleware/     # Middlewares do Express
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Definição das rotas da API
│   │   ├── services/       # Lógica de negócios
│   │   └── utils/          # Utilitários e helpers
│   └── package.json
│
├── frontend/              # Código-fonte do frontend
│   ├── public/             # Arquivos estáticos
│   └── src/
│       ├── components/     # Componentes React reutilizáveis
│       ├── hooks/          # Hooks personalizados
│       ├── pages/          # Páginas da aplicação
│       ├── services/       # Serviços da aplicação
│       ├── stores/         # Gerenciamento de estado global
│       └── styles/         # Estilos globais
│
├── docs/                  # Documentação do projeto
├── docker-compose.yml      # Configuração do Docker Compose
└── README.md               # Este arquivo
```

## Contribuição

Contribuições são bem-vindas! Siga estes passos para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
