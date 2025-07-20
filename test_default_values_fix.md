# 默认值加载修复测试文档

## 问题描述
用户反馈默认值没有加载到表单中，需要验证所有变量类型的默认值都能正确加载。

## 修复内容
修改了 `handleCreateVariableInstance` 函数中的默认值设置逻辑：
- 之前：只处理 `CALC_FACTORS` 和 `CALC` 类型的默认值
- 现在：处理所有类型（`INPUT`、`API`、`CALC_FACTORS`、`CALC`）的默认值

## 测试步骤

### 1. 准备测试数据
确保模型变量中有各种类型的默认值：

```json
[
  {
    "variableCode": "input_var1",
    "variableName": "输入变量1",
    "variableType": "INPUT",
    "dataType": "NUMBER",
    "defaultValue": "100"
  },
  {
    "variableCode": "api_var1",
    "variableName": "API变量1", 
    "variableType": "API",
    "dataType": "DECIMAL",
    "defaultValue": "50.5"
  },
  {
    "variableCode": "calc_factor1",
    "variableName": "计算因子1",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "10"
  },
  {
    "variableCode": "calc_var1",
    "variableName": "计算变量1",
    "variableType": "CALC",
    "dataType": "CURRENCY",
    "calculationFormula": "input_var1 * calc_factor1 / 100",
    "defaultValue": "0"
  }
]
```

### 2. 测试默认值加载
1. 打开模型实例变量管理页面
2. 选择一个模型实例
3. 点击"创建变量实例"按钮
4. 检查表单中每个变量的输入框是否预填充了默认值

### 3. 验证控制台日志
打开浏览器开发者工具，查看控制台日志：

```
modelVars: [变量数组]
modelVars length: 4
Processing variable: input_var1 INPUT 100
Setting default value for: input_var1 100
Converted value: input_var1 100
Processing variable: api_var1 API 50.5
Setting default value for: api_var1 50.5
Converted value: api_var1 50.5
Processing variable: calc_factor1 CALC_FACTORS 10
Setting default value for: calc_factor1 10
Converted value: calc_factor1 10
Processing variable: calc_var1 CALC 0
Setting default value for: calc_var1 0
Converted value: calc_var1 0
Final defaultValues: {input_var1: 100, api_var1: 50.5, calc_factor1: 10, calc_var1: 0}
Final values to set: {input_var1: 100, api_var1: 50.5, calc_factor1: 10, calc_var1: 10}
Valid values to set: {input_var1: 100, api_var1: 50.5, calc_factor1: 10, calc_var1: 10}
Current form values after setFieldsValue: {input_var1: 100, api_var1: 50.5, calc_factor1: 10, calc_var1: 10}
```

### 4. 验证数据类型转换
检查不同数据类型的默认值是否正确转换：

- **NUMBER/DECIMAL**: 字符串转换为数字
- **PERCENTAGE**: 字符串转换为数字
- **CURRENCY**: 字符串转换为数字
- **BOOLEAN**: 字符串转换为布尔值
- **STRING**: 保持字符串格式

### 5. 验证计算变量
检查CALC类型变量是否正确计算：

1. 修改INPUT变量的值（如从100改为200）
2. 修改CALC_FACTORS变量的值（如从10改为20）
3. 观察CALC变量是否自动重新计算（应该显示40）

## 预期结果

### ✅ 成功标准
- 所有变量类型的默认值都正确加载到表单中
- 数据类型转换正确
- CALC类型变量根据公式自动计算
- 控制台日志显示正确的处理过程
- 表单验证正常工作（只有CALC_FACTORS为必填）

### ❌ 失败情况
- 某些变量类型的默认值没有加载
- 数据类型转换错误
- CALC类型变量计算错误
- 控制台出现错误日志
- 表单验证异常

## 修复验证

### 代码变更确认
```typescript
// 修改前
if ((variable.variableType === 'CALC_FACTORS' || variable.variableType === 'CALC') && variable.defaultValue) {

// 修改后  
if (variable.defaultValue) {
```

### 测试覆盖
- [ ] INPUT类型默认值加载
- [ ] API类型默认值加载
- [ ] CALC_FACTORS类型默认值加载
- [ ] CALC类型默认值加载
- [ ] 数据类型转换正确性
- [ ] 实时计算功能
- [ ] 表单验证规则

## 注意事项

1. 确保模型变量API返回正确的默认值数据
2. 检查数据类型转换逻辑是否正确
3. 验证NaN和undefined值的过滤
4. 确认表单值设置时机正确
5. 测试不同数据类型的边界情况

## 相关文件
- `ModelInstanceVariableManagement.tsx`: 主要修改文件
- `test_enhanced_variable_editing.md`: 完整功能测试文档 