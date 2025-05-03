@echo off
setlocal enabledelayedexpansion

echo Iniciando o servidor de desenvolvimento do frontend...
echo.

REM Verifica se o diretório frontend existe
if not exist frontend (
    echo Erro: O diretório frontend não foi encontrado.
    echo Certifique-se de estar executando este script na pasta raiz do projeto.
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

cd frontend

echo Verificando dependências...
npm install
if !errorlevel! neq 0 (
    echo.
    echo Erro: Falha ao instalar as dependências.
    echo Verifique sua conexão com a internet ou execute o comando manualmente.
    cd ..
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

echo.
echo Iniciando o servidor de desenvolvimento...
echo.

REM Usa cmd /k para manter a janela aberta após a execução do comando
cmd /k "npm run dev"

REM O código abaixo só será executado se o usuário fechar manualmente o servidor
REM ou se o comando cmd /k falhar
cd ..
echo.
echo O servidor de desenvolvimento foi encerrado.
echo Pressione qualquer tecla para fechar esta janela...
echo.
pause >nul