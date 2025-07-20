# 表单初始值设置和校验逻辑修复测试

## 🎯 问题描述

在创建实例变量页面，点击提交时提示"请输入集团预留比例、请输入团队预留比例等"，虽然这些变量在初始打开时已经加载了默认值到文本框中，但表单校验时没有识别到这些值。

## ✅ 修复内容

### 1. 默认值设置逻辑修复
- **修复前**: 为CALC_FACTORS和CALC类型都设置默认值
- **修复后**: 只为CALC_FACTORS类型设置默认值，CALC类型不设置默认值

### 2. 表单值变化处理修复
- **修复前**: 处理CALC_FACTORS和CALC类型的变化
- **修复后**: 只处理CALC_FACTORS类型的变化

### 3. 输入组件修复
- **修复前**: 在输入组件中使用`defaultValue`属性
- **修复后**: 移除`defaultValue`属性，通过`setFieldsValue`设置初始值

## 📋 测试步骤

### 1. 准备测试数据

**模型变量配置示例**:
```json
[
  {
    "variableCode": "GROUP_RESERVE_RATIO",
    "variableName": "集团预留比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "60",
    "unit": "%"
  },
  {
    "variableCode": "TEAM_RESERVE_RATIO",
    "variableName": "团队预留比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "30",
    "unit": "%"
  },
  {
    "variableCode": "TOTAL_RESERVE_RATIO",
    "variableName": "总预留比例",
    "variableType": "CALC",
    "dataType": "PERCENTAGE",
    "calculationFormula": "GROUP_RESERVE_RATIO + TEAM_RESERVE_RATIO",
    "unit": "%"
  }
]
```

### 2. 测试页面访问

**测试URL**: http://localhost:8001/saleops-optimizer/financial-analysis/v2/model-instance-variables

**测试步骤**:
1. 选择左侧的模型实例
2. 点击"创建变量实例"按钮
3. 观察表单中的变量显示和初始值

### 3. 验证初始值设置

**预期结果**:
1. **CALC_FACTORS类型变量** (如：集团预留比例、团队预留比例)
   - 输入框中显示默认值 (60, 30)
   - 显示红色星号(*)
   - 表单校验时能识别到这些值

2. **CALC类型变量** (如：总预留比例)
   - 显示只读计算结果 (90)
   - 不显示红色星号
   - 不进行必填校验

3. **INPUT/API类型变量**
   - 显示"此变量类型不参与实例变量填写"
   - 不显示红色星号
   - 不进行必填校验

### 4. 测试表单校验

**测试步骤**:
1. 打开创建变量实例表单
2. 观察CALC_FACTORS类型变量是否已填入默认值
3. 直接点击"创建变量实例"按钮
4. 验证是否成功保存，不显示校验错误

**预期结果**:
- CALC_FACTORS类型变量显示默认值
- 表单校验通过，不显示红色错误提示
- 保存成功

### 5. 测试实时计算

**测试步骤**:
1. 修改CALC_FACTORS类型变量的值
2. 观察CALC类型变量是否自动重新计算
3. 验证计算结果显示在只读输入框中

**预期结果**:
- 修改集团预留比例为70，团队预留比例为20
- 总预留比例自动计算为90
- 计算结果显示在只读输入框中

### 6. 测试空值校验

**测试步骤**:
1. 清空CALC_FACTORS类型变量的值
2. 点击"创建变量实例"按钮
3. 观察校验结果

**预期结果**:
- 清空的CALC_FACTORS变量显示红色校验提示
- 其他类型的变量不显示校验错误
- 表单阻止提交

## 🔧 技术验证

### 1. 默认值设置逻辑验证
```typescript
// 验证默认值设置
if (variable.variableType === 'CALC_FACTORS' && variable.defaultValue) {
  // 只为CALC_FACTORS类型设置默认值
  defaultValues[variable.variableCode] = convertedValue;
}
```

### 2. 表单值变化处理验证
```typescript
// 验证表单值变化处理
const inputVariables = modelVariables.filter(v => v.variableType === 'CALC_FACTORS');
// 只处理CALC_FACTORS类型的变化
```

### 3. 输入组件验证
```typescript
// 验证输入组件不包含defaultValue
<InputNumber
  style={{ width: '100%' }}
  placeholder={`请输入${variable.variableName}`}
  precision={2}
  addonAfter="%"
  // 不包含defaultValue属性
/>
```

## 🐛 常见问题

### 1. 默认值不显示
**问题**: CALC_FACTORS类型变量的默认值不显示在输入框中
**解决**: 检查`setFieldsValue`调用是否正确，确保在表单渲染后设置值

### 2. 校验仍然失败
**问题**: 即使有默认值，表单校验仍然失败
**解决**: 检查表单校验规则，确保只对CALC_FACTORS类型进行校验

### 3. 实时计算不工作
**问题**: 修改CALC_FACTORS变量值时，CALC变量不重新计算
**解决**: 检查表单值变化处理逻辑和计算引擎

### 4. 初始值设置时机问题
**问题**: 初始值设置时机不对，导致表单没有正确加载
**解决**: 确保在模态框打开后再设置表单值

## 📝 测试检查清单

- [ ] CALC_FACTORS类型变量显示默认值
- [ ] CALC_FACTORS类型变量进行必填校验
- [ ] CALC类型变量显示计算结果
- [ ] CALC类型变量不进行必填校验
- [ ] INPUT/API类型变量不显示校验错误
- [ ] 有默认值时表单校验通过
- [ ] 清空必填字段时显示校验错误
- [ ] 实时计算功能正常工作
- [ ] 表单提交成功
- [ ] 初始值设置时机正确

## 🎉 完成标准

所有测试项目通过，表单初始值正确设置，校验逻辑正常工作，用户体验良好。 