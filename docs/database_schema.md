# Esquema do Banco de Dados PostgreSQL

## Visão Geral

O NoteSync utiliza PostgreSQL como banco de dados principal, aproveitando seus recursos avançados como full-text search, JSON nativo e integridade referencial. Este documento descreve o esquema completo do banco de dados, incluindo tabelas, relacionamentos, tipos de dados e índices.

## Diagrama ER

```
+----------------+       +----------------+       +----------------+
|     User       |       |    Notebook    |       |      Note      |
+----------------+       +----------------+       +----------------+
| id             |<----->| id             |<----->| id             |
| name           |       | title          |       | title          |
| email          |       | description    |       | content        |
| password_hash  |       | color          |       | is_pinned      |
| avatar_url     |       | is_archived    |       | is_archived    |
| refresh_token  |       | user_id        |       | notebook_id    |
| google_id      |       | created_at     |       | created_at     |
| created_at     |       | updated_at     |       | updated_at     |
| updated_at     |       +----------------+       +----------------+
+----------------+                                       |
        |                                                |
        |                +----------------+              |
        |                |   NoteVersion  |<-------------+
        |                +----------------+
        |                | id             |
        |                | note_id        |
        |                | content        |
        |                | created_at     |
        |                +----------------+
        |
        |                +----------------+       +----------------+
        |                |      Tag       |       |    NoteTag     |
        +--------------->| id             |<----->| note_id        |
                         | name           |       | tag_id         |
                         | color          |       +----------------+
                         | user_id        |
                         | created_at     |
                         | updated_at     |
                         +----------------+
                                ^
                                |
                         +----------------+
                         |   NotebookTag  |
                         +----------------+
                         | notebook_id    |
                         | tag_id         |
                         +----------------+

                         +----------------+
                         |  DriveSync     |
                         +----------------+
                         | id             |
                         | user_id        |
                         | access_token   |
                         | refresh_token  |
                         | expires_at     |
                         | folder_id      |
                         | last_sync      |
                         | created_at     |
                         | updated_at     |
                         +----------------+
```

## Definição das Tabelas

### User

Armazena informações dos usuários do sistema.

```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  refresh_token TEXT,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_google_id ON "User"(google_id) WHERE google_id IS NOT NULL;
```

### Notebook

Representa os cadernos onde as notas são organizadas.

```sql
CREATE TABLE "Notebook" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#FFFFFF',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notebook_user_id ON "Notebook"(user_id);
CREATE INDEX idx_notebook_is_archived ON "Notebook"(is_archived);
```

### Note

Armazena as notas criadas pelos usuários.

```sql
CREATE TABLE "Note" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) DEFAULT 'Sem título',
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  notebook_id UUID NOT NULL REFERENCES "Notebook"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_note_notebook_id ON "Note"(notebook_id);
CREATE INDEX idx_note_is_archived ON "Note"(is_archived);
CREATE INDEX idx_note_is_pinned ON "Note"(is_pinned);
CREATE INDEX idx_note_created_at ON "Note"(created_at);
CREATE INDEX idx_note_updated_at ON "Note"(updated_at);
```

### NoteVersion

Armazena o histórico de versões das notas.

```sql
CREATE TABLE "NoteVersion" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES "Note"(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_noteversion_note_id ON "NoteVersion"(note_id);
CREATE INDEX idx_noteversion_created_at ON "NoteVersion"(created_at);
```

### Tag

Armazena as etiquetas para categorização de notas e cadernos.

```sql
CREATE TABLE "Tag" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#CCCCCC',
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(name, user_id)
);

CREATE INDEX idx_tag_user_id ON "Tag"(user_id);
```

### NoteTag

Tabela de junção para relacionamento many-to-many entre Note e Tag.

```sql
CREATE TABLE "NoteTag" (
  note_id UUID NOT NULL REFERENCES "Note"(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES "Tag"(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notetag_note_id ON "NoteTag"(note_id);
CREATE INDEX idx_notetag_tag_id ON "NoteTag"(tag_id);
```

### NotebookTag

Tabela de junção para relacionamento many-to-many entre Notebook e Tag.

```sql
CREATE TABLE "NotebookTag" (
  notebook_id UUID NOT NULL REFERENCES "Notebook"(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES "Tag"(id) ON DELETE CASCADE,
  PRIMARY KEY (notebook_id, tag_id)
);

CREATE INDEX idx_notebooktag_notebook_id ON "NotebookTag"(notebook_id);
CREATE INDEX idx_notebooktag_tag_id ON "NotebookTag"(tag_id);
```

