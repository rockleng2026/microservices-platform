# 财务模型导出功能API测试

## 测试环境
- 服务地址：`http://localhost:8080`
- API基础路径：`/api/soo/v2/models`
- 认证方式：Bearer Token

## 测试数据准备

### 1. 创建测试模型
```sql
-- 插入测试财务模型
INSERT INTO soo_financial_model (
    model_code, 
    model_name, 
    model_category, 
    model_description, 
    is_active, 
    is_template,
    model_version,
    tenant_id,
    creator_id
) VALUES (
    'TEST_EXPORT_001',
    '测试导出模型',
    'breakeven_analysis',
    '这是一个用于测试导出功能的模型',
    true,
    false,
    '1.0.0',
    'default',
    1
);

-- 获取模型ID
SET @test_model_id = LAST_INSERT_ID();
```

### 2. 创建测试变量
```sql
-- 插入测试变量
INSERT INTO soo_model_variable (
    model_id, 
    variable_code, 
    variable_name, 
    variable_type, 
    data_type, 
    unit,
    display_order,
    is_required,
    is_key_indicator,
    is_visible
) VALUES 
(@test_model_id, 'revenue', '收入', 'INPUT', 'DECIMAL', '万元', 1, true, true, true),
(@test_model_id, 'cost', '成本', 'INPUT', 'DECIMAL', '万元', 2, true, true, true),
(@test_model_id, 'profit', '利润', 'CALCULATED', 'DECIMAL', '万元', 3, false, true, true);
```

### 3. 创建测试图表
```sql
-- 插入测试图表
INSERT INTO soo_chart_analysis_model (
    model_id,
    chart_name,
    x_axis_name,
    x_axis_field,
    x_axis_unit,
    y_axis_name,
    y_axis_unit,
    chart_type,
    simulation_steps
) VALUES (
    @test_model_id,
    '盈亏平衡分析图',
    '收入',
    'revenue',
    '万元',
    '利润',
    '万元',
    'line',
    100
);

-- 获取图表ID
SET @test_chart_id = LAST_INSERT_ID();
```

### 4. 创建测试系列
```sql
-- 插入测试系列
INSERT INTO soo_chart_series (
    chart_id,
    series_name,
    series_field,
    series_type,
    color,
    sort_order
) VALUES 
(@test_chart_id, '收入线', 'revenue', 'variable', '#1890ff', 1),
(@test_chart_id, '成本线', 'cost', 'variable', '#ff4d4f', 2),
(@test_chart_id, '利润线', 'profit', 'variable', '#52c41a', 3);
```

## API测试

### 1. 单个模型导出测试

#### 请求示例
```bash
curl -X GET "http://localhost:8080/api/soo/v2/models/{modelId}/export/excel" \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  --output "test_model_export.xlsx"
```

#### 预期响应
- **状态码**: 200 OK
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **文件名**: `测试导出模型_20241219_143022.xlsx`

#### 验证要点
1. 文件能够正常下载
2. Excel文件包含4个sheet页
3. 数据内容正确
4. 文件名包含模型名称和时间戳

### 2. 批量模型导出测试

#### 请求示例
```bash
curl -X POST "http://localhost:8080/api/soo/v2/models/export/excel/batch" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  -d "[1, 2, 3]" \
  --output "test_batch_export.xlsx"
```

#### 预期响应
- **状态码**: 200 OK
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **文件名**: `财务模型批量导出_20241219_143022.xlsx`

#### 验证要点
1. 文件能够正常下载
2. Excel文件包含所有选中模型的数据
3. 数据按模型分组正确
4. 没有重复数据

### 3. 全量模型导出测试

#### 请求示例
```bash
curl -X GET "http://localhost:8080/api/soo/v2/models/export/excel/all" \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  --output "test_all_export.xlsx"
```

#### 预期响应
- **状态码**: 200 OK
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **文件名**: `财务模型全量导出_20241219_143022.xlsx`

#### 验证要点
1. 文件能够正常下载
2. Excel文件包含系统中所有模型的数据
3. 数据完整性检查
4. 文件大小合理

## Excel文件验证

### 1. 文件结构验证
```bash
# 使用Python验证Excel文件结构
python3 -c "
import pandas as pd
import sys

try:
    # 读取Excel文件
    excel_file = 'test_model_export.xlsx'
    
    # 检查sheet页
    xl = pd.ExcelFile(excel_file)
    print('Sheet页列表:', xl.sheet_names)
    
    # 验证每个sheet页的数据
    for sheet_name in xl.sheet_names:
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        print(f'{sheet_name} - 行数: {len(df)}, 列数: {len(df.columns)}')
        print(f'{sheet_name} - 列名: {list(df.columns)}')
        print('---')
        
    print('Excel文件验证通过')
    
except Exception as e:
    print(f'Excel文件验证失败: {e}')
    sys.exit(1)
"
```

### 2. 数据内容验证
```bash
# 验证模型信息sheet
python3 -c "
import pandas as pd

# 读取模型信息
df = pd.read_excel('test_model_export.xlsx', sheet_name='模型信息')
print('模型信息验证:')
print(f'模型数量: {len(df)}')
print(f'模型名称: {df[\"模型名称\"].iloc[0]}')
print(f'模型编码: {df[\"模型编码\"].iloc[0]}')
print(f'模型分类: {df[\"模型分类\"].iloc[0]}')
print('---')

# 读取变量信息
df = pd.read_excel('test_model_export.xlsx', sheet_name='模型变量')
print('变量信息验证:')
print(f'变量数量: {len(df)}')
print('变量列表:')
for _, row in df.iterrows():
    print(f'  - {row[\"变量名称\"]} ({row[\"变量编码\"]})')
print('---')

# 读取图表信息
df = pd.read_excel('test_model_export.xlsx', sheet_name='图表配置')
print('图表信息验证:')
print(f'图表数量: {len(df)}')
print('图表列表:')
for _, row in df.iterrows():
    print(f'  - {row[\"图表名称\"]}')
print('---')

# 读取系列信息
df = pd.read_excel('test_model_export.xlsx', sheet_name='图表系列')
print('系列信息验证:')
print(f'系列数量: {len(df)}')
print('系列列表:')
for _, row in df.iterrows():
    print(f'  - {row[\"系列名称\"]} ({row[\"系列字段\"]})')
"
```

