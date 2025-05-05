# Esquema de Dados JSON

## Visão Geral

O NoteSync utiliza arquivos JSON como principal método de armazenamento de dados, aproveitando a simplicidade, portabilidade e facilidade de uso deste formato. Este documento descreve a estrutura completa dos arquivos JSON, incluindo entidades, relacionamentos e esquemas.

## Estrutura de Arquivos

```text
/data
├── users/
│   ├── users.json         # Informações de todos os usuários
│   ├── {user_id}/        # Diretório por usuário
│       ├── notebooks.json  # Cadernos do usuário
│       ├── tags.json       # Etiquetas do usuário
│       ├── drivesync.json  # Configurações de sincronização
│       └── notes/          # Diretório para notas
│           ├── {notebook_id}/ # Organizado por caderno
│           │   ├── notes.json        # Metadados das notas
│           │   ├── {note_id}.json    # Conteúdo da nota
│           │   └── versions/         # Histórico de versões
│           │       └── {note_id}_v{timestamp}.json
│           └── note_tags.json  # Relações entre notas e etiquetas
└── backup/               # Backups automáticos
    └── {timestamp}/       # Organizado por data
```

## Definição dos Esquemas

### User

Armazena informações dos usuários do sistema.

```json
// users.json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password_hash": "$2b$10$3TBz...",
    "avatar_url": "https://...",
    "refresh_token": "eyJhbGciOiJIUzI1...",
    "google_id": "12345678901234567890",
    "created_at": "2023-05-15T10:30:00.000Z",
    "updated_at": "2023-06-20T14:25:10.000Z"
  }
]
```

### Notebook

Representa os cadernos onde as notas são organizadas.

```json
// notebooks.json (por usuário)
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Trabalho",
    "description": "Notas relacionadas a projetos profissionais",
    "color": "#4285F4",
    "is_archived": false,
    "created_at": "2023-05-16T08:20:00.000Z",
    "updated_at": "2023-06-10T11:15:30.000Z"
  }
]
```

### Tag

Armazena as etiquetas para categorização de notas e cadernos.

```json
// tags.json (por usuário)
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Importante",
    "color": "#DB4437",
    "created_at": "2023-05-17T09:40:00.000Z",
    "updated_at": "2023-05-17T09:40:00.000Z"
  }
]
```

### Note (Metadados)

Armazena metadados das notas criadas pelos usuários.

```json
// notes.json (por caderno)
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Reunião de Planejamento",
    "is_pinned": true,
    "is_archived": false,
    "created_at": "2023-05-18T14:30:00.000Z",
    "updated_at": "2023-06-12T16:45:20.000Z"
  }
]
```

### Note (Conteúdo)

Armazena o conteúdo completo de uma nota, separado dos metadados para otimizar o carregamento.

```json
// {note_id}.json
{
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Discutir o cronograma do projeto X"
          }
        ]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Definir etapas e prazos"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### NoteVersion

Armazena o histórico de versões das notas.

```json
// {note_id}_v{timestamp}.json
{
  "content": { /* Conteúdo da versão anterior da nota */ },
  "created_at": "2023-06-10T15:20:10.000Z"
}
```

### NoteTag

Armazena as relações entre notas e etiquetas.

```json
// note_tags.json
[
  {
    "note_id": "550e8400-e29b-41d4-a716-446655440003",
    "tag_id": "550e8400-e29b-41d4-a716-446655440002"
  }
]
```

### NotebookTag

Armazena as relações entre cadernos e etiquetas.

```json
// notebook_tags.json
[
  {
    "notebook_id": "550e8400-e29b-41d4-a716-446655440001",
    "tag_id": "550e8400-e29b-41d4-a716-446655440002"
  }
]
```

### DriveSync

Armazena informações de sincronização com Google Drive.

```json
// drivesync.json
{
  "access_token": "ya29.a0AX9GBdWB...",
  "refresh_token": "1//04dPAz6KjQM...",
  "expires_at": "2023-06-25T18:30:45.000Z",
  "folder_id": "1a2b3c4d5e6f7g8h9i",
  "last_sync": "2023-06-24T12:15:30.000Z",
  "created_at": "2023-05-20T10:00:00.000Z",
  "updated_at": "2023-06-24T12:15:30.000Z"
}
```

## Sistema de Índices em Memória

Para otimizar a busca e filtragem de dados, o NoteSync implementa um sistema de indexação em memória:

```javascript
// Exemplo simplificado de implementação
const noteIndex = {
  // Índice por ID
  byId: new Map(),
  
  // Índice por título (para busca textual)
  byTitle: new Map(),
  
  // Índice por conteúdo (para busca full-text)
  byContent: new Map(),
  
  // Índice por caderno
  byNotebook: new Map(),
  
  // Índice por etiqueta
  byTag: new Map(),
  
  // Atualização dos índices
  rebuildIndex() {
    // Lógica para carregar dados dos arquivos JSON e construir os índices
  },
  
  // Busca por termo
  search(term) {
    // Lógica para busca rápida usando os índices em memória
  }
};
```

## Sistema de Versionamento

O NoteSync mantém automaticamente o histórico de versões das notas:

1. Quando uma nota é atualizada, a versão anterior é salva no diretório `versions/`
2. São mantidas até 10 versões por nota, removendo as mais antigas quando o limite é alcançado
3. O nome do arquivo inclui um timestamp para facilitar a ordenação

## Sistema de Backup

O NoteSync implementa um sistema de backup automático:

1. Backups diários incrementais são criados no diretório `backup/`
2. Backups completos são criados semanalmente
3. Backups mais antigos que 30 dias são automaticamente removidos
4. Os backups são compactados para economizar espaço

## Validação de Dados

Para garantir a integridade dos dados, o NoteSync implementa validação rigorosa usando schemas JSON:

```javascript
// Exemplo de schema para validação de uma nota
const noteSchema = {
  type: 'object',
  required: ['id', 'title', 'is_pinned', 'is_archived', 'created_at', 'updated_at'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string', maxLength: 255 },
    is_pinned: { type: 'boolean' },
    is_archived: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
};
```
