@echo off
echo ========================================
echo   FFmpeg 安装辅助脚本
echo ========================================
echo.
echo 正在检查FFmpeg是否已安装...

where ffmpeg >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ FFmpeg已安装！
    ffmpeg -version | findstr "ffmpeg version"
    pause
    exit /b 0
)

echo × FFmpeg未安装
echo.
echo 请按照以下步骤安装FFmpeg：
echo.
echo 方法1：使用Chocolatey（推荐）
echo   1. 以管理员身份运行：choco install ffmpeg
echo.
echo 方法2：手动安装
echo   1. 访问 https://ffmpeg.org/download.html
echo   2. 点击 Windows 图标，下载 builds
echo   3. 推荐下载：https://github.com/BtbN/FFmpeg-Builds/releases
echo   4. 解压下载的zip文件
echo   5. 将 bin 文件夹路径添加到系统环境变量PATH
echo.
echo 方法3：使用Scoop
echo   1. 运行：scoop install ffmpeg
echo.
echo 安装完成后，请重新打开此终端并运行 'ffmpeg -version' 验证
echo.
pause
