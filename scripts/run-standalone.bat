@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cls
echo.
echo.
echo    ██████╗ ██╗███╗   ██╗███████╗██╗  ██╗
echo    ██╔══██╗██║████╗  ██║██╔════╝╚██╗██╔╝
echo    ██║  ██║██║██╔██╗ ██║█████╗  ╚███╔╝ 
echo    ██║  ██║██║██║╚██╗██║██╔══╝  ██╔██╗ 
echo    ██████╔╝██║██║ ╚████║███████╗██╔╝ ██╗
echo    ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🚀  SISTEMA DINEX - MODO STANDALONE  🚀
echo    ═══════════════════════════════════════════════════════════
echo.
echo    💡  Este script inicia o sistema DineX de forma simples
echo    📁  Pasta atual: %CD%
echo.
echo    ═══════════════════════════════════════════════════════════
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌  Node.js não está instalado!
    echo    🌐  Visite: https://nodejs.org/
    pause
    exit /b 1
)

echo    ✅  Node.js verificado
echo.

REM Verificar se o banco está configurado
echo    💡  Certifique-se de que o banco de dados está configurado!
echo    📋  Execute setup-database.bat se necessário
echo.
echo    ═══════════════════════════════════════════════════════════
echo    Pressione qualquer tecla para continuar...
pause >nul

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
echo    🚀  INICIANDO SISTEMA DINEX
echo    ═══════════════════════════════════════════════════════════
echo.

echo    🚀  Iniciando o sistema...
echo    💡  O sistema será iniciado automaticamente
echo    ⚠️  Para parar o sistema, pressione Ctrl+C
echo.
echo    ═══════════════════════════════════════════════════════════
echo.

REM Aguardar um pouco
echo    ⏳  Aguardando inicialização...
timeout /t 3 /nobreak >nul

REM Abrir Edge no modo standalone
echo    🌐  Abrindo Microsoft Edge no modo standalone...
echo    💡  URL: http://localhost:3000
echo.

REM Abrir Edge no modo standalone (--new-window --app)
start msedge --new-window --app="http://localhost:3000"

echo    ✅  Edge aberto no modo standalone!
echo    🚀  Sistema iniciando, aguarde...
echo.

REM Iniciar o sistema diretamente
echo    🚀  Iniciando o sistema DineX...
echo    💡  O servidor será iniciado neste terminal
echo.
echo    ═══════════════════════════════════════════════════════════
echo    🎯  Sistema DineX iniciando...
echo    ═══════════════════════════════════════════════════════════
echo.

REM Executar npm start diretamente (o script para aqui)
npm start
