@echo off
echo ========================================
echo    BUILD E DISTRIBUICAO DO DINEX
echo ========================================
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao esta instalado!
    pause
    exit /b 1
)

echo Fazendo build do projeto...
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha no build!
    pause
    exit /b 1
)

echo Build concluido com sucesso!
echo.

REM Criar pasta de distribuição
if exist "dist" rmdir /s /q "dist"
mkdir "dist"

echo Copiando arquivos para distribuicao...
echo.

REM Copiar arquivos essenciais
echo - Copiando pasta .next...
xcopy ".next" "dist\.next" /E /I /Y >nul

echo - Copiando pasta public...
xcopy "public" "dist\public" /E /I /Y >nul

echo - Copiando package.json...
copy "package.json" "dist\" >nul

echo - Copiando package-lock.json...
copy "package-lock.json" "dist\" >nul

echo - Copiando next.config.ts...
copy "next.config.ts" "dist\" >nul

echo - Copiando tsconfig.json...
copy "tsconfig.json" "dist\" >nul

echo - Copiando prisma...
xcopy "prisma" "dist\prisma" /E /I /Y >nul

echo - Copiando scripts...
xcopy "scripts" "dist\scripts" /E /I /Y >nul

echo - Copiando README.md...
copy "README.md" "dist\" >nul

REM Criar arquivo .env de exemplo
echo Criando arquivo .env de exemplo...
(
echo # Configuracoes do Banco de Dados
echo DATABASE_URL="postgresql://usuario:senha@localhost:5432/dinex"
echo.
echo # Configuracoes do Next.js
echo NODE_ENV=production
) > "dist\.env.example"

REM Criar script de instalação
echo Criando script de instalacao...
(
echo @echo off
echo echo ========================================
echo echo    INSTALACAO DO DINEX
echo echo ========================================
echo echo.
echo echo 1. Instalando dependencias...
echo npm install --production
echo echo.
echo echo 2. Configurando banco de dados...
echo call scripts\setup-database.bat
echo echo.
echo echo 3. Iniciando o sistema...
echo npm start
echo echo.
echo echo Sistema iniciado! Use scripts\run-standalone.bat para modo fullscreen
echo pause
) > "dist\instalar.bat"

echo.
echo ========================================
echo    DISTRIBUICAO PREPARADA!
echo ========================================
echo.
echo Arquivos copiados para a pasta 'dist'
echo.
echo Para distribuir, envie a pasta 'dist' completa
echo.
echo O usuario final deve:
echo 1. Executar 'instalar.bat'
echo 2. Configurar o arquivo .env com as credenciais do banco
echo 3. Executar 'scripts\setup-database.bat'
echo 4. Executar 'npm start' para iniciar
echo 5. Usar 'scripts\run-standalone.bat' para modo fullscreen
echo.
pause
