# 计算表达式逻辑测试文档

## 问题描述
CALC类型的变量没有关联计算出值，需要修改计算逻辑：
- **calculation_formula**: 用于存储计算表达式，CALC类型变量使用这个公式计算值
- **constraint_formula**: 用于存储约束表达式，所有类型变量都显示这个约束

## 修复内容

### 1. 修改计算逻辑
```typescript
// 修改前：使用constraintFormula或calculationFormula
if (variable.constraintFormula || variable.calculationFormula) {
  const formula = variable.constraintFormula || variable.calculationFormula;
  if (formula) {
    const calculatedValue = calculateFormula(formula, calculatedValues);
    calculatedValues[variable.variableCode] = calculatedValue;
  }
}

// 修改后：只使用calculationFormula进行计算
if (variable.calculationFormula) {
  console.log(`Calculating ${variable.variableCode} using calculation_formula: ${variable.calculationFormula}`);
  const calculatedValue = calculateFormula(variable.calculationFormula, calculatedValues);
  calculatedValues[variable.variableCode] = calculatedValue;
  console.log(`Calculated value for ${variable.variableCode}: ${calculatedValue}`);
}
```

### 2. 修改显示逻辑
```typescript
// 修改前：只显示一个公式
const formula = calculationFormula || constraintFormula;
const formulaDisplay = formula ? `计算表达式: ${formula}` : '无计算表达式';

// 修改后：分别显示计算表达式和约束表达式
const calculationDisplay = calculationFormula ? `计算表达式: ${calculationFormula}` : '';
const constraintDisplay = constraintFormula ? `约束表达式: ${constraintFormula}` : '';

// 显示逻辑
{variableType === 'CALC' && calculationDisplay && (
  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
    {calculationDisplay}
  </div>
)}
{constraintDisplay && (
  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
    {constraintDisplay}
  </div>
)}
```

## 测试步骤

### 1. 准备测试数据
确保模型变量中有正确的计算表达式和约束表达式：

```json
[
  {
    "variableCode": "employee_reserve_amount",
    "variableName": "员工预留金额",
    "variableType": "CALC_FACTORS",
    "dataType": "CURRENCY",
    "defaultValue": "4200"
  },
  {
    "variableCode": "project_employee_reserve_ratio",
    "variableName": "项目员工预留比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "80"
  },
  {
    "variableCode": "project_individual_commission_amount",
    "variableName": "项目个人提成金额",
    "variableType": "CALC",
    "dataType": "CURRENCY",
    "calculationFormula": "employee_reserve_amount * project_employee_reserve_ratio / 1000",
    "constraintFormula": "project_individual_commission_amount >= 0"
  },
  {
    "variableCode": "project_team_commission_ratio",
    "variableName": "项目团队提成比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "20"
  },
  {
    "variableCode": "project_individual_commission_ratio",
    "variableName": "项目个人提成比例",
    "variableType": "CALC_FACTORS",
    "dataType": "PERCENTAGE",
    "defaultValue": "80"
  },
  {
    "variableCode": "commission_ratio_sum",
    "variableName": "提成比例总和",
    "variableType": "CALC",
    "dataType": "PERCENTAGE",
    "calculationFormula": "project_team_commission_ratio + project_individual_commission_ratio",
    "constraintFormula": "project_team_commission_ratio + project_individual_commission_ratio = 100"
  }
]
```

### 2. 测试计算逻辑
1. 打开模型实例变量管理页面
2. 选择一个模型实例
3. 点击"创建变量实例"按钮
4. 检查CALC类型变量是否正确计算

### 3. 验证控制台日志
打开浏览器开发者工具，查看计算日志：

```
Calculating project_individual_commission_amount using calculation_formula: employee_reserve_amount * project_employee_reserve_ratio / 1000
Original formula: employee_reserve_amount * project_employee_reserve_ratio / 1000
Extracted formula: employee_reserve_amount * project_employee_reserve_ratio / 1000
Processed formula: 4200 * 80 / 1000
Formula result: employee_reserve_amount * project_employee_reserve_ratio / 1000 = 336
Calculated value for project_individual_commission_amount: 336

Calculating commission_ratio_sum using calculation_formula: project_team_commission_ratio + project_individual_commission_ratio
Original formula: project_team_commission_ratio + project_individual_commission_ratio
Extracted formula: project_team_commission_ratio + project_individual_commission_ratio
Processed formula: 20 + 80
Formula result: project_team_commission_ratio + project_individual_commission_ratio = 100
Calculated value for commission_ratio_sum: 100
```

### 4. 验证显示逻辑
检查表单中变量的显示：

- **INPUT/API/CALC_FACTORS类型**: 只显示约束表达式（如果有）
- **CALC类型**: 显示计算表达式和约束表达式（如果有）

### 5. 验证实时计算
1. 修改 `employee_reserve_amount` 的值（如从4200改为5000）
2. 观察 `project_individual_commission_amount` 是否自动重新计算（应该显示400）
3. 修改 `project_team_commission_ratio` 的值（如从20改为30）
4. 观察 `commission_ratio_sum` 是否自动重新计算（应该显示110）

## 预期结果

### ✅ 成功标准
- CALC类型变量使用calculation_formula正确计算
- 所有类型变量都显示约束表达式（如果有）
- 只有CALC类型变量显示计算表达式
- 实时计算功能正常工作
- 控制台日志显示正确的计算过程

### ❌ 失败情况
- CALC类型变量没有计算值
- 使用了错误的公式进行计算
- 显示逻辑不正确
- 实时计算不工作
- 控制台出现错误日志

## 修复验证

### 代码变更确认
1. ✅ 修改计算逻辑，只使用calculation_formula
2. ✅ 修改显示逻辑，分别显示计算表达式和约束表达式
3. ✅ 添加详细的计算日志
4. ✅ 确保CALC类型变量正确计算

### 测试覆盖
- [ ] CALC类型变量使用calculation_formula计算
- [ ] 所有类型变量显示约束表达式
- [ ] 只有CALC类型变量显示计算表达式
- [ ] 实时计算功能
- [ ] 控制台日志验证
- [ ] 不同数据类型的计算

## 注意事项

1. 确保calculation_formula格式正确
2. 检查变量依赖关系
3. 验证计算表达式语法
4. 确认约束表达式显示正确
5. 测试复杂计算场景

## 相关文件
- `ModelInstanceVariableManagement.tsx`: 主要修改文件
- `test_default_value_display_fix.md`: 默认值显示测试文档
- `test_enhanced_variable_editing.md`: 完整功能测试文档 