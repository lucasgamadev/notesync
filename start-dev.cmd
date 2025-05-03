@echo off
setlocal enabledelayedexpansion

title NoteSync - Ambiente de Desenvolvimento

echo ===================================================
echo       NoteSync - Ambiente de Desenvolvimento
echo ===================================================
echo.

REM Verifica se os diretórios necessários existem
if not exist frontend (
    echo [ERRO] O diretório frontend não foi encontrado.
    echo Certifique-se de estar executando este script na pasta raiz do projeto.
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

if not exist backend (
    echo [ERRO] O diretório backend não foi encontrado.
    echo Certifique-se de estar executando este script na pasta raiz do projeto.
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

echo [INFO] Iniciando os serviços de desenvolvimento...
echo.

REM Inicia o servidor backend em uma nova janela
echo [INFO] Iniciando o servidor backend...
start "NoteSync Backend" cmd /c "%~dp0start-backend.cmd"

REM Aguarda 3 segundos para o backend iniciar primeiro
timeout /t 3 /nobreak >nul

REM Inicia o servidor frontend em uma nova janela
echo [INFO] Iniciando o servidor frontend...
start "NoteSync Frontend" cmd /c "%~dp0start-frontend.cmd"

echo.
echo [INFO] Serviços iniciados com sucesso!
echo [INFO] Backend: http://localhost:4000
echo [INFO] Frontend: http://localhost:3000
echo.
echo [INFO] As janelas dos servidores foram abertas em separado.
echo [INFO] Para encerrar os serviços, feche as respectivas janelas.
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul