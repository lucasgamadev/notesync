@echo off
:: Inicia uma nova instância do CMD que não fecha automaticamente
if "%~1"=="" (
    cmd /k ""%~f0" executed"
    exit /b
)

chcp 65001 > nul
title NoteSync - Backend

:: Mostrar informações iniciais
echo ===================================
echo    INICIANDO BACKEND - NOTESYNC
echo ===================================
echo.

echo [1/6] Verificando Node.js...
node -v
if errorlevel 1 (
    echo.
    echo ERRO: Node.js nao encontrado.
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/6] Verificando npm...
npm -v
if errorlevel 1 (
    echo.
    echo ERRO: npm nao encontrado.
    echo Tente reinstalar o Node.js
    pause
    exit /b 1
)

echo.
echo [3/6] Verificando estrutura do projeto...
if not exist "backend\" (
    echo.
    echo ERRO: Pasta 'backend' nao encontrada.
    echo Certifique-se de que este script esta na pasta raiz do projeto.
    echo.
    echo Conteudo do diretorio atual:
    dir /b
    pause
    exit /b 1
)

:: Entrar na pasta backend
pushd backend

if errorlevel 1 (
    echo.
    echo ERRO: Nao foi possivel acessar a pasta backend.
    pause
    exit /b 1
)

echo.
echo [4/6] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo.
        echo ERRO: Falha ao instalar as dependencias.
        echo Tente executar 'npm cache clean --force' e tente novamente.
        pause
        exit /b 1
    )
else
    echo Dependencias ja estao instaladas.
)

echo.
echo [5/6] Verificando configuracoes...
if not exist ".env" (
    echo AVISO: Arquivo .env nao encontrado.
    echo Criando arquivo .env de exemplo...
    (
        echo # Configuracoes do Banco de Dados
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASS=
        echo DB_NAME=notesync
        echo.
        echo # Configuracoes do Servidor
        echo PORT=4000
        echo NODE_ENV=development
    ) > .env
    echo Arquivo .env de exemplo criado. Por favor, configure as variaveis necessarias.
    pause
)

echo.
echo [6/6] Iniciando servidor...
echo ===================================
echo URL: http://localhost:4000
echo Pressione Ctrl+C para parar o servidor
echo ===================================
echo.

echo Executando: npm run dev
npm run dev

if errorlevel 1 (
    echo.
    echo ERRO: Falha ao iniciar o servidor.
    echo Verifique as mensagens acima para mais detalhes.
)

:: Voltar para o diretorio original
popd

echo.
pause