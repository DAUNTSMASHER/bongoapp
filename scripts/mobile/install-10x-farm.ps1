# 💎 10x ROI Elite Master Installer (Windows VPS)
# Designed for PetroSky / CloudClusters

Write-Host "🚀 Starting 10X ROI Elite Installation..." -ForegroundColor Green

# 1. Install Node.js (via Chocolatey)
if ( -not (Get-Command node -ErrorAction SilentlyContinue) ) {
    Write-Host "📥 Installing Node.js LTS..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    choco install nodejs-lts -y
}

# 2. Setup Folder Structure
$BaseDir = "C:\10x-ROI-Farm"
if ( -not (Test-Path $BaseDir) ) {
    New-Item -ItemType Directory -Force -Path $BaseDir
}
Set-Location $BaseDir

# 3. Create placeholder for scripts (User will copy their files here)
# Assuming files are already in the repository/current workspace
# I will provide a command to copy them or download them.

# 4. Install LDPlayer 9 (Silent mode)
$LDPlayerInstaller = "https://encdn.ldmnq.com/download/package/LDPlayer9_En_1001_exe"
Write-Host "📥 Downloading LDPlayer 9..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $LDPlayerInstaller -OutFile "ldplayer_setup.exe"
Write-Host "📥 Installing LDPlayer (Silent)..." -ForegroundColor Cyan
Start-Process "ldplayer_setup.exe" -ArgumentList "/S" -Wait

# 5. Final Instructions
Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "✅ 10x ROI ELITE INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "1. Open LDPlayer 9 and create 5 instances."
    -ForegroundColor White
Write-Host "2. Enable ADB in LDPlayer Settings (Other > ADB Connection > Open)."
    -ForegroundColor White
Write-Host "3. Edit scripts/mobile/config.json with your proxies."
    -ForegroundColor White
Write-Host "4. Run 'node scripts/mobile/v22-10x-roi-controller.js' to START!"
    -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor Green
