# 10x ROI System Prep & Cleanup
# Run once before starting the bot farm to ensure a clean state

Write-Host "🧹 10x ROI System Prep Started..." -ForegroundColor Cyan

# 1. Kill stale processes safely (No new windows)
Write-Host "Cleaning ADB and Stale Drivers..."
Stop-Process -Name "adb" -ErrorAction SilentlyContinue
Stop-Process -Name "dnplayer" -ErrorAction SilentlyContinue 

# 2. Deep Clean System Temp (Frees up RAM for emulators)
Write-Host "Performing Deep System Clean..."
$tempFolders = @("C:\Windows\Temp", "C:\Users\$env:USERNAME\AppData\Local\Temp")
foreach ($folder in $tempFolders) {
    if (Test-Path $folder) {
        # Get count of items for reporting
        $count = (Get-ChildItem $folder | Measure-Object).Count
        Write-Host "Clearing $count stale files from $folder..."
        Get-ChildItem $folder -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ System is Clean. Ready for Elite Farm Launch." -ForegroundColor Green
