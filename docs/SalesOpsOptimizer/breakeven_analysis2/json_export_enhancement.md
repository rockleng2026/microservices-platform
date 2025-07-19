# 财务模型JSON导出功能增强

## 功能概述

财务模型JSON导出功能已增强，现在支持导出完整的模型配置，包括：
- 模型基本信息
- 模型变量配置
- 图表配置
- 图表系列数据
- 模型统计信息

## 导出数据结构

### JSON文件结构
```json
{
  "model": {
    "id": 123,
    "modelCode": "BREAKEVEN_001",
    "modelName": "盈亏平衡分析模型",
    "modelCategory": "breakeven_analysis",
    "modelDescription": "用于分析企业盈亏平衡点的财务模型",
    "modelVersion": "1.0.0",
    "isActive": true,
    "isTemplate": false,
    "creatorId": 1001,
    "tenantId": "default",
    "createdAt": "2024-12-19T10:30:00",
    "updatedAt": "2024-12-19T15:45:00"
  },
  "variables": [
    {
      "id": 1,
      "modelId": 123,
      "variableCode": "revenue",
      "variableName": "收入",
      "variableType": "INPUT",
      "dataType": "DECIMAL",
      "unit": "万元",
      "defaultValue": 1000.0,
      "minValue": 0.0,
      "maxValue": 10000.0,
      "formula": null,
      "constraints": null,
      "displayOrder": 1,
      "isRequired": true,
      "isKeyIndicator": true,
      "isVisible": true,
      "description": "企业年收入",
      "helpText": "请输入企业年度总收入"
    },
    {
      "id": 2,
      "modelId": 123,
      "variableCode": "cost",
      "variableName": "成本",
      "variableType": "INPUT",
      "dataType": "DECIMAL",
      "unit": "万元",
      "defaultValue": 800.0,
      "minValue": 0.0,
      "maxValue": 10000.0,
      "formula": null,
      "constraints": null,
      "displayOrder": 2,
      "isRequired": true,
      "isKeyIndicator": true,
      "isVisible": true,
      "description": "企业年成本",
      "helpText": "请输入企业年度总成本"
    },
    {
      "id": 3,
      "modelId": 123,
      "variableCode": "profit",
      "variableName": "利润",
      "variableType": "CALC",
      "dataType": "DECIMAL",
      "unit": "万元",
      "defaultValue": null,
      "minValue": null,
      "maxValue": null,
      "formula": "revenue - cost",
      "constraints": null,
      "displayOrder": 3,
      "isRequired": false,
      "isKeyIndicator": true,
      "isVisible": true,
      "description": "企业年利润",
      "helpText": "收入减去成本"
    }
  ],
  "charts": [
    {
      "chart": {
        "id": 1,
        "modelId": 123,
        "chartName": "盈亏平衡分析图",
        "xAxisName": "收入",
        "xAxisField": "revenue",
        "xAxisUnit": "万元",
        "yAxisName": "利润",
        "yAxisUnit": "万元",
        "chartType": "LINE",
        "simulationSteps": 100,
        "createdAt": "2024-12-19T11:00:00",
        "updatedAt": "2024-12-19T11:00:00"
      },
      "series": [
        {
          "id": 1,
          "chartId": 1,
          "seriesName": "收入线",
          "seriesField": "revenue",
          "seriesType": "LINE",
          "seriesValue": null,
          "color": "#1890ff",
          "sortOrder": 1,
          "createdAt": "2024-12-19T11:00:00"
        },
        {
          "id": 2,
          "chartId": 1,
          "seriesName": "成本线",
          "seriesField": "cost",
          "seriesType": "LINE",
          "seriesValue": null,
          "color": "#ff4d4f",
          "sortOrder": 2,
          "createdAt": "2024-12-19T11:00:00"
        },
        {
          "id": 3,
          "chartId": 1,
          "seriesName": "利润线",
          "seriesField": "profit",
          "seriesType": "LINE",
          "seriesValue": null,
          "color": "#52c41a",
          "sortOrder": 3,
          "createdAt": "2024-12-19T11:00:00"
        }
      ]
    }
  ],
  "statistics": {
    "variableCount": 3,
    "chartCount": 1,
    "seriesCount": 3,
    "lastUsedAt": "2024-12-19T15:45:00",
    "usageCount": 5
  }
}
```

## 功能特点

### 1. 完整数据导出
- ✅ 模型基本信息（编码、名称、分类、版本等）
- ✅ 模型变量配置（输入变量、计算变量、公式等）
- ✅ 图表配置（图表类型、坐标轴、模拟步数等）
- ✅ 图表系列数据（系列名称、字段、颜色、排序等）
- ✅ 模型统计信息（变量数量、图表数量、使用次数等）

### 2. 数据完整性
- ✅ 保持所有字段的完整性
- ✅ 包含时间戳信息
- ✅ 保留关联关系（模型ID、图表ID等）
- ✅ 支持复杂的数据结构

