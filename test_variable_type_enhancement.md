# 变量类型功能增强测试指南

## 🎯 功能说明

根据新的变量类型规则，重新定义变量类型的处理方式：

### 变量类型规则
1. **INPUT**: 用户外部输入，实例变量时不参与填写
2. **API**: 从外部API获取数据，实例变量时不参与填写  
3. **CALC_FACTORS**: 模型的计算因子，实例变量时需要用户填写
4. **CALC**: 模型的应变量，通过用户输入和计算因子得到结果，实例变量时需要用户填写

### 约束和计算分离
- **calculation_formula**: 存储计算表达式，只有CALC类型才显示
- **constraint_formula**: 存储约束表达式，所有类型都显示（如果存在）

## ✨ 功能特性

### 1. 变量类型管理
- ✅ **INPUT类型**: 蓝色标签，不参与实例变量填写
- ✅ **API类型**: 橙色标签，不参与实例变量填写
- ✅ **CALC_FACTORS类型**: 紫色标签，需要用户填写
- ✅ **CALC类型**: 绿色标签，需要用户填写

### 2. 表单字段显示规则
- ✅ **INPUT/API**: 显示"此变量类型不参与实例变量填写"
- ✅ **CALC_FACTORS**: 显示输入框，支持默认值
- ✅ **CALC**: 显示只读计算结果和计算表达式

### 3. 约束和计算分离
- ✅ **约束表达式**: 所有类型都显示（如果存在）
- ✅ **计算表达式**: 只有CALC类型才显示

## 📋 测试步骤

### 1. 后端数据库更新

**确认数据库枚举值已更新**:
```sql
-- 检查变量类型枚举
SHOW COLUMNS FROM soo_model_variable LIKE 'variable_type';
```

**预期结果**: 应该包含 `'INPUT','API','CALC','CALC_FACTORS'`

### 2. 变量管理页面测试

**测试页面**: http://localhost:8001/saleops-optimizer/financial-analysis/variables

**测试步骤**:
1. 创建新变量，选择不同的变量类型
2. 验证变量类型选项包含所有四种类型
3. 验证表单字段显示规则：
   - CALC类型显示"计算表达式"字段
   - 其他类型显示"默认值"字段
   - 所有类型都显示"约束表达式"字段

**预期结果**:
- 变量类型选择器包含：输入、计算、计算因子、API
- CALC类型显示计算表达式输入框
- 其他类型显示默认值输入框
- 约束表达式字段始终显示

### 3. 模型实例变量管理测试

**测试页面**: http://localhost:8001/saleops-optimizer/financial-analysis/v2/model-instance-variables

**测试数据准备**:
```json
[
  {
    "variableCode": "FIXED_COST",
    "variableName": "固定成本",
    "variableType": "INPUT",
    "dataType": "DECIMAL",
    "defaultValue": "1000",
    "unit": "元"
  },
  {
    "variableCode": "VARIABLE_COST_RATIO",
    "variableName": "变动成本率",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "30",
    "unit": "%"
  },
  {
    "variableCode": "TOTAL_COST",
    "variableName": "总成本",
    "variableType": "CALC",
    "dataType": "DECIMAL",
    "calculationFormula": "FIXED_COST + (REVENUE * VARIABLE_COST_RATIO / 100)",
    "unit": "元"
  },
  {
    "variableCode": "MARKET_DATA",
    "variableName": "市场数据",
    "variableType": "API",
    "dataType": "DECIMAL",
    "apiConfig": "{\"url\": \"https://api.example.com/market\"}",
    "unit": "元"
  }
]
```

**测试步骤**:
1. 选择模型实例
2. 点击"创建变量实例"
3. 验证变量显示规则：
   - INPUT和API类型显示"此变量类型不参与实例变量填写"
   - CALC_FACTORS类型显示输入框，自动填入默认值
   - CALC类型显示只读计算结果和计算表达式

**预期结果**:
- INPUT和API变量显示灰色提示文字
- CALC_FACTORS变量显示输入框，默认值已填入
- CALC变量显示只读计算结果，下方显示计算表达式

### 4. 实时计算功能测试

**测试步骤**:
1. 在变量实例创建页面
2. 修改CALC_FACTORS类型变量的值
3. 观察CALC类型变量是否自动重新计算

**预期结果**:
- 修改CALC_FACTORS变量值时，CALC变量自动重新计算
- 计算结果显示在只读输入框中
- 计算表达式显示在输入框下方

### 5. 约束表达式测试

**测试数据**:
```json
{
  "variableCode": "TEAM_COMMISSION_RATIO",
  "variableName": "团队提成比例",
  "variableType": "CALC_FACTORS",
  "dataType": "PERCENTAGE",
  "defaultValue": "60",
  "constraintFormula": "TEAM_COMMISSION_RATIO + INDIVIDUAL_COMMISSION_RATIO = 100",
  "unit": "%"
}
```

**测试步骤**:
1. 创建包含约束表达式的变量
2. 在变量管理页面验证约束表达式字段显示
3. 在实例变量管理页面验证约束表达式显示

**预期结果**:
- 变量管理页面显示约束表达式字段
- 实例变量管理页面显示约束表达式信息

## 🔧 技术验证

### 1. 后端实体类验证
```java
// 验证ModelVariable实体类
ModelVariable variable = new ModelVariable();
variable.setVariableType("CALC_FACTORS");

// 验证新增的方法
assert variable.isUserInputRequired() == true;
assert variable.shouldShowCalculationFormula() == false;
assert variable.getVariableTypeDisplayName().equals("计算因子");
```

### 2. 前端接口验证
```typescript
// 验证ModelVariable接口
interface ModelVariable {
  variableType: 'INPUT' | 'CALC' | 'API' | 'CALC_FACTORS';
  // ... 其他字段
}
```

### 3. 数据库查询验证
```sql
-- 验证变量类型查询
SELECT variable_type, COUNT(*) as count 
FROM soo_model_variable 
GROUP BY variable_type;
```

## 🐛 常见问题

### 1. 变量类型显示错误
**问题**: 变量类型标签显示不正确
**解决**: 检查前端变量类型映射配置

### 2. 计算表达式不显示
**问题**: CALC类型变量不显示计算表达式
**解决**: 确认后端返回的calculationFormula字段有值

### 3. 实时计算不工作
**问题**: 修改变量值后计算结果不更新
**解决**: 检查表单值变化处理逻辑和计算引擎

### 4. 约束表达式不显示
**问题**: 约束表达式字段不显示
**解决**: 确认后端返回的constraintFormula字段有值

## 📝 测试检查清单

- [ ] 数据库枚举值已更新
- [ ] 变量管理页面显示四种变量类型
- [ ] 表单字段显示规则正确
- [ ] 实例变量管理页面变量显示正确
- [ ] 实时计算功能正常
- [ ] 约束表达式显示正确
- [ ] 计算表达式只在CALC类型显示
- [ ] 默认值自动填入功能正常
- [ ] 变量类型标签颜色正确
- [ ] 后端API返回数据格式正确

## 🎉 完成标准

所有测试项目通过，变量类型功能按照新规则正常工作，用户体验良好。 