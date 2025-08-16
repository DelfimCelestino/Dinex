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
echo    🔑  GERADOR DE LICENÇAS - DINEX  🔑
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Este script gera licenças para o sistema DineX
echo    📁  Pasta atual: %CD%
echo.
echo    ═══════════════════════════════════════════════════════════
echo.

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
    echo    ❌  ERRO! GERAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Node.js encontrado: 
node --version
echo.

REM Verificar se o script de licença existe
echo    [2/6] 🔍 Verificando script de licença...
if not exist "generate-license.js" (
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
    echo    ❌  ERRO: SCRIPT DE LICENÇA NÃO ENCONTRADO!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    📄  O arquivo generate-license.js não foi encontrado.
    echo    💡  Verifique se todos os arquivos foram copiados corretamente.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! GERAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo    ✅  Script de licença encontrado
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
    echo    ❌  ERRO! GERAÇÃO FALHOU!  ❌
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
    echo    📦  Instalando dependências...
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
        echo    ❌  ERRO! GERAÇÃO FALHOU!  ❌
        echo    ═══════════════════════════════════════════════════════════
        echo.
        echo    💡  Pressione qualquer tecla para fechar...
        pause >nul
        exit /b 1
    )
    echo    ✅  Dependências instaladas com sucesso!
    echo.
) else (
    echo    ✅  Dependências já instaladas
    echo.
)

REM Coletar dados da licença
echo    [5/6] 📝  Coletando dados da licença...
echo.
echo    ═══════════════════════════════════════════════════════════
echo    📋  DADOS DA LICENÇA
echo    ═══════════════════════════════════════════════════════════
echo.

set /p clientName="    👤  Nome do cliente: "
if "!clientName!"=="" (
    echo    ❌  Nome do cliente é obrigatório!
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

set /p machineName="    💻  Nome da máquina: "
if "!machineName!"=="" (
    echo    ❌  Nome da máquina é obrigatório!
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

set /p hardwareId="    🔧  ID do hardware: "
if "!hardwareId!"=="" (
    echo    ❌  ID do hardware é obrigatório!
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

set /p days="    📅  Número de dias de validade: "
if "!days!"=="" (
    echo    ❌  Número de dias é obrigatório!
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

REM Validar se days é um número
echo !days!| findstr /r "^[0-9]*$" >nul
if %errorlevel% neq 0 (
    echo    ❌  Número de dias deve ser um número válido!
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

set /p clientEmail="    📧  Email do cliente (opcional): "

echo.
echo    ═══════════════════════════════════════════════════════════
echo    📋  RESUMO DA LICENÇA
echo    ═══════════════════════════════════════════════════════════
echo.
echo    👤  Cliente: !clientName!
echo    💻  Máquina: !machineName!
echo    🔧  Hardware ID: !hardwareId!
echo    📅  Validade: !days! dias
if not "!clientEmail!"=="" (
    echo    📧  Email: !clientEmail!
)
echo.

set /p confirm="    💡  Confirmar criação da licença? (s/n): "
if /i not "!confirm!"=="s" (
    echo.
    echo    ❌  Geração cancelada pelo usuário.
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 0
)

REM Gerar licença
echo    [6/6] 🔑  Gerando licença...
echo    ⏳  Gerando licença (pode demorar alguns segundos)...

REM Construir comando
set "command=node generate-license.js create --client "!clientName!" --machine "!machineName!" --hardware "!hardwareId!" --days "!days!""

if not "!clientEmail!"=="" (
    set "command=!command! --email "!clientEmail!""
)

echo    🔧  Comando: !command!
echo.

call !command!
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
    echo    ❌  ERRO: FALHA AO GERAR LICENÇA!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    🔍  Possíveis causas:
    echo    - Banco de dados não está rodando
    echo    - Credenciais incorretas no arquivo .env
    echo    - Conexão com o banco falhou
    echo    - Erro no script de licença
    echo.
    echo    💡  Verifique se o PostgreSQL está rodando e as credenciais.
    echo.
    echo    ═══════════════════════════════════════════════════════════
    echo    ❌  ERRO! GERAÇÃO FALHOU!  ❌
    echo    ═══════════════════════════════════════════════════════════
    echo.
    echo    💡  Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

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
echo    🎉  LICENÇA GERADA COM SUCESSO!  🎉
echo    ═══════════════════════════════════════════════════════════
echo.
echo    ✅  Node.js verificado
echo    ✅  Script de licença encontrado
echo    ✅  Arquivo .env configurado
echo    ✅  Dependências instaladas
echo    ✅  Dados coletados
echo    ✅  Licença gerada
echo.

echo    💡  A licença foi criada no banco de dados.
echo.
echo    ═══════════════════════════════════════════════════════════
echo    📋  LISTAGEM DE LICENÇAS
echo    ═══════════════════════════════════════════════════════════
echo.
echo    ⏳  Carregando lista de licenças...
echo.
call node generate-license.js list
echo.
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🎯  SUCESSO! LICENÇA CRIADA!  🎯
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
