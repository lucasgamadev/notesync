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

REM Verifica a versão do Node.js
echo [INFO] Verificando versão do Node.js...
for /f "tokens=*" %%a in ('node -v') do set node_version=%%a
echo [INFO] Versão do Node.js encontrada: !node_version!

REM Extrai o número da versão principal (v20.x.x -> 20)
set "node_major=!node_version:~1,2!"

REM Verifica se a versão é pelo menos 20
if !node_major! LSS 20 (
    echo [AVISO] A versão do Node.js é inferior à recomendada (v20+).
    echo Recomendamos atualizar o Node.js para a versão mais recente LTS (v20+).
    echo Você pode continuar, mas podem ocorrer problemas de compatibilidade.
    echo.
    choice /C SN /M "Deseja continuar mesmo assim? (S=Sim, N=Não)"
    if !errorlevel! equ 2 (
        echo.
        echo [INFO] Operação cancelada pelo usuário.
        cd ..
        echo.
        echo Pressione qualquer tecla para fechar esta janela...
        pause >nul
        exit /b 1
    )
    echo.
)

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