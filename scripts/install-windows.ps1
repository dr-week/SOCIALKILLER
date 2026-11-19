<#
 One-time setup (run in PowerShell from project root):
   powershell -ExecutionPolicy Bypass -File scripts\install-windows.ps1 -ExtensionId <id from chrome://extensions>
 Does 3 things:
   1. Registers the native messaging host so the extension can auto-start the app.
   2. Creates a logon task that starts the server at Windows login.
   3. Creates a daily task that queues a randomized promo post (default 09:30).
#>
param(
  [string]$ExtensionId = '',
  [string]$DailyTime = '09:30',
  [string]$Repo = 'https://github.com/dr-week/fast-framework'
)
$root = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node).Source
$hostName = 'com.followdesk.host'

if ($ExtensionId) {
  # Wrapper .bat (Chrome needs an executable path)
  $bat = Join-Path $root 'scripts\native-host.bat'
  "@echo off`r`n`"$node`" `"$root\scripts\native-host.mjs`"" | Set-Content -Encoding ascii $bat

  $manifest = Join-Path $root 'scripts\com.followdesk.host.json'
  @{
    name = $hostName; description = 'FollowDesk app launcher'; path = $bat; type = 'stdio'
    allowed_origins = @("chrome-extension://$ExtensionId/")
  } | ConvertTo-Json | Set-Content -Encoding ascii $manifest
  New-Item -Path "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName" -Force | Out-Null
  Set-ItemProperty -Path "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName" -Name '(default)' -Value $manifest
  Write-Host 'Native host registered.'
} else {
  Write-Host 'No -ExtensionId given: skipped native host registration (tasks only).'
}

# Start server at logon via Startup folder (no admin rights needed)
$startup = [Environment]::GetFolderPath('Startup')
$vbs = Join-Path $startup 'FollowDeskServer.vbs'
$q = '""'
$cmd = "cmd /c cd /d $q$root$q && $q$node$q server.mjs"
('CreateObject("WScript.Shell").Run "' + $cmd + '", 0, False') | Set-Content -Encoding ascii $vbs
Write-Host "Startup launcher: $vbs"

# Daily randomized post (queued; extension fills composer, you press Post)
$a2 = New-ScheduledTaskAction -Execute $node -Argument "scripts\auto-post.mjs --repo=$Repo" -WorkingDirectory $root
Register-ScheduledTask -TaskName 'FollowDesk Daily Post' -Action $a2 -Trigger (New-ScheduledTaskTrigger -Daily -At $DailyTime) -Force -ErrorAction Stop | Out-Null

Write-Host "Done. Daily post task 'FollowDesk Daily Post' at $DailyTime + startup launcher created."

