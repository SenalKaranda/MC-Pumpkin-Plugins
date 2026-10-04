# Start the KarandaPerms, KarandaRewards, and KarandaWorldTools editors together.
#
#   .\start-editors.ps1
#   .\start-editors.ps1 "D:\server\plugins\data"
#   .\start-editors.ps1 -Data "D:\server\plugins\data" -Bind 127.0.0.1
#   .\start-editors.ps1 -Data "D:\server\plugins\data" -Editors "D:\editors"
#
# -Data is the server's plugins\data folder. It must contain:
#   karanda-perms        port 8787   karanda-editor.exe
#   karanda-rewards      port 8788   karanda-rewards-editor.exe
#   karanda-worldtools   port 8789   karanda-worldtools-editor.exe
#
# Each program is taken from the first place it exists:
#   -Editors, or a KarandaPerms / KarandaRewards / KarandaWorldTools folder inside it
#   the folder that contains this script, or those same subfolders
#   an editors folder next to this script, or those subfolders
#   that plugin's target\release folder, when the program is already there
#
# Put that editor's web\dist folder in the same folder as the program.
# The three editors do not share one page.
#
# Ctrl+C stops all three. In game, /kp editor, /krewards editor, and /kwt editor
# print the session link. This script only listens.
#
# Open the printed http:// address. https:// on these ports makes Firefox
# report NS_ERROR_NET_EMPTY_RESPONSE. Do not publish 8787-8789 on the Pumpkin
# container: Docker accepts the connection and sends nothing, which is the
# same Firefox error.
#
# When cargo is installed and a plugin still has a debug build cache
# (target\debug), that cache is removed before the editor starts. Release
# programs are left in place. A machine without cargo skips that cleanup.

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Data = "D:\Docker\projects\pumpkin-mc\data\plugins\data",
    [string]$Bind = "0.0.0.0",
    [int]$PermsPort = 8787,
    [int]$RewardsPort = 8788,
    [int]$WorldToolsPort = 8789,
    [string]$Editors = ""
)

$ErrorActionPreference = "Stop"

if ($Editors) {
    if (-not (Test-Path -LiteralPath $Editors -PathType Container)) {
        throw "Missing editors folder: $Editors"
    }
    $Editors = (Resolve-Path -LiteralPath $Editors).Path
}

$Data = (Resolve-Path -LiteralPath $Data).Path
$PermsData = Join-Path $Data "karanda-perms"
$RewardsData = Join-Path $Data "karanda-rewards"
$WorldToolsData = Join-Path $Data "karanda-worldtools"

foreach ($folder in @($PermsData, $RewardsData, $WorldToolsData)) {
    if (-not (Test-Path -LiteralPath $folder -PathType Container)) {
        throw "Missing plugin data folder: $folder"
    }
}

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Projects = @(
    @{
        Name = "KarandaPerms"
        Project = Join-Path $Here "KarandaPerms"
        Exe = "karanda-editor.exe"
        Data = $PermsData
        Port = $PermsPort
    },
    @{
        Name = "KarandaRewards"
        Project = Join-Path $Here "KarandaRewards"
        Exe = "karanda-rewards-editor.exe"
        Data = $RewardsData
        Port = $RewardsPort
    },
    @{
        Name = "KarandaWorldTools"
        Project = Join-Path $Here "KarandaWorldTools"
        Exe = "karanda-worldtools-editor.exe"
        Data = $WorldToolsData
        Port = $WorldToolsPort
    }
)

$processes = @()

function Test-EmptyListener {
    param([int]$Port)
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $wait = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        if (-not $wait.AsyncWaitHandle.WaitOne(400)) {
            return $false
        }
        if (-not $client.Connected) {
            return $false
        }
        $stream = $client.GetStream()
        $stream.ReadTimeout = 800
        $payload = [Text.Encoding]::ASCII.GetBytes("GET / HTTP/1.1`r`nHost: 127.0.0.1`r`nConnection: close`r`n`r`n")
        $stream.Write($payload, 0, $payload.Length)
        $buffer = New-Object byte[] 256
        $read = 0
        try {
            $read = $stream.Read($buffer, 0, $buffer.Length)
        } catch {
            $read = 0
        }
        return $read -le 0
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

function Resolve-EditorExe {
    param($Editor)
    $folders = @()
    if ($Editors) {
        $folders += $Editors
        $folders += (Join-Path $Editors $Editor.Name)
    }
    $folders += $Here
    $folders += (Join-Path $Here $Editor.Name)
    $folders += (Join-Path $Here "editors")
    $folders += (Join-Path (Join-Path $Here "editors") $Editor.Name)
    $folders += (Join-Path $Editor.Project "target\release")

    $candidates = @()
    foreach ($folder in $folders) {
        $candidates += (Join-Path $folder $Editor.Exe)
    }
    foreach ($path in $candidates) {
        if (Test-Path -LiteralPath $path -PathType Leaf) {
            return (Resolve-Path -LiteralPath $path).Path
        }
    }
    $looked = ($candidates -join [Environment]::NewLine)
    throw "Missing $($Editor.Exe) for $($Editor.Name). Looked in:`n$looked"
}

function Clear-DevArtifacts {
    param($Editor)
    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        return
    }
    $debug = Join-Path $Editor.Project "target\debug"
    if (-not (Test-Path -LiteralPath $debug)) {
        return
    }
    $manifest = Join-Path $Editor.Project "Cargo.toml"
    if (-not (Test-Path -LiteralPath $manifest)) {
        return
    }
    Write-Host "$($Editor.Name)  removing debug build cache"
    & cargo clean --profile dev --manifest-path $manifest --offline
    if ($LASTEXITCODE -ne 0) {
        throw "cargo clean failed for $($Editor.Name)"
    }
}

function Stop-Editors {
    foreach ($proc in $processes) {
        if ($proc -and -not $proc.HasExited) {
            & taskkill.exe /PID $proc.Id /T /F | Out-Null
        }
    }
}

try {
    foreach ($editor in $Projects) {
        if (Test-EmptyListener -Port $editor.Port) {
            throw @"
Port $($editor.Port) accepts a connection and sends nothing back.
Firefox reports that as NS_ERROR_NET_EMPTY_RESPONSE.
Another program is listening there. If the Pumpkin container publishes $($editor.Port), remove that published port. The editors run on this computer, not inside the container.
"@
        }
    }
    foreach ($editor in $Projects) {
        $editor.ExePath = Resolve-EditorExe $editor
    }
    foreach ($editor in $Projects) {
        Clear-DevArtifacts $editor
        $work = Split-Path -Parent $editor.ExePath
        Write-Host "$($editor.Name)  http://127.0.0.1:$($editor.Port)  $($editor.Data)"
        Write-Host "  $($editor.ExePath)"
        $arguments = "--data `"$($editor.Data)`" --port $($editor.Port) --bind $Bind"
        $processes += Start-Process -FilePath $editor.ExePath -ArgumentList $arguments -WorkingDirectory $work -PassThru -NoNewWindow
    }

    Write-Host ""
    Write-Host "All three editors are starting. Ctrl+C stops them."
    Write-Host "Open http://127.0.0.1 and the port above. Do not use https."
    if ($Bind -eq "0.0.0.0") {
        Write-Host "Other computers use http://<this-computer-ip> and the same port."
    }
    while ($true) {
        $running = @($processes | Where-Object { $_ -and -not $_.HasExited })
        if ($running.Count -eq 0) {
            break
        }
        Start-Sleep -Seconds 1
    }
}
finally {
    Stop-Editors
}
