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
echo    ⚠️   RESET COMPLETO - DINEX  ⚠️
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Este script irá:
echo    - Resetar completamente o banco de dados
echo    - Remover todas as imagens enviadas
echo    - Executar seed novamente
echo.
echo    ⚠️  TODOS OS DADOS SERÃO PERDIDOS!
echo.
echo    ═══════════════════════════════════════════════════════════
echo.

set /p confirm="    💡  Tem certeza que deseja continuar? (s/n): "
if /i not "%confirm%"=="s" (
    echo.
    echo    ❌  Operação cancelada pelo usuário.
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 0
)

REM Verificar se o Node.js está instalado
echo    [1/6] 🔍 Verificando Node.js...
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
    echo    ❌  ERRO! RESET FALHOU!  ❌
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
echo    [2/6] 🔍 Verificando pasta Prisma...
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
    echo    ❌  ERRO! RESET FALHOU!  ❌
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
    echo    ❌  ERRO! RESET FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Pasta e schema Prisma encontrados
echo.

REM Verificar se o arquivo .env existe
echo    [3/6] 🔍 Verificando arquivo .env...
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
    echo    ❌  ERRO! RESET FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Arquivo .env encontrado
echo.

REM Verificar se as dependências estão instaladas
echo    [4/6] 🔍 Verificando dependências...
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
        echo    ❌  ERRO! RESET FALHOU!  ❌
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

REM Limpar pasta de imagens enviadas
echo    [5/6] 🗑️  Limpando pasta de imagens enviadas...
if exist "public\images\uploads" (
    echo    🗑️  Removendo todas as imagens enviadas...
    
    REM Contar arquivos antes da remoção
    for /f %%i in ('dir /b "public\images\uploads\*.*" 2^>nul ^| find /c /v ""') do set "fileCount=%%i"
    if not defined fileCount set "fileCount=0"
    echo    📊  Arquivos encontrados: %fileCount%
    
    REM Remover todos os arquivos da pasta uploads
    del /q "public\images\uploads\*.*" >nul 2>&1
    if %errorlevel% neq 0 (
        echo    ⚠️  Nenhum arquivo para remover ou erro ao remover
    ) else (
        echo    ✅  Todos os arquivos removidos com sucesso!
    )
    
    REM Verificar se a pasta ficou vazia
    dir /b "public\images\uploads\*.*" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    ⚠️  Ainda existem arquivos na pasta uploads
    ) else (
        echo    ✅  Pasta uploads limpa completamente
    )
) else (
    echo    ⚠️  Pasta public\images\uploads não existe
)
echo.

REM Gerar cliente Prisma
echo    [6/6] 🔧 Gerando cliente Prisma...
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
    echo    ❌  ERRO! RESET FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo    ✅  Cliente Prisma gerado com sucesso!
echo.

REM Executar reset completo do banco
echo    [7/7] 🚀 Executando reset completo do banco...
echo.
echo    ⚠️  ATENÇÃO: O banco será completamente resetado!
echo    💡  Todos os dados serão perdidos e o seed será executado.
echo.
echo    ⏳  Executando reset completo (pode demorar alguns segundos)...
call npx.cmd prisma migrate reset --force
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
    echo    ❌  ERRO: FALHA AO EXECUTAR RESET!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🔍  Possíveis causas:
    echo    - Banco de dados não está rodando
    echo    - Credenciais incorretas no arquivo .env
    echo    - Conexão com o banco falhou
    echo    - Banco não existe ainda
    echo    - Permissões insuficientes no banco
    echo.
    echo    💡  Verifique se o PostgreSQL está rodando e as credenciais.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! RESET FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo    ✅  Reset completo executado com sucesso!
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
echo    🎉  RESET COMPLETO CONCLUÍDO COM SUCESSO!  🎉
echo    ═══════════════════════════════════════════════════════════
echo.
echo    ✅  Node.js verificado
echo    ✅  Pasta Prisma encontrada
echo    ✅  Arquivo .env configurado
echo    ✅  Dependências instaladas
echo    ✅  Pasta de imagens limpa
echo    ✅  Cliente Prisma gerado
echo    ✅  Banco resetado completamente
echo.

echo    💡  O sistema foi completamente resetado:
echo    - Banco de dados: Resetado e populado com dados iniciais
echo    - Imagens enviadas: Todas removidas
echo    - Cliente Prisma: Regenerado
echo.
echo    💡  Agora você pode:
echo    1. Executar: npm start
echo    2. Usar o script run-standalone.bat para modo fullscreen
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🎯  SUCESSO! RESET COMPLETO FINALIZADO!  🎯
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