## 错误场景测试

### 1. 模型不存在
```bash
curl -X GET "http://localhost:8080/api/soo/v2/models/99999/export/excel" \
  -H "Authorization: Bearer {your-token}"
```

**预期响应**: 404 Not Found 或 500 Internal Server Error

### 2. 未授权访问
```bash
curl -X GET "http://localhost:8080/api/soo/v2/models/1/export/excel"
```

**预期响应**: 401 Unauthorized

### 3. 批量导出空列表
```bash
curl -X POST "http://localhost:8080/api/soo/v2/models/export/excel/batch" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d "[]"
```

**预期响应**: 400 Bad Request 或 500 Internal Server Error

### 4. 无效的模型ID
```bash
curl -X POST "http://localhost:8080/api/soo/v2/models/export/excel/batch" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d "[99999, 99998]"
```

**预期响应**: 200 OK (但Excel文件可能为空或包含错误信息)

## 性能测试

### 1. 大数据量测试
```bash
# 创建大量测试数据
python3 -c "
import requests
import json

# 创建100个测试模型
for i in range(100):
    model_data = {
        'modelCode': f'PERF_TEST_{i:03d}',
        'modelName': f'性能测试模型_{i:03d}',
        'modelCategory': 'breakeven_analysis',
        'modelDescription': f'性能测试模型描述_{i}',
        'isActive': True,
        'isTemplate': False,
        'modelVersion': '1.0.0'
    }
    
    response = requests.post(
        'http://localhost:8080/api/soo/v2/models',
        headers={'Authorization': 'Bearer {your-token}', 'Content-Type': 'application/json'},
        json=model_data
    )
    
    if response.status_code == 200:
        print(f'创建模型 {i+1}/100 成功')
    else:
        print(f'创建模型 {i+1}/100 失败: {response.text}')
"

# 测试全量导出性能
time curl -X GET "http://localhost:8080/api/soo/v2/models/export/excel/all" \
  -H "Authorization: Bearer {your-token}" \
  --output "performance_test.xlsx"
```

### 2. 内存使用测试
```bash
# 监控内存使用
top -p $(pgrep -f "java.*saleops-optimizer") -b -n 1

# 导出过程中监控
while true; do
    echo "$(date): $(ps aux | grep java | grep saleops-optimizer | awk '{print $6/1024 \" MB\"}')"
    sleep 1
done
```

## 前端测试

### 1. 单个导出测试
```javascript
// 在浏览器控制台执行
async function testSingleExport() {
    try {
        await FinancialModelAPI.exportModelToExcel(1);
        console.log('单个导出测试成功');
    } catch (error) {
        console.error('单个导出测试失败:', error);
    }
}

testSingleExport();
```

### 2. 批量导出测试
```javascript
// 在浏览器控制台执行
async function testBatchExport() {
    try {
        await FinancialModelAPI.exportModelsToExcel([1, 2, 3]);
        console.log('批量导出测试成功');
    } catch (error) {
        console.error('批量导出测试失败:', error);
    }
}

testBatchExport();
```

### 3. 全量导出测试
```javascript
// 在浏览器控制台执行
async function testAllExport() {
    try {
        await FinancialModelAPI.exportAllModelsToExcel();
        console.log('全量导出测试成功');
    } catch (error) {
        console.error('全量导出测试失败:', error);
    }
}

testAllExport();
```

## 测试报告模板

### 测试结果记录
```
测试日期: 2024-12-19
测试人员: [姓名]
测试环境: [环境信息]

## 功能测试结果
□ 单个模型导出 - 通过/失败
□ 批量模型导出 - 通过/失败  
□ 全量模型导出 - 通过/失败

## 性能测试结果
□ 大数据量导出 - 通过/失败
□ 内存使用正常 - 通过/失败
□ 响应时间合理 - 通过/失败

## 错误处理测试结果
□ 模型不存在 - 通过/失败
□ 未授权访问 - 通过/失败
□ 空数据导出 - 通过/失败

## 文件格式验证结果
□ Excel文件结构正确 - 通过/失败
□ 数据内容完整 - 通过/失败
□ 文件名格式正确 - 通过/失败

## 问题记录
1. [问题描述]
   - 严重程度: [高/中/低]
   - 状态: [已修复/待修复/已知问题]

## 测试结论
[测试结论和建议]
```

## 清理测试数据

```sql
-- 清理测试数据
DELETE FROM soo_chart_series WHERE chart_id IN (
    SELECT id FROM soo_chart_analysis_model WHERE model_id IN (
        SELECT id FROM soo_financial_model WHERE model_code LIKE 'TEST_%'
    )
);

DELETE FROM soo_chart_analysis_model WHERE model_id IN (
    SELECT id FROM soo_financial_model WHERE model_code LIKE 'TEST_%'
);

DELETE FROM soo_model_variable WHERE model_id IN (
    SELECT id FROM soo_financial_model WHERE model_code LIKE 'TEST_%'
);

DELETE FROM soo_financial_model WHERE model_code LIKE 'TEST_%';
``` 