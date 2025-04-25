# Requisitos do NoteSync

## Requisitos Funcionais

### Autenticação e Usuários

#### US-01: Registro de Usuário
**Como** um novo usuário,  
**Quero** me registrar no sistema,  
**Para que** eu possa acessar as funcionalidades do aplicativo.

**Critérios de Aceitação:**
- O usuário deve fornecer nome, email e senha
- O email deve ser único no sistema
- A senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais
- O sistema deve enviar um email de confirmação após o registro

#### US-02: Login de Usuário
**Como** um usuário registrado,  
**Quero** fazer login no sistema,  
**Para que** eu possa acessar minha conta e dados.

**Critérios de Aceitação:**
- O login deve ser feito com email e senha
- O sistema deve fornecer tokens JWT para autenticação
- O sistema deve oferecer opção "Lembrar-me"
- O sistema deve bloquear temporariamente a conta após 5 tentativas falhas de login

#### US-03: Login com Google
**Como** um usuário,  
**Quero** fazer login usando minha conta Google,  
**Para que** eu possa acessar o sistema sem criar credenciais adicionais.

**Critérios de Aceitação:**
- O sistema deve integrar com OAuth 2.0 do Google
- O sistema deve solicitar permissões mínimas necessárias
- O sistema deve vincular contas existentes com mesmo email

### Gerenciamento de Cadernos

#### US-04: Criação de Cadernos
**Como** um usuário autenticado,  
**Quero** criar novos cadernos,  
**Para que** eu possa organizar minhas notas por temas ou projetos.

**Critérios de Aceitação:**
- O caderno deve ter título obrigatório
- O caderno pode ter descrição opcional
- O caderno pode ter uma cor personalizada
- O sistema deve permitir até 50 cadernos por usuário na versão gratuita

#### US-05: Gerenciamento de Cadernos
**Como** um usuário autenticado,  
**Quero** editar, arquivar ou excluir cadernos,  
**Para que** eu possa manter minha organização atualizada.

**Critérios de Aceitação:**
- O sistema deve permitir edição de título, descrição e cor
- O sistema deve permitir arquivamento para ocultar sem excluir
- O sistema deve confirmar antes de excluir um caderno
- A exclusão deve ser reversível por 30 dias

### Gerenciamento de Notas

#### US-06: Criação de Notas
**Como** um usuário autenticado,  
**Quero** criar novas notas em meus cadernos,  
**Para que** eu possa registrar informações importantes.

**Critérios de Aceitação:**
- A nota deve ter título opcional ("Sem título" como padrão)
- A nota deve permitir conteúdo rich text
- O sistema deve salvar automaticamente a cada 5 segundos
- O sistema deve registrar data de criação e modificação

#### US-07: Edição de Notas
**Como** um usuário autenticado,  
**Quero** editar minhas notas existentes,  
**Para que** eu possa atualizar ou corrigir informações.

**Critérios de Aceitação:**
- O editor deve suportar formatação rich text (negrito, itálico, listas, etc.)
- O editor deve suportar inserção de imagens e links
- O sistema deve manter histórico de versões das últimas 10 edições
- O sistema deve permitir reverter para versões anteriores

#### US-08: Organização de Notas
**Como** um usuário autenticado,  
**Quero** mover, arquivar ou excluir notas,  
**Para que** eu possa manter meus cadernos organizados.

**Critérios de Aceitação:**
- O sistema deve permitir mover notas entre cadernos
- O sistema deve permitir arquivar notas sem excluí-las
- O sistema deve confirmar antes de excluir uma nota
- A exclusão deve ser reversível por 30 dias

### Etiquetas e Categorização

#### US-09: Gerenciamento de Etiquetas
**Como** um usuário autenticado,  
**Quero** criar e gerenciar etiquetas,  
**Para que** eu possa categorizar minhas notas de forma flexível.

**Critérios de Aceitação:**
- O sistema deve permitir criar, editar e excluir etiquetas
- As etiquetas devem ter nome e cor personalizável
- O sistema deve permitir até 100 etiquetas por usuário na versão gratuita
- O sistema deve mostrar contagem de notas por etiqueta

#### US-10: Aplicação de Etiquetas
**Como** um usuário autenticado,  
**Quero** adicionar ou remover etiquetas das minhas notas,  
**Para que** eu possa categorizá-las de forma flexível.

**Critérios de Aceitação:**
- O sistema deve permitir múltiplas etiquetas por nota
- O sistema deve oferecer autocompletar ao digitar etiquetas existentes
- O sistema deve permitir criar novas etiquetas durante a aplicação
- O sistema deve mostrar etiquetas visualmente na nota

### Pesquisa e Filtros

#### US-11: Pesquisa de Notas
**Como** um usuário autenticado,  
**Quero** pesquisar em todas as minhas notas,  
**Para que** eu possa encontrar rapidamente informações específicas.

**Critérios de Aceitação:**
- O sistema deve pesquisar em títulos e conteúdos
- O sistema deve destacar termos encontrados nos resultados
- O sistema deve ordenar resultados por relevância
- A pesquisa deve ser rápida (menos de 1 segundo para resultados)

