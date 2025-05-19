@echo off
setlocal enabledelayedexpansion

REM Define codificação UTF-8 para suportar acentos
chcp 65001 >nul

title NoteSync - Servidor de Produção Frontend

echo ===================================================
echo    NoteSync - Servidor de Produção Frontend
echo ===================================================
echo.

REM Verifica se já existe uma instância em execução
set "lock_file=%TEMP%\notesync_frontend_prod.lock"

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
echo [INFO] Compilando a aplicação para produção...
call npm run build
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] Falha ao compilar a aplicação para produção.
    echo Verifique os erros acima e corrija-os antes de tentar novamente.
    cd ..
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

echo.
echo [INFO] Iniciando o servidor de produção...
echo [INFO] Acesse a aplicação em http://localhost:3000
echo [INFO] Pressione Ctrl+C para encerrar o servidor quando desejar
echo.

REM Configura um handler para CTRL+C para garantir que o arquivo de bloqueio seja removido
REM mesmo se o script for interrompido abruptamente
echo [INFO] Configurando limpeza para encerramento...

REM Executa o comando npm start diretamente
echo [DEBUG] Iniciando npm start...
call npm start
if !errorlevel! neq 0 (
    echo.
    echo [ERRO] O comando npm start falhou com código !errorlevel!
    echo [DEBUG] Verifique o package.json e as dependências do projeto
    cd ..
    echo.
    echo Pressione qualquer tecla para fechar esta janela...
    pause >nul
    exit /b 1
)

REM O código abaixo será executado quando o servidor for encerrado
echo.
echo [INFO] O servidor de produção foi encerrado.

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