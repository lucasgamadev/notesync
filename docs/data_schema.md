# Esquema de Dados JSON

## Visu00e3o Geral

O NoteSync utiliza arquivos JSON como principal mu00e9todo de armazenamento de dados, aproveitando a simplicidade, portabilidade e facilidade de uso deste formato. Este documento descreve a estrutura completa dos arquivos JSON, incluindo entidades, relacionamentos e esquemas.

## Estrutura de Arquivos

```text
/data
u251cu2500u2500 users/
u2502   u251cu2500u2500 users.json         # Informau00e7u00f5es de todos os usuu00e1rios
u2502   u251cu2500u2500 {user_id}/        # Diretu00f3rio por usuu00e1rio
u2502       u251cu2500u2500 notebooks.json  # Cadernos do usuu00e1rio
u2502       u251cu2500u2500 tags.json       # Etiquetas do usuu00e1rio
u2502       u251cu2500u2500 drivesync.json  # Configurau00e7u00f5es de sincronizau00e7u00e3o
u2502       u2514u2500u2500 notes/          # Diretu00f3rio para notas
u2502           u251cu2500u2500 {notebook_id}/ # Organizado por caderno
u2502           u2502   u251cu2500u2500 notes.json        # Metadados das notas
u2502           u2502   u251cu2500u2500 {note_id}.json    # Conteu00fado da nota
u2502           u2502   u2514u2500u2500 versions/         # Histu00f3rico de versu00f5es
u2502           u2502       u2514u2500u2500 {note_id}_v{timestamp}.json
u2502           u2514u2500u2500 note_tags.json  # Relau00e7u00f5es entre notas e etiquetas
u2514u2500u2500 backup/               # Backups automu00e1ticos
    u2514u2500u2500 {timestamp}/       # Organizado por data
```

## Definiu00e7u00e3o dos Esquemas

### User

Armazena informau00e7u00f5es dos usuu00e1rios do sistema.

```json
// users.json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jou00e3o Silva",
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

Representa os cadernos onde as notas su00e3o organizadas.

```json
// notebooks.json (por usuu00e1rio)
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

Armazena as etiquetas para categorizau00e7u00e3o de notas e cadernos.

```json
// tags.json (por usuu00e1rio)
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

Armazena metadados das notas criadas pelos usuu00e1rios.

```json
// notes.json (por caderno)
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Reuniu00e3o de Planejamento",
    "is_pinned": true,
    "is_archived": false,
    "created_at": "2023-05-18T14:30:00.000Z",
    "updated_at": "2023-06-12T16:45:20.000Z"
  }
]
```

### Note (Conteu00fado)

Armazena o conteu00fado completo de uma nota, separado dos metadados para otimizar o carregamento.

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

Armazena o histu00f3rico de versu00f5es das notas.

```json
// {note_id}_v{timestamp}.json
{
  "content": { /* Conteu00fado da versu00e3o anterior da nota */ },
  "created_at": "2023-06-10T15:20:10.000Z"
}
```

### NoteTag

Armazena as relau00e7u00f5es entre notas e etiquetas.

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

Armazena as relau00e7u00f5es entre cadernos e etiquetas.

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

Armazena informau00e7u00f5es de sincronizau00e7u00e3o com Google Drive.

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

## Sistema de u00cdndices em Memu00f3ria

Para otimizar a busca e filtragem de dados, o NoteSync implementa um sistema de indexau00e7u00e3o em memu00f3ria:

```javascript
// Exemplo simplificado de implementau00e7u00e3o
const noteIndex = {
  // u00cdndice por ID
  byId: new Map(),
  
  // u00cdndice por tu00edtulo (para busca textual)
  byTitle: new Map(),
  
  // u00cdndice por conteu00fado (para busca full-text)
  byContent: new Map(),
  
  // u00cdndice por caderno
  byNotebook: new Map(),
  
  // u00cdndice por etiqueta
  byTag: new Map(),
  
  // Atualizau00e7u00e3o dos u00edndices
  rebuildIndex() {
    // Lu00f3gica para carregar dados dos arquivos JSON e construir os u00edndices
  },
  
  // Busca por termo
  search(term) {
    // Lu00f3gica para busca ru00e1pida usando os u00edndices em memu00f3ria
  }
};
```

## Sistema de Versionamento

O NoteSync mantu00e9m automaticamente o histu00f3rico de versu00f5es das notas:

1. Quando uma nota u00e9 atualizada, a versu00e3o anterior u00e9 salva no diretu00f3rio `versions/`
2. Su00e3o mantidas atu00e9 10 versu00f5es por nota, removendo as mais antigas quando o limite u00e9 alcanu00e7ado
3. O nome do arquivo inclui um timestamp para facilitar a ordenau00e7u00e3o

## Sistema de Backup

O NoteSync implementa um sistema de backup automu00e1tico:

1. Backups diu00e1rios incrementais su00e3o criados no diretu00f3rio `backup/`
2. Backups completos su00e3o criados semanalmente
3. Backups mais antigos que 30 dias su00e3o automaticamente removidos
4. Os backups su00e3o compactados para economizar espau00e7o

## Validau00e7u00e3o de Dados

Para garantir a integridade dos dados, o NoteSync implementa validau00e7u00e3o rigorosa usando schemas JSON:

```javascript
// Exemplo de schema para validau00e7u00e3o de uma nota
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
