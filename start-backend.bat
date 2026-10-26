@echo off
title DoodhLedger Backend (FastAPI)
cd /d "%~dp0backend"
echo Starting FastAPI Backend on http://localhost:8000...
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
pause
