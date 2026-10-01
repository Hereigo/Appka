$ErrorActionPreference = "Stop"

$serverPath = Join-Path $PSScriptRoot "Appka.Server"
$clientPath = Join-Path $PSScriptRoot "Appka.Client"
$serverUrl = "http://localhost:5138/api/hello"
$clientUrl = "http://localhost:5173"

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw "The .NET SDK was not found on PATH."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found on PATH."
}

Start-Process -FilePath $env:ComSpec -ArgumentList @("/k", "dotnet run --launch-profile http") -WorkingDirectory $serverPath
Start-Process -FilePath $env:ComSpec -ArgumentList @("/k", "npm run dev") -WorkingDirectory $clientPath

$deadline = (Get-Date).AddSeconds(60)
$serverReady = $false
$clientReady = $false

while ((Get-Date) -lt $deadline -and (-not $serverReady -or -not $clientReady)) {
    if (-not $serverReady) {
        try {
            Invoke-WebRequest -Uri $serverUrl -TimeoutSec 2 -UseBasicParsing | Out-Null
            $serverReady = $true
        }
        catch {
        }
    }

    if (-not $clientReady) {
        try {
            Invoke-WebRequest -Uri $clientUrl -TimeoutSec 2 -UseBasicParsing | Out-Null
            $clientReady = $true
        }
        catch {
        }
    }

    if (-not $serverReady -or -not $clientReady) {
        Start-Sleep -Seconds 1
    }
}

if ($serverReady -and $clientReady) {
#   Start-Process -FilePath $clientUrl # open by default program
    Start-Process -FilePath "C:\Program Files\Mozilla Firefox\firefox.exe" -ArgumentList $clientUrl
}
else {
    $notReady = @()
    if (-not $serverReady) { $notReady += "API at http://localhost:5138" }
    if (-not $clientReady) { $notReady += "client at $clientUrl" }
    Write-Warning "Timed out waiting for $($notReady -join ' and '). Check the opened command windows for errors."
}