@echo off
echo ========================================
echo    DINEX STANDALONE
echo ========================================
echo.

REM Criar arquivo de log
set "logFile=run-standalone-log.txt"
echo ======================================== > "%logFile%"
echo    LOG STANDALONE - DINEX >> "%logFile%"
echo    Data: %date% %time% >> "%logFile%"
echo ======================================== >> "%logFile%"
echo. >> "%logFile%"

REM Iniciar servidor Next.js
echo Iniciando servidor DineX...
echo Iniciando servidor DineX... >> "%logFile%"
start "DineX Server" cmd /k "npm start"

echo Aguardando servidor iniciar...
echo Aguardando servidor iniciar... >> "%logFile%"
timeout /t 8

echo Abrindo em modo standalone...
echo Abrindo em modo standalone... >> "%logFile%"
timeout /t 2

REM Tentar abrir com Edge primeiro
echo Tentando abrir com Edge...
echo Tentando abrir com Edge... >> "%logFile%"
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000 --start-fullscreen

REM Se Edge não funcionar, tentar com Chrome
if %errorlevel% neq 0 (
    echo Edge nao encontrado, tentando Chrome...
    echo Edge nao encontrado, tentando Chrome... >> "%logFile%"
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000 --start-fullscreen
)

REM Se Chrome não funcionar, tentar com Firefox
if %errorlevel% neq 0 (
    echo Chrome nao encontrado, tentando Firefox...
    echo Chrome nao encontrado, tentando Firefox... >> "%logFile%"
    start "" "C:\Program Files\Mozilla Firefox\firefox.exe" -kiosk http://localhost:3000
)

echo.
echo ========================================
echo    DINEX INICIADO EM MODO STANDALONE!
echo ========================================
echo.
echo Servidor rodando em: http://localhost:3000
echo Modo standalone ativado
echo.

echo ======================================== >> "%logFile%"
echo    DINEX INICIADO EM MODO STANDALONE! >> "%logFile%"
echo ======================================== >> "%logFile%"
echo. >> "%logFile%"
echo Servidor rodando em: http://localhost:3000 >> "%logFile%"
echo Modo standalone ativado >> "%logFile%"
echo. >> "%logFile%"

echo Para parar: feche a janela do servidor
echo Para sair do fullscreen: Alt+F4
echo.
echo Log salvo em: %logFile%
echo.
echo ========================================
echo    SUCESSO! STANDALONE ATIVADO!
echo ========================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
