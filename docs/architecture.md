# Arquitetura Técnica do NoteSync

## Visão Geral

O NoteSync é uma aplicação de notas com sincronização em nuvem, construída com uma arquitetura moderna de microserviços. A aplicação utiliza Next.js para o frontend e Node.js/Express para o backend, com PostgreSQL como banco de dados principal e integração com Google Drive para sincronização.

## Diagrama de Arquitetura

```
+------------------+         +------------------+         +------------------+
|                  |         |                  |         |                  |
|    Cliente Web   |<------->|  API Gateway    |<------->|  Serviço de      |
|    (Next.js)     |         |  (Express)      |         |  Autenticação    |
|                  |         |                  |         |                  |
+------------------+         +------------------+         +------------------+
                                     ^                            ^
                                     |                            |
                                     v                            v
+------------------+         +------------------+         +------------------+
|                  |         |                  |         |                  |
|  Serviço de      |<------->|  Serviço de     |<------->|  Serviço de     |
|  Cadernos        |         |  Notas          |         |  Etiquetas       |
|                  |         |                  |         |                  |
+------------------+         +------------------+         +------------------+
                                     ^                            ^
                                     |                            |
                                     v                            v
+------------------+         +------------------+         +------------------+
|                  |         |                  |         |                  |
|  Serviço de      |<------->|  Banco de Dados |<------->|  Serviço de     |
|  Sincronização   |         |  (PostgreSQL)   |         |  Pesquisa        |
|                  |         |                  |         |                  |
+------------------+         +------------------+         +------------------+
        ^                                                        ^
        |                                                        |
        v                                                        v
+------------------+                                    +------------------+
|                  |                                    |                  |
|  Google Drive    |                                    |  Cache           |
|  API             |                                    |  (Redis)         |
|                  |                                    |                  |
+------------------+                                    +------------------+
```

## Componentes Principais

### Frontend (Next.js)

- **Arquitetura**: Aplicação React com Next.js utilizando App Router
- **Estado**: Gerenciamento de estado com Zustand
- **UI**: Componentes estilizados com Tailwind CSS
- **Editor**: TipTap para edição rich text
- **Requisições**: Axios com React Query para gerenciamento de cache e estado de requisições
- **Autenticação**: JWT com armazenamento em cookies HttpOnly

### Backend (Express)

- **API Gateway**: Roteamento e middleware central
- **Microserviços**: Serviços independentes para autenticação, cadernos, notas, etiquetas, pesquisa e sincronização
- **ORM**: Prisma para acesso ao banco de dados
- **Autenticação**: JWT com refresh tokens
- **Validação**: Zod para validação de dados
- **Logging**: Winston para logs estruturados

### Banco de Dados (PostgreSQL)

- **Modelagem**: Esquema relacional com suporte a JSON para conteúdo de notas
- **Pesquisa**: Full-text search com índices GIN e extensão pg_trgm
- **Segurança**: Row-Level Security (RLS) para isolamento de dados

### Sincronização (Google Drive)

- **Autenticação**: OAuth 2.0 para acesso à API do Google Drive
- **Estratégia**: Sincronização bidirecional com detecção de conflitos
- **Formato**: Armazenamento de notas em formato JSON estruturado

### Cache (Redis)

- **Uso**: Cache de consultas frequentes e sessões
- **Invalidação**: Estratégia de invalidação baseada em eventos

## Padrões de API

### RESTful API

A API segue os princípios RESTful com os seguintes endpoints principais:

```
/api/auth       - Autenticação e gerenciamento de usuários
/api/notebooks  - CRUD de cadernos
/api/notes      - CRUD de notas
/api/tags       - CRUD de etiquetas
/api/search     - Pesquisa em notas e cadernos
/api/sync       - Sincronização com Google Drive
```

### Formato de Resposta

