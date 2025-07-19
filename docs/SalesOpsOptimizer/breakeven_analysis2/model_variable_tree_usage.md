# 模型变量树形结构使用指南

## 概述

财务模型2.0新增了树形结构支持，允许变量之间建立父子关系，并通过约束条件定义变量间的业务规则。这个功能特别适用于复杂的财务分配和计算场景。

## 核心概念

### 1. 树形结构
- **父变量**: 作为根节点的变量，通常是一个总量或基础值
- **子变量**: 从父变量派生或分配的变量
- **层级关系**: 支持多层级嵌套，形成复杂的变量树

### 2. 约束条件
- **约束公式**: 定义子变量与父变量之间的数学关系
- **业务规则**: 确保数据的逻辑一致性和完整性
- **自动验证**: 系统会验证约束条件的语法和逻辑

## 应用场景

### 场景1: 毛利润分配
```
毛利润 (10000元)
├── 集团预留比例 (40%)
├── 团队预留比例 (60%)
├── 集团预留金额 (计算得出)
└── 团队预留金额 (计算得出)

约束条件: group_reserve_ratio + team_reserve_ratio = 100
```

### 场景2: 包含定向结余的分配
```
毛利润 (10000元)
├── 集团预留比例 (40%)
├── 团队预留比例 (50%)
├── 定向结余 (1000元)
├── 集团预留金额 (计算得出)
└── 团队预留金额 (计算得出)

约束条件: group_reserve_amount + team_reserve_amount + surplus_amount = gross_profit
```

### 场景3: 多层级分配
```
毛利润
├── 集团预留比例
│   ├── 项目中参与部门的计提比例 (30%)
│   ├── 项目中参与员工的计提比例 (70%)
│   ├── 部门计提金额 (计算得出)
│   └── 员工计提金额 (计算得出)
└── 团队预留比例

约束条件: 
- dept_reserve_ratio + employee_reserve_ratio = 100
- dept_reserve_amount = team_reserve_amount * dept_reserve_ratio / 100
```

## 前端操作指南

### 1. 创建树形变量

1. **创建父变量**
   - 进入变量管理页面
   - 点击"新增变量"
   - 填写变量信息（如：毛利润）
   - 不设置父级变量（保持为空）

2. **创建子变量**
   - 点击父变量行的"添加子变量"按钮
   - 或手动创建变量时选择父级变量
   - 填写子变量信息（如：集团预留比例）

### 2. 设置约束条件

1. **打开约束条件设置**
   - 在变量列表中点击"设置约束条件"按钮
   - 或在变量编辑时填写约束条件公式

2. **编写约束公式**
   ```
   # 百分比约束
   group_reserve_ratio + team_reserve_ratio = 100
   
   # 金额约束
   group_reserve_amount + team_reserve_amount + surplus_amount = gross_profit
   
   # 计算约束
   dept_reserve_amount = team_reserve_amount * dept_reserve_ratio / 100
   ```

### 3. 查看树形结构

1. **切换到树形展示**
   - 在变量管理页面点击"树形展示"标签
   - 查看完整的变量层级关系

2. **展开/折叠节点**
   - 点击节点前的箭头展开或折叠子节点
   - 查看每个节点的详细信息

## 后端API接口

### 1. 获取变量树
```http
GET /api/soo/v2/variables/tree/{modelId}
```

### 2. 获取子变量
```http
GET /api/soo/v2/variables/children/{parentId}
```

### 3. 移动变量
```http
PUT /api/soo/v2/variables/{id}/move
Content-Type: application/json

{
  "parentId": 123
}
```

### 4. 验证约束条件
```http
POST /api/soo/v2/variables/validate-constraint
Content-Type: application/json

{
  "modelId": 1,
  "parentId": 123,
  "constraintFormula": "child1 + child2 = parent_value"
}
```

## 约束条件语法

### 支持的运算符
- **算术运算符**: `+`, `-`, `*`, `/`, `%`
- **比较运算符**: `=`, `>`, `<`, `>=`, `<=`, `!=`
- **逻辑运算符**: `AND`, `OR`
- **括号**: `()`

### 变量引用
- 使用变量编码引用变量
- 支持父变量和子变量的引用
- 变量编码区分大小写

### 示例公式
```javascript
// 百分比之和等于100%
group_ratio + team_ratio = 100

// 金额分配等于父变量
group_amount + team_amount + surplus = gross_profit

// 复杂约束条件
dept_ratio + employee_ratio = 100 AND 
dept_amount = team_amount * dept_ratio / 100

// 条件约束
IF(profit > 0, bonus = profit * 0.1, bonus = 0)
```

## 数据库结构

### 新增字段
```sql
-- 父级变量ID
parent_id BIGINT COMMENT '父级树ID,标识这个变量属于parent_id的子变量，他的值受父级变量值的约束'

-- 约束条件公式
constraint_formula TEXT COMMENT '约束条件公式，定义子变量与父变量之间的关系'
```

### 索引优化
```sql
-- 父级ID索引
INDEX idx_parent_id (parent_id)

-- 约束条件索引
INDEX idx_constraint_formula (constraint_formula(100))
```

## 最佳实践

### 1. 变量命名
- 使用清晰的变量编码和名称
- 遵循一致的命名规范
- 避免使用特殊字符

### 2. 约束条件设计
- 保持约束条件的简洁性
- 确保约束条件的逻辑正确性
- 考虑约束条件的可维护性

### 3. 树形结构设计
- 避免过深的层级嵌套（建议不超过3层）
- 合理分配父子关系
- 考虑业务逻辑的清晰性

### 4. 性能优化
- 合理使用索引
- 避免复杂的递归查询
- 考虑数据量对性能的影响

## 常见问题

### Q1: 如何检查循环引用？
A: 系统会自动检查循环引用，如果检测到会阻止操作并提示错误。

### Q2: 约束条件验证失败怎么办？
A: 检查约束条件的语法是否正确，变量编码是否存在，逻辑是否合理。

### Q3: 如何删除有子变量的父变量？
A: 需要先删除所有子变量，或者将子变量移动到其他父变量下。

### Q4: 支持多对多的关系吗？
A: 目前只支持一对多的父子关系，一个子变量只能有一个父变量。

### Q5: 约束条件会影响计算吗？
A: 约束条件主要用于验证和约束，实际计算仍基于计算公式进行。

## 版本兼容性

- 新功能向后兼容，不影响现有的变量数据
- 现有变量可以逐步迁移到树形结构
- 支持混合使用树形和非树形变量

## 技术支持

如有问题，请联系开发团队或查看相关文档：
- API文档：`/api/soo/v2/variables`
- 数据库文档：`sql/model_variable_tree_migration.sql`
- 示例数据：`sql/model_variable_tree_example_data.sql` 