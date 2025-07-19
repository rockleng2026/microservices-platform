# 服务启动测试指南

## 🚀 服务状态检查

### 后端服务 (saleops-optimizer)
- **端口**: 7006
- **状态**: 正在启动中
- **健康检查**: http://localhost:7006/actuator/health
- **API文档**: http://localhost:7006/swagger-ui.html

### 前端服务 (portal-web)
- **端口**: 8001
- **状态**: 正在启动中
- **访问地址**: http://localhost:8001

## 📋 测试步骤

### 1. 检查后端服务
```bash
# 等待几秒钟让服务完全启动，然后检查健康状态
curl http://localhost:7006/actuator/health

# 检查API文档
curl http://localhost:7006/swagger-ui.html
```

### 2. 检查前端服务
```bash
# 检查前端服务是否启动
curl http://localhost:8001
```

### 3. 访问模型实例管理页面
- 打开浏览器访问: http://localhost:8001/saleops-optimizer/financial-analysis/model-instances
- 验证页面正常加载

### 4. API接口测试
```bash
# 测试模型实例列表接口
curl -X GET "http://localhost:7006/api/soo/v2/model-instances?page=1&size=10"

# 测试创建模型实例接口
curl -X POST "http://localhost:7006/api/soo/v2/model-instances" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": 1,
    "projectId": 1,
    "instanceCode": "TEST_001",
    "instanceName": "测试实例",
    "instanceDescription": "这是一个测试实例"
  }'
```

## 🔧 问题排查

### 如果后端服务启动失败
1. 检查数据库连接配置
2. 确认数据库表已创建
3. 查看服务日志

### 如果前端服务启动失败
1. 检查Node.js版本
2. 确认依赖包已安装
3. 查看控制台错误信息

### 如果页面无法访问
1. 确认服务端口正确
2. 检查防火墙设置
3. 验证路由配置

## ✅ 成功标志

- 后端服务返回健康状态
- 前端页面正常加载
- API接口可以正常调用
- 模型实例管理页面可以访问

## 🎉 完成测试

一旦所有服务正常启动，模型实例功能就可以正常使用了！ 