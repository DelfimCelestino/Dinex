@echo off
echo ========================================
echo    RESET COMPLETO - DINEX
echo ========================================
echo.
echo ATENCAO: Este script ira:
echo - Resetar completamente o banco de dados
echo - Remover todas as imagens enviadas
echo - Executar seed novamente
echo.
echo TODOS OS DADOS SERAO PERDIDOS!
echo.

set /p confirm="Tem certeza que deseja continuar? (s/n): "
if /i not "%confirm%"=="s" (
    echo.
    echo Operacao cancelada pelo usuario.
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 0
)

REM Criar arquivo de log
set "logFile=reset-database-log.txt"
echo ======================================== > "%logFile%"
echo    LOG RESET COMPLETO - DINEX >> "%logFile%"
echo    Data: %date% %time% >> "%logFile%"
echo ======================================== >> "%logFile%"
echo. >> "%logFile%"

REM Verificar se o Node.js está instalado
echo [1/7] Verificando Node.js...
echo [1/7] Verificando Node.js... >> "%logFile%"
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo    ERRO: NODE.JS NAO INSTALADO!
    echo ========================================
    echo.
    echo Baixe e instale o Node.js de: https://nodejs.org/
    echo.
    echo ERRO: NODE.JS NAO INSTALADO! >> "%logFile%"
    echo Baixe e instale o Node.js de: https://nodejs.org/ >> "%logFile%"
    echo. >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo    FALHA NO RESET >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo.
    echo Log salvo em: %logFile%
    echo.
    echo ========================================
    echo    ERRO! RESET FALHOU!
    echo ========================================
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo [OK] Node.js encontrado: 
node --version
echo [OK] Node.js encontrado >> "%logFile%"
node --version >> "%logFile%"
echo. >> "%logFile%"
echo.

