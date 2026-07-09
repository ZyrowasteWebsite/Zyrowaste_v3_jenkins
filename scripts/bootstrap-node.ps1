$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$toolsDir = Join-Path $projectRoot ".tools\node"
New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null

$version = "v20.18.1"
$zipName = "node-$version-win-x64.zip"
$zipPath = Join-Path $toolsDir $zipName
$extractDir = Join-Path $toolsDir "node-$version-win-x64"
$url = "https://nodejs.org/dist/$version/$zipName"

if (-not (Test-Path $extractDir)) {
  Write-Host "Downloading portable Node.js $version ..."
  Invoke-WebRequest -Uri $url -OutFile $zipPath

  Write-Host "Extracting Node.js ..."
  Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
  Remove-Item $zipPath -Force
} else {
  Write-Host "Portable Node already exists: $extractDir"
}

$nodeExe = Join-Path $extractDir "node.exe"
$npmCmd = Join-Path $extractDir "npm.cmd"

if (-not (Test-Path $nodeExe) -or -not (Test-Path $npmCmd)) {
  throw "Portable Node install incomplete."
}

Write-Host ""
& $nodeExe --version
& $npmCmd --version
Write-Host ""
Write-Host "Portable Node installed successfully."
Write-Host "Use scripts/run-level1.ps1 to start beginner level."
