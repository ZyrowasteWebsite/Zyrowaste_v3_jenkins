@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

set "FRONTEND_PORT=5173"
set "BACKEND_PORT=8000"
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

echo.
echo ========================================
echo   Zyrowaste - Local Dev Launcher
echo ========================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] python not found. Install Python 3.11+ from https://python.org/
  pause
  exit /b 1
)

call :SetupBackendEnv
call :SetupFrontendEnv

call :EnsurePort %FRONTEND_PORT% FRONTEND_PORT
call :EnsurePort %BACKEND_PORT% BACKEND_PORT

call :StartBackend
call :StartFrontend

echo Waiting for dev server...
timeout /t 4 /nobreak >nul

echo Opening http://localhost:%FRONTEND_PORT%/#/
start "" "http://localhost:%FRONTEND_PORT%/#/"

echo.
echo ----------------------------------------
echo   Frontend: http://localhost:%FRONTEND_PORT%/
echo   Backend:  http://localhost:%BACKEND_PORT%/api/health
echo ----------------------------------------
echo   Close the server windows to stop the app.
echo.
pause
exit /b 0

:: ---------------------------------------------------------------------------
:: Backend: .venv, pip install from requirements.txt, .env from .env.example
:: ---------------------------------------------------------------------------
:SetupBackendEnv
echo [Backend] Checking environment...

if not exist "%ROOT%\backend\requirements.txt" (
  echo [ERROR] Missing backend\requirements.txt
  pause
  exit /b 1
)

if not exist "%ROOT%\backend\.venv\Scripts\python.exe" (
  echo   Creating Python virtual environment in backend\.venv ...
  pushd "%ROOT%\backend"
  python -m venv .venv
  if errorlevel 1 (
    echo [ERROR] Failed to create backend virtual environment.
    popd
    pause
    exit /b 1
  )
  popd
  set "BACKEND_VENV_NEW=1"
) else (
  echo   Virtual environment already present - skipping creation.
  set "BACKEND_VENV_NEW=0"
)

if "!BACKEND_VENV_NEW!"=="1" (
  echo   Installing packages from backend\requirements.txt ...
  "%ROOT%\backend\.venv\Scripts\python.exe" -m pip install --upgrade pip --quiet
  "%ROOT%\backend\.venv\Scripts\pip.exe" install -r "%ROOT%\backend\requirements.txt"
  if errorlevel 1 (
    echo [ERROR] pip install failed for backend\requirements.txt
    pause
    exit /b 1
  )
) else (
  echo   Dependencies already installed - skipping pip install.
)

if not exist "%ROOT%\backend\.env" (
  if exist "%ROOT%\backend\.env.example" (
    echo   Creating backend\.env from .env.example ...
    copy /Y "%ROOT%\backend\.env.example" "%ROOT%\backend\.env" >nul
    echo   [NOTE] Edit backend\.env and set GROQ_API_KEY before using chat.
  ) else (
    echo [WARN] backend\.env.example not found; create backend\.env manually.
  )
) else (
  echo   backend\.env already present - skipping.
)

echo.
exit /b 0

:: ---------------------------------------------------------------------------
:: Frontend: npm install from package.json, .env from .env.example
:: (package.json + package-lock.json are the frontend dependency manifest)
:: ---------------------------------------------------------------------------
:SetupFrontendEnv
echo [Frontend] Checking environment...

if not exist "%ROOT%\frontend\package.json" (
  echo [ERROR] Missing frontend\package.json
  pause
  exit /b 1
)

if not exist "%ROOT%\frontend\node_modules" (
  echo   Installing packages from frontend\package.json ...
  pushd "%ROOT%\frontend"
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    popd
    pause
    exit /b 1
  )
  popd
) else (
  echo   node_modules already present - skipping npm install.
)

if not exist "%ROOT%\frontend\.env" (
  if exist "%ROOT%\frontend\.env.example" (
    echo   Creating frontend\.env from .env.example ...
    copy /Y "%ROOT%\frontend\.env.example" "%ROOT%\frontend\.env" >nul
  ) else (
    echo [WARN] frontend\.env.example not found; create frontend\.env manually.
  )
) else (
  echo   frontend\.env already present - skipping.
)

echo.
exit /b 0

:: ---------------------------------------------------------------------------
:: Ensure a port is free; kill any listener if occupied.
:: If still busy after kill, scan upward for the next free port.
:: %1 = preferred port, %2 = output variable name
:: ---------------------------------------------------------------------------
:EnsurePort
set "PREFERRED=%~1"
set "VAR_NAME=%~2"

call :FreePort !PREFERRED!

set "CANDIDATE=!PREFERRED!"
:FindFreePort
call :IsPortFree !CANDIDATE!
if "!PORT_FREE!"=="1" goto PortReady

echo   Port !CANDIDATE! still busy, trying next...
set /a CANDIDATE+=1
if !CANDIDATE! GTR 65535 (
  echo [ERROR] No free port found near %PREFERRED%.
  pause
  exit /b 1
)
goto FindFreePort

:PortReady
set "%VAR_NAME%=!CANDIDATE!"
if not "!CANDIDATE!"=="%PREFERRED%" (
  echo   Using port !CANDIDATE! instead of %PREFERRED%.
) else (
  echo   Port !CANDIDATE! is ready.
)
exit /b 0

:: Kill process listening on the given port (if any).
:FreePort
set "PORT=%~1"
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command ^
  "$p=%PORT%; Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $_.OwningProcess } | Sort-Object -Unique"`) do (
  echo   Port %PORT% occupied by PID %%P - stopping...
  taskkill /F /PID %%P >nul 2>&1
  if errorlevel 1 (
    echo   [WARN] Could not stop PID %%P. Trying PowerShell...
    powershell -NoProfile -Command "Stop-Process -Id %%P -Force -ErrorAction SilentlyContinue"
  )
)
exit /b 0

:: Returns PORT_FREE=1 if nothing is listening on the port.
:IsPortFree
set "PORT=%~1"
set "PORT_FREE=0"
for /f "usebackq delims=" %%C in (`powershell -NoProfile -Command ^
  "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { '0' } else { '1' }"`) do set "PORT_FREE=%%C"
exit /b 0

:: Start FastAPI backend using the prepared virtual environment.
:StartBackend
if exist "%ROOT%\backend\.venv\Scripts\uvicorn.exe" (
  echo Starting FastAPI backend on port %BACKEND_PORT%...
  start "Zyrowaste Backend" cmd /k "cd /d ""%ROOT%\backend"" && .venv\Scripts\uvicorn main:app --reload --port %BACKEND_PORT%"
  goto BackendDone
)

echo [WARN] Backend venv not ready; frontend will run without API.
echo.

:BackendDone
exit /b 0

:: Start Vite dev server.
:StartFrontend
echo Starting frontend on port %FRONTEND_PORT%...
start "Zyrowaste Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && npm run dev -- --port %FRONTEND_PORT% --host"
exit /b 0
