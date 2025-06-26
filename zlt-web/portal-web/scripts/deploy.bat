@echo off
chcp 65001 >nul
echo 🚀 Portal Web 部署脚本
echo ========================

REM 设置默认值
if "%API_GATEWAY_URL%"=="" set API_GATEWAY_URL=http://117.72.61.156:9900
if "%NODE_ENV%"=="" set NODE_ENV=production

echo 📋 部署配置：
echo    环境: %NODE_ENV%
echo    API网关: %API_GATEWAY_URL%
echo    构建目录: dist\

REM 检查Node.js环境
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

echo.
echo 🔍 检查依赖...

REM 安装依赖
if not exist "node_modules" (
    echo 📦 安装依赖包...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已存在
)

echo.
echo 🏗️ 开始构建...

REM 构建项目
call npm run build

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ 构建成功！
    echo.
    echo 📊 构建结果：
    echo    构建目录: %CD%\dist
    if exist "dist" (
        for /f %%i in ('dir /s /-c dist ^| find "个文件"') do echo    文件数量: %%i
    )
    echo.
    echo 🔧 部署建议：
    echo    1. 将 dist\ 目录部署到Web服务器
    echo    2. 配置IIS/nginx指向 dist\index.html
    echo    3. 确保API服务器 %API_GATEWAY_URL% 可访问
    echo    4. 配置CORS允许前端域名访问
    echo.
    echo 📝 IIS配置建议：
    echo    - 将dist目录复制到wwwroot
    echo    - 设置默认文档为index.html
    echo    - 配置URL重写规则支持SPA路由
) else (
    echo.
    echo ❌ 构建失败
    echo 请检查错误信息并修复后重试
    pause
    exit /b 1
)

echo.
echo 🎉 部署脚本执行完成
pause 