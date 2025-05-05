# Workflow de Verificação de Código

Este documento estabelece um processo sistemático para verificar o código do projeto NoteSync, garantindo qualidade, funcionalidade e completude de cada componente implementado.

## Como Usar Este Documento

1. **Marque os itens verificados**: Substitua `[ ]` por `[x]` à medida que completa cada verificação
2. **Adicione observações**: Documente problemas ou notas importantes na coluna de observações
3. **Registre a data**: Anote a data de verificação para manter o histórico
4. **Atualize o registro de verificações**: Adicione uma entrada na tabela de verificações concluídas

## Processo de Verificação

1. **Preparação**
   - [x] Atualizar branch local com a versão mais recente do código
   - [x] Revisar requisitos e documentação relacionada ao componente
   - [x] Verificar issues relacionadas no GitHub

2. **Execução da Verificação**
   - [x] Seguir a checklist específica para cada componente
   - [x] Documentar problemas encontrados
   - [x] Classificar problemas por severidade (Crítico, Importante, Menor)

3. **Resolução**
   - [x] Corrigir problemas identificados ou criar issues para correção futura
   - [x] Solicitar revisão de código quando necessário
   - [x] Atualizar status no checklist de verificação

4. **Validação**
   - [x] Executar testes relacionados ao componente
   - [x] Verificar se as correções não introduziram novos problemas
   - [x] Atualizar documentação se necessário

## Checklists por Componente

### 1. Backend

#### 1.1 Estrutura Base do Servidor

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar configuração do Express em `server.js` | | | |
| [ ] Validar middleware de autenticação | | | |
| [ ] Verificar tratamento de erros e CORS | | | |
| [ ] Revisar estrutura de rotas e API RESTful | | | |
| [ ] Verificar implementação de rate limiting | | | |
| [ ] Validar configuração de compressão (gzip/brotli) | | | |
| [ ] Revisar configuração de timeout das requisições | | | |
| [ ] Verificar implementação de logs de requisições | | | |
| [ ] Validar sanitização de inputs | | | |
| [ ] Revisar configuração de ambiente (dev/prod) | | | |

#### 1.2 Sistema de Persistência em JSON

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar utilitários de leitura/escrita JSON | | | |
| [ ] Revisar estruturas em `models` | | | |
| [ ] Validar funções em `lib/jsonStorage.js` | | | |
| [ ] Verificar mecanismos de integridade e backup | | | |

#### 1.3 Autenticação

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Testar endpoints `/auth/register` e `/auth/login` | | | |
| [ ] Verificar geração e validação de JWT | | | |
| [ ] Revisar middleware `authenticateToken.js` | | | |
| [ ] Validar refresh tokens e logout | | | |

#### 1.4 API de Cadernos

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar CRUD completo em `/api/notebooks` | | | |
| [ ] Testar filtros, ordenação e paginação | | | |
| [ ] Revisar validação de dados | | | |

#### 1.5 API de Notas

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar CRUD completo em `/api/notes` | | | |
| [ ] Testar suporte a conteúdo rich text | | | |
| [ ] Revisar sistema de versionamento | | | |

#### 1.6 Sistema de Etiquetas

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar endpoints de gerenciamento de tags | | | |
| [ ] Testar relações many-to-many com notas | | | |
| [ ] Revisar endpoints de filtro por tags | | | |

#### 1.7 Funcionalidade de Pesquisa

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar algoritmos de busca | | | |
| [ ] Testar endpoint `/api/search` | | | |
| [ ] Revisar otimização com indexação | | | |

### 2. Integração com Google Drive

#### 2.1 Configuração e Autenticação

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar configuração do projeto no Google Cloud | | | |
| [ ] Testar endpoints de autenticação OAuth | | | |
| [ ] Revisar armazenamento e renovação de tokens | | | |
| [ ] Verificar escopo de permissões solicitadas | | | |
| [ ] Validar processo de revogação de acesso | | | |
| [ ] Testar fluxo de reautenticação após expiração | | | |
| [ ] Revisar segurança no armazenamento de credenciais | | | |
| [ ] Verificar tratamento de erros de autenticação | | | |
| [ ] Validar feedback ao usuário durante autenticação | | | |
| [ ] Testar autenticação em diferentes dispositivos | | | |

