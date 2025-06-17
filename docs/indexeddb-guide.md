# Guia do IndexedDB

## Visão Geral

Este documento descreve a implementação e o uso do IndexedDB no projeto NoteSync. O IndexedDB é um sistema de banco de dados NoSQL baseado em JavaScript para armazenar grandes quantidades de dados estruturados no navegador do usuário.

## Por que IndexedDB?

- **Armazenamento local** - Permite que o aplicativo funcione offline
- **Alta capacidade** - Suporta muito mais dados do que localStorage
- **Consulta eficiente** - Suporte a índices para buscas rápidas
- **Transacional** - Garante a integridade dos dados
- **Assíncrono** - Não bloqueia a thread principal da interface do usuário

## Estrutura do Banco de Dados

### Stores Principais

1. **notes**
   - Armazena todas as notas do usuário
   - Índices: id, userId, createdAt, updatedAt, isPinned, isArchived, tags

2. **notebooks**
   - Armazena os cadernos do usuário
   - Índices: id, userId, title, createdAt, updatedAt

3. **tags**
   - Armazena as etiquetas do usuário
   - Índices: id, userId, name

4. **syncQueue**
   - Fila de sincronização para operações offline
   - Índices: id, type, status, createdAt

## Como Usar

### Inicialização

O banco de dados é inicializado automaticamente quando o aplicativo é carregado:

```typescript
import { db } from '@/services/database';
```

### Serviço de Notas

O serviço `noteService` fornece uma API amigável para gerenciar notas:

```typescript
import { noteService } from '@/services/noteService';

// Criar uma nota
const novaNota = await noteService.createNote({
  title: 'Título da Nota',
  content: 'Conteúdo da nota...',
  userId: 'user-123'
});

// Buscar todas as notas
const notas = await noteService.getAllNotes('user-123');

// Atualizar uma nota
await noteService.updateNote(1, {
  title: 'Novo Título',
  content: 'Conteúdo atualizado...'
});

// Excluir uma nota
await noteService.deleteNote(1);
```

### Hooks Personalizados

Use os hooks personalizados para acessar o IndexedDB em componentes React:

```typescript
import { useNotesDB } from '@/hooks/useIndexedDB';

function MinhasNotas() {
  const { 
    notes, 
    isLoading, 
    addNote, 
    updateNote, 
    deleteNote 
  } = useNotesDB();

  // ... use as funções e estados conforme necessário
}
```

## Fluxo de Sincronização

1. **Modo Offline**
   - Todas as operações são salvas no IndexedDB
   - As operações são enfileiradas na syncQueue
   - O status de sincronização é atualizado

2. **Modo Online**
   - As operações em fila são sincronizadas com o servidor
   - Os dados são atualizados no IndexedDB
   - Os conflitos são resolvidos com base no timestamp

## Boas Práticas

### 1. Tratamento de Erros

```typescript
try {
  await noteService.createNote(/* ... */);
} catch (error) {
  console.error('Erro ao criar nota:', error);
  // Mostrar feedback ao usuário
}
```

### 2. Otimização de Desempenho

- Use índices para consultas frequentes
- Limite a quantidade de dados carregados por vez
- Use transações para operações em lote

### 3. Gerenciamento de Estado

- Atualize a interface do usuário após operações assíncronas
- Use estados de carregamento para feedback visual

## Migração de Dados

Para migrar dados existentes (ex: do localStorage):

```typescript
// Exemplo de migração do localStorage para IndexedDB
const notasAntigas = JSON.parse(localStorage.getItem('notas') || '[]');

for (const nota of notasAntigas) {
  await noteService.createNote({
    title: nota.titulo,
    content: nota.conteudo,
    userId: 'usuario-atual',
    // outros campos necessários
  });
}

// Limpar dados antigos
localStorage.removeItem('notas');
```

## Solução de Problemas Comuns

### Erro: "Database not initialized"

- Verifique se o banco de dados foi aberto corretamente
- Certifique-se de que o usuário está autenticado

### Desempenho Lento

- Verifique se há índices adequados para suas consultas
- Considere limitar a quantidade de dados carregados por vez

### Dados Não Sincronizados

- Verifique a conexão com a internet
- Verifique a fila de sincronização para erros

## Recursos Adicionais

- [MDN Web Docs: Usando IndexedDB](https://developer.mozilla.org/pt-BR/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Documentação do IDB (wrapper do IndexedDB)](https://github.com/jakearchibald/idb)
- [Guia de Melhores Práticas do IndexedDB](https://web.dev/indexeddb-best-practices/)

## Considerações de Segurança

- O IndexedDB está sujeito às políticas de mesma origem
- Dados sensíveis devem ser criptografados antes do armazenamento
- Implemente limpeza de dados ao fazer logout

## Limitações

- Limites de armazenamento variam por navegador (geralmente 50-80% do espaço livre em disco)
- Acesso síncrono não está disponível em workers
- Pode ser desabilitado pelo usuário no modo de navegação privada

## Próximos Passos

- [ ] Implementar criptografia de ponta a ponta
- [ ] Adicionar suporte a anexos
- [ ] Melhorar o tratamento de conflitos de sincronização
- [ ] Adicionar métricas de uso do armazenamento

---

Última atualização: 17/06/2024
