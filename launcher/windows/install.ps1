<#
.SYNOPSIS
  SOCIALKILLER Zero-Bloat Windows Auto-Installer (<100 lines)
  Run via: irm https://raw.githubusercontent.com/dr-week/SOCIALKILLER/main/launcher/windows/install.ps1 | iex
#>
$ErrorActionPreference = 'Stop'

$RepoUrl    = 'https://github.com/dr-week/SOCIALKILLER.git'
$InstallDir = Join-Path $env:LOCALAPPDATA 'SOCIALKILLER'

Write-Host '======================================================' -ForegroundColor Cyan
Write-Host '  SOCIALKILLER · Windows Auto-Installer ($0 Local-First)' -ForegroundColor Cyan
Write-Host '======================================================' -ForegroundColor Cyan

function Ensure-Tool($cmd, $wingetId, $label) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) {
    Write-Host "[OK] $label already installed." -ForegroundColor Green
    return
  }
  Write-Host "[INSTALL] Installing $label via winget..." -ForegroundColor Yellow
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "winget not found. Please install $label manually and re-run."
  }
  winget install --id $wingetId --exact --silent --accept-package-agreements --accept-source-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
}

Ensure-Tool 'git'  'Git.Git'         'Git'
Ensure-Tool 'node' 'OpenJS.NodeJS.LTS' 'Node.js LTS'

if (Test-Path (Join-Path $InstallDir '.git')) {
  Write-Host "[UPDATE] Updating existing install at $InstallDir..." -ForegroundColor Cyan
  git -C $InstallDir fetch origin main
  git -C $InstallDir pull --ff-only origin main
} else {
  Write-Host "[CLONE] Cloning SOCIALKILLER into $InstallDir..." -ForegroundColor Cyan
  git clone --depth 1 $RepoUrl $InstallDir
}

Write-Host '[DEPS] Installing dependencies...' -ForegroundColor Cyan
Push-Location $InstallDir
try {
  npm ci --no-audit --no-fund
} catch {
  npm install --no-audit --no-fund
}
Pop-Location

function New-Shortcut($linkPath, $targetPath, $workDir) {
  $shell = New-Object -ComObject WScript.Shell
  $sc = $shell.CreateShortcut($linkPath)
  $sc.TargetPath = $targetPath
  $sc.WorkingDirectory = $workDir
  $sc.Description = 'Launch SOCIALKILLER Local-First Creator OS'
  $sc.Save()
}

$launcherCmd = Join-Path $InstallDir 'Launch FoundryDesk.cmd'
$desktopLnk  = Join-Path ([Environment]::GetFolderPath('Desktop')) 'SOCIALKILLER.lnk'
$startMenuDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'
$startLnk    = Join-Path $startMenuDir 'SOCIALKILLER.lnk'

New-Shortcut $desktopLnk $launcherCmd $InstallDir
New-Shortcut $startLnk   $launcherCmd $InstallDir

Write-Host ''
Write-Host '[DONE] SOCIALKILLER installed successfully!' -ForegroundColor Green
Write-Host "  Directory : $InstallDir"
Write-Host "  Shortcut  : $desktopLnk"
Write-Host '  Update    : npm run update:apply'
Write-Host ''
Start-Process -FilePath $launcherCmd -WorkingDirectory $InstallDir
