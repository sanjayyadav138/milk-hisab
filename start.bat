@echo off
setlocal

echo ======================================================
echo    Starting Milk Hisab Production Server
echo ======================================================

set "ROOT_DIR=%~dp0"
set "FRONTEND_DIST_DIR=%ROOT_DIR%frontend\dist"

cd /d "%ROOT_DIR%backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

echo Production Server URL: http://localhost:8000
echo API Documentation:    http://localhost:8000/docs
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
