# 等号格式计算表达式测试文档

## 问题描述
需要识别等号，如果计算表达式存在等号，等号的左边是当前变量值，右边是计算表达式。

## 修复内容

### 修改calculateFormula函数
```typescript
// 修改前：只提取等号右边的部分
if (processedFormula.includes('=')) {
  const parts = processedFormula.split('=');
  if (parts.length >= 2) {
    processedFormula = parts[1].trim(); // 取等号右边的部分
  }
}

// 修改后：识别等号左边为目标变量，右边为计算表达式
if (processedFormula.includes('=')) {
  const parts = processedFormula.split('=');
  if (parts.length >= 2) {
    targetVariable = parts[0].trim(); // 等号左边是目标变量
    processedFormula = parts[1].trim(); // 等号右边是计算表达式
  }
}
```

### 日志输出改进
```typescript
console.log('Original formula:', formula);
console.log('Target variable:', targetVariable);
console.log('Calculation expression:', processedFormula);
```

## 测试步骤

### 1. 准备测试数据
确保模型变量中有等号格式的计算表达式：

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
    "calculationFormula": "project_individual_commission_amount = employee_reserve_amount * project_employee_reserve_ratio / 1000",
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
    "calculationFormula": "commission_ratio_sum = project_team_commission_ratio + project_individual_commission_ratio",
    "constraintFormula": "project_team_commission_ratio + project_individual_commission_ratio = 100"
  }
]
```

### 2. 测试等号格式计算表达式
1. 打开模型实例变量管理页面
2. 选择一个模型实例
3. 点击"创建变量实例"按钮
4. 检查CALC类型变量是否正确计算

### 3. 验证控制台日志
打开浏览器开发者工具，查看计算日志：

```
Calculating project_individual_commission_amount using calculation_formula: project_individual_commission_amount = employee_reserve_amount * project_employee_reserve_ratio / 1000
Original formula: project_individual_commission_amount = employee_reserve_amount * project_employee_reserve_ratio / 1000
Target variable: project_individual_commission_amount
Calculation expression: employee_reserve_amount * project_employee_reserve_ratio / 1000
Processed formula: 4200 * 80 / 1000
Formula result: project_individual_commission_amount = employee_reserve_amount * project_employee_reserve_ratio / 1000 = 336
Calculated value for project_individual_commission_amount: 336

Calculating commission_ratio_sum using calculation_formula: commission_ratio_sum = project_team_commission_ratio + project_individual_commission_ratio
Original formula: commission_ratio_sum = project_team_commission_ratio + project_individual_commission_ratio
Target variable: commission_ratio_sum
Calculation expression: project_team_commission_ratio + project_individual_commission_ratio
Processed formula: 20 + 80
Formula result: commission_ratio_sum = project_team_commission_ratio + project_individual_commission_ratio = 100
Calculated value for commission_ratio_sum: 100
```

### 4. 测试不同格式的计算表达式
测试以下格式的计算表达式：

#### 4.1 等号格式
```
project_individual_commission_amount = employee_reserve_amount * project_employee_reserve_ratio / 1000
```
- 目标变量: `project_individual_commission_amount`
- 计算表达式: `employee_reserve_amount * project_employee_reserve_ratio / 1000`

#### 4.2 无等号格式
```
employee_reserve_amount * project_employee_reserve_ratio / 1000
```
- 目标变量: `''` (空)
- 计算表达式: `employee_reserve_amount * project_employee_reserve_ratio / 1000`

### 5. 验证实时计算
1. 修改 `employee_reserve_amount` 的值（如从4200改为5000）
2. 观察 `project_individual_commission_amount` 是否自动重新计算（应该显示400）
3. 修改 `project_team_commission_ratio` 的值（如从20改为30）
4. 观察 `commission_ratio_sum` 是否自动重新计算（应该显示110）

## 预期结果

### ✅ 成功标准
- 正确识别等号格式的计算表达式
- 等号左边被识别为目标变量
- 等号右边被用作计算表达式
- 计算结果正确
- 控制台日志显示正确的解析过程
- 实时计算功能正常工作

### ❌ 失败情况
- 等号格式识别错误
- 目标变量提取错误
- 计算表达式解析错误
- 计算结果不正确
- 控制台出现错误日志
- 实时计算不工作

## 修复验证

### 代码变更确认
1. ✅ 添加targetVariable变量来存储等号左边的目标变量
2. ✅ 修改等号解析逻辑，分别提取左边和右边
3. ✅ 更新控制台日志，显示目标变量和计算表达式
4. ✅ 保持原有的计算逻辑不变

### 测试覆盖
- [ ] 等号格式计算表达式识别
- [ ] 目标变量正确提取
- [ ] 计算表达式正确解析
- [ ] 无等号格式计算表达式处理
- [ ] 实时计算功能
- [ ] 控制台日志验证
- [ ] 不同数据类型的计算

## 注意事项

1. 确保等号格式的计算表达式语法正确
2. 检查目标变量名是否与变量编码匹配
3. 验证计算表达式中变量依赖关系
4. 确认约束表达式格式正确
5. 测试复杂计算场景

## 相关文件
- `ModelInstanceVariableManagement.tsx`: 主要修改文件
- `test_calculation_formula_logic.md`: 计算表达式逻辑测试文档
- `test_default_value_display_fix.md`: 默认值显示测试文档 