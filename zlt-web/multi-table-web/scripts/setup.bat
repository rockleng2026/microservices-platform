@echo off
chcp 65001 >nul
echo 🚀 正在初始化多维表格系统前端项目...
echo.

:: 检查Node.js版本
echo 📋 检查环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 请先安装 Node.js (推荐版本 ^>= 16.0.0^)
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set node_version=%%i
for /f "tokens=*" %%i in ('npm -v') do set npm_version=%%i

echo Node.js 版本: %node_version%
echo npm 版本: %npm_version%
echo.

:: 进入项目目录
cd /d "%~dp0.."
echo 📁 当前目录: %cd%
echo.

:: 安装依赖
echo 📦 安装项目依赖...
where yarn >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 yarn 安装依赖...
    call yarn install
) else (
    echo 使用 npm 安装依赖...
    call npm install
)

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败，请检查网络连接或手动安装
    pause
    exit /b 1
)

echo ✅ 依赖安装完成
echo.

:: 创建环境变量文件
if not exist ".env.local" (
    echo 📝 创建环境变量文件...
    (
        echo # 开发环境配置
        echo VITE_API_BASE_URL=http://localhost:8080
        echo VITE_APP_TITLE=多维表格系统
        echo VITE_APP_VERSION=1.0.0
        echo.
        echo # VTable配置
        echo VITE_VTABLE_LICENSE=
        echo VITE_VTABLE_THEME=default
        echo.
        echo # 调试模式
        echo VITE_DEBUG=true
    ) > .env.local
    echo ✅ 环境变量文件已创建: .env.local
)

echo.
echo 🎉 项目初始化完成！
echo.
echo 📚 快速开始:
echo   npm run dev     # 启动开发服务器
echo   npm run build   # 构建生产版本
echo   npm run preview # 预览生产构建
echo   npm run lint    # 代码检查
echo.
echo 🌐 开发服务器地址: http://localhost:3000
echo 📖 项目文档: ./README.md
echo.
echo ✨ 祝您开发愉快！
echo.
pause 