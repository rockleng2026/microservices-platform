# 模型实例功能测试指南

## 🎯 功能概述
模型实例功能已经完成开发，包括：
- ✅ 数据库表结构设计
- ✅ 后端API实现
- ✅ 前端页面开发
- ✅ 路由配置完成

## 🚀 服务启动状态
- **后端服务**: http://localhost:7006 (saleops-optimizer)
- **前端服务**: http://localhost:8001 (portal-web)
- **API文档**: http://localhost:7006/swagger-ui.html

## 📋 测试步骤

### 1. 验证服务启动
```bash
# 检查后端服务
curl http://localhost:7006/actuator/health

# 检查前端服务
curl http://localhost:8001
```

### 2. 访问模型实例管理页面
- 打开浏览器访问: http://localhost:8001/saleops-optimizer/financial-analysis/model-instances
- 验证页面正常加载

### 3. API接口测试
```bash
# 获取模型实例列表
curl -X GET "http://localhost:7006/api/soo/v2/model-instances?page=1&size=10"

# 创建模型实例
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

### 4. 数据库验证
```sql
-- 检查表是否存在
SHOW TABLES LIKE 'soo_financial_model_instance%';

-- 查看测试数据
SELECT * FROM soo_financial_model_instance;
SELECT * FROM soo_model_instance_variable;
SELECT * FROM soo_model_instance_calculation_history;
```

## 🔧 功能特性

### 后端功能
- ✅ 模型实例CRUD操作
- ✅ 实例变量管理
- ✅ 计算执行和状态管理
- ✅ 实例克隆功能
- ✅ 计算历史记录
- ✅ 多租户支持

### 前端功能
- ✅ 实例列表展示
- ✅ 创建/编辑实例
- ✅ 实例详情查看
- ✅ 变量配置编辑
- ✅ 计算历史查看
- ✅ 实例克隆操作

## 📊 数据库表结构

### soo_financial_model_instance (模型实例表)
- id: 主键
- instance_code: 实例编码
- instance_name: 实例名称
- model_id: 关联模型ID
- project_id: 关联项目ID
- instance_status: 实例状态
- calculation_status: 计算状态
- 其他字段...

### soo_model_instance_variable (实例变量表)
- id: 主键
- instance_id: 实例ID
- variable_id: 变量ID
- variable_value: 变量值
- variable_type: 变量类型
- 其他字段...

### soo_model_instance_calculation_history (计算历史表)
- id: 主键
- instance_id: 实例ID
- calculation_type: 计算类型
- calculation_status: 计算状态
- input_data: 输入数据
- output_data: 输出数据
- 其他字段...

## 🎉 测试完成
模型实例功能已经完整实现，可以支持项目管理根据具体的模型实例数据来约束项目分成的设定！ 