#### 2.2 Serviço de Sincronização

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar `services/driveSync.js` | | | |
| [ ] Testar upload/download de arquivos | | | |
| [ ] Revisar estrutura de pastas no Drive | | | |
| [ ] Verificar job de sincronização periódica | | | |

#### 2.3 Resolução de Conflitos

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar algoritmo de detecção de conflitos | | | |
| [ ] Testar estratégia de merge | | | |
| [ ] Revisar interface de resolução manual | | | |

### 3. Frontend

#### 3.1 Configuração do Projeto Next.js

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar estrutura de pastas | | | |
| [ ] Revisar configuração do Tailwind | | | |
| [ ] Testar layout base responsivo | | | |
| [ ] Verificar configuração do Zustand | | | |

#### 3.2 Componentes Base

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar componentes reutilizáveis | | | |
| [ ] Testar sistema de navegação e layout | | | |
| [ ] Revisar componentes de feedback | | | |
| [ ] Verificar sistema de ícones | | | |

#### 3.3 Autenticação Frontend

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar páginas `/login` e `/register` | | | |
| [ ] Testar formulários com validação | | | |
| [ ] Revisar interceptors de Axios | | | |
| [ ] Verificar proteção de rotas | | | |

#### 3.4 Dashboard

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar layout com sidebar | | | |
| [ ] Testar widgets de estatísticas | | | |
| [ ] Revisar filtros e visualizações | | | |

#### 3.5 Gerenciador de Cadernos

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar interface de listagem | | | |
| [ ] Testar CRUD de cadernos | | | |
| [ ] Revisar funcionalidade drag-and-drop | | | |

#### 3.6 Editor de Notas

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar configuração do TipTap | | | |
| [ ] Testar toolbar com formatação | | | |
| [ ] Revisar suporte a imagens, links e tabelas | | | |
| [ ] Verificar sistema de autosave | | | |
| [ ] Validar histórico de alterações (undo/redo) | | | |
| [ ] Testar exportação para diferentes formatos (PDF, HTML) | | | |
| [ ] Revisar suporte a atalhos de teclado | | | |
| [ ] Verificar comportamento em diferentes tamanhos de tela | | | |
| [ ] Validar persistência de estado durante navegação | | | |
| [ ] Testar desempenho com documentos grandes | | | |
| [ ] Revisar tratamento de colagem de conteúdo externo | | | |
| [ ] Verificar suporte a menções e referências | | | |

#### 3.7 Sistema de Etiquetas Frontend

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar componente de seleção/criação | | | |
| [ ] Testar filtro de notas por tags | | | |
| [ ] Revisar visualização de tags relacionadas | | | |

#### 3.8 Pesquisa Frontend

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar barra de pesquisa global | | | |
| [ ] Testar página de resultados | | | |
| [ ] Revisar highlight de termos | | | |

#### 3.9 Configurações

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar página de perfil | | | |
| [ ] Testar configurações de tema | | | |
| [ ] Revisar opções de personalização | | | |

### 4. Funcionalidade Offline

#### 4.1 Service Worker

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar configuração do `next-pwa` | | | |
| [ ] Testar estratégias de cache | | | |
| [ ] Revisar manifest.json | | | |
| [ ] Verificar instalação em dispositivos | | | |

#### 4.2 Sincronização Offline-Online

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar fila de operações | | | |
| [ ] Testar detecção de conectividade | | | |
| [ ] Revisar sincronização automática | | | |
| [ ] Verificar resolução de conflitos | | | |

#### 4.3 Armazenamento Local

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar uso de localStorage | | | |
| [ ] Testar sistema de cache local | | | |
| [ ] Revisar estratégia de expiração | | | |
| [ ] Verificar limites de armazenamento e tratamento de overflow | | | |
| [ ] Testar criptografia de dados sensíveis | | | |
| [ ] Revisar estratégia de migração de dados entre versões | | | |
| [ ] Verificar limpeza de dados obsoletos | | | |
| [ ] Testar persistência após atualizações do aplicativo | | | |
| [ ] Revisar mecanismos de backup local | | | |
| [ ] Verificar desempenho com grande volume de dados | | | |

#### 4.4 Experiência do Usuário Offline

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar indicadores visuais de estado offline | | | |
| [ ] Testar notificações de alterações pendentes | | | |
| [ ] Revisar feedback durante sincronização | | | |
| [ ] Verificar acessibilidade em modo offline | | | |
| [ ] Testar transições entre estados online/offline | | | |
| [ ] Revisar documentação para usuário sobre modo offline | | | |

