@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Milk Hisab (Milk Hisab) - Windows Build Script
echo ======================================================

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/3] Setting up Backend Dependencies...
cd /d "%ROOT_DIR%backend"
if not exist "venv" (
    echo Creating virtual environment in backend\venv...
    python -m venv venv
)
call venv\Scripts\activate.bat
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
python -c "from app.main import app; print('  Backend verified successfully!')"

echo.
echo [2/3] Compiling and Building Frontend...
cd /d "%ROOT_DIR%frontend"
call npm install --silent
call npm run build

if not exist "dist\index.html" (
    echo Error: Frontend build failed. dist\index.html not found.
    exit /b 1
)

echo   Frontend built successfully in frontend\dist!

echo.
echo [3/3] Build Verification Complete!
echo ======================================================
echo    Build Completed Successfully!
echo ======================================================
echo Run start.bat to launch production server.
cd /d "%ROOT_DIR%"
pause