REM Verificar se a pasta prisma existe
echo [2/7] Verificando pasta Prisma...
echo [2/7] Verificando pasta Prisma... >> "%logFile%"
if not exist "prisma" (
    echo.
    echo ========================================
    echo    ERRO: PASTA PRISMA NAO ENCONTRADA!
    echo ========================================
    echo.
    echo A pasta prisma com o schema nao foi encontrada.
    echo Verifique se todos os arquivos foram copiados corretamente.
    echo.
    echo ERRO: PASTA PRISMA NAO ENCONTRADA! >> "%logFile%"
    echo A pasta prisma com o schema nao foi encontrada. >> "%logFile%"
    echo. >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo    FALHA NO RESET >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo.
    echo Log salvo em: %logFile%
    echo.
    echo ========================================
    echo    ERRO! RESET FALHOU!
    echo ========================================
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

if not exist "prisma\schema.prisma" (
    echo.
    echo ========================================
    echo    ERRO: SCHEMA PRISMA NAO ENCONTRADO!
    echo ========================================
    echo.
    echo O arquivo prisma\schema.prisma nao foi encontrado.
    echo.
    echo ERRO: SCHEMA PRISMA NAO ENCONTRADO! >> "%logFile%"
    echo O arquivo prisma\schema.prisma nao foi encontrado. >> "%logFile%"
    echo. >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo    FALHA NO RESET >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo.
    echo Log salvo em: %logFile%
    echo.
    echo ========================================
    echo    ERRO! RESET FALHOU!
    echo ========================================
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo [OK] Pasta e schema Prisma encontrados
echo [OK] Pasta e schema Prisma encontrados >> "%logFile%"
echo. >> "%logFile%"
echo.

REM Verificar se o arquivo .env existe
echo [3/7] Verificando arquivo .env...
echo [3/7] Verificando arquivo .env... >> "%logFile%"
if not exist ".env" (
    echo.
    echo ========================================
    echo    ERRO: ARQUIVO .ENV NAO ENCONTRADO!
    echo ========================================
    echo.
    echo Crie um arquivo .env com as configuracoes do banco
    echo Exemplo:
    echo DATABASE_URL="postgresql://usuario:senha@localhost:5432/dinex"
    echo.
    echo Copie config-example.txt para .env e configure.
    echo.
    echo ERRO: ARQUIVO .ENV NAO ENCONTRADO! >> "%logFile%"
    echo Crie um arquivo .env com as configuracoes do banco >> "%logFile%"
    echo. >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo    FALHA NO RESET >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo.
    echo Log salvo em: %logFile%
    echo.
    echo ========================================
    echo    ERRO! RESET FALHOU!
    echo ========================================
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo [OK] Arquivo .env encontrado
echo [OK] Arquivo .env encontrado >> "%logFile%"
echo. >> "%logFile%"
echo.


REM Limpar pasta de imagens enviadas
echo [5/7] Limpando pasta de imagens enviadas...
echo [5/7] Limpando pasta de imagens enviadas... >> "%logFile%"
if exist "public\images\uploads" (
    echo Removendo todas as imagens enviadas...
    echo Removendo todas as imagens enviadas... >> "%logFile%"
    
    REM Contar arquivos antes da remoção
    for /f %%i in ('dir /b "public\images\uploads\*.*" 2^>nul ^| find /c /v ""') do set "fileCount=%%i"
    if not defined fileCount set "fileCount=0"
    echo Arquivos encontrados: %fileCount%
    echo Arquivos encontrados: %fileCount% >> "%logFile%"
    
    REM Remover todos os arquivos da pasta uploads
    del /q "public\images\uploads\*.*" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [AVISO] Nenhum arquivo para remover ou erro ao remover
        echo [AVISO] Nenhum arquivo para remover ou erro ao remover >> "%logFile%"
    ) else (
        echo [OK] Todos os arquivos removidos com sucesso!
        echo [OK] Todos os arquivos removidos com sucesso! >> "%logFile%"
    )
    
    REM Verificar se a pasta ficou vazia
    dir /b "public\images\uploads\*.*" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [AVISO] Ainda existem arquivos na pasta uploads
        echo [AVISO] Ainda existem arquivos na pasta uploads >> "%logFile%"
    ) else (
        echo [OK] Pasta uploads limpa completamente
        echo [OK] Pasta uploads limpa completamente >> "%logFile%"
    )
) else (
    echo [AVISO] Pasta public\images\uploads nao existe
    echo [AVISO] Pasta public\images\uploads nao existe >> "%logFile%"
)
echo. >> "%logFile%"
echo.

REM Gerar cliente Prisma
echo [6/7] Gerando cliente Prisma...
echo [6/7] Gerando cliente Prisma... >> "%logFile%"
npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo    ERRO: FALHA AO GERAR CLIENTE PRISMA!
    echo ========================================
    echo.
    echo Possiveis causas:
    echo - Schema do Prisma corrompido
    echo - Dependencias nao instaladas corretamente
    echo - Erro de sintaxe no schema
    echo.
    echo ERRO: FALHA AO GERAR CLIENTE PRISMA! >> "%logFile%"
    echo Possiveis causas: >> "%logFile%"
    echo - Schema do Prisma corrompido >> "%logFile%"
    echo - Dependencias nao instaladas corretamente >> "%logFile%"
    echo - Erro de sintaxe no schema >> "%logFile%"
    echo. >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo    FALHA NO RESET >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo.
    echo Log salvo em: %logFile%
    echo.
    echo ========================================
    echo    ERRO! RESET FALHOU!
    echo ========================================
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo [OK] Cliente Prisma gerado com sucesso!
echo [OK] Cliente Prisma gerado com sucesso! >> "%logFile%"
echo. >> "%logFile%"
echo.

REM Executar reset completo do banco
echo [7/7] Executando reset completo do banco...
echo [7/7] Executando reset completo do banco... >> "%logFile%"
echo.
echo ATENCAO: O banco sera completamente resetado!
echo Todos os dados serao perdidos e o seed sera executado.
echo.
echo [AVISO] O banco sera completamente resetado! >> "%logFile%"
echo Todos os dados serao perdidos e o seed sera executado. >> "%logFile%"
echo. >> "%logFile%"

npx prisma migrate reset --force
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo    ERRO: FALHA AO EXECUTAR RESET!
    echo ========================================
    echo.
    echo Possiveis causas:
    echo - Banco de dados nao esta rodando
    echo - Credenciais incorretas no arquivo .env
    echo - Conexao com o banco falhou
    echo - Banco nao existe ainda
    echo - Permissoes insuficientes no banco
    echo.
    echo Verifique se o PostgreSQL esta rodando e as credenciais.
    echo.
    echo ERRO: FALHA AO EXECUTAR RESET! >> "%logFile%"
    echo Possiveis causas: >> "%logFile%"
    echo - Banco de dados nao esta rodando >> "%logFile%"
    echo - Credenciais incorretas no arquivo .env >> "%logFile%"
    echo - Conexao com o banco falhou >> "%logFile%"
    echo - Banco nao existe ainda >> "%logFile%"
    echo - Permissoes insuficientes no banco >> "%logFile%"
    echo. >> "%logFile%"
    echo Verifique se o PostgreSQL esta rodando e as credenciais. >> "%logFile%"
    echo. >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo    FALHA NO RESET >> "%logFile%"
    echo ======================================== >> "%logFile%"
    echo.
    echo Log salvo em: %logFile%
    echo.
    echo ========================================
    echo    ERRO! RESET FALHOU!
    echo ========================================
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)
echo [OK] Reset completo executado com sucesso!
echo [OK] Reset completo executado com sucesso! >> "%logFile%"
echo. >> "%logFile%"
echo.

echo.
echo ========================================
echo    RESET COMPLETO CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo [OK] Node.js verificado
echo [OK] Pasta Prisma encontrada
echo [OK] Arquivo .env configurado
echo [OK] Dependencias instaladas
echo [OK] Pasta de imagens limpa
echo [OK] Cliente Prisma gerado
echo [OK] Banco resetado completamente
echo.

echo ======================================== >> "%logFile%"
echo    RESET COMPLETO CONCLUIDO COM SUCESSO! >> "%logFile%"
echo ======================================== >> "%logFile%"
echo. >> "%logFile%"
echo [OK] Node.js verificado >> "%logFile%"
echo [OK] Pasta Prisma encontrada >> "%logFile%"
echo [OK] Arquivo .env configurado >> "%logFile%"
echo [OK] Dependencias instaladas >> "%logFile%"
echo [OK] Pasta de imagens limpa >> "%logFile%"
echo [OK] Cliente Prisma gerado >> "%logFile%"
echo [OK] Banco resetado completamente >> "%logFile%"
echo. >> "%logFile%"

echo O sistema foi completamente resetado:
echo - Banco de dados: Resetado e populado com dados iniciais
echo - Imagens enviadas: Todas removidas
echo - Cliente Prisma: Regenerado
echo.
echo Agora voce pode:
echo 1. Executar: npm start
echo 2. Usar o script run-standalone.bat para modo fullscreen
echo.
echo Log salvo em: %logFile%
echo.
echo ========================================
echo    SUCESSO! RESET COMPLETO FINALIZADO!
echo ========================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
