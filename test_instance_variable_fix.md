# 模型实例变量查询修复测试指南

## 🎯 修复内容
修复模型实例变量查询时的SQL语法错误，解决以下两个问题：
1. `Unknown column 'v.tenant_id' in 'where clause'`
2. `Unknown column 'mv.deleted' in 'on clause'`

## 🐛 问题描述

### 问题1: 租户字段错误
- **错误**: `Unknown column 'v.tenant_id' in 'where clause'`
- **原因**: `soo_model_instance_variable`表没有`tenant_id`字段，但MyBatis-Plus租户插件自动添加了租户条件
- **影响**: 点击"编辑变量"按钮时无法获取实例变量列表

### 问题2: 删除字段错误
- **错误**: `Unknown column 'mv.deleted' in 'on clause'`
- **原因**: `soo_model_variable`表没有`deleted`字段，但SQL查询中引用了该字段
- **影响**: 变量查询SQL语法错误

## 🔧 修复方案

### 1. 配置租户忽略表
在`application.yml`中添加以下配置：
```yaml
zlt:
  tenant:
    enable: true
    ignoreTables:
      - soo_model_instance_variable
      - soo_model_instance_calculation_history
```

### 2. 修复SQL查询
在`ModelInstanceVariableMapper.xml`中移除对不存在字段的引用：
```xml
<!-- 修复前 -->
LEFT JOIN soo_model_variable mv ON v.variable_id = mv.id AND mv.deleted = 0

<!-- 修复后 -->
LEFT JOIN soo_model_variable mv ON v.variable_id = mv.id
```

### 3. 数据库表结构确认

#### soo_model_instance_variable表结构：
```sql
CREATE TABLE `soo_model_instance_variable` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) NOT NULL,
  `variable_id` bigint(20) NOT NULL,
  `variable_value` text,
  `calculated_value` text,
  `is_calculated` tinyint(1) NOT NULL DEFAULT '0',
  `calculation_error` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

#### soo_model_variable表结构：
```sql
CREATE TABLE soo_model_variable (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_id BIGINT NOT NULL,
    variable_code VARCHAR(50) NOT NULL,
    variable_name VARCHAR(100) NOT NULL,
    variable_type ENUM('INPUT','CALC','API') NOT NULL,
    data_type ENUM('NUMBER','DECIMAL','PERCENTAGE','CURRENCY','BOOLEAN','STRING') DEFAULT 'DECIMAL',
    unit VARCHAR(20),
    parent_id BIGINT,
    default_value DECIMAL(20,6),
    min_value DECIMAL(20,6),
    max_value DECIMAL(20,6),
    calculation_formula TEXT,
    constraint_formula TEXT,
    api_config JSON,
    display_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    is_key_indicator BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    validation_rules JSON,
    description TEXT,
    help_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 📋 测试步骤

### 1. 测试模型实例列表页面
- **访问地址**: http://localhost:8001/saleops-optimizer/financial-analysis/v2/model-instances
- **预期结果**:
  - ✅ 实例列表正常显示
  - ✅ 分页功能正常工作

### 2. 测试编辑变量功能
- **操作步骤**:
  1. 在实例列表中找到任意一个实例
  2. 点击"编辑变量"按钮
  3. 观察是否弹出变量编辑弹窗
- **预期结果**:
  - ✅ 弹窗正常打开
  - ✅ 变量列表正常显示
  - ✅ 无SQL语法错误

### 3. 检查API响应
- **API地址**: GET http://localhost:7006/api/soo/v2/model-instances/{id}/variables
- **预期响应**:
```json
{
  "resp_code": 0,
  "resp_msg": "success",
  "datas": [
    {
      "id": 1,
      "instanceId": 1,
      "variableId": 1,
      "variableValue": "1000",
      "calculatedValue": null,
      "isCalculated": 0,
      "calculationError": null,
      "variableCode": "FIXED_COST",
      "variableName": "固定成本",
      "variableType": "INPUT",
      "dataType": "DECIMAL",
      "unit": "元",
      "isRequired": true,
      "displayOrder": 1
    }
  ]
}
```

### 4. 检查浏览器控制台
- **预期结果**:
  - ✅ 无SQL语法错误
  - ✅ 无"Cannot read properties of undefined"错误
  - ✅ API请求正常完成

## ✅ 成功标志

### 功能测试
- ✅ 模型实例列表正常显示
- ✅ 编辑变量弹窗正常打开
- ✅ 变量列表数据正确显示
- ✅ 变量编辑功能正常工作

### 错误检查
- ✅ 浏览器控制台无SQL语法错误
- ✅ 后端日志无SQL异常
- ✅ API响应格式正确

### 数据验证
- ✅ 变量数据正确加载
- ✅ 变量类型和单位正确显示
- ✅ 必填字段标识正确

## 🐛 问题排查

### 如果仍然报SQL错误
1. 检查`application.yml`配置是否正确
2. 确认后端服务是否重启
3. 验证租户忽略配置是否生效
4. 检查数据库表结构
5. 确认SQL查询中无引用不存在字段

### 如果变量列表为空
1. 检查实例是否有关联的变量
2. 确认模型变量配置是否正确
3. 验证实例变量数据是否存在
4. 检查API响应数据

### 如果弹窗无法打开
1. 检查前端JavaScript错误
2. 确认API请求是否成功
3. 验证网络连接是否正常
4. 检查浏览器控制台错误

## 🎉 完成测试

一旦所有测试通过，说明模型实例变量查询功能已经成功修复！

### 用户现在可以：
1. 正常查看模型实例列表
2. 成功编辑实例变量
3. 享受完整的变量管理功能
4. 获得流畅的用户体验

### 系统优势：
- **稳定性**: 消除了SQL语法错误
- **功能性**: 完整的变量管理功能
- **用户体验**: 流畅的变量编辑界面
- **数据完整性**: 正确的变量数据展示

## 📝 修复记录

### 2024-12-19 修复记录
1. **租户字段错误修复**:
   - 在`application.yml`中添加`soo_model_instance_variable`到租户忽略列表
   - 解决`v.tenant_id`字段不存在的问题

2. **删除字段错误修复**:
   - 在`ModelInstanceVariableMapper.xml`中移除`mv.deleted = 0`条件
   - 解决`mv.deleted`字段不存在的问题

3. **编译和部署**:
   - 重新编译后端服务
   - 重启服务验证修复效果 