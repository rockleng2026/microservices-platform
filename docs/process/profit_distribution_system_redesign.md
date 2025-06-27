# 项目提成分配系统重新设计

## 概述
根据用户需求，完全重新设计了提成分配页面的UI和业务逻辑，实现了更灵活的部门-员工层级分配模式。

## 主要改进

### 1. 新的UI布局
- **层级展示**：采用Table的expandable功能，以部门为主体，员工为子项的层级结构
- **统一基准**：所有计算都以"最大分配比例"作为100%基准
- **储备金列**：新增储备金列，动态显示储备比例和金额
- **分配概览**：顶部显示项目基础信息和分配概览

### 2. 新的计算逻辑

#### 统一计算基准
```javascript
// 基准金额 = 毛利润 × 最大分配比例
const baseAmount = grossProfit * maxDistributionRatio / 100;

// 部门分配金额 = 基准金额 × 部门权重
const deptAmount = baseAmount * (dept.weight / 100);

// 员工分配金额 = 基准金额 × 员工权重
const empAmount = baseAmount * (emp.weight / 100);
```

#### 储备金计算
```javascript
// 储备金额 = 部门总分配金额 - 员工分配金额总和
const reserveAmount = deptAmount - employeeTotalAmount;

// 储备比例 = 储备金额 ÷ 部门总分配金额 × 100%
const reserveRatio = (reserveAmount / deptAmount) * 100;
```

### 3. 约束条件
- **部门权重约束**：所有部门权重之和 ≤ 100%
- **员工权重约束**：每个部门下员工权重之和 ≤ 该部门权重
- **双模式支持**：支持按比例和固定金额两种分配模式

### 4. 数据处理逻辑

#### 两种初始化场景
1. **有已保存数据**：从hierarchicalData加载并获取真实姓名
2. **无保存数据**：从项目参与人信息初始化默认分配

#### API修复
- 统一使用相对路径`/api/organization/...`通过Umi代理
- 修复API响应数据结构：使用`res.datas.name`而非`res.data.name`
- 添加并行查询优化性能

## 技术实现

### 核心函数

#### 计算函数
```javascript
// 计算部门分配金额
const calculateDepartmentAmount = (dept: DepartmentAllocation): number => {
  return (grossProfit * maxDistributionRatio / 100) * (dept.weight / 100);
};

// 计算部门员工分配总额
const calculateDepartmentEmployeeTotal = (dept: DepartmentAllocation): number => {
  return dept.employeeDistributions.reduce((sum, emp) => {
    if (emp.isFixedAmount) {
      return sum + emp.amount;
    } else {
      const empAmount = (grossProfit * maxDistributionRatio / 100) * (emp.weight / 100);
      return sum + empAmount;
    }
  }, 0);
};
```

#### 权重验证
```javascript
const validateWeights = (): boolean => {
  const totalWeight = calculateTotalWeight();
  return totalWeight <= 100;
};
```

### UI组件结构
```typescript
<Table
  expandable={{
    expandedRowRender: renderEmployeeRows,
    defaultExpandAllRows: true,
  }}
  columns={[
    { title: '部门', dataIndex: 'departmentName' },
    { title: '权重(%)', dataIndex: 'weight' },
    { title: '分配金额(元)', key: 'calculatedAmount' },
    { title: '部门储备金', key: 'reserveInfo' },
    { title: '员工分配总额', key: 'employeeTotal' },
    { title: '操作', key: 'action' }
  ]}
/>
```

## 示例计算

假设：
- 毛利润：10万元
- 最大分配比例：50%
- 技术部权重：20%
- 某员工权重：5%

计算过程：
1. 基准金额 = 10万 × 50% = 5万元
2. 技术部分配金额 = 5万 × 20% = 1万元
3. 该员工分配金额 = 5万 × 5% = 2500元
4. 如果技术部所有员工权重总和为15%，则：
   - 员工总分配 = 5万 × 15% = 7500元
   - 储备金 = 1万 - 7500 = 2500元
   - 储备比例 = 2500 ÷ 10000 × 100% = 25%

## 用户体验改进

### 1. 实时计算
- 所有金额和比例实时更新
- 权重约束实时验证
- 储备金动态显示

### 2. 操作便利
- 支持部门和员工的添加/删除
- 支持比例/固定金额模式切换
- 展开/收起员工列表

### 3. 数据展示
- 清晰的层级结构
- 丰富的统计信息
- 直观的储备金展示

## 兼容性
- 向后兼容原有API接口
- 支持有/无保存数据两种场景
- 完整的容错处理机制

## 测试建议
1. 测试有已保存数据的项目
2. 测试无保存数据的新项目
3. 测试权重约束验证
4. 测试比例/固定金额模式切换
5. 测试储备金计算准确性 