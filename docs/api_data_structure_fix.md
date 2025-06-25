# API返回数据结构修复指南

## 问题描述
部门API能正确返回数据，返回了"技术研发部1"，但前端仍显示"部门2"。

## 根本原因
API返回数据使用`datas`字段，但前端代码期待`data`字段：

**实际API返回**:
```json
{
  "datas": { "name": "技术研发部1" },
  "resp_code": 0
}
```

**前端期待**:
```json
{
  "data": { "name": "技术研发部1" }
}
```

## 修复状态

### ✅ 已修复
1. 提成分配中的部门名称获取
2. 提成分配中的员工姓名获取

### ❌ 待修复  
3. 项目负责人姓名获取
4. 项目参与人信息获取

## 手动修复指南

**文件**: `zlt-web/portal-web/src/pages/Project/components/ProjectDetail.tsx`

**修复1 - 项目负责人(约第76行)**:
```typescript
// 改前: if (res && res.data && res.data.name)
// 改后: if (res && res.resp_code === 0 && res.datas && res.datas.name)
```

**修复2 - 参与人信息(约第101行)**:
```typescript
// 改前: res.data.name, res.data.departmentName
// 改后: res.datas.name, res.datas.departmentName  
```

修复后应该能看到正确的部门名称"技术研发部1"。 