# 智学知识库 - 局域网知识库文件服务启动脚本
# 在终端中运行: .\start-knowledge-server.ps1

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " 智学知识库 - 局域网知识库文件服务启动脚本" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$ServerPath = Join-Path $PSScriptRoot "knowledge-server\main.py"

if (-not (Test-Path $ServerPath)) {
    Write-Host "错误: 找不到知识库服务器文件!" -ForegroundColor Red
    Write-Host "预期路径: $ServerPath" -ForegroundColor Red
    exit 1
}

Write-Host "正在启动服务..." -ForegroundColor Green
Write-Host ""
Write-Host "启动后你可以在浏览器中访问:" -ForegroundColor Yellow
Write-Host "  本机: http://localhost:8080" -ForegroundColor White
Write-Host "  局域网: http://$((Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.PrefixOrigin -ne 'WellKnownObject 'Dhcp' }).IPAddress):8080" -ForegroundColor White
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

python $ServerPath