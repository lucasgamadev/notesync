# WORKFLOW-FRONTEND.md

Este documento lista todas as funcionalidades e tarefas necessárias para o desenvolvimento do frontend do NoteSync.

## 1. Autenticação

- [x] Tela de Login
  - [x] Fase beta: autenticação ocorre apenas ao pressionar o botão "Entrar" (sem validação de usuário/senha)
  - [x] Formulário de usuário e senha
  - [x] Validação de campos
  - [x] Feedback de erro
  - [x] Integração com backend para autenticação
- [x] Tela de Registro
  - [x] Formulário de cadastro (nome, email, senha)
  - [x] Validação de campos
  - [x] Feedback de sucesso/erro
  - [x] Integração com backend para criação de conta
- [x] Recuperação de senha
  - [x] Formulário de solicitação de recuperação
  - [x] Integração com backend

## 2. Notas

- [x] Listagem de notas
  - [x] Interface para exibir todas as notas do usuário
  - [x] Carregamento de dados do backend
- [x] Criação de nota
  - [x] Formulário para criar nova nota
  - [x] Validação de campos
  - [x] Integração com backend
- [x] Edição de nota
  - [x] Interface para editar nota existente
  - [x] Sincronização com backend
- [x] Exclusão de nota
  - [x] Confirmação antes de excluir
  - [x] Integração com backend

## 3. Interface do Usuário

- [x] Layout responsivo
- [x] Barra de navegação
- [x] Feedback visual (spinners, mensagens de erro/sucesso)
- [x] Temas (claro/escuro)

## 4. Sincronização

- [x] Sincronizar notas em tempo real (opcional)
- [x] Feedback de sincronização

## 5. Configurações do Usuário

- [x] Tela de perfil
  - [x] Atualização de dados pessoais
  - [x] Alteração de senha

## 6. Recursos Adicionais Implementados

- [x] Dashboard
  - [x] Layout com sidebar e área principal
  - [x] Widgets de estatísticas e atividade recente
  - [x] Filtros e visualizações personalizáveis
- [x] Gerenciador de cadernos
  - [x] Interface de listagem com visualização em grade/lista
  - [x] CRUD de cadernos com modais
  - [x] Funcionalidade de drag-and-drop para organização
- [x] Editor de notas avançado
  - [x] TipTap com extensões personalizadas
  - [x] Toolbar com formatação rich text
  - [x] Suporte a imagens, links e tabelas
  - [x] Sistema de autosave e indicador de status
- [x] Sistema de etiquetas
  - [x] Componente de seleção e criação de tags
  - [x] Filtro de notas por tags
  - [x] Visualização de tags relacionadas
- [x] Pesquisa avançada
  - [x] Barra de pesquisa global com sugestões
  - [x] Página de resultados com filtros avançados
  - [x] Highlight de termos nos resultados