#### US-12: Filtros Avançados
**Como** um usuário autenticado,  
**Quero** filtrar notas por diversos critérios,  
**Para que** eu possa encontrar notas específicas facilmente.

**Critérios de Aceitação:**
- O sistema deve permitir filtrar por caderno, etiqueta, data e status
- O sistema deve permitir combinar múltiplos filtros
- O sistema deve salvar filtros frequentes como favoritos
- Os filtros devem ser aplicados em tempo real

### Sincronização com Google Drive

#### US-13: Configuração da Sincronização
**Como** um usuário autenticado,  
**Quero** configurar sincronização com meu Google Drive,  
**Para que** eu possa acessar minhas notas em qualquer dispositivo.

**Critérios de Aceitação:**
- O sistema deve solicitar permissões necessárias do Google Drive
- O sistema deve criar pasta dedicada no Google Drive
- O sistema deve permitir escolher quais cadernos sincronizar
- O sistema deve mostrar status da última sincronização

#### US-14: Sincronização Automática
**Como** um usuário autenticado,  
**Quero** que minhas notas sejam sincronizadas automaticamente,  
**Para que** eu tenha sempre a versão mais atualizada em todos os dispositivos.

**Critérios de Aceitação:**
- O sistema deve sincronizar automaticamente a cada 15 minutos quando online
- O sistema deve sincronizar imediatamente após modificações importantes
- O sistema deve notificar sobre conflitos que precisam de resolução manual
- O sistema deve permitir forçar sincronização manual

#### US-15: Resolução de Conflitos
**Como** um usuário autenticado,  
**Quero** resolver conflitos de sincronização,  
**Para que** eu não perca informações importantes.

**Critérios de Aceitação:**
- O sistema deve detectar edições conflitantes
- O sistema deve resolver automaticamente conflitos simples
- O sistema deve apresentar interface para resolução manual quando necessário
- O sistema deve preservar ambas versões em caso de dúvida

### Funcionalidade Offline

#### US-16: Acesso Offline
**Como** um usuário autenticado,  
**Quero** acessar e editar minhas notas offline,  
**Para que** eu possa trabalhar mesmo sem conexão com internet.

**Critérios de Aceitação:**
- O sistema deve armazenar localmente cadernos e notas recentes
- O sistema deve permitir criar e editar notas offline
- O sistema deve indicar visualmente o status offline
- O sistema deve sincronizar automaticamente ao recuperar conexão

## Requisitos Não-Funcionais

### RNF-01: Desempenho
- O tempo de carregamento inicial deve ser inferior a 3 segundos em conexões 4G
- As operações de CRUD devem responder em menos de 1 segundo
- A pesquisa deve retornar resultados em menos de 2 segundos
- O editor deve funcionar sem lag perceptível em dispositivos com 2GB+ de RAM

### RNF-02: Escalabilidade
- O sistema deve suportar até 100.000 usuários ativos simultaneamente
- Cada usuário deve poder armazenar até 10GB de dados na versão gratuita
- O banco de dados deve escalar horizontalmente para acomodar crescimento
- O sistema deve implementar cache para reduzir carga no banco de dados

### RNF-03: Disponibilidade
- O sistema deve ter disponibilidade de 99.9% (downtime máximo de 8.76 horas/ano)
- O sistema deve implementar redundância para componentes críticos
- O sistema deve ter monitoramento 24/7 com alertas automáticos
- O tempo médio de recuperação após falhas deve ser inferior a 30 minutos

### RNF-04: Segurança
- Todas as comunicações devem ser criptografadas com HTTPS/TLS 1.3+
- As senhas devem ser armazenadas com hash bcrypt e salt único
- O sistema deve implementar proteção contra CSRF, XSS e injeção SQL
- O sistema deve seguir o princípio de privilégio mínimo para acesso a dados

### RNF-05: Usabilidade
- A interface deve ser responsiva e funcionar em dispositivos de 320px a 4K
- O sistema deve seguir diretrizes WCAG 2.1 AA para acessibilidade
- O sistema deve ter tempo de aprendizado inferior a 20 minutos para usuários comuns
- A taxa de erro em tarefas comuns deve ser inferior a 1%

### RNF-06: Compatibilidade
- O frontend deve funcionar nos navegadores Chrome, Firefox, Safari e Edge (últimas 2 versões)
- O aplicativo deve funcionar em sistemas Windows, macOS e Linux
- O aplicativo móvel deve funcionar em Android 8+ e iOS 13+
- As APIs devem seguir padrões RESTful com documentação OpenAPI

### RNF-07: Manutenibilidade
- O código deve seguir padrões de codificação documentados
- A cobertura de testes deve ser superior a 80%
- O sistema deve usar CI/CD para automação de testes e deploy
- A documentação técnica deve ser mantida atualizada

### RNF-08: Privacidade
- O sistema deve cumprir requisitos do GDPR e LGPD
- O sistema deve permitir exportação e exclusão de todos os dados do usuário
- O sistema deve ter política de retenção de dados clara
- O sistema deve registrar logs de acesso para auditoria