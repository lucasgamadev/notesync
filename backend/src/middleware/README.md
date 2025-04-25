# Middleware

Esta pasta contém os middlewares da aplicação, que são funções intermediárias executadas durante o ciclo de requisição-resposta.

## Estrutura

- `authenticateToken.js`: Middleware para autenticação de tokens JWT
- `errorHandler.js`: Middleware para tratamento centralizado de erros
- `requestLogger.js`: Middleware para registro de logs de requisições
- `validateRequest.js`: Middleware para validação de dados de entrada
- `rateLimiter.js`: Middleware para limitação de taxa de requisições