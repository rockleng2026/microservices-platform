# 项目提成分配 - 员工显示问题修复

## 问题描述
在第一次分配（新建模式）场景下，部门提成分配列表只显示了部门列表，没有同时展现出部门下面的员工列表。

## 修复内容

### 1. 确保部门默认展开
在`initializeDepartmentAllocations`函数中，确保所有部门的`expanded`属性都设置为`true`：
```javascript
return {
  key: `dept_${dept.value}`,
  departmentId: dept.value,
  departmentName: dept.name,
  weight: departmentWeight,
  totalAmount: 0,
  reserveRatio: 20,
  employeeDistributions,
  expanded: true // 确保默认展开
};
```

### 2. 强制展开所有部门
在设置部门分配数据时，额外确保所有部门都是展开状态：
```javascript
// 确保所有部门都展开，显示员工
const expandedAllocations = initialAllocations.map(dept => ({
  ...dept,
  expanded: true // 强制展开显示员工
}));

setDepartmentAllocations(expandedAllocations);
```

### 3. 优化员工选择逻辑
在新建模式下，改进员工显示逻辑：
- 如果员工已有ID和姓名，显示为只读文本
- 如果员工没有ID，提供下拉选择框

### 4. 添加调试信息
增加了详细的控制台日志，便于调试：
- `🔧 开始初始化部门分配数据...`
- `📋 部门列表:` - 显示可用部门
- `👥 员工部门映射:` - 显示员工与部门的映射关系
- `📝 员工详情:` - 显示员工详细信息
- `🏢 部门员工分组结果:` - 显示按部门分组的员工
- `📊 部门分配数据更新:` - 显示最终的分配数据结构

## 验证步骤

### 第一次分配场景测试
1. 选择一个没有提成分配数据的项目
2. 点击"项目提成分配"
3. 检查是否显示"(新建模式)"
4. 检查每个部门下是否自动显示员工列表
5. 检查员工姓名是否正确显示

### 控制台日志检查
打开浏览器开发者工具的Console面板，应该看到：
```
🔧 开始初始化部门分配数据...
📋 部门列表: [...]
👥 员工部门映射: Map(...)
📝 员工详情: Map(...)
🏢 部门员工分组结果: Map(...)
🎯 初始化部门分配完成: [...]
🔄 设置部门分配数据: [...]
📊 部门分配数据更新: [...]
📂 部门1: 技术研发部1 (dept_id)
   展开状态: true
   员工数量: 2
   👤 员工1: 周杰 (empId1)
   👤 员工2: 李明 (empId2)
```

### 期望效果
- 部门行显示部门名称，展开按钮显示"▼"（已展开）
- 每个部门下自动显示该部门的所有员工
- 员工行显示员工真实姓名（不是"员工ID"）
- 员工权重默认分配（如：部门80%平均分给员工）

## 常见问题

### Q: 部门显示了但没有员工
**A:** 检查控制台日志，可能的原因：
1. 员工部门映射数据为空
2. 员工详情获取失败
3. 部门ID匹配不上

### Q: 员工显示为"员工123"而非真实姓名
**A:** 检查：
1. `getEmployeeDetail` API是否返回正确数据
2. API响应数据结构是否使用`res.datas.name`
3. 员工详情映射是否正确创建

### Q: 部门是收起状态
**A:** 检查：
1. 初始化时`expanded: true`设置
2. 强制展开逻辑是否生效
3. 切换展开状态的按钮是否被意外触发

## 技术细节

### 数据流
1. `extractDepartmentsFromProject()` - 获取项目参与人
2. `batchGetEmployeeMainDepartments()` - 批量查询员工所属部门
3. `initializeDepartmentAllocations()` - 创建部门分配结构
4. 设置`expanded: true`确保展开
5. 渲染表格，显示部门和员工

### 关键状态
- `departmentAllocations` - 部门分配数据
- `dept.expanded` - 部门展开状态
- `dept.employeeDistributions` - 员工分配列表
- `hasExistingData` - 场景标识（新建/编辑模式）

这次修复确保了在新建模式下，所有部门的员工都能正确显示，并且显示真实的员工姓名。 