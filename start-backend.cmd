@echo off
setlocal enabledelayedexpansion

REM Define codificação UTF-8 para suportar acentos
chcp 65001 >nul

title NoteSync - Servidor de Desenvolvimento Backend

echo ===================================================
echo    NoteSync - Servidor de Desenvolvimento Backend
echo ===================================================
echo.

REM Verifica se o diretório backend existe
if not exist backend (
    echo [ERRO] O diretório backend não foi encontrado.
    echo Certifique-se de estar executando este script na pasta raiz do projeto.
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

REM Entra no diretório backend
cd backend

echo [INFO] Verificando dependências...
call npm install
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Falha ao instalar as dependências.
    echo Verifique sua conexão com a internet ou execute o comando manualmente.
    cd ..
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

echo.
echo [INFO] Iniciando o servidor de desenvolvimento...
echo [INFO] O servidor backend estará disponível em http://localhost:4000
echo [INFO] Pressione Ctrl+C para encerrar o servidor quando desejar
echo.

REM Executa o comando npm run dev diretamente
REM Isso mantém a janela aberta até que o processo seja encerrado
npm run dev

REM O código abaixo será executado quando o servidor for encerrado
echo.
echo [INFO] O servidor de desenvolvimento foi encerrado.

REM Retorna ao diretório original
cd ..

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul