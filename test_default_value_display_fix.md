# 默认值显示修复测试文档

## 问题描述
用户反馈INPUT、API、CALC_FACTORS类型的变量对应的文本框都没有展示变量的默认值，虽然控制台显示表单值已经设置成功。

## 问题分析
1. 表单值通过 `setFieldsValue` 设置成功
2. 但输入组件没有显示默认值
3. 原因是输入组件缺少 `defaultValue` 属性

## 修复内容

### 1. 为所有输入组件添加defaultValue属性
```typescript
// 修改前：没有defaultValue
<InputNumber
  style={{ width: '100%' }}
  placeholder={`请输入${variable.variableName}`}
  precision={dataType === 'DECIMAL' ? 2 : 0}
  addonAfter={unit}
/>

// 修改后：添加defaultValue
<InputNumber
  style={{ width: '100%' }}
  placeholder={`请输入${variable.variableName}`}
  precision={dataType === 'DECIMAL' ? 2 : 0}
  addonAfter={unit}
  defaultValue={typeof convertedDefaultValue === 'number' ? convertedDefaultValue : undefined}
/>
```

### 2. 类型安全的默认值处理
```typescript
// 根据数据类型返回正确的类型
case 'NUMBER':
case 'DECIMAL':
case 'PERCENTAGE':
case 'CURRENCY':
  defaultValue={typeof convertedDefaultValue === 'number' ? convertedDefaultValue : undefined}

case 'BOOLEAN':
  defaultChecked={typeof convertedDefaultValue === 'boolean' ? convertedDefaultValue : undefined}

default:
  defaultValue={typeof convertedDefaultValue === 'string' ? convertedDefaultValue : undefined}
```

### 3. 修复CURRENCY类型的parser函数
```typescript
// 修改前：返回字符串
parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}

// 修改后：返回数字
parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
```

## 测试步骤

### 1. 准备测试数据
确保模型变量中有各种类型的默认值：

```json
[
  {
    "variableCode": "gross_profit",
    "variableName": "毛利润",
    "variableType": "INPUT",
    "dataType": "CURRENCY",
    "defaultValue": "10000"
  },
  {
    "variableCode": "group_reserve_ratio",
    "variableName": "集团预留比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "40"
  },
  {
    "variableCode": "team_reserve_ratio",
    "variableName": "团队预留比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "60"
  }
]
```

### 2. 测试默认值显示
1. 打开模型实例变量管理页面
2. 选择一个模型实例
3. 点击"创建变量实例"按钮
4. 检查每个变量的输入框是否显示默认值

### 3. 验证控制台日志
打开浏览器开发者工具，查看控制台日志：

```
modelVars: [变量数组]
Processing variable: gross_profit INPUT 10000
Setting default value for: gross_profit 10000
Converted value: gross_profit 10000
Processing variable: group_reserve_ratio CALC_FACTORS 40
Setting default value for: group_reserve_ratio 40
Converted value: group_reserve_ratio 40
Final defaultValues: {gross_profit: 10000, group_reserve_ratio: 40, team_reserve_ratio: 60}
Final values to set: {gross_profit: 10000, group_reserve_ratio: 40, team_reserve_ratio: 60}
Valid values to set: {gross_profit: 10000, group_reserve_ratio: 40, team_reserve_ratio: 60}
Current form values after setFieldsValue: {gross_profit: 10000, group_reserve_ratio: 40, team_reserve_ratio: 60}
Field gross_profit: expected=10000, actual=10000
Field group_reserve_ratio: expected=40, actual=40
Field team_reserve_ratio: expected=60, actual=60
```

### 4. 验证不同数据类型
检查不同数据类型的默认值是否正确显示：

- **CURRENCY**: 显示为数字，带千分位分隔符
- **PERCENTAGE**: 显示为数字，带%符号
- **NUMBER/DECIMAL**: 显示为数字
- **BOOLEAN**: 显示为开关状态
- **STRING**: 显示为文本

## 预期结果

### ✅ 成功标准
- 所有变量类型的默认值都正确显示在输入框中
- 数据类型转换正确
- 表单值设置成功
- 控制台日志显示正确的处理过程
- 没有类型错误

### ❌ 失败情况
- 某些变量类型的默认值没有显示
- 数据类型转换错误
- 表单值设置失败
- 控制台出现错误日志
- 类型错误

## 修复验证

### 代码变更确认
1. ✅ 为所有InputNumber组件添加defaultValue属性
2. ✅ 为Switch组件添加defaultChecked属性
3. ✅ 为Input组件添加defaultValue属性
4. ✅ 修复CURRENCY类型的parser函数
5. ✅ 添加类型安全检查

### 测试覆盖
- [ ] INPUT类型默认值显示
- [ ] API类型默认值显示
- [ ] CALC_FACTORS类型默认值显示
- [ ] CALC类型默认值显示
- [ ] 不同数据类型的默认值显示
- [ ] 表单值设置验证
- [ ] 控制台日志验证

## 注意事项

1. 确保模型变量API返回正确的默认值数据
2. 检查数据类型转换逻辑是否正确
3. 验证表单值设置时机正确
4. 确认组件类型匹配
5. 测试不同数据类型的边界情况

## 相关文件
- `ModelInstanceVariableManagement.tsx`: 主要修改文件
- `test_default_values_fix.md`: 默认值加载测试文档
- `test_enhanced_variable_editing.md`: 完整功能测试文档 