@echo off
echo ========================================
echo    DESENVOLVIMENTO DINEX STANDALONE
echo ========================================
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao esta instalado!
    pause
    exit /b 1
)

echo Iniciando servidor de desenvolvimento...
start "DineX Dev Server" cmd /k "npm run dev"

echo Aguardando servidor iniciar...
timeout /t 10

echo Abrindo em modo standalone...
timeout /t 2

REM Tentar abrir com Edge primeiro
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000 --start-fullscreen

REM Se Edge não funcionar, tentar com Chrome
if %errorlevel% neq 0 (
    echo Edge nao encontrado, tentando Chrome...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000 --start-fullscreen
)

REM Se Chrome não funcionar, tentar com Firefox
if %errorlevel% neq 0 (
    echo Chrome nao encontrado, tentando Firefox...
    start "" "C:\Program Files\Mozilla Firefox\firefox.exe" -kiosk http://localhost:3000
)

echo.
echo ========================================
echo    DESENVOLVIMENTO INICIADO!
echo ========================================
echo.
echo Servidor rodando em: http://localhost:3000
echo Modo standalone ativado
echo.
echo Para parar: feche a janela do servidor
echo Para sair do fullscreen: Alt+F4
echo.
pause
