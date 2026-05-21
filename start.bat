@echo off
REM Script de démarrage pour développement (Windows)

echo.
echo 🚀 GPS Livraison - Script de démarrage
echo ========================================
echo.

REM Vérifier Node.js
echo 📦 Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installe. Installez-le depuis https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detecte
echo.

REM Installer les dependances
echo 📦 Installation des dependances...
if not exist "node_modules\" (
    echo Serveur...
    call npm install
    echo.
    echo Client...
    cd client
    call npm install
    cd ..
    echo.
) else (
    echo ✓ Dependances deja installees
)
echo.

REM Creer le fichier .env s'il n'existe pas
if not exist ".env" (
    echo 📝 Creation du fichier .env...
    copy .env.example .env >nul
    echo ✓ .env cree
    echo.
)

REM Demarrer
echo ========================================
echo ✓ Tout est pret!
echo 🚀 Demarrage...
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.

call npm run dev

pause
