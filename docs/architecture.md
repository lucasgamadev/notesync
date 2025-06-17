# Arquitetura Técnica do NoteSync

## Visão Geral

O NoteSync é uma aplicação de notas com sincronização em nuvem, construída com uma arquitetura moderna de microserviços. A aplicação utiliza Next.js para o frontend e Node.js/Express para o backend, com armazenamento em arquivos JSON e integração com Google Drive para sincronização.

## Diagrama de Arquitetura

```text
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
|  Serviço de      |<------->|  Armazenamento  |<------->|  Serviço de     |
|  Sincronização   |         |  (Arquivos JSON)|         |  Pesquisa        |
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
- **Acesso a Dados**: fs-extra para manipulação de arquivos JSON
- **Autenticação**: JWT com refresh tokens
- **Validação**: Zod para validação de dados
- **Logging**: Winston para logs estruturados

### Armazenamento de Dados (Arquivos JSON)

- **Modelagem**: Estrutura de dados em formato JSON para notas e cadernos
- **Pesquisa**: Busca em memória com indexação para melhor performance
- **Segurança**: Controle de acesso baseado em usuário para isolamento de dados

### Sincronização (Google Drive)

- **Autenticação**: OAuth 2.0 para acesso à API do Google Drive
- **Estratégia**: Sincronização bidirecional com detecção de conflitos
- **Formato**: Armazenamento de notas em formato JSON estruturado

### Armazenamento Local (IndexedDB)

- **Uso**: Armazenamento local para suporte offline avançado e melhoria de desempenho
- **Estrutura**:
  - `notes`: Armazena todas as notas do usuário
  - `notebooks`: Armazena os cadernos do usuário
  - `tags`: Armazena as etiquetas do usuário
  - `syncQueue`: Fila de operações para sincronização quando online
- **Sincronização**: Estratégia de sincronização baseada em timestamps e detecção de conflitos
- **Vantagens**:
  - Suporte a grandes volumes de dados
  - Consultas indexadas para melhor desempenho
  - Transações atômicas para garantir a integridade dos dados

## Padrões de API

### RESTful API

A API segue os princípios RESTful com os seguintes endpoints principais:

```text
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

```text
?page=1       - Página atual (default: 1)
?limit=20     - Itens por página (default: 20, max: 100)
?sort=title   - Campo para ordenação
?order=asc    - Direção da ordenação (asc/desc)
```

### Filtros

Endpoints suportam filtros via query params:

```text
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

- **Protocolo**: HTTP interno para comunicações entre serviços
- **Formato**: JSON para troca de dados
- **Autenticação**: Tokens de serviço

### Backend → Armazenamento de Dados

- **Protocolo**: Acesso direto via fs-extra
- **Segurança**: Permissões de arquivo e controle de acesso
- **Estrutura**: Organização hierárquica de arquivos JSON

## Estratégia de Cache

### Níveis de Cache

1. **Cache de Aplicação (Frontend)**
   - React Query para cache de requisições
   - Zustand para estado local
   - Service Worker para assets estáticos

2. **Cache de API (Backend)**
   - Cache em memória para respostas frequentes
   - TTL variável por tipo de recurso
   - Invalidação baseada em eventos

3. **Cache de Armazenamento**
   - Índices em memória para busca rápida
   - Estruturas otimizadas para consultas frequentes
   - Carregamento seletivo de dados

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

### Armazenamento de Dados

1. **Indexação**: Índices em memória para busca rápida
2. **Organização**: Estrutura hierárquica de arquivos por usuário/caderno
3. **Compressão**: Otimização do tamanho dos arquivos JSON
4. **Monitoramento**: Análise de performance de leitura/escrita

## Segurança

### Autenticação e Autorização

- JWT com rotação de tokens
- Refresh tokens com invalidação em logout
- Controle de acesso baseado em funções (RBAC)
- Proteção contra CSRF com tokens

### Proteção de Dados

- Criptografia em trânsito (HTTPS)
- Senhas com hash bcrypt e salt
- Controle de acesso baseado em usuário para arquivos
- Sanitização de inputs contra XSS e injeção de código

### Headers de Segurança

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY

## Escalabilidade

### Horizontal

- Arquitetura stateless para facilitar replicação
- Load balancing com health checks
- Sessões gerenciadas via JWT

### Vertical

- Otimização de recursos por container
- Monitoramento de uso de CPU/memória
- Ajuste automático de recursos

### Armazenamento de Dados

- Replicação de arquivos para redundância
- Distribuição por usuário para melhor performance
- Estratégias de backup automático

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
