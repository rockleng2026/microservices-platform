# 提成分配弹窗修复

## 修复内容

### 1. ✅ 已有分配数据显示修复
**问题**: 加载已保存的提成分配数据时，部门和员工名称显示为ID而不是真实姓名。

**原因**: `loadExistingDistributionData`函数只是简单地使用后端返回的`departmentName`和`employeeName`字段，但这些字段可能为空或不准确。

**修复方案**: 
- 在加载已有数据时，主动调用部门和员工API获取真实姓名
- 使用并行查询提高性能：`Promise.all([getDepartmentDetail, getEmployeeDetail])`
- 使用正确的API响应字段：`res.datas.name`而不是`res.data.name`

**修复代码**:
```typescript
// 收集所有需要查询的部门ID和员工ID
const departmentIds = new Set<string>();
const employeeIds = new Set<string>();

// 并行获取部门名称和员工姓名
const [departmentNames, employeeNames] = await Promise.all([
  // 获取部门名称
  Promise.all(Array.from(departmentIds).map(async (deptId) => {
    const deptRes = await getDepartmentDetail(deptId);
    if (deptRes && deptRes.resp_code === 0 && deptRes.datas && deptRes.datas.name) {
      return { id: deptId, name: deptRes.datas.name };
    }
    return { id: deptId, name: `部门${deptId}` };
  })),
  // 获取员工姓名  
  Promise.all(Array.from(employeeIds).map(async (empId) => {
    const empRes = await getEmployeeDetail(Number(empId));
    if (empRes && empRes.resp_code === 0 && empRes.datas && empRes.datas.name) {
      return { id: empId, name: empRes.datas.name };
    }
    return { id: empId, name: `员工${empId}` };
  }))
]);
```

### 2. ✅ 没有结项数据时的初始化修复
**问题**: 没有结项数据时，缺少默认的部门和人员分配逻辑。

**修复方案**: 
- 完善`loadInitData`函数的条件判断
- 确保在没有已保存数据时正确调用`extractDepartmentsFromProject`
- 添加详细的日志输出便于调试

**修复代码**:
```typescript
if (initData.hasExistingData && initData.hierarchicalData) {
  console.log('加载已保存的提成分配数据...');
  await loadExistingDistributionData(initData.hierarchicalData);
} else {
  // 没有已保存的数据，提取项目参与人信息并初始化默认分配
  console.log('没有已保存数据，提取项目参与人信息...');
  await extractDepartmentsFromProject();
}
```

### 3. ✅ 错误处理优化
**问题**: API调用失败时没有合适的fallback机制。

**修复方案**:
- 改善错误处理，API调用失败时使用备用逻辑
- 将`message.error`改为`console.warn`，避免过多错误提示
- 确保失败时仍能调用`extractDepartmentsFromProject`

## 测试场景

### 场景1: 有已保存分配数据
**测试步骤**:
1. 打开一个有提成分配数据的项目
2. 点击"提成分配"按钮
3. 验证部门名称显示为真实名称（如"技术研发部1"）
4. 验证员工姓名显示为真实姓名（如"周杰"）

**预期结果**: ✅ 显示真实的部门名称和员工姓名

### 场景2: 没有结项数据的新项目
**测试步骤**:
1. 打开一个没有结项的进行中项目
2. 点击"提成分配"按钮
3. 验证能看到项目参与人对应的部门列表
4. 验证每个部门下显示对应的员工

**预期结果**: ✅ 自动提取项目参与人并按部门分组显示

### 场景3: API调用失败
**测试步骤**:
1. 模拟网络错误或API不可用
2. 打开提成分配弹窗
3. 验证fallback逻辑生效

**预期结果**: ✅ 显示ID作为fallback，不崩溃

## 技术细节

### API响应数据结构
确保使用正确的字段结构：
```json
{
  "datas": {
    "name": "技术研发部1"
  },
  "resp_code": 0,
  "resp_msg": ""
}
```

### 性能优化
- 使用`Promise.all`并行查询部门和员工信息
- 使用`Set`去重，避免重复查询
- 创建映射表快速查找姓名

### 错误容错
- 单个API失败不影响整体加载
- 提供fallback显示（"部门{ID}"、"员工{ID}"）
- 详细的错误日志便于调试

## 修复文件
- `zlt-web/portal-web/src/pages/Project/components/ProfitDistributionModal.tsx` 