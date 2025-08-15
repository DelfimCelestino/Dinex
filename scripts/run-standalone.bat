@echo off
echo Iniciando DineX em modo standalone...
timeout /t 3

REM Verificar se o sistema está rodando na porta 3000
echo Verificando se o servidor esta rodando...
netstat -an | find "3000" >nul
if %errorlevel% neq 0 (
    echo ERRO: Servidor nao esta rodando na porta 3000!
    echo Execute primeiro: npm run dev
    pause
    exit /b 1
)

echo Servidor encontrado! Abrindo em modo standalone...
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

echo DineX iniciado em modo standalone!
echo Pressione Alt+F4 para sair do modo fullscreen
pause
