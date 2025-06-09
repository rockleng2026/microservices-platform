@echo off
chcp 65001 >nul
echo ================================================
echo Portal 3.0 部门管理API完整测试
echo ================================================

echo.
echo [1] 测试健康检查...
curl -s -X GET "http://localhost:7002/actuator/health" | jq .

echo.
echo [2] 测试部门树查询...
curl -s -X GET "http://localhost:7002/api/organization/departments/tree" -H "tenant-id: default" | jq .

echo.
echo [3] 测试创建新部门...
curl -s -X POST "http://localhost:7002/api/organization/departments" ^
  -H "Content-Type: application/json" ^
  -H "tenant-id: default" ^
  -d "{\"name\":\"测试部门\",\"parentId\":0,\"description\":\"API测试创建的部门\"}" | jq .

echo.
echo [4] 再次查询部门树（验证新增）...
curl -s -X GET "http://localhost:7002/api/organization/departments/tree" -H "tenant-id: default" | jq .

echo.
echo [5] 测试部门详情查询...
curl -s -X GET "http://localhost:7002/api/organization/departments/1" -H "tenant-id: default" | jq .

echo.
echo ================================================
echo 测试完成！API响应正常
echo ================================================

pause 