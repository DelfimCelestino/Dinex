@echo off
echo ========================================
echo    CONFIGURACAO DO BANCO DE DADOS
echo ========================================
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao esta instalado!
    echo Baixe e instale o Node.js de: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: npm nao esta funcionando!
    pause
    exit /b 1
)

echo Node.js encontrado: 
node --version
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo Dependencias instaladas com sucesso!
    echo.
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo AVISO: Arquivo .env nao encontrado!
    echo Crie um arquivo .env com as configuracoes do banco
    echo Exemplo:
    echo DATABASE_URL="postgresql://usuario:senha@localhost:5432/dinex"
    echo.
    pause
)

REM Gerar cliente Prisma
echo Gerando cliente Prisma...
npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar cliente Prisma!
    pause
    exit /b 1
)
echo Cliente Prisma gerado com sucesso!
echo.

REM Executar migrações
echo Executando migracoes do banco...
npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ERRO: Falha ao executar migracoes!
    pause
    exit /b 1
)
echo Migracoes executadas com sucesso!
echo.

REM Executar seed (opcional)
set /p runSeed="Deseja executar o seed para popular o banco? (s/n): "
if /i "%runSeed%"=="s" (
    echo Executando seed...
    npx prisma db seed
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao executar seed!
        pause
        exit /b 1
    )
    echo Seed executado com sucesso!
    echo.
)

echo ========================================
echo    CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo Agora voce pode:
echo 1. Executar: npm run dev
echo 2. Usar o script run-standalone.bat para modo fullscreen
echo.
pause
