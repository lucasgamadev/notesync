# NoteSync - Sistema Web de Notas com Sincronização Google Drive

## Descrição do Projeto

O NoteSync é um sistema web moderno para criação e gerenciamento de notas organizadas por cadernos, oferecendo uma experiência intuitiva e eficiente para usuários que precisam manter suas anotações organizadas e acessíveis em qualquer dispositivo através da sincronização com o Google Drive.

## Funcionalidades Principais

- **Organização por Cadernos**: Crie e gerencie múltiplos cadernos para diferentes temas ou projetos
- **Notas Ricas**: Editor com suporte a formatação de texto, listas, imagens e anexos
- **Etiquetas e Categorias**: Organize suas notas com etiquetas personalizáveis
- **Sincronização com Google Drive**: Mantenha suas notas seguras e acessíveis em qualquer dispositivo
- **Modo Offline**: Acesse e edite suas notas mesmo sem conexão com a internet
- **Pesquisa Avançada**: Encontre rapidamente suas notas com busca por texto, etiquetas ou cadernos
- **Interface Responsiva**: Experiência consistente em dispositivos desktop e móveis

## Tecnologias Utilizadas

### Arquitetura

- **Microserviços**: Arquitetura baseada em serviços independentes para autenticação, cadernos, notas, etiquetas, pesquisa e sincronização
- Para detalhes completos, consulte o [diagrama de arquitetura](./docs/architecture.md)

### Frontend

- **Next.js 14**: Framework React com renderização híbrida para melhor performance e SEO
- **TypeScript**: Tipagem estática para código mais seguro e manutenível
- **Tailwind CSS**: Framework CSS utilitário para design responsivo e customizável
- **TipTap**: Editor de texto rico baseado em ProseMirror
- **Zustand**: Gerenciamento de estado global simplificado
- **React Query**: Gerenciamento de estado do servidor e cache
- **Axios**: Cliente HTTP para requisições à API

### Backend

- **Node.js**: Ambiente de execução JavaScript do lado do servidor
- **Express.js**: Framework web minimalista e flexível para Node.js
- **fs-extra**: Extensão do fs para manipulação de arquivos JSON
- **JWT**: Autenticação baseada em tokens
- **Google Drive API**: Integração para sincronização de dados
- **Zod**: Validação de dados e schemas
- **Winston**: Sistema de logging estruturado

### Armazenamento de Dados

- **Arquivos JSON**: Armazenamento simples e portátil em formato JSON
- **Redis**: Cache distribuído para melhorar a performance
- **LocalStorage**: Cache local para suporte offline no frontend

### DevOps

- **Docker**: Containerização para ambiente de desenvolvimento consistente
- **GitHub Actions**: CI/CD para automação de testes e deploy
- **Vercel/Netlify**: Hospedagem do frontend
- **Railway/Render**: Hospedagem do backend

## Documentação Técnica

- [Arquitetura Técnica](./docs/architecture.md): Diagrama e detalhes da arquitetura de microserviços
- [Esquema de Dados](./docs/data_schema.md): Estrutura dos arquivos JSON e relacionamentos
- [Workflow de Desenvolvimento](./docs/WORKFLOW.md): Processo de desenvolvimento completo
- [Workflow Frontend](./docs/WORKFLOW-FRONTEND.md): Detalhes específicos do desenvolvimento frontend
- [Mock API](./docs/MOCK_API_README.md): Sistema para desenvolvimento frontend independente
- [Requisitos](./docs/requirements.md): User stories e critérios de aceitação

## Como Iniciar o Desenvolvimento

### Pré-requisitos

- Node.js (v18 ou superior)
- Docker e Docker Compose
- Conta no Google Cloud Platform (para API do Google Drive)
- Redis (opcional, para ambiente de desenvolvimento completo)

### Passos Iniciais

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/notesync.git
cd notesync
```

2. Instale as dependências do backend:

```bash
cd backend
npm install
```

3. Instale as dependências do frontend:

```bash
cd ../frontend
npm install
```

4. Configure as variáveis de ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Inicie os serviços com Docker:

```bash
docker-compose up -d
```

6. Inicialize os arquivos JSON para armazenamento de dados:

```bash
cd backend
npm run init-data
```

7. Inicie o servidor de desenvolvimento do backend:

```bash
npm run dev
```

8. Inicie o servidor de desenvolvimento do frontend:

```bash
cd ../frontend
npm run dev
```

9. Acesse a aplicação em `http://localhost:3000`

### Desenvolvimento Frontend Independente

O NoteSync suporta desenvolvimento frontend sem necessidade do backend, utilizando um sistema de Mock API. Para detalhes, consulte [MOCK_API_README.md](./docs/MOCK_API_README.md).

## Estrutura de Diretórios

```text
notesync/
├── backend/                # Servidor Node.js/Express
│   ├── data/              # Diretório para arquivos JSON
│   ├── src/
│   │   ├── api/           # API Gateway
│   │   ├── services/      # Microserviços
│   │   │   ├── auth/      # Serviço de autenticação
│   │   │   ├── notebooks/ # Serviço de cadernos
│   │   │   ├── notes/     # Serviço de notas
│   │   │   ├── tags/      # Serviço de etiquetas
│   │   │   ├── search/    # Serviço de pesquisa
│   │   │   └── sync/      # Serviço de sincronização
│   │   ├── middlewares/   # Middlewares Express
│   │   ├── models/        # Modelos de dados
│   │   ├── utils/         # Utilitários
│   │   └── app.js         # Configuração do Express
│   ├── .env               # Variáveis de ambiente
│   └── package.json       # Dependências do backend
│
├── frontend/              # Aplicação Next.js
│   ├── public/            # Arquivos estáticos
│   ├── src/
│   │   ├── app/           # Rotas e páginas (App Router)
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── lib/            # Bibliotecas e utilitários
│   │   ├── services/       # Serviços de API
│   │   ├── utils/          # Utilitários
│   │   │   └── mockApi.ts  # Sistema de Mock API
│   │   ├── store/          # Estado global (Zustand)
│   │   └── styles/         # Estilos globais
│   ├── .env                # Variáveis de ambiente
│   └── package.json        # Dependências do frontend
│
├── docs/                  # Documentação técnica
├── docker-compose.yml     # Configuração do Docker
└── README.md              # Documentação do projeto
```

## Contribuição

Contribuições são bem-vindas! Por favor, siga estes passos para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