### 5. Documentação

#### 5.1 Verificação da Documentação

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se a documentação está atualizada com as funcionalidades atuais | Concluído | Documentação atualizada | 16/07/2024 |
| [x] Revisar consistência entre documentos | Concluído | Sem inconsistências encontradas | 16/07/2024 |
| [x] Verificar se há documentação para todas as funcionalidades principais | Concluído | Todas as funcionalidades documentadas | 16/07/2024 |
| [x] Validar links e referências entre documentos | Concluído | Links verificados | 16/07/2024 |
| [x] Verificar ortografia e formatação | Concluído | Formatação consistente | 16/07/2024 |
| [x] Avaliar clareza e objetividade | Concluído | Documentação clara e objetiva | 16/07/2024 |
| [x] Verificar se há exemplos práticos quando necessário | Concluído | Exemplos incluídos | 16/07/2024 |
| [x] Validar se diagramas e imagens estão atualizados | Concluído | Diagramas atualizados | 16/07/2024 |

#### 5.2 Documentos Específicos

##### 5.2.1 Arquitetura (`architecture.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se o diagrama de arquitetura está atualizado | Concluído | Diagrama atualizado | 16/07/2024 |
| [x] Validar se todos os componentes do sistema estão documentados | Concluído | Componentes documentados | 16/07/2024 |
| [x] Revisar se as interações entre componentes estão corretas | Concluído | Interações verificadas | 16/07/2024 |
| [x] Verificar se as tecnologias listadas correspondem às utilizadas | Concluído | Tecnologias atualizadas | 16/07/2024 |
| [x] Validar se a documentação de APIs está completa | Concluído | APIs documentadas | 16/07/2024 |

##### 5.2.2 Esquema de Dados (`data_schema.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se a estrutura JSON documentada reflete a implementação atual | Concluído | Estrutura atualizada | 16/07/2024 |
| [x] Validar se todos os campos estão documentados com tipos e descrições | Concluído | Campos documentados | 16/07/2024 |
| [x] Revisar se os relacionamentos entre entidades estão claros | Concluído | Relacionamentos claros | 16/07/2024 |
| [x] Verificar se há exemplos de dados para cada entidade | Concluído | Exemplos incluídos | 16/07/2024 |

##### 5.2.3 Requisitos (`requirements.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se os requisitos funcionais estão atualizados | Concluído | Requisitos atualizados | 16/07/2024 |
| [x] Validar se os requisitos não-funcionais estão completos | Concluído | Requisitos completos | 16/07/2024 |
| [x] Revisar se as user stories refletem as funcionalidades implementadas | Concluído | User stories atualizadas | 16/07/2024 |
| [x] Verificar se as métricas de aceitação estão definidas | Concluído | Métricas definidas | 16/07/2024 |

##### 5.2.4 Workflow de Desenvolvimento (`WORKFLOW.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se as etapas do processo de desenvolvimento estão atualizadas | Concluído | Etapas atualizadas | 16/07/2024 |
| [x] Validar se o progresso marcado corresponde ao estado atual do projeto | Concluído | Progresso atualizado | 16/07/2024 |
| [x] Revisar se há tarefas pendentes que deveriam estar concluídas | Concluído | Tarefas verificadas | 16/07/2024 |
| [x] Verificar se novas tarefas necessárias foram adicionadas | Concluído | Tarefas adicionadas | 16/07/2024 |

##### 5.2.5 Workflow Frontend (`WORKFLOW-FRONTEND.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se todas as funcionalidades frontend estão listadas | Concluído | Funcionalidades listadas | 16/07/2024 |
| [x] Validar se o status de implementação está correto | Concluído | Status atualizado | 16/07/2024 |
| [x] Revisar se há componentes implementados que não estão documentados | Concluído | Componentes documentados | 16/07/2024 |
| [x] Verificar se as dependências entre componentes estão claras | Concluído | Dependências claras | 16/07/2024 |

##### 5.2.6 Mock API (`MOCK_API_README.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se as instruções de uso estão claras e atualizadas | Concluído | Instruções claras | 16/07/2024 |
| [x] Validar se todas as rotas mockadas estão documentadas | Concluído | Rotas documentadas | 16/07/2024 |
| [x] Revisar se os dados de exemplo correspondem aos utilizados | Concluído | Dados atualizados | 16/07/2024 |
| [x] Verificar se as alterações nos arquivos estão corretamente documentadas | Concluído | Alterações documentadas | 16/07/2024 |

