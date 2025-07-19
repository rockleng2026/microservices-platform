# 财务模型复制功能API测试

## 测试环境
- 服务地址：`http://localhost:8080`
- API基础路径：`/api/soo/v2/models`

## 测试步骤

### 1. 准备测试数据
首先确保数据库中有可复制的财务模型数据：

```sql
-- 检查现有模型
SELECT id, model_code, model_name, variable_count, chart_count 
FROM soo_financial_model 
WHERE is_active = 1 
ORDER BY created_at DESC 
LIMIT 5;
```

### 2. 测试复制API

#### 请求示例
```bash
curl -X POST "http://localhost:8080/api/soo/v2/models/{modelId}/clone" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{
    "newModelCode": "TEST_COPY_001",
    "newModelName": "测试复制模型",
    "includeVariables": true,
    "includeCharts": true
  }'
```

#### 请求参数说明
- `modelId`: 要复制的源模型ID
- `newModelCode`: 新模型编码（必须唯一）
- `newModelName`: 新模型名称
- `includeVariables`: 是否复制变量配置（默认true）
- `includeCharts`: 是否复制图表配置（默认true）

#### 成功响应示例
```json
{
  "resp_code": 0,
  "resp_msg": "操作成功",
  "datas": {
    "id": 123,
    "modelCode": "TEST_COPY_001",
    "modelName": "测试复制模型",
    "modelCategory": "breakeven_analysis",
    "modelDescription": "这是一个用于演示复制功能的示例模型，包含完整的变量和图表配置",
    "isActive": true,
    "parentModelId": 1,
    "createdAt": "2024-12-19T10:30:00",
    "updatedAt": "2024-12-19T10:30:00"
  }
}
```

### 3. 验证复制结果

#### 检查模型复制
```sql
-- 查看源模型和复制模型
SELECT 
    m1.id as source_id,
    m1.model_code as source_code,
    m1.model_name as source_name,
    m2.id as cloned_id,
    m2.model_code as cloned_code,
    m2.model_name as cloned_name,
    m2.parent_model_id
FROM soo_financial_model m1
LEFT JOIN soo_financial_model m2 ON m2.parent_model_id = m1.id
WHERE m1.id = {sourceModelId};
```

#### 检查变量复制
```sql
-- 比较源模型和复制模型的变量数量
SELECT 
    'Source Variables' as type,
    COUNT(*) as count
FROM soo_model_variable 
WHERE model_id = {sourceModelId}
UNION ALL
SELECT 
    'Cloned Variables' as type,
    COUNT(*) as count
FROM soo_model_variable mv
JOIN soo_financial_model m ON mv.model_id = m.id
WHERE m.parent_model_id = {sourceModelId};
```

#### 检查图表复制
```sql
-- 比较源模型和复制模型的图表数量
SELECT 
    'Source Charts' as type,
    COUNT(*) as count
FROM soo_chart_analysis_model 
WHERE model_id = {sourceModelId}
UNION ALL
SELECT 
    'Cloned Charts' as type,
    COUNT(*) as count
FROM soo_chart_analysis_model cam
JOIN soo_financial_model m ON cam.model_id = m.id
WHERE m.parent_model_id = {sourceModelId};
```

#### 检查系列复制
```sql
-- 比较源图表和复制图表的系列数量
SELECT 
    'Source Series' as type,
    COUNT(*) as count
FROM soo_chart_series cs
JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
WHERE cam.model_id = {sourceModelId}
UNION ALL
SELECT 
    'Cloned Series' as type,
    COUNT(*) as count
FROM soo_chart_series cs
JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
JOIN soo_financial_model m ON cam.model_id = m.id
WHERE m.parent_model_id = {sourceModelId};
```

### 4. 错误处理测试

#### 测试1：模型不存在
```bash
curl -X POST "http://localhost:8080/api/soo/v2/models/99999/clone" \
  -H "Content-Type: application/json" \
  -d '{
    "newModelCode": "TEST_ERROR_001",
    "newModelName": "测试错误模型"
  }'
```

预期响应：
```json
{
  "resp_code": 500,
  "resp_msg": "源模型不存在: 99999",
  "datas": null
}
```

#### 测试2：模型编码重复
```bash
curl -X POST "http://localhost:8080/api/soo/v2/models/{modelId}/clone" \
  -H "Content-Type: application/json" \
  -d '{
    "newModelCode": "EXISTING_CODE",
    "newModelName": "测试重复编码"
  }'
```

预期响应：
```json
{
  "resp_code": 500,
  "resp_msg": "模型编码已存在: EXISTING_CODE",
  "datas": null
}
```

### 5. 性能测试

#### 批量复制测试
```bash
# 创建测试脚本
for i in {1..5}; do
  curl -X POST "http://localhost:8080/api/soo/v2/models/{modelId}/clone" \
    -H "Content-Type: application/json" \
    -d "{
      \"newModelCode\": \"BATCH_TEST_${i}\",
      \"newModelName\": \"批量测试模型 ${i}\",
      \"includeVariables\": true,
      \"includeCharts\": true
    }" &
done
wait
```

### 6. 清理测试数据

```sql
-- 删除测试复制的模型（级联删除相关数据）
DELETE FROM soo_financial_model 
WHERE model_code LIKE 'TEST_COPY_%' 
   OR model_code LIKE 'BATCH_TEST_%';
```

## 测试检查清单

- [ ] 模型基础信息正确复制
- [ ] 变量配置完整复制
- [ ] 图表配置完整复制
- [ ] 系列配置完整复制
- [ ] 复制关系正确记录（parent_model_id）
- [ ] 错误处理正常工作
- [ ] 性能表现良好
- [ ] 数据一致性保证

## 常见问题排查

### 1. SQL语法错误
如果遇到 `Unknown column 'updated_at'` 错误，检查：
- `ChartSeries` 实体是否正确映射字段
- 数据库表结构是否与实体定义一致

### 2. 外键约束错误
如果遇到外键约束错误，检查：
- 源模型是否存在
- 相关表的数据完整性

### 3. 事务回滚
如果复制过程中出现错误，检查：
- 事务配置是否正确
- 异常处理是否完善

### 4. 性能问题
如果复制速度较慢，检查：
- 数据库索引是否优化
- 批量操作是否合理
- 网络连接是否稳定 