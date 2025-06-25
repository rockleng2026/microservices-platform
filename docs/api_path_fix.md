# 前端API路径修复

## 问题描述
项目详情页面和提成分配页面中，部门名称和员工姓名显示为ID而不是真实姓名，原因是前端API路径配置错误。

## 问题根源
组织服务的API路径配置错误：
- **错误配置**：直接使用`http://127.0.0.1:9900/api-portal/api/organization/...`
- **正确配置**：应使用相对路径`/api/organization/...`，通过Umi的代理配置转发

## 代理配置分析
从`.umirc.ts`可以看到代理配置：
```typescript
proxy: {
  '/api-project': {
    target: 'http://127.0.0.1:9900',
    changeOrigin: true,
  },
  '/api': {
    target: 'http://127.0.0.1:9900',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api-portal/api',
    },
  },
}
```

这意味着：
- `/api/organization/departments/123` → `http://127.0.0.1:9900/api-portal/api/organization/departments/123`
- `/api-project/api/project/projects` → `http://127.0.0.1:9900/api-project/api/project/projects`

## 修复内容

### 1. 部门API修复
**文件**: `zlt-web/portal-web/src/services/organization/department.ts`

**修复前**:
```typescript
const API_BASE = 'http://127.0.0.1:9900/api-portal';
const API_PREFIX = `${API_BASE}/api/organization/departments`;
```

**修复后**:
```typescript
const API_PREFIX = '/api/organization/departments';
```

### 2. 员工API修复
**文件**: `zlt-web/portal-web/src/services/organization/employee.ts`

**修复前**:
```typescript
const API_BASE = 'http://127.0.0.1:9900/api-portal';
// 所有API调用: `${API_BASE}/api/organization/employee/...`
```

**修复后**:
```typescript
const API_PREFIX = '/api/organization/employee';
// 所有API调用: `${API_PREFIX}/...`
```

### 3. 岗位API修复
**文件**: `zlt-web/portal-web/src/services/organization/position.ts`

**修复前**:
```typescript
const API_BASE = 'http://127.0.0.1:9900/api-portal';
// 所有API调用: `${API_BASE}/api/workposition/...`
```

**修复后**:
```typescript
const API_PREFIX = '/api/workposition';
// 所有API调用: `${API_PREFIX}/...`
```

## 影响的页面

### 1. 项目详情页面 (ProjectDetail.tsx)
- ✅ 修复部门名称显示：从"部门2"变为"技术研发部1"
- ✅ 修复员工姓名显示：从"员工7"变为"周杰"

### 2. 提成分配弹窗 (ProfitDistributionModal.tsx)
- ✅ 修复部门选择下拉框显示真实部门名称
- ✅ 修复员工列表显示真实员工姓名
- ✅ 修复批量查询员工所属大部门功能

## API调用流程

### 修复前的错误流程
```
前端调用: http://127.0.0.1:9900/api-portal/api/organization/departments/2
↓
直接请求到组织服务，绕过网关
↓
可能失败或返回错误数据
```

### 修复后的正确流程
```
前端调用: /api/organization/departments/2
↓
Umi代理转换: http://127.0.0.1:9900/api-portal/api/organization/departments/2
↓
网关路由到组织服务
↓
返回正确的部门数据
```

## 测试验证

### 测试用例
1. **项目详情页面**
   - 打开项目ID: `1937591119709835264`
   - 查看提成分配信息
   - 验证部门名称和员工姓名正确显示

2. **提成分配弹窗**
   - 打开任意已结项项目的提成分配
   - 验证部门下拉框显示真实名称
   - 验证员工列表显示真实姓名

### 预期结果
- ✅ 部门显示："技术研发部1"、"市场销售部"、"人力行政部"
- ✅ 员工显示："周杰"、"谢丽娜"、"梁美玲1"
- ✅ API调用成功，返回完整数据

## 相关文件
- `zlt-web/portal-web/src/services/organization/department.ts`
- `zlt-web/portal-web/src/services/organization/employee.ts`
- `zlt-web/portal-web/src/services/organization/position.ts`
- `zlt-web/portal-web/src/pages/Project/components/ProjectDetail.tsx`
- `zlt-web/portal-web/src/pages/Project/components/ProfitDistributionModal.tsx`
- `zlt-web/portal-web/.umirc.ts`

## 其他修复建议

### 1. 统一API前缀管理
考虑创建统一的API配置文件：
```typescript
// services/config.ts
export const API_ENDPOINTS = {
  ORGANIZATION: '/api/organization',
  PROJECT: '/api-project/api/project',
  // ...
};
```

### 2. 错误处理增强
为API调用添加统一的错误处理和重试机制。

### 3. 类型安全
确保所有API接口的TypeScript类型定义完整。 