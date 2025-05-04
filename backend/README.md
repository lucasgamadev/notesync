# NoteSync Backend - Armazenamento em JSON

## Visão Geral

Esta versão do backend do NoteSync foi refatorada para utilizar arquivos JSON como sistema de armazenamento em vez de um banco de dados relacional. Esta abordagem facilita a sincronização com o Google Drive e torna o aplicativo mais portátil.

## Estrutura de Armazenamento

Os dados são armazenados em arquivos JSON na pasta `data` do projeto:

- `notes.json` - Armazena todas as notas dos usuários
- `notebooks.json` - Armazena todos os cadernos
- `tags.json` - Armazena todas as etiquetas
- `users.json` - Armazena informações dos usuários

## Funcionalidades Implementadas

- Sistema completo de CRUD para notas, cadernos e etiquetas
- Manutenção da mesma API do backend original, garantindo compatibilidade com o frontend
- Suporte para sincronização com Google Drive
- Geração automática de IDs únicos para novos registros

## Como Executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente (copie o arquivo `.env.example` para `.env` e ajuste conforme necessário)

3. Execute o servidor:

   ```bash
   npm run dev
   ```

## Sincronização com Google Drive

A sincronização com o Google Drive está implementada através do serviço `driveService.js`. Para utilizá-la:

1. Configure as credenciais do Google API no arquivo `.env`
2. Utilize os endpoints de sincronização:
   - `POST /api/sync/drive` - Sincroniza dados com o Google Drive
   - `GET /api/sync/drive/status` - Verifica o status da sincronização
   - `POST /api/sync/drive/import` - Importa dados do Google Drive

## Estrutura de Arquivos

```text
src/
├── controllers/     # Controladores da API
├── middleware/      # Middlewares (autenticação, etc.)
├── routes/          # Rotas da API
├── services/        # Serviços (armazenamento, sincronização)
│   ├── storageService.js    # Gerencia o armazenamento em JSON
│   ├── driveService.js      # Integração com Google Drive
│   └── syncService.js       # Sincronização de dados
└── server.js        # Ponto de entrada da aplicação
```

## Diferenças em Relação ao Banco de Dados

- Não há suporte para consultas complexas ou relacionamentos automáticos
- O versionamento de notas foi simplificado
- A performance pode ser inferior para grandes volumes de dados
- Maior facilidade para backup e portabilidade dos dados

## Próximos Passos

- Implementar sistema de versionamento de notas
- Adicionar compressão de dados para arquivos JSON grandes
- Implementar cache para melhorar performance
- Adicionar suporte para conflitos de sincronização
