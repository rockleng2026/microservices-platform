# 模型实例功能API测试文档

## 1. 环境准备

### 后端服务
- 服务地址: http://localhost:7006
- API前缀: /api/soo/v2/model-instances
- Swagger文档: http://localhost:7006/swagger-ui.html

### 前端服务
- 服务地址: http://localhost:8001
- 模型实例管理页面: http://localhost:8001/saleops-optimizer/financial-analysis/model-instances

## 2. API测试用例

### 2.1 获取模型实例列表
```bash
GET /api/soo/v2/model-instances?page=1&size=10
```

### 2.2 创建模型实例
```bash
POST /api/soo/v2/model-instances
Content-Type: application/json

{
  "modelId": 1,
  "projectId": 1,
  "instanceCode": "INST_001",
  "instanceName": "测试模型实例1",
  "instanceDescription": "这是一个测试模型实例",
  "instanceStatus": "ACTIVE"
}
```

### 2.3 获取模型实例详情
```bash
GET /api/soo/v2/model-instances/1
```

### 2.4 更新模型实例
```bash
PUT /api/soo/v2/model-instances/1
Content-Type: application/json

{
  "instanceName": "更新后的模型实例1",
  "instanceDescription": "这是更新后的描述"
}
```

### 2.5 获取实例变量列表
```bash
GET /api/soo/v2/model-instances/1/variables
```

### 2.6 更新实例变量
```bash
PUT /api/soo/v2/model-instances/1/variables
Content-Type: application/json

{
  "variables": [
    {
      "variableId": 1,
      "variableName": "销售收入",
      "variableValue": "1000000",
      "variableType": "DECIMAL"
    }
  ]
}
```

### 2.7 执行实例计算
```bash
POST /api/soo/v2/model-instances/1/calculate
Content-Type: application/json

{
  "calculationType": "FULL"
}
```

### 2.8 克隆模型实例
```bash
POST /api/soo/v2/model-instances/1/clone
Content-Type: application/json

{
  "newInstanceCode": "INST_001_CLONE",
  "newInstanceName": "克隆的模型实例1"
}
```

### 2.9 获取实例统计信息
```bash
GET /api/soo/v2/model-instances/statistics
```

## 3. 数据库验证

### 3.1 检查表结构
```sql
-- 检查模型实例表
DESCRIBE soo_financial_model_instance;

-- 检查实例变量表
DESCRIBE soo_model_instance_variable;

-- 检查计算历史表
DESCRIBE soo_model_instance_calculation_history;
```

### 3.2 检查测试数据
```sql
-- 查看模型实例数据
SELECT * FROM soo_financial_model_instance;

-- 查看实例变量数据
SELECT * FROM soo_model_instance_variable;

-- 查看计算历史数据
SELECT * FROM soo_model_instance_calculation_history;
```

## 4. 前端功能验证

### 4.1 页面访问
- 访问模型实例管理页面
- 验证页面正常加载
- 检查列表显示

### 4.2 功能测试
- 创建新实例
- 编辑实例信息
- 查看实例详情
- 编辑实例变量
- 执行计算
- 查看计算历史
- 克隆实例

## 5. 常见问题排查

### 5.1 后端服务启动问题
- 检查数据库连接配置
- 验证数据库表是否创建
- 查看服务日志

### 5.2 前端页面问题
- 检查API接口是否正常
- 验证路由配置
- 查看浏览器控制台错误

### 5.3 数据库问题
- 确认表结构正确
- 检查测试数据是否插入
- 验证多租户配置 