Todas as respostas seguem um formato padronizado:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Em caso de erro:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "O recurso solicitado não foi encontrado"
  }
}
```

### Autenticação

A autenticação é realizada via JWT com o seguinte fluxo:

1. Cliente envia credenciais para `/api/auth/login`
2. Servidor valida e retorna `access_token` e `refresh_token`
3. Cliente envia `access_token` no header `Authorization: Bearer {token}`
4. Quando o `access_token` expira, cliente usa `refresh_token` para obter novo token

### Paginação

Endpoints que retornam listas suportam paginação com os seguintes parâmetros:

```
?page=1       - Página atual (default: 1)
?limit=20     - Itens por página (default: 20, max: 100)
?sort=title   - Campo para ordenação
?order=asc    - Direção da ordenação (asc/desc)
```

### Filtros

Endpoints suportam filtros via query params:

```
?search=termo         - Pesquisa por termo
?tag=tag1,tag2        - Filtro por etiquetas
?archived=true        - Incluir itens arquivados
?from=2023-01-01      - Data inicial
?to=2023-12-31        - Data final
```

## Comunicação entre Camadas

### Frontend → Backend

- **Protocolo**: HTTPS
- **Formato**: JSON via REST API
- **Autenticação**: JWT em header Authorization

### Serviço → Serviço

- **Protocolo**: HTTP interno ou gRPC para comunicações críticas
- **Formato**: JSON ou Protocol Buffers
- **Autenticação**: Tokens de serviço

### Backend → Banco de Dados

- **Protocolo**: TCP/IP via Prisma Client
- **Segurança**: Conexão TLS e credenciais seguras
- **Pooling**: Pool de conexões gerenciado

## Estratégia de Cache

### Níveis de Cache

1. **Cache de Aplicação (Frontend)**
   - React Query para cache de requisições
   - Zustand para estado local
   - Service Worker para assets estáticos

2. **Cache de API (Backend)**
   - Redis para cache de respostas frequentes
   - TTL variável por tipo de recurso
   - Invalidação baseada em eventos

3. **Cache de Banco de Dados**
   - Índices otimizados
   - Consultas materializadas para relatórios
   - PgBouncer para pooling de conexões

### Políticas de Invalidação

- **Time-based**: Expiração automática após TTL
- **Write-through**: Atualização do cache em operações de escrita
- **Event-based**: Invalidação baseada em eventos de domínio

## Otimização de Performance

### Frontend

1. **Code Splitting**: Carregamento sob demanda de componentes
2. **Lazy Loading**: Imagens e componentes carregados conforme necessário
3. **Prefetching**: Pré-carregamento de rotas prováveis
4. **Memoização**: Uso de React.memo e useMemo para componentes pesados

### Backend

1. **Compressão**: gzip/brotli para respostas HTTP
2. **Pooling**: Reutilização de conexões com banco de dados
3. **Batching**: Agrupamento de operações relacionadas
4. **Rate Limiting**: Proteção contra abuso de API

### Banco de Dados

1. **Índices**: Otimizados para padrões de acesso comuns
2. **Particionamento**: Para tabelas grandes (notas)
3. **Vacuum**: Manutenção regular para otimização
4. **Explain Analyze**: Monitoramento de queries lentas

## Segurança

### Autenticação e Autorização

- JWT com rotação de tokens
- Refresh tokens com invalidação em logout
- Controle de acesso baseado em funções (RBAC)
- Proteção contra CSRF com tokens

### Proteção de Dados

- Criptografia em trânsito (HTTPS)
- Senhas com hash bcrypt e salt
- Row-Level Security no PostgreSQL
- Sanitização de inputs contra XSS e injeção SQL

### Headers de Segurança

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY

## Escalabilidade

### Horizontal

- Arquitetura stateless para facilitar replicação
- Load balancing com health checks
- Sessões compartilhadas via Redis

### Vertical

- Otimização de recursos por container
- Monitoramento de uso de CPU/memória
- Ajuste automático de recursos

### Banco de Dados

- Read replicas para consultas
- Sharding para distribuição de carga
- Connection pooling com PgBouncer

## Monitoramento e Observabilidade

### Métricas

- Prometheus para coleta de métricas
- Grafana para visualização
- Alertas baseados em thresholds

### Logs

- Winston para logs estruturados
- Formato JSON para facilitar análise
- Agregação centralizada

### Tracing

- OpenTelemetry para tracing distribuído
- Visualização de latência entre serviços
- Identificação de gargalos

## Estratégia de Deploy

### CI/CD

- GitHub Actions para automação
- Testes automatizados em PRs
- Deploy automático para ambientes

### Ambientes

- Desenvolvimento: Local com Docker Compose
- Staging: Réplica de produção para testes
- Produção: Infraestrutura escalável

### Feature Flags

- Controle de lançamento gradual
- Testes A/B
- Rollback rápido se necessário

## Considerações Futuras

1. **Migração para Kubernetes**: Para melhor orquestração de containers
2. **GraphQL**: Para consultas mais flexíveis e eficientes
3. **WebSockets**: Para atualizações em tempo real
4. **Machine Learning**: Para sugestões inteligentes e categorização automática
5. **Edge Computing**: Para melhor performance global