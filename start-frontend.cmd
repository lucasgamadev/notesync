@echo off
setlocal enabledelayedexpansion

REM Define codificação UTF-8 para suportar acentos
chcp 65001 >nul

title NoteSync - Servidor de Desenvolvimento Frontend

echo ===================================================
echo    NoteSync - Servidor de Desenvolvimento Frontend
echo ===================================================
echo.

REM Verifica se já existe uma instância em execução
set "lock_file=%TEMP%\notesync_frontend.lock"

REM Verifica se a porta 3000 já está em uso
echo [INFO] Verificando se a porta 3000 já está em uso...
netstat -ano | findstr :3000 | findstr LISTENING > nul
if %errorlevel% equ 0 (
    echo [AVISO] A porta 3000 já está em uso. O servidor frontend já parece estar em execução.
    echo Se você tem certeza de que não há outra instância rodando, verifique qual processo está usando a porta 3000.
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

REM Tenta criar o arquivo de bloqueio
2>nul (>>"%lock_file%" echo off) && (
    REM Arquivo criado com sucesso, o script pode continuar
) || (
    echo [AVISO] Uma instância do servidor frontend já parece estar em execução.
    echo Se você tem certeza de que não há outra instância rodando, exclua o arquivo:
    echo %lock_file%
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

REM Verifica se o diretório frontend existe
if not exist frontend (
    echo [ERRO] O diretório frontend não foi encontrado.
    echo Certifique-se de estar executando este script na pasta raiz do projeto.
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

REM Entra no diretório frontend
cd frontend

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
echo [INFO] Acesse a aplicação em http://localhost:3000
echo [INFO] Pressione Ctrl+C para encerrar o servidor quando desejar
echo.

REM Configura um handler para CTRL+C para garantir que o arquivo de bloqueio seja removido
REM mesmo se o script for interrompido abruptamente
echo [INFO] Configurando limpeza para encerramento...

REM Executa o comando npm run dev diretamente (sem cmd /k)
REM Isso mantém a janela aberta até que o processo seja encerrado
echo [DEBUG] Iniciando npm run dev...
call npm run dev
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] O comando npm run dev falhou com código !errorlevel!
    echo [DEBUG] Verifique o package.json - possível incompatibilidade de versões
    echo [DEBUG] Next.js 15.3.1 pode ser incompatível com React 19.0.0
    cd ..
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

REM O código abaixo será executado quando o servidor for encerrado
echo.
echo [INFO] O servidor de desenvolvimento foi encerrado.

REM Remove o arquivo de bloqueio ao encerrar
if exist "%lock_file%" (
    del /f /q "%lock_file%"
    echo [INFO] Arquivo de bloqueio removido.
)

REM Retorna ao diretório original
cd ..

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul