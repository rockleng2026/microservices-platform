# 修复项目详情页面提成分配显示

## 问题描述
项目详情页面中，虽然后端返回了完整的`profitDistributions`数据，但前端页面没有正确显示项目提成分配信息。另外，部门名称和员工姓名只显示ID，没有显示具体的名称。

## 后端返回数据结构分析
从API返回的数据来看：
```json
{
  "profitDistributions": [
    {
      "id": "18",
      "deptId": "2",
      "employeeId": null,
      "role": "部门分配",
      "distributionType": "比例",
      "distributionValue": 34.00
    },
    {
      "id": "19", 
      "deptId": "2",
      "employeeId": "7",
      "role": "员工分配",
      "distributionType": "比例",
      "distributionValue": 27.00
    }
  ]
}
```

### 数据结构特点
1. **role字段**：区分"部门分配"和"员工分配"
2. **distributionType字段**：值为"比例"或"金额"
3. **distributionValue字段**：具体的分配数值
4. **deptId字段**：关联的部门ID
5. **employeeId字段**：员工分配时才有值，部门分配时为null
6. **departmentName和employeeName字段**：后端返回为null，需要前端补充

## 修复内容

### 1. 修正数据分组逻辑
**之前的错误逻辑**：
```javascript
// 错误：基于不存在的type字段分组
const groupedData = profitDistributionData.reduce((acc, item) => {
  if (item.type === 'project') { // type字段不存在
    acc.project = item;
  }
  // ...
}, {});
```

**修复后的正确逻辑**：
```javascript
// 正确：基于role字段分组
const departmentDistributions = profitDistributionData.filter(item => item.role === '部门分配');
const employeeDistributions = profitDistributionData.filter(item => item.role === '员工分配');
```

### 2. 添加部门名称和员工姓名获取逻辑

**新增API导入**：
```javascript
import { getDepartmentDetail } from '@/services/organization/department';
```

**在fetchDetails函数中添加数据补充逻辑**：
```javascript
// 为提成分配数据补充部门名称和员工姓名
const enrichedDistributions = await Promise.all(
  project.profitDistributions.map(async (distribution: any) => {
    const enriched = { ...distribution };
    
    // 获取部门名称
    if (distribution.deptId && !distribution.departmentName) {
      try {
        const deptRes = await getDepartmentDetail(distribution.deptId);
        if (deptRes && deptRes.data && deptRes.data.name) {
          enriched.departmentName = deptRes.data.name;
        }
      } catch (error) {
        console.error(`Failed to get department ${distribution.deptId}:`, error);
      }
    }
    
    // 获取员工姓名（优先从项目参与人中获取，其次调用员工API）
    if (distribution.employeeId && !distribution.employeeName) {
      // 首先从已加载的参与人详情中查找
      const participant = details.find(p => p.participantId === distribution.employeeId);
      if (participant && participant.participantName) {
        enriched.employeeName = participant.participantName;
      } else {
        // 如果参与人详情中没有，直接通过员工API获取
        try {
          const empRes = await getEmployeeDetail(Number(distribution.employeeId));
          if (empRes && empRes.data && empRes.data.name) {
            enriched.employeeName = empRes.data.name;
          }
        } catch (error) {
          console.error(`Failed to get employee ${distribution.employeeId}:`, error);
        }
      }
    }
    
    return enriched;
  })
);
```

### 3. 改进显示格式
参考提成分配页面的显示格式，采用层级展示：

#### 新的显示结构
1. **项目提成概览**（从结项信息计算）
   - 项目实际金额
   - 项目毛利润  
   - 毛利率
   - 提成池总额

2. **部门分配详情**（可展开查看员工）
   - 部门ID和名称 ✅ **现在显示真实部门名称**
   - 分配类型（比例/金额）
   - 分配值
   - 计算金额
   - 审批状态
   - 可展开查看该部门的员工分配

3. **员工分配详情**（嵌套在部门下）
   - 员工ID和姓名 ✅ **现在显示真实员工姓名**
   - 分配类型和分配值
   - 计算金额
   - 审批状态

4. **提成分配汇总**
   - 参与部门数
   - 参与员工数
   - 总权重

### 4. 金额计算逻辑
实现动态金额计算：
```javascript
// 比例分配的金额计算
const amount = (closureInfo.grossProfit || 0) * ((project.maxDistribution || 0.5)) * (distributionValue / 100);
```

### 5. 修复计提状态显示
**之前的问题**：
```javascript
const status = (project as any).profitDistributionStatus; // 类型转换不必要
```

**修复后**：
```javascript
const status = project.profitDistributionStatus; // 直接使用，类型定义已完善
```

## 显示效果

### 项目概览卡片
- 使用Statistic组件显示关键数据
- 不同数据使用不同的颜色标识
- 包含图标和单位后缀

### 部门分配表格
- 支持展开/收起查看员工详情
- 动态计算实际分配金额
- 状态标签显示审批状态
- 员工表格嵌套在部门行下方
- ✅ **部门名称现在显示真实名称而非ID**

### 员工分配详情
- ✅ **员工姓名现在显示真实姓名而非ID**
- 优先从项目参与人中获取姓名，保证数据一致性
- 如果参与人中没有，则调用员工API获取

### 汇总信息
- 灰色背景区域显示统计数据
- 包含参与部门数、员工数、总权重

## 数据获取策略

### 部门名称获取
- 通过`getDepartmentDetail(deptId)`API获取部门详情
- 从返回的`data.name`字段获取部门名称
- 添加错误处理，避免API调用失败影响整体显示

### 员工姓名获取
采用两级获取策略：
1. **优先级1**：从已加载的项目参与人详情中查找
   - 通过`details.find(p => p.participantId === distribution.employeeId)`
   - 确保与项目参与人显示的姓名一致
2. **优先级2**：直接调用员工API获取
   - 通过`getEmployeeDetail(Number(distribution.employeeId))`
   - 处理不在项目参与人中的员工情况

## 修复文件
- `zlt-web/portal-web/src/pages/Project/components/ProjectDetail.tsx`

## 测试用例

### 测试项目数据
项目ID: `1937591119709835264`
- 状态：`profitDistributionStatus: "awaiting_approval"`
- 有结项数据：毛利润90,000元，毛利率10%
- 有提成分配：3个部门，3个员工

### 预期显示效果
1. ✅ 计提状态显示为"待审批"（橙色标签）
2. ✅ 项目提成概览显示4个统计卡片
3. ✅ 部门分配表格显示3行真实部门名称：
   - 技术研发部1（原来显示"部门2"）
   - 市场销售部（原来显示"部门4"）
   - 人力行政部（原来显示"部门3"）
4. ✅ 每个部门可展开显示员工分配，显示真实员工姓名：
   - 周杰（原来显示"员工7"）
   - 谢丽娜（原来显示"员工18"）
   - 梁美玲1（原来显示"员工15"）
5. ✅ 汇总显示：3个部门、3个员工、总权重100%

## 性能优化

### API调用优化
- 使用`Promise.all()`并行获取部门和员工信息
- 优先使用已缓存的项目参与人信息
- 添加错误处理，单个API失败不影响整体显示

### 错误处理
- 部门API调用失败时，保持原有的fallback显示（"部门{ID}"）
- 员工API调用失败时，保持原有的fallback显示（"员工{ID}"）
- 在控制台输出错误日志，便于调试

## 后续优化建议

1. **缓存机制**：考虑为部门和员工信息添加本地缓存
2. **批量查询**：如果API支持，可以批量查询部门和员工信息
3. **审批流程集成**：后续可以添加审批操作按钮
4. **权限控制**：根据用户角色显示不同的操作权限 