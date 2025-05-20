@echo off
setlocal enabledelayedexpansion

REM Define codificação UTF-8 para suportar acentos
chcp 65001 >nul

title NoteSync - Frontend

echo ===================================================
echo    NoteSync - Servidor de Desenvolvimento Frontend
echo ===================================================
echo.

REM Entra no diretório frontend
cd frontend

echo [INFO] Iniciando o servidor de desenvolvimento...
echo [INFO] Acesse a aplicação em http://localhost:3000
echo [INFO] Pressione Ctrl+C para encerrar o servidor
echo.

REM Executa o servidor
call npm run dev

echo.
echo [INFO] O servidor de desenvolvimento foi encerrado.