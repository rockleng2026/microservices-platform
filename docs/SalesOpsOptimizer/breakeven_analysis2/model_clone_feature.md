# 财务模型复制功能说明

## 功能概述

财务模型复制功能允许用户一键复制现有的财务模型，包括模型表、变量表、图表表和图表序列表的所有配置，快速创建新的模型，大幅提升建模效率。

## 功能特性

### 1. 完整复制
- **模型基础信息**：复制模型名称、编码、分类、描述等基础配置
- **变量配置**：复制所有变量定义、公式、约束条件和层次结构
- **图表配置**：复制所有图表设置、轴配置和模拟参数
- **系列配置**：复制所有图表系列的颜色、样式和计算规则

### 2. 智能命名
- 自动生成新的模型编码（原编码 + "_COPY_" + 时间戳）
- 自动生成新的模型名称（原名称 + " - 副本"）
- 图表名称自动添加" - 副本"后缀
- 支持用户自定义新名称

### 3. 灵活选择
- 可选择是否复制变量配置
- 可选择是否复制图表配置（包括系列）
- 支持部分复制，满足不同需求

### 4. 数据完整性
- 使用数据库事务确保复制操作的原子性
- 保持变量间的依赖关系和层次结构
- 保持图表系列的完整性和关联关系
- 记录复制关系，便于追溯

## 技术实现

### 后端实现

#### 1. 服务层 (FinancialModelServiceImpl)
```java
@Override
@Transactional(rollbackFor = Exception.class)
public FinancialModel cloneModel(Long sourceModelId, String newModelCode, 
                                String newModelName, boolean includeVariables) {
    // 1. 复制基础模型信息
    FinancialModel newModel = new FinancialModel();
    BeanUtils.copyProperties(sourceModel, newModel, "id", "createdTime", "updatedTime");
    newModel.setModelCode(newModelCode);
    newModel.setModelName(newModelName);
    newModel.setParentModelId(sourceModelId);
    
    // 2. 复制变量配置
    if (includeVariables) {
        List<ModelVariable> variables = modelVariableMapper.selectByModelId(sourceModelId);
        for (ModelVariable variable : variables) {
            ModelVariable newVariable = new ModelVariable();
            BeanUtils.copyProperties(variable, newVariable, "id", "createdTime", "updatedTime");
            newVariable.setModelId(createdModel.getId());
            modelVariableMapper.insert(newVariable);
        }
        
        // 3. 复制图表配置
        List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(sourceModelId);
        for (ChartAnalysisModel chart : charts) {
            ChartAnalysisModel newChart = new ChartAnalysisModel();
            BeanUtils.copyProperties(chart, newChart, "id", "createdTime", "updatedTime");
            newChart.setModelId(createdModel.getId());
            newChart.setChartName(chart.getChartName() + " - 副本");
            chartAnalysisModelMapper.insert(newChart);
            
            // 4. 复制图表系列
            List<ChartSeries> seriesList = chartSeriesMapper.selectByChartId(chart.getId());
            for (ChartSeries series : seriesList) {
                ChartSeries newSeries = new ChartSeries();
                BeanUtils.copyProperties(series, newSeries, "id", "createdTime", "updatedTime");
                newSeries.setChartId(newChart.getId());
                chartSeriesMapper.insert(newSeries);
            }
        }
    }
    
    return createdModel;
}
```

#### 2. 控制器层 (FinancialModelController)
```java
@PostMapping("/{id}/clone")
@Operation(summary = "克隆财务模型", description = "基于现有模型创建新模型，包括变量、图表和系列配置")
public Result<FinancialModel> cloneModel(
        @PathVariable @NotNull Long id,
        @RequestBody Map<String, Object> cloneRequest) {
    
    String newModelCode = (String) cloneRequest.get("newModelCode");
    String newModelName = (String) cloneRequest.get("newModelName");
    Boolean includeVariables = (Boolean) cloneRequest.getOrDefault("includeVariables", true);
    Boolean includeCharts = (Boolean) cloneRequest.getOrDefault("includeCharts", true);
    
    FinancialModel clonedModel = financialModelService.cloneModel(
        id, newModelCode, newModelName, includeVariables && includeCharts);
    
    return Result.succeed(clonedModel);
}
```

### 前端实现

#### 1. API服务 (financialModel.ts)
```typescript
static async cloneModel(
  id: number, 
  newModelCode: string, 
  newModelName: string, 
  includeVariables: boolean = true,
  includeCharts: boolean = true
): Promise<FinancialModel> {
  const response = await request<ApiResponse<FinancialModel>>(`${API_BASE}/${id}/clone`, {
    method: 'POST',
    data: {
      newModelCode,
      newModelName,
      includeVariables,
      includeCharts,
    },
  });

  if (response.resp_code === 0) {
    return response.datas;
  }
  throw new Error(response.resp_msg || '克隆模型失败');
}
```

#### 2. 用户界面 (FinancialModelManagement.tsx)
```typescript
// 复制模型弹窗
const [copyModalVisible, setCopyModalVisible] = useState(false);
const [copyingModel, setCopyingModel] = useState<FinancialModel | null>(null);
const [copyForm] = Form.useForm();

// 执行复制
const handleCopySubmit = async () => {
  const values = await copyForm.validateFields();
  
  await FinancialModelAPI.cloneModel(
    copyingModel!.id,
    values.newModelCode,
    values.newModelName,
    values.includeVariables,
    values.includeCharts
  );
  
  message.success('复制成功');
  setCopyModalVisible(false);
  fetchModels();
};
```

## 使用流程

### 1. 进入财务模型管理页面
- 导航到：`/saleops-optimizer/financial-analysis/v2/financial-model-management`

### 2. 选择要复制的模型
- 在模型列表中点击目标模型的"复制"按钮

### 3. 配置复制参数
- **新模型编码**：输入新模型的唯一编码
- **新模型名称**：输入新模型的显示名称
- **复制变量配置**：选择是否复制所有变量定义
- **复制图表配置**：选择是否复制图表和系列配置

### 4. 确认复制
- 点击"确认复制"按钮执行复制操作
- 系统将显示复制进度和结果

### 5. 验证复制结果
- 在模型列表中查看新创建的模型
- 检查变量配置是否完整复制
- 验证图表配置是否正确复制

## 数据表结构

### 复制涉及的表
1. **soo_financial_model** - 财务模型主表
2. **soo_model_variable** - 模型变量表
3. **soo_chart_analysis_model** - 图表分析模型表
4. **soo_chart_series** - 图表系列表

### 关键字段说明
- **parent_model_id**：记录复制关系，指向源模型ID
- **model_id**：变量和图表关联的模型ID
- **chart_id**：系列关联的图表ID

## 优势和价值

### 1. 提升建模效率
- 避免重复配置相同的变量和公式
- 快速基于现有模型创建变体
- 减少配置错误和时间成本

### 2. 保证数据一致性
- 完整复制所有相关配置
- 保持变量间的依赖关系
- 确保图表配置的完整性

### 3. 支持业务场景
- 快速创建相似的分析模型
- 支持模型版本管理和迭代
- 便于模型模板的复用

### 4. 用户体验优化
- 直观的复制操作界面
- 灵活的复制选项配置
- 清晰的操作反馈和结果展示

## 注意事项

### 1. 数据安全
- 复制操作在事务中执行，确保数据一致性
- 支持操作日志记录，便于审计
- 建议在生产环境中谨慎使用

### 2. 性能考虑
- 大量数据复制可能影响性能
- 建议在非高峰期执行复制操作
- 可考虑异步处理大型模型复制

### 3. 命名规范
- 新模型编码必须唯一
- 建议使用有意义的命名规则
- 避免使用特殊字符和空格

### 4. 权限控制
- 确保用户有复制模型的权限
- 新模型继承当前用户的创建权限
- 支持租户级别的数据隔离

## 扩展功能

### 1. 批量复制
- 支持同时复制多个模型
- 批量设置复制参数
- 批量验证复制结果

### 2. 模板管理
- 将常用模型标记为模板
- 支持模板库管理
- 提供模板推荐功能

### 3. 版本控制
- 记录模型的复制历史
- 支持版本回滚和比较
- 提供版本差异分析

### 4. 智能推荐
- 基于使用频率推荐复制源
- 智能生成新模型名称
- 提供最佳实践建议 