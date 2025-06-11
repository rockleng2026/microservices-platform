@echo off
echo 正在初始化central_organization数据库...

REM 查找MySQL安装目录
set MYSQL_PATH=""
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
) else if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
) else if exist "D:\MySQL\bin\mysql.exe" (
    set MYSQL_PATH="D:\MySQL\bin\mysql.exe"
) else (
    echo 未找到MySQL安装路径，请手动执行以下SQL脚本：
    echo %~dp0init-central-organization-db.sql
    pause
    exit /b 1
)

echo 找到MySQL路径: %MYSQL_PATH%
echo 执行数据库初始化脚本...

%MYSQL_PATH% -u root -pBigdata@2024 < "%~dp0init-central-organization-db.sql"

if %ERRORLEVEL% EQU 0 (
    echo 数据库初始化成功！
) else (
    echo 数据库初始化失败，错误代码: %ERRORLEVEL%
)

pause 