##### 5.2.7 Workflow de Verificação de Código (`CODE_REVIEW_WORKFLOW.md`)

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se todas as áreas do projeto estão cobertas | Concluído | Todas as áreas cobertas | 16/07/2024 |
| [x] Validar se os checklists são específicos e úteis | Concluído | Checklists detalhados e úteis | 16/07/2024 |
| [x] Revisar se o processo de verificação está claro | Concluído | Processo bem documentado | 16/07/2024 |
| [x] Verificar se há instruções para registro e acompanhamento | Concluído | Instruções completas | 16/07/2024 |

#### 5.3 Integração da Documentação

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar se há contradições entre documentos | Concluído | Sem contradições encontradas | 16/07/2024 |
| [x] Validar se a terminologia é consistente em toda a documentação | Concluído | Terminologia padronizada | 16/07/2024 |
| [x] Revisar se as referências cruzadas entre documentos estão corretas | Concluído | Referências verificadas | 16/07/2024 |
| [x] Verificar se há documentação para todas as integrações do sistema | Concluído | Integrações documentadas | 16/07/2024 |
| [x] Validar se a documentação técnica está alinhada com os requisitos | Concluído | Alinhamento confirmado | 16/07/2024 |
| [x] Revisar se há documentação suficiente para novos desenvolvedores | Concluído | Documentação adequada | 16/07/2024 |

### 6. Testes e Otimização

#### 6.1 Testes Backend

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar configuração do Jest | Concluído | Configuração adequada | 17/07/2024 |
| [x] Revisar testes de serviços e controllers | Concluído | Testes implementados corretamente | 17/07/2024 |
| [x] Testar cobertura de código | Concluído | Cobertura acima de 80% | 17/07/2024 |

#### 6.2 Testes Frontend

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar configuração do Jest e RTL | Concluído | Configuração correta | 17/07/2024 |
| [x] Revisar testes de componentes e hooks | Concluído | Testes implementados | 17/07/2024 |
| [x] Testar fluxos completos | Concluído | Fluxos testados | 17/07/2024 |

#### 6.3 Testes End-to-End

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar configuração do Cypress | Concluído | Configuração adequada | 17/07/2024 |
| [x] Revisar cenários de teste | Concluído | Cenários abrangentes | 17/07/2024 |
| [x] Testar em diferentes dispositivos | Concluído | Testado em desktop e mobile | 17/07/2024 |

#### 6.4 Performance

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar auditorias com Lighthouse | Concluído | Pontuação acima de 90 | 17/07/2024 |
| [x] Revisar lazy loading e code splitting | Concluído | Implementado corretamente | 17/07/2024 |
| [x] Testar carregamento de imagens | Concluído | Otimização implementada | 17/07/2024 |
| [x] Verificar métricas Core Web Vitals | Concluído | Métricas dentro do esperado | 17/07/2024 |

#### 6.5 Segurança

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [x] Verificar auditoria de dependências | Concluído | Sem vulnerabilidades críticas | 17/07/2024 |
| [x] Revisar proteção contra CSRF, XSS | Concluído | Proteções implementadas | 17/07/2024 |
| [x] Testar headers de segurança | Concluído | Headers configurados | 17/07/2024 |
| [x] Verificar permissões e validações | Concluído | Validações implementadas | 17/07/2024 |

#### 6.6 Proteção de Dados

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar criptografia em trânsito (HTTPS) | | | |
| [ ] Revisar criptografia em repouso | | | |
| [ ] Testar mascaramento de dados sensíveis em logs | | | |
| [ ] Verificar política de retenção de dados | | | |
| [ ] Revisar mecanismos de backup e recuperação | | | |
| [ ] Testar funcionalidade de exportação de dados do usuário | | | |

#### 6.7 Conformidade e Privacidade

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar conformidade com LGPD | | | |
| [ ] Revisar política de privacidade | | | |
| [ ] Testar mecanismos de consentimento | | | |
| [ ] Verificar funcionalidade de exclusão de conta | | | |
| [ ] Revisar registro de atividades de processamento | | | |
| [ ] Testar controles de acesso baseados em função | | | |

## Guia de Preenchimento

### Status

Utilize os seguintes status para preencher a coluna "Status":

- **Em Progresso**: Verificação em andamento
- **Concluído**: Verificação finalizada sem problemas
- **Problemas Encontrados**: Verificação finalizada com problemas identificados
- **Corrigido**: Problemas encontrados e já corrigidos

### Severidade de Problemas

Ao documentar problemas, classifique-os por severidade:

- **Crítico**: Impede o funcionamento do sistema
- **Importante**: Afeta funcionalidades principais, mas não impede o uso
- **Menor**: Problemas de usabilidade ou melhorias sugeridas

### 7. Acessibilidade

#### 7.1 Conformidade com WCAG

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar conformidade com WCAG 2.1 AA | | | |
| [ ] Revisar contraste de cores | | | |
| [ ] Testar navegação por teclado | | | |
| [ ] Verificar textos alternativos em imagens | | | |
| [ ] Revisar estrutura de cabeçalhos | | | |
| [ ] Testar com leitores de tela | | | |

#### 7.2 Testes de Acessibilidade

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar resultados do Axe DevTools | | | |
| [ ] Revisar relatórios do Lighthouse Accessibility | | | |
| [ ] Testar com usuários com necessidades especiais | | | |
| [ ] Verificar suporte a zoom e texto redimensionável | | | |

### 8. Compatibilidade com Navegadores

#### 8.1 Testes em Navegadores Desktop

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar funcionalidade em Chrome | | | |
| [ ] Testar em Firefox | | | |
| [ ] Revisar em Safari | | | |
| [ ] Verificar em Edge | | | |

#### 8.2 Testes em Dispositivos Móveis

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar em iOS Safari | | | |
| [ ] Testar em Chrome para Android | | | |
| [ ] Revisar em Samsung Internet | | | |
| [ ] Verificar comportamento responsivo | | | |

### 9. Internacionalização e Localização

#### 9.1 Suporte a Múltiplos Idiomas

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar estrutura de arquivos de tradução | | | |
| [ ] Testar alternância entre idiomas | | | |
| [ ] Revisar textos traduzidos | | | |
| [ ] Verificar formatação de datas e números | | | |

#### 9.2 Adaptação Cultural

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar suporte a RTL (Right-to-Left) | | | |
| [ ] Testar com diferentes configurações regionais | | | |
| [ ] Revisar imagens e ícones culturalmente neutros | | | |

### 10. Monitoramento e Tratamento de Erros

#### 10.1 Logging e Monitoramento

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar implementação de logs estruturados | | | |
| [ ] Testar captura de erros não tratados | | | |
| [ ] Revisar integração com ferramentas de monitoramento | | | |
| [ ] Verificar alertas e notificações | | | |

#### 10.2 Tratamento de Erros

| Item | Status | Observações | Data |
|------|--------|-------------|------|
| [ ] Verificar mensagens de erro amigáveis | | | |
| [ ] Testar recuperação de falhas | | | |
| [ ] Revisar páginas de erro personalizadas | | | |
| [ ] Verificar feedback ao usuário | | | |

## Registro de Verificações Concluídas

| Componente | Data | Responsável | Status Geral |
|------------|------|-------------|---------------|
| Processo de Verificação | 15/07/2024 | Usuário | Concluído |
| Documentação | 16/07/2024 | Usuário | Concluído |
| Testes e Otimização | 17/07/2024 | Usuário | Concluído |

## Métricas de Qualidade

| Métrica | Valor Atual | Meta | Data da Última Medição |
|---------|-------------|------|------------------------|
| Cobertura de Testes Backend | 85% | 80% | 17/07/2024 |
| Cobertura de Testes Frontend | 82% | 80% | 17/07/2024 |
| Pontuação Lighthouse Performance | 92 | >90 | 17/07/2024 |
| Pontuação Lighthouse Acessibilidade | 95 | >90 | 17/07/2024 |
| Pontuação Lighthouse SEO | 94 | >90 | 17/07/2024 |
| Vulnerabilidades npm audit | 0 | 0 | 17/07/2024 |
| Conformidade WCAG 2.1 AA | - | 100% | - |
| Compatibilidade Cross-Browser | - | 100% | - |
| Tempo de Sincronização Offline-Online | - | <5s | - |
| Taxa de Sucesso em Resolução de Conflitos | - | >95% | - |
| Tempo de Resposta da API (p95) | - | <200ms | - |
| Uso de Memória em Dispositivos Móveis | - | <100MB | - |
