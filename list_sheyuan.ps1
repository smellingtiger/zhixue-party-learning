# Scan subfolder
$targetPath = "E:\社院课程stt"

if (Test-Path $targetPath) {
    Write-Host "Folder exists. Subfolders:"
    Get-ChildItem $targetPath -Directory | ForEach-Object {
        Write-Host "Found: $($_.Name) - $($_.FullName)"
    }
}
