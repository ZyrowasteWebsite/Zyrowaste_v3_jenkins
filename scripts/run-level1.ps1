$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeRoot = Join-Path $projectRoot ".tools\node"

if (-not (Test-Path $nodeRoot)) {
  Write-Host "Portable Node not found. Run scripts/bootstrap-node.ps1 first."
  exit 1
}

$nodeDir = Get-ChildItem -Path $nodeRoot -Directory | Where-Object { $_.Name -like "node-v*-win-x64" } | Select-Object -First 1
if (-not $nodeDir) {
  Write-Host "Portable Node folder not found. Run scripts/bootstrap-node.ps1 first."
  exit 1
}

$nodeExe = Join-Path $nodeDir.FullName "node.exe"
$npmCmd = Join-Path $nodeDir.FullName "npm.cmd"

if (-not (Test-Path $nodeExe) -or -not (Test-Path $npmCmd)) {
  Write-Host "Portable Node binaries are missing. Re-run scripts/bootstrap-node.ps1"
  exit 1
}

$env:Path = "$($nodeDir.FullName);$env:Path"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

$frontendDir = Join-Path $projectRoot "frontend"
$envExample = Join-Path $frontendDir ".env.example"
$envFile = Join-Path $frontendDir ".env"

if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
  Copy-Item $envExample $envFile
  Write-Host "Created frontend/.env from .env.example"
}

$apiKeyReady = $false
if (Test-Path $envFile) {
  $envContent = Get-Content $envFile -Raw
  if ($envContent -match "GROQ_API_KEY=([^\n\r]+)") {
    $keyVal = $matches[1].Trim()
    if ($keyVal -and $keyVal -ne "gsk_your_key_here") {
      $apiKeyReady = $true
    }
  }
}

Write-Host "Installing frontend dependencies (if needed)..."
Push-Location $frontendDir
& $npmCmd install --no-audit --no-fund
Pop-Location

if ($apiKeyReady) {
  Write-Host "Starting Level 1 local API on http://localhost:8000 ..."
  Start-Process -FilePath $nodeExe -ArgumentList "scripts/dev-api.mjs" -WorkingDirectory $projectRoot
} else {
  Write-Host "GROQ_API_KEY is not configured yet."
  Write-Host "Frontend will still start, but chatbot responses will fail until key is set in frontend/.env."
}

Write-Host "Starting frontend on http://localhost:5173 ..."
Push-Location $frontendDir
& $npmCmd run dev -- --host 0.0.0.0 --port 5173
Pop-Location
