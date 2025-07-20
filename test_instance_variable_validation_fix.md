# 实例变量创建页面校验逻辑修复测试

## 🎯 问题描述

在创建实例变量页面，点击保存时对非计算因子的变量进行了校验，标注红色提示输入毛利润。根据新的变量类型规则，应该只对变量类型为CALC_FACTORS的变量进行校验。

## ✅ 修复内容

### 1. 校验规则更新
- **修复前**: 对所有 `isRequired` 为 true 的变量进行必填校验
- **修复后**: 只对 `variableType === 'CALC_FACTORS'` 的变量进行必填校验

### 2. 必填标识更新
- **修复前**: 对所有 `isRequired` 为 true 的变量显示红色星号(*)
- **修复后**: 只对 `variableType === 'CALC_FACTORS'` 的变量显示红色星号(*)

## 📋 测试步骤

### 1. 准备测试数据

**模型变量配置示例**:
```json
[
  {
    "variableCode": "GROSS_PROFIT",
    "variableName": "毛利润",
    "variableType": "INPUT",
    "dataType": "DECIMAL",
    "isRequired": true,
    "defaultValue": "10000",
    "unit": "元"
  },
  {
    "variableCode": "COST_RATIO",
    "variableName": "成本比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "isRequired": false,
    "defaultValue": "30",
    "unit": "%"
  },
  {
    "variableCode": "TOTAL_COST",
    "variableName": "总成本",
    "variableType": "CALC",
    "dataType": "DECIMAL",
    "isRequired": true,
    "calculationFormula": "GROSS_PROFIT * COST_RATIO / 100",
    "unit": "元"
  },
  {
    "variableCode": "MARKET_DATA",
    "variableName": "市场数据",
    "variableType": "API",
    "dataType": "DECIMAL",
    "isRequired": true,
    "unit": "元"
  }
]
```

### 2. 测试页面访问

**测试URL**: http://localhost:8001/saleops-optimizer/financial-analysis/v2/model-instance-variables

**测试步骤**:
1. 选择左侧的模型实例
2. 点击"创建变量实例"按钮
3. 观察表单中的变量显示

### 3. 验证变量显示规则

**预期结果**:
1. **INPUT类型变量** (如：毛利润)
   - 显示"此变量类型不参与实例变量填写"
   - 不显示红色星号(*)
   - 不进行必填校验

2. **CALC_FACTORS类型变量** (如：成本比例)
   - 显示输入框，支持用户填写
   - 显示红色星号(*)
   - 进行必填校验

3. **CALC类型变量** (如：总成本)
   - 显示只读计算结果
   - 不显示红色星号(*)
   - 不进行必填校验

4. **API类型变量** (如：市场数据)
   - 显示"此变量类型不参与实例变量填写"
   - 不显示红色星号(*)
   - 不进行必填校验

### 4. 测试校验逻辑

**测试步骤**:
1. 在创建变量实例表单中，不填写任何值
2. 点击"创建变量实例"按钮
3. 观察校验结果

**预期结果**:
- 只有CALC_FACTORS类型的变量显示红色校验提示
- INPUT、CALC、API类型的变量不显示校验提示
- 表单不会因为非CALC_FACTORS类型的变量未填写而阻止提交

### 5. 测试保存逻辑

**测试步骤**:
1. 只填写CALC_FACTORS类型的变量值
2. 点击"创建变量实例"按钮
3. 验证保存成功

**预期结果**:
- 保存成功，不显示校验错误
- 只有CALC_FACTORS类型的变量值被保存
- 其他类型的变量使用默认值或空值

### 6. 测试实时计算

**测试步骤**:
1. 填写CALC_FACTORS类型变量的值
2. 观察CALC类型变量是否自动计算
3. 验证计算结果显示在只读输入框中

**预期结果**:
- CALC_FACTORS变量值变化时，CALC变量自动重新计算
- 计算结果显示在只读输入框中
- 计算表达式显示在输入框下方

## 🔧 技术验证

### 1. 前端代码验证
```typescript
// 验证校验规则
rules={variable.variableType === 'CALC_FACTORS' ? 
  [{ required: true, message: `请输入${variable.variableName}` }] : []}

// 验证必填标识
{variable.variableType === 'CALC_FACTORS' && <Text type="danger">*</Text>}
```

### 2. 变量类型处理验证
```typescript
// 验证变量显示逻辑
if (variableType === 'INPUT' || variableType === 'API') {
  // 显示"此变量类型不参与实例变量填写"
} else if (variableType === 'CALC') {
  // 显示只读计算结果
} else if (variableType === 'CALC_FACTORS') {
  // 显示输入框，支持用户填写
}
```

## 🐛 常见问题

### 1. 仍然对所有变量进行校验
**问题**: 非CALC_FACTORS类型的变量仍然显示校验错误
**解决**: 检查表单校验规则是否正确更新

### 2. 必填标识显示错误
**问题**: 非CALC_FACTORS类型的变量仍然显示红色星号
**解决**: 检查标签渲染逻辑中的条件判断

### 3. 保存时包含不需要的变量
**问题**: 保存时包含了INPUT和API类型的变量
**解决**: 检查保存逻辑，应该只保存需要用户输入的变量

### 4. 实时计算不工作
**问题**: 修改CALC_FACTORS变量值时，CALC变量不重新计算
**解决**: 检查表单值变化处理逻辑

## 📝 测试检查清单

- [ ] INPUT类型变量不显示红色星号
- [ ] INPUT类型变量不进行必填校验
- [ ] CALC_FACTORS类型变量显示红色星号
- [ ] CALC_FACTORS类型变量进行必填校验
- [ ] CALC类型变量不显示红色星号
- [ ] CALC类型变量不进行必填校验
- [ ] API类型变量不显示红色星号
- [ ] API类型变量不进行必填校验
- [ ] 只填写CALC_FACTORS变量可以成功保存
- [ ] 实时计算功能正常工作
- [ ] 变量显示规则正确

## 🎉 完成标准

所有测试项目通过，实例变量创建页面只对CALC_FACTORS类型的变量进行校验，用户体验良好。 