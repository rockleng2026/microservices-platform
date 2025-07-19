# 财务模型删除功能增强

## 功能概述

本次更新增强了财务模型的删除功能，确保删除模型时能够完整清理所有相关数据，包括：
- 模型变量表数据
- 图表配置数据
- 图表系列数据
- 模型本身数据

## 删除逻辑优化

### 删除前的问题
- 只删除模型表数据，导致相关表数据残留
- 可能造成数据不一致和存储空间浪费
- 影响数据完整性

### 删除后的优化
- **级联删除**：删除模型时自动删除所有相关数据
- **事务保证**：使用事务确保删除操作的原子性
- **详细日志**：记录删除的各类数据数量，便于追踪

## 删除流程

### 1. 删除顺序
```
1. 删除模型变量 (soo_model_variable)
2. 删除图表系列 (soo_chart_series)
3. 删除图表配置 (soo_chart_analysis_model)
4. 删除模型本身 (soo_financial_model)
```

### 2. 删除逻辑
```java
@Transactional(rollbackFor = Exception.class)
public boolean deleteModel(Long modelId) {
    // 1. 检查模型是否存在
    FinancialModel model = getById(modelId);
    if (model == null) {
        return false;
    }
    
    try {
        // 2. 删除模型变量
        int deletedVariables = modelVariableMapper.deleteByModelId(modelId);
        
        // 3. 删除图表配置和系列数据
        List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(modelId);
        int deletedCharts = 0;
        int deletedSeries = 0;
        
        if (!charts.isEmpty()) {
            // 删除每个图表的相关系列
            for (ChartAnalysisModel chart : charts) {
                int seriesCount = chartSeriesMapper.deleteByChartId(chart.getId());
                deletedSeries += seriesCount;
            }
            
            // 删除图表配置
            deletedCharts = chartAnalysisModelMapper.deleteByModelId(modelId);
        }
        
        // 4. 删除模型本身
        boolean deleted = removeById(modelId);
        
        return deleted;
    } catch (Exception e) {
        throw new RuntimeException("删除财务模型失败: " + e.getMessage(), e);
    }
}
```

## 数据库方法增强

### 1. ModelVariableMapper
新增 `deleteByModelId` 方法：
```java
/**
 * 根据模型ID删除所有变量
 * 
 * @param modelId 模型ID
 * @return 删除行数
 */
@Delete("DELETE FROM soo_model_variable WHERE model_id = #{modelId}")
int deleteByModelId(@Param("modelId") Long modelId);
```

### 2. ChartAnalysisModelMapper
修复 `deleteByModelId` 方法注解：
```java
/**
 * 删除指定财务模型下的所有图表配置
 */
@Delete("DELETE FROM soo_chart_analysis_model WHERE model_id = #{modelId}")
int deleteByModelId(@Param("modelId") Long modelId);
```

### 3. ChartSeriesMapper
已有 `deleteByChartId` 方法：
```java
/**
 * 根据图表ID删除系列
 */
@Delete("DELETE FROM soo_chart_series WHERE chart_id = #{chartId}")
int deleteByChartId(@Param("chartId") Long chartId);
```

## 测试验证

### 1. 准备测试数据
```sql
-- 创建测试模型
INSERT INTO soo_financial_model (model_code, model_name, model_category) 
VALUES ('TEST_DELETE_001', '测试删除模型', 'breakeven_analysis');

-- 创建测试变量
INSERT INTO soo_model_variable (model_id, variable_code, variable_name, variable_type) 
VALUES (LAST_INSERT_ID(), 'revenue', '收入', 'INPUT');

-- 创建测试图表
INSERT INTO soo_chart_analysis_model (model_id, chart_name, x_axis_field, y_axis_field) 
VALUES (LAST_INSERT_ID(), '测试图表', 'revenue', 'profit');

-- 创建测试系列
INSERT INTO soo_chart_series (chart_id, series_name, series_field, series_type) 
VALUES (LAST_INSERT_ID(), '测试系列', 'profit', 'variable');
```

### 2. 执行删除测试
```bash
curl -X DELETE "http://localhost:8080/api/soo/v2/models/{modelId}" \
  -H "Authorization: Bearer {your-token}"
```

### 3. 验证删除结果
```sql
-- 检查模型是否删除
SELECT COUNT(*) FROM soo_financial_model WHERE id = {modelId};

-- 检查变量是否删除
SELECT COUNT(*) FROM soo_model_variable WHERE model_id = {modelId};

-- 检查图表是否删除
SELECT COUNT(*) FROM soo_chart_analysis_model WHERE model_id = {modelId};

-- 检查系列是否删除
SELECT COUNT(*) FROM soo_chart_series cs
JOIN soo_chart_analysis_model cam ON cs.chart_id = cam.id
WHERE cam.model_id = {modelId};
```

## 日志输出示例

### 成功删除日志
```
INFO  - 删除财务模型: 123
INFO  - 删除模型变量: modelId=123
INFO  - 删除变量数量: 5
INFO  - 删除图表配置: modelId=123
INFO  - 删除图表[456]的系列数量: 3
INFO  - 删除图表[457]的系列数量: 2
INFO  - 删除图表数量: 2
INFO  - 删除财务模型: modelId=123
INFO  - 财务模型删除成功: modelId=123, 删除变量: 5, 删除图表: 2, 删除系列: 5
```

### 错误处理日志
```
WARN  - 财务模型不存在: 99999
ERROR - 删除财务模型时发生错误: modelId=123, error=数据库连接异常
```

## 安全考虑

### 1. 事务回滚
- 使用 `@Transactional(rollbackFor = Exception.class)` 确保删除操作的原子性
- 如果任何步骤失败，所有操作都会回滚

### 2. 权限控制
- 删除操作需要用户认证
- 建议添加删除权限验证

### 3. 数据备份
- 重要数据删除前建议先备份
- 考虑实现软删除机制

## 性能优化

### 1. 批量删除
- 对于大量数据，考虑使用批量删除
- 避免逐条删除导致的性能问题

### 2. 索引优化
- 确保相关字段有适当的索引
- 特别是 `model_id` 和 `chart_id` 字段

### 3. 删除策略
- 考虑使用软删除而不是硬删除
- 定期清理软删除的数据

## 相关文件

### 修改的文件
- `zlt-business/saleops-optimizer/src/main/java/com/central/soo/service/impl/FinancialModelServiceImpl.java`
- `zlt-business/saleops-optimizer/src/main/java/com/central/soo/mapper/ModelVariableMapper.java`
- `zlt-business/saleops-optimizer/src/main/java/com/central/soo/mapper/ChartAnalysisModelMapper.java`

### 新增的文档
- `docs/SalesOpsOptimizer/breakeven_analysis2/model_delete_enhancement.md`

## 总结

通过本次增强，财务模型删除功能现在能够：

1. **完整清理数据**：删除模型时自动清理所有相关数据
2. **保证数据一致性**：使用事务确保删除操作的原子性
3. **提供详细日志**：记录删除过程，便于问题排查
4. **错误处理完善**：提供清晰的错误信息和异常处理

这确保了系统的数据完整性，避免了数据残留和存储空间浪费的问题。 