### 3. 导入兼容性
- ✅ 支持完整配置的导入
- ✅ 自动处理ID重置
- ✅ 避免编码冲突
- ✅ 保持数据一致性

## API使用

### 导出模型配置
```bash
# 导出单个模型配置
curl -X GET "http://localhost:8080/api/soo/v2/models/123/export" \
  -H "Authorization: Bearer {your-token}" \
  -H "x-tenant-header: default" \
  --output "财务模型配置_123.json"
```

### 导入模型配置
```bash
# 导入模型配置
curl -X POST "http://localhost:8080/api/soo/v2/models/import" \
  -H "Authorization: Bearer {your-token}" \
  -H "x-tenant-header: default" \
  -H "Content-Type: application/json" \
  -d '{
    "configJson": "{...完整的JSON配置...}"
  }'
```

## 前端使用

### 导出功能
```typescript
// 导出模型配置
const handleExport = async (record: FinancialModel) => {
  try {
    setLoading(true);
    await FinancialModelAPI.exportModelConfig(record.id);
    message.success('JSON导出成功');
  } catch (error) {
    console.error('JSON导出失败:', error);
    message.error(error instanceof Error ? error.message : 'JSON导出失败');
  } finally {
    setLoading(false);
  }
};
```

### 导入功能
```typescript
// 导入模型配置
const handleImport = async (file: File) => {
  try {
    const content = await file.text();
    const result = await FinancialModelAPI.importModelConfig({
      configJson: content
    });
    message.success('导入成功');
    fetchModels(); // 刷新列表
  } catch (error) {
    console.error('导入失败:', error);
    message.error('导入失败');
  }
};
```

## 技术实现

### 后端实现

#### 1. 增强的getModelDetail方法
```java
@Override
public Map<String, Object> getModelDetail(Long modelId) {
    // 获取模型基本信息
    FinancialModel model = getById(modelId);
    
    // 获取模型变量
    List<ModelVariable> variables = modelVariableMapper.selectByModelId(modelId);
    
    // 获取图表配置和系列数据
    List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(modelId);
    List<Map<String, Object>> chartsWithSeries = new ArrayList<>();
    
    for (ChartAnalysisModel chart : charts) {
        List<ChartSeries> series = chartSeriesMapper.selectByChartId(chart.getId());
        
        Map<String, Object> chartWithSeries = new HashMap<>();
        chartWithSeries.put("chart", chart);
        chartWithSeries.put("series", series);
        chartsWithSeries.add(chartWithSeries);
    }
    
    // 获取统计信息
    Map<String, Object> statistics = getModelStatistics(modelId);
    
    // 组装完整数据
    Map<String, Object> detail = new HashMap<>();
    detail.put("model", model);
    detail.put("variables", variables);
    detail.put("charts", chartsWithSeries);
    detail.put("statistics", statistics);
    
    return detail;
}
```

#### 2. 增强的导入功能
```java
@Override
@Transactional(rollbackFor = Exception.class)
public FinancialModel importModelConfig(String configJson, String tenantId) {
    // 解析JSON配置
    Map<String, Object> config = objectMapper.readValue(configJson, Map.class);
    
    // 创建模型
    FinancialModel model = createModelFromConfig(config, tenantId);
    
    // 导入变量
    importVariablesFromConfig(config, model.getId());
    
    // 导入图表配置和系列数据
    importChartsFromConfig(config, model.getId());
    
    return model;
}
```

## 测试验证

### 1. 导出测试
```bash
# 测试导出功能
curl -X GET "http://localhost:8080/api/soo/v2/models/123/export" \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-header: default" \
  -v
```

### 2. 导入测试
```bash
# 测试导入功能
curl -X POST "http://localhost:8080/api/soo/v2/models/import" \
  -H "Authorization: Bearer {token}" \
  -H "x-tenant-header: default" \
  -H "Content-Type: application/json" \
  -d @test_config.json
```

### 3. 数据验证
- ✅ 检查导出的JSON文件是否包含所有必要字段
- ✅ 验证图表配置和系列数据的完整性
- ✅ 确认导入后的数据与原始数据一致
- ✅ 测试导入时的ID重置和编码处理

## 注意事项

### 1. 数据大小
- 包含图表配置的JSON文件可能较大
- 建议对大型模型进行分批处理
- 考虑添加数据压缩功能

### 2. 版本兼容性
- 确保导入的JSON格式与当前版本兼容
- 添加版本检查和格式验证
- 支持向后兼容的格式转换

### 3. 安全性
- 验证导入数据的合法性
- 防止恶意数据注入
- 限制文件大小和内容

## 总结

增强后的JSON导出功能现在支持完整的模型配置导出，包括：
- 模型基本信息
- 变量配置
- 图表配置
- 图表系列数据
- 统计信息

这确保了模型配置的完整性和可移植性，支持模型的备份、迁移和分享。 