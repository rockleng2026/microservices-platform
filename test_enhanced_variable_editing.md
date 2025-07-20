# 变量编辑逻辑测试文档

## 测试目标
验证新的变量编辑逻辑：所有变量类型都可以填写，但只保存CALC_FACTORS类型

## 测试场景

### 1. 变量类型显示测试
**目标**: 验证所有变量类型都能在表单中显示和编辑

**步骤**:
1. 打开模型实例变量管理页面
2. 选择一个模型实例
3. 点击"创建变量实例"按钮
4. 检查表单中是否显示所有类型的变量：
   - INPUT类型变量
   - API类型变量  
   - CALC_FACTORS类型变量
   - CALC类型变量

**预期结果**:
- 所有变量类型都应该显示在表单中
- 每个变量都有对应的输入控件
- CALC类型变量在输入框下方显示计算表达式

### 2. 默认值加载测试
**目标**: 验证所有变量类型的默认值都能正确加载

**步骤**:
1. 确保模型变量中有各种类型的默认值
2. 打开创建变量实例表单
3. 检查每个变量的输入框是否预填充了默认值

**预期结果**:
- INPUT类型变量显示默认值
- API类型变量显示默认值
- CALC_FACTORS类型变量显示默认值
- CALC类型变量显示默认值

### 3. 表单验证测试
**目标**: 验证只有CALC_FACTORS类型为必填项

**步骤**:
1. 打开创建变量实例表单
2. 清空所有输入框
3. 点击提交按钮

**预期结果**:
- 只有CALC_FACTORS类型的变量显示必填错误
- INPUT、API、CALC类型的变量不显示必填错误

### 4. 实时计算测试
**目标**: 验证所有变量类型的变化都能触发实时计算

**步骤**:
1. 打开创建变量实例表单
2. 修改INPUT类型变量的值
3. 修改API类型变量的值
4. 修改CALC_FACTORS类型变量的值
5. 观察CALC类型变量的值是否实时更新

**预期结果**:
- 任何类型变量的变化都应该触发CALC类型变量的重新计算
- CALC类型变量的值应该根据公式实时更新

### 5. 保存逻辑测试
**目标**: 验证只保存CALC_FACTORS类型的变量值

**步骤**:
1. 填写所有类型变量的值
2. 提交表单
3. 检查保存的实例变量数据

**预期结果**:
- 只有CALC_FACTORS类型的变量值被保存
- INPUT、API、CALC类型的变量值不被保存
- 保存成功后，实例变量列表中只显示CALC_FACTORS类型的变量

### 6. 显示逻辑测试
**目标**: 验证实例变量通过关联显示

**步骤**:
1. 创建变量实例后
2. 查看实例变量列表
3. 检查变量显示是否正确关联

**预期结果**:
- 实例变量显示正确的变量名称和编码
- 变量值与模型变量关联正确
- 只显示CALC_FACTORS类型的实例变量

## 测试数据准备

### 模型变量示例
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
    "calculationFormula": "input_var1 * calc_factor1 / 100"
  }
]
```

## 预期行为总结

1. **编辑行为**: 所有变量类型都可以在表单中编辑
2. **默认值**: 所有变量类型都加载默认值
3. **验证**: 只有CALC_FACTORS类型为必填
4. **计算**: 所有变量变化都触发实时计算
5. **保存**: 只保存CALC_FACTORS类型的值
6. **显示**: 通过关联显示实例变量

## 注意事项

- 确保模型变量中有足够的测试数据
- 检查计算表达式是否正确
- 验证表单验证规则是否按预期工作
- 确认保存逻辑只处理CALC_FACTORS类型 