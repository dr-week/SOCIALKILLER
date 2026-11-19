param(
    [ValidateSet('assembleDebug', 'assembleRelease', 'bundleRelease')]
    [string]$Task = 'assembleDebug'
)
$ErrorActionPreference = 'Stop'
$factory = if ($env:APK_DEV_ROOT) { $env:APK_DEV_ROOT } else { 'C:\Software\APK-DEV' }
$buildScript = Join-Path $factory 'Scripts\Build-The-Social-Base.ps1'
if (-not (Test-Path $buildScript)) { throw "Android App Factory script not found: $buildScript" }
& $buildScript -Task $Task -ProjectPath (Split-Path $PSScriptRoot -Parent)
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
