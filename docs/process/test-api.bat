@echo off
chcp 65001 >nul

echo ================================================
echo Portal 3.0 组织管理服务API测试
echo ================================================

echo [1] 测试健康检查...
curl -X GET "http://localhost:7350/actuator/health" -H "Content-Type: application/json"

echo.
echo [2] 测试部门详情查询...
curl -X GET "http://localhost:7350/api/organization/departments/1" -H "Content-Type: application/json" -H "tenant-id: default"

echo.
echo [3] 测试部门树查询...
curl -X GET "http://localhost:7350/api/organization/departments/tree" -H "Content-Type: application/json" -H "tenant-id: default"

echo.
echo ================================================
echo 测试完成！
echo ================================================

pause 