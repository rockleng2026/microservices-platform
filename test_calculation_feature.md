# 计算类型变量功能测试指南

## 🎯 功能说明

为计算类型的变量根据`constraintFormula`或`calculationFormula`表达式自动关联计算，实现实时计算功能。

## ✨ 功能特性

### 1. 智能变量类型识别
- ✅ **输入类型(INPUT)**: 用户手动输入，支持默认值
- ✅ **计算类型(CALC)**: 根据表达式自动计算，只读显示
- ✅ **API类型(API)**: 从外部API获取数据

### 2. 表达式计算引擎
- ✅ 支持数学运算: `+`, `-`, `*`, `/`, `()`
- ✅ 支持变量引用: 使用变量编码
- ✅ 安全计算环境: 防止恶意代码执行
- ✅ 错误处理: 计算失败时返回默认值

### 3. 实时计算功能
- ✅ 输入值变化时自动重新计算
- ✅ 计算结果显示在只读输入框中
- ✅ 公式显示在输入框下方
- ✅ 支持多级依赖关系

## 📋 测试步骤

### 1. 准备测试数据

**模型变量配置示例**:
```json
[
  {
    "id": 1,
    "variableCode": "FIXED_COST",
    "variableName": "固定成本",
    "variableType": "INPUT",
    "dataType": "DECIMAL",
    "defaultValue": "1000",
    "unit": "元"
  },
  {
    "id": 2,
    "variableCode": "VARIABLE_COST",
    "variableName": "变动成本",
    "variableType": "INPUT",
    "dataType": "DECIMAL",
    "defaultValue": "500",
    "unit": "元"
  },
  {
    "id": 3,
    "variableCode": "TOTAL_COST",
    "variableName": "总成本",
    "variableType": "CALC",
    "dataType": "DECIMAL",
    "constraintFormula": "FIXED_COST + VARIABLE_COST",
    "unit": "元"
  },
  {
    "id": 4,
    "variableCode": "PROFIT_MARGIN",
    "variableName": "利润率",
    "variableType": "CALC",
    "dataType": "PERCENTAGE",
    "calculationFormula": "(REVENUE - TOTAL_COST) / REVENUE * 100",
    "unit": "%"
  }
]
```

### 2. 功能测试

**测试页面**: http://localhost:8001/saleops-optimizer/financial-analysis/v2/model-instance-variables

**操作步骤**:
1. 选择左侧的模型实例
2. 点击"创建变量实例"按钮
3. 观察模态框中的变量显示

**预期结果**:
- ✅ 输入类型变量显示可编辑输入框，自动填入默认值
- ✅ 计算类型变量显示只读输入框，显示计算公式
- ✅ 输入值变化时，计算类型变量自动重新计算

### 3. 实时计算测试

**测试场景**:
1. 修改固定成本为2000
2. 修改变动成本为800
3. 观察总成本是否自动计算为2800

**预期结果**:
- ✅ 总成本 = 2000 + 800 = 2800
- ✅ 计算结果显示在只读输入框中
- ✅ 公式显示: "公式: FIXED_COST + VARIABLE_COST"

### 4. 复杂表达式测试

**测试表达式**:
```
// 简单运算
TOTAL_COST = FIXED_COST + VARIABLE_COST

// 复杂运算
PROFIT_MARGIN = (REVENUE - TOTAL_COST) / REVENUE * 100

// 条件运算
DISCOUNT_AMOUNT = TOTAL_COST > 1000 ? TOTAL_COST * 0.1 : 0

// 数学函数
AVERAGE_COST = (COST1 + COST2 + COST3) / 3
```

**预期结果**:
- ✅ 所有表达式正确计算
- ✅ 变量依赖关系正确处理
- ✅ 计算顺序正确

### 5. 错误处理测试

**测试场景**:
1. 表达式语法错误
2. 变量不存在
3. 除零错误
4. 无效数学运算

**预期结果**:
- ✅ 错误信息友好显示
- ✅ 不影响其他变量计算
- ✅ 返回默认值0
- ✅ 控制台记录错误日志

## ✅ 验证清单

### 基础功能
- [ ] 正确识别变量类型
- [ ] 输入类型变量可编辑
- [ ] 计算类型变量只读
- [ ] 默认值正确填入

### 计算功能
- [ ] 表达式正确解析
- [ ] 变量引用正确替换
- [ ] 数学运算正确执行
- [ ] 实时计算响应及时

### 用户体验
- [ ] 公式清晰显示
- [ ] 计算结果准确
- [ ] 错误处理友好
- [ ] 界面响应流畅

### 安全性
- [ ] 防止代码注入
- [ ] 安全的计算环境
- [ ] 输入验证完善
- [ ] 错误边界处理

## 🐛 问题排查

### 如果计算不工作
1. 检查表达式语法是否正确
2. 确认变量编码是否存在
3. 验证数据类型是否匹配
4. 检查控制台错误信息

### 如果实时计算不响应
1. 检查onValuesChange事件绑定
2. 确认变量类型过滤逻辑
3. 验证计算函数调用
4. 测试表单值变化监听

### 如果显示异常
1. 检查renderVariableInput函数
2. 确认只读状态设置
3. 验证公式显示逻辑
4. 测试不同数据类型

## 🎉 完成验证

一旦所有测试通过，说明计算类型变量功能正常工作！

### 用户现在可以：
1. 享受自动计算的便利
2. 实时查看计算结果
3. 理解计算公式逻辑
4. 获得准确的数据分析

### 系统优势：
- **智能计算**: 自动处理复杂表达式
- **实时响应**: 输入变化即时计算
- **安全可靠**: 防止恶意代码执行
- **用户友好**: 清晰的公式和结果显示 