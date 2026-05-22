# Scan 社院课程stt subfolder
$targetPath = "E:\社院课程stt"

if (Test-Path $targetPath) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Scanning: 社院课程stt" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $folders = Get-ChildItem $targetPath -Directory
    
    if ($folders.Count -eq 0) {
        Write-Host "No subfolders found." -ForegroundColor Yellow
    } else {
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
        Write-Host "----------------------------------------" -ForegroundColor Cyan
        Write-Host "Total: $totalSize GB" -ForegroundColor Green
    }
} else {
    Write-Host "`nPath not found: $targetPath" -ForegroundColor Red
    Write-Host "`nTrying to list folder contents..." -ForegroundColor Yellow
    Get-ChildItem "E:\" -Directory | Where-Object { $_.FullName -like "*stt*" -or $_.FullName -like "*社院*" } | Select-Object Name, FullName
}
