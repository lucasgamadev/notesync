# Documentação de Alterações para Desenvolvimento Frontend Independente

## Visão Geral

Este documento registra as alterações feitas para permitir o desenvolvimento do frontend independentemente do backend. Essas modificações permitem que você trabalhe no frontend sem precisar executar o servidor backend.

## Alterações Realizadas

### 1. Criação do Sistema de Mock API

- **Arquivo criado**: `src/utils/mockApi.ts`
  - Implementa um sistema de mock que simula as respostas do backend
  - Contém dados fictícios para notas, tags e cadernos
  - Simula operações CRUD (Create, Read, Update, Delete)
  - Adiciona atrasos artificiais para simular latência de rede

- **Arquivo modificado**: `src/utils/api.ts`
  - Adicionada flag `USE_MOCK_API` (atualmente definida como `true`)
  - Criado proxy que redireciona chamadas para o mock quando a flag está ativa
  - Mantém compatibilidade com o backend real quando necessário

## Como Usar

### Desenvolvimento com Mock API

O frontend está configurado para usar automaticamente o mock API. Você pode:

1. Criar, editar e excluir notas
2. Visualizar tags e cadernos pré-definidos
3. Testar a interface sem depender do backend

### Voltar para o Backend Real

Quando quiser voltar a usar o backend real, siga estes passos:

1. Abra o arquivo `src/utils/api.ts`
2. Altere a linha `const USE_MOCK_API = true;` para `const USE_MOCK_API = false;`
3. Certifique-se de que o servidor backend esteja em execução

## Dados Mockados

### Tags Pré-definidas

- Importante
- Trabalho
- Pessoal
- Estudo

### Cadernos Pré-definidos

- Geral
- Trabalho

## Limitações

O sistema de mock tem algumas limitações:

1. Os dados são armazenados apenas em memória e serão perdidos ao recarregar a página
2. Algumas funcionalidades avançadas podem não estar disponíveis
3. As notas temporárias criadas têm IDs que começam com "temp-" para distingui-las

## Reversão das Alterações

Para reverter completamente essas alterações e voltar ao estado original:

1. Exclua o arquivo `src/utils/mockApi.ts`
2. Restaure o arquivo `src/utils/api.ts` para sua versão original, removendo:
   - A importação do mockApi
   - A flag USE_MOCK_API
   - O objeto apiProxy
   - A exportação condicional
