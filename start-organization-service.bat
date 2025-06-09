@echo off
chcp 65001 >nul

echo ================================================
echo Portal 3.0 组织管理服务启动脚本
echo ================================================

echo [1] 启动组织管理服务...
cd zlt-business\organization-service
start "Organization Service" mvn spring-boot:run -Dspring-boot.run.profiles=dev

echo [2] 等待服务启动...
timeout /t 30 /nobreak >nul

echo [3] 测试服务健康状态...
curl -X GET "http://localhost:7350/actuator/health" -H "Content-Type: application/json"

echo.
echo [4] 测试部门API...
curl -X GET "http://localhost:7350/api/organization/departments/tree" -H "Content-Type: application/json" -H "tenant-id: default"

echo.
echo ================================================
echo 服务启动完成！
echo 访问地址: http://localhost:7350
echo API文档: http://localhost:7350/swagger-ui.html
echo ================================================

pause 