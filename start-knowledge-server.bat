@echo off
chcp 65001 >nul
echo =======================================================
echo  智学知识库 - 局域网知识库文件服务启动脚本
echo =======================================================
echo.
echo 正在启动服务...
echo.
python "%~dp0knowledge-server\main.py"
pause