# Check disk space usage
if (Test-Path "E:\") {
    Write-Host "Scanning E: drive folders, please wait..." -ForegroundColor Yellow
    Write-Host "`nE: Drive Folder Space Usage:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $folders = Get-ChildItem "E:\" -Directory
    
    $results = @()
    foreach ($folder in $folders) {
        Write-Host "Scanning: $($folder.Name)..." -ForegroundColor Gray
        $size = (Get-ChildItem $folder.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $sizeGB = [math]::Round($size / 1GB, 2)
        
        $results += [PSCustomObject]@{
            Folder = $folder.Name
            SizeGB = $sizeGB
        }
    }
    
    $results | Sort-Object SizeGB -Descending | Format-Table -AutoSize
    
    # Calculate total
    $totalSize = ($results | Measure-Object -Property SizeGB -Sum).Sum
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Total E: Drive Usage: $totalSize GB" -ForegroundColor Green
} else {
    Write-Host "E: drive does not exist or is not connected" -ForegroundColor Red
}
