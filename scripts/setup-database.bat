@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cls
echo.
echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🚀  CONFIGURAÇÃO DO BANCO - DINEX  🚀
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Este script configura o banco de dados do sistema DineX
echo    📁  Pasta atual: %CD%
echo.
echo    ═══════════════════════════════════════════════════════════
echo.

REM Verificar se o Node.js está instalado
echo    [1/4] 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: NODE.JS NÃO INSTALADO!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🌐  Baixe e instale o Node.js de: https://nodejs.org/
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Node.js encontrado: 
node --version
echo.

REM Verificar se a pasta prisma existe
echo    [2/4] 🔍 Verificando pasta Prisma...
if not exist "prisma" (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: PASTA PRISMA NÃO ENCONTRADA!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    📁  A pasta prisma com o schema não foi encontrada.
    echo    💡  Verifique se todos os arquivos foram copiados corretamente.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

if not exist "prisma\schema.prisma" (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: SCHEMA PRISMA NÃO ENCONTRADO!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    📄  O arquivo prisma\schema.prisma não foi encontrado.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Pasta e schema Prisma encontrados
echo.

REM Verificar se o arquivo .env existe
echo    [3/4] 🔍 Verificando arquivo .env...
if not exist ".env" (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: ARQUIVO .ENV NÃO ENCONTRADO!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🔧  Crie um arquivo .env com as configurações do banco
    echo    📝  Exemplo:
    echo    DATABASE_URL="postgresql://usuario:senha@localhost:5432/dinex"
    echo.
    echo    💡  Copie config-example.txt para .env e configure.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Arquivo .env encontrado
echo.

REM Verificar se as dependências estão instaladas
echo    [4/4] 🔍 Verificando dependências...
if not exist "node_modules" (
    echo    📦  Instalando dependências de PRODUÇÃO apenas...
    echo    ⏳  Isso pode demorar alguns minutos...
    echo.
    call npm install --production --no-optional
    if %errorlevel% neq 0 (
        cls
        echo.
        echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
        echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
        echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
        echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
        echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
        echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
        echo.
        echo    ═══════════════════════════════════════════════════════════
        echo    ❌  ERRO: FALHA AO INSTALAR DEPENDÊNCIAS!  ❌
        echo    ═══════════════════════════════════════════════════════════
        echo.
        echo    💡  Execute primeiro: instalar.bat
        echo.
        echo    ═══════════════════════════════════════════════════════════
        echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
        echo    ═══════════════════════════════════════════════════════════
        echo.
        echo    💡  Pressione qualquer tecla para fechar...
        pause >nul
        exit /b 1
    )
    echo    ✅  Dependências de PRODUÇÃO instaladas com sucesso!
    echo.
) else (
    echo    ✅  Dependências já instaladas
    echo.
)

REM Gerar cliente Prisma
echo    [5/5] 🔧 Gerando cliente Prisma...
echo    ⏳  Gerando cliente Prisma (pode demorar alguns segundos)...
call npx.cmd prisma generate
if %errorlevel% neq 0 (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: FALHA AO GERAR CLIENTE PRISMA!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🔍  Possíveis causas:
    echo    - Schema do Prisma corrompido
    echo    - Dependências não instaladas corretamente
    echo    - Erro de sintaxe no schema
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo    ✅  Cliente Prisma gerado com sucesso!
echo.

REM Executar migrações
echo    [6/6] 🚀 Executando migrações do banco...
echo    ⏳  Executando migrações (pode demorar alguns segundos)...
call npx.cmd prisma migrate deploy
if %errorlevel% neq 0 (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: FALHA AO EXECUTAR MIGRAÇÕES!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🔍  Possíveis causas:
    echo    - Banco de dados não está rodando
    echo    - Credenciais incorretas no arquivo .env
    echo    - Conexão com o banco falhou
    echo    - Banco não existe ainda
    echo.
    echo    💡  Verifique se o PostgreSQL está rodando e as credenciais.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo    ✅  Migrações executadas com sucesso!
echo.

REM Executar seed automaticamente
echo    [7/7] 🌱  Executando seed do banco...
echo    ⏳  Executando seed (pode demorar alguns segundos)...
call npx.cmd prisma db seed
if %errorlevel% neq 0 (
    cls
    echo.
    echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
    echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
    echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
    echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
    echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
    echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO: FALHA AO EXECUTAR SEED!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🔍  Possíveis causas:
    echo    - Banco não configurado corretamente
    echo    - Arquivo seed.ts corrompido
    echo    - Dependências de seed não instaladas
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! CONFIGURAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo    ✅  Seed executado com sucesso!
echo.

cls
echo.
echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🎉  CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!  🎉
echo    ═══════════════════════════════════════════════════════════
echo.
echo    ✅  Node.js verificado
echo    ✅  Pasta Prisma encontrada
echo    ✅  Arquivo .env configurado
echo    ✅  Dependências instaladas
echo    ✅  Cliente Prisma gerado
echo    ✅  Migrações executadas
echo    ✅  Seed executado
echo.

echo    💡  Agora você pode:
echo    1. Executar: npm start
echo    2. Usar o script run-standalone.bat para modo fullscreen
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🎯  SUCESSO! CONFIGURAÇÃO COMPLETA!  🎯
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