### DriveSync

Armazena informações de sincronização com Google Drive.

```sql
CREATE TABLE "DriveSync" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  folder_id VARCHAR(255) NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_drivesync_user_id ON "DriveSync"(user_id);
```

## Índices de Pesquisa Full-Text

Para otimizar a funcionalidade de pesquisa, utilizamos índices GIN com extensão pg_trgm:

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice para pesquisa em título de notas
CREATE INDEX idx_note_title_trgm ON "Note" USING GIN (title gin_trgm_ops);

-- Função para extrair texto do JSONB de conteúdo
CREATE OR REPLACE FUNCTION note_content_to_text(content JSONB) RETURNS TEXT AS $$
DECLARE
  text_content TEXT := '';
BEGIN
  WITH RECURSIVE nodes AS (
    SELECT j.* FROM jsonb_array_elements(content->'content') AS j
    UNION ALL
    SELECT j.* FROM nodes, jsonb_array_elements(nodes->'content') AS j WHERE nodes->'content' IS NOT NULL
  )
  SELECT string_agg(nodes->>'text', ' ') INTO text_content FROM nodes WHERE nodes->>'text' IS NOT NULL;
  
  RETURN text_content;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Índice para pesquisa em conteúdo de notas
CREATE INDEX idx_note_content_trgm ON "Note" USING GIN (note_content_to_text(content) gin_trgm_ops);
```

## Triggers

### Atualização de Timestamps

```sql
-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para User
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para Notebook
CREATE TRIGGER update_notebook_updated_at
BEFORE UPDATE ON "Notebook"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para Note
CREATE TRIGGER update_note_updated_at
BEFORE UPDATE ON "Note"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para Tag
CREATE TRIGGER update_tag_updated_at
BEFORE UPDATE ON "Tag"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para DriveSync
CREATE TRIGGER update_drivesync_updated_at
BEFORE UPDATE ON "DriveSync"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### Versionamento de Notas

```sql
-- Função para criar versão da nota quando o conteúdo é alterado
CREATE OR REPLACE FUNCTION create_note_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO "NoteVersion" (note_id, content) VALUES (NEW.id, OLD.content);
    
    -- Manter apenas as 10 versões mais recentes
    DELETE FROM "NoteVersion"
    WHERE id IN (
      SELECT id FROM "NoteVersion"
      WHERE note_id = NEW.id
      ORDER BY created_at DESC
      OFFSET 10
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para versionamento de notas
CREATE TRIGGER create_note_version_on_update
BEFORE UPDATE ON "Note"
FOR EACH ROW
EXECUTE FUNCTION create_note_version();
```

## Políticas de Segurança

Utilizamos Row-Level Security (RLS) para garantir isolamento de dados entre usuários:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE "Notebook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

-- Política para Notebook
CREATE POLICY notebook_user_isolation ON "Notebook"
FOR ALL
TO authenticated
USING (user_id = current_user_id());

-- Política para Note (via notebook_id)
CREATE POLICY note_user_isolation ON "Note"
FOR ALL
TO authenticated
USING (notebook_id IN (SELECT id FROM "Notebook" WHERE user_id = current_user_id()));

-- Política para Tag
CREATE POLICY tag_user_isolation ON "Tag"
FOR ALL
TO authenticated
USING (user_id = current_user_id());
```

## Considerações de Performance

1. **Particionamento**: Para usuários com grande volume de notas, considerar particionamento da tabela Note por data.

2. **Vacuum e Analyze**: Configurar manutenção regular para otimizar índices e estatísticas.

3. **Monitoramento**: Implementar monitoramento de queries lentas e otimizar conforme necessário.

4. **Caching**: Utilizar Redis para cache de consultas frequentes, especialmente para pesquisas e listagens.

## Estratégia de Backup

1. **Backup Completo**: Diariamente às 2h da manhã.

2. **Backup Incremental**: A cada 6 horas.

3. **Write-Ahead Logs (WAL)**: Configurados para arquivamento contínuo.

4. **Retenção**: 30 dias para backups diários, 7 dias para incrementais.

5. **Teste de Restauração**: Realizado semanalmente em ambiente de staging.