
@echo off
echo Starting Hybrid AI RAG Application...
echo.

echo Starting FastAPI Backend Server...
cd backend
start "Backend Server" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

cd..
echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
