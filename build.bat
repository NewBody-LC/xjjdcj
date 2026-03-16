@echo off
chcp 65001 >nul
echo ==========================================
echo 小鸡舰队出击 - 一键遗迹工具 打包脚本
echo ==========================================
echo.

:: 检查是否安装了Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] 检测到Node.js版本:
node -v
echo.

:: 设置Electron镜像源（使用淘宝镜像加速下载）
echo [2/4] 设置Electron镜像源...
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npm config set registry https://registry.npmmirror.com
echo [完成] 镜像源设置完成
echo.

:: 安装依赖
echo [3/4] 安装项目依赖（这可能需要几分钟时间）...
npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)
echo [完成] 依赖安装完成
echo.

:: 执行打包
echo [4/4] 开始打包应用...
npm run build
if errorlevel 1 (
    echo [错误] 打包失败，请查看错误信息
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [成功] 打包完成！
echo 输出目录: release\
echo ==========================================
echo.
pause
