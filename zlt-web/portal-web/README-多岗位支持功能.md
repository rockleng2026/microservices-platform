# Portal 多岗位支持功能实现

## 功能概述

本功能实现了Portal用户系统的完整多岗位支持，包括主岗位和副岗位的管理，以及基于岗位的权限切换功能。

## 核心特性

### 1. 多岗位管理
- **主岗位（MAIN）**: 用户的主要工作岗位，通常只有一个
- **副岗位（SUB）**: 用户的兼职岗位，可以有多个
- **岗位切换**: 支持在不同岗位间动态切换
- **权限合并**: 根据当前岗位获取对应的菜单权限

### 2. 前端实现

#### 核心组件

**UserMenu 组件** (`src/components/UserMenu/index.tsx`)
- 集成了完整的岗位选择器
- 支持多岗位显示和切换
- 实现权限实时更新

**PositionSelector 组件** (`src/components/PositionSelector/index.tsx`)
- 岗位下拉选择器
- 支持主岗位和副岗位的区分显示
- 集成岗位切换API调用

**DynamicMenu 组件** (`src/components/DynamicMenu/index.tsx`)
- 基于岗位权限的动态菜单渲染
- 支持菜单权限实时更新

#### API服务

**Portal API** (`src/services/portal.ts`)
```typescript
// 获取用户所有岗位（主岗位 + 副岗位）
export async function getUserAllPositions(userId: number)

// 切换用户岗位
export async function switchUserPosition(positionId: number)

// 获取当前岗位菜单权限
export async function getCurrentUserMenus()
```

### 3. 后端集成

#### Java后端逻辑
```java
// 获取分管岗位（根据岗位ID查询分管岗位）
List<Workposition> subPositions = workpositionMapper.selectSubPositionsByPositionId(positionId, tenantId);
positions.addAll(subPositions);
```

#### API端点
- `GET /api-portal/users/positions` - 获取主岗位
- `GET /api-organization/workposition/sub-positions` - 获取副岗位
- `POST /api-portal/users/switch-position` - 切换岗位
- `GET /api-portal/users/menus` - 获取菜单权限

## 技术实现细节

### 1. 岗位数据结构
```typescript
interface WorkPosition {
  id: number;
  name: string;
  shortname?: string;
  deptId?: number;
  deptName?: string;
  type?: 'MAIN' | 'SUB';  // 岗位类型
  isMain?: boolean;       // 是否主岗位
  workgrade?: number;
  workcontent?: string;
  functionIDs?: string;
  permissions?: string;
}
```

### 2. 岗位切换流程
1. 用户在PositionSelector中选择新岗位
2. 调用`switchUserPosition` API切换岗位
3. 触发全局`positionChanged`事件
4. UserMenu监听事件并更新当前岗位
5. 重新加载菜单权限
6. DynamicMenu重新渲染

### 3. 权限管理
- 每个岗位拥有独立的菜单权限
- 切换岗位时自动更新权限
- 支持权限缓存和实时刷新

### 4. 全局事件机制
```typescript
// 触发岗位切换事件
const event = new CustomEvent('positionChanged', {
  detail: { 
    position: newPosition,
    userId: userId,
    timestamp: new Date().toISOString()
  }
});
window.dispatchEvent(event);

// 监听岗位切换事件
window.addEventListener('positionChanged', handlePositionChange);
```

## 使用示例

### 1. 集成UserMenu组件
```jsx
import UserMenu from './components/UserMenu';

<UserMenu 
  onMenuUpdate={(menus) => {
    // 处理菜单更新
    setMenus(menus);
  }}
/>
```

### 2. 监听岗位切换
```typescript
useEffect(() => {
  const handlePositionChange = (event: any) => {
    console.log('当前岗位已切换到:', event.detail.position);
    // 执行相关业务逻辑
  };

  window.addEventListener('positionChanged', handlePositionChange);
  return () => {
    window.removeEventListener('positionChanged', handlePositionChange);
  };
}, []);
```

## 配置说明

### 1. API地址配置
在`src/services/portal.ts`中配置API基础地址：
```typescript
const API_BASE = 'http://127.0.0.1:9900';
```

### 2. 权限配置
每个岗位的权限通过`functionIDs`和`permissions`字段配置，支持：
- 菜单访问权限
- 按钮操作权限
- API接口权限

## 测试说明

### 1. 功能测试
- 验证用户可以正常获取所有岗位（主岗位 + 副岗位）
- 验证岗位切换功能正常工作
- 验证权限更新机制
- 验证全局事件触发

### 2. 性能测试
- 岗位切换响应时间
- 菜单权限加载性能
- 大量岗位时的性能表现

## 注意事项

1. **数据一致性**: 确保前后端岗位数据结构一致
2. **权限缓存**: 合理使用权限缓存，避免频繁请求
3. **错误处理**: 完善错误处理机制，提供友好的用户提示
4. **兼容性**: 确保与现有系统的兼容性

## 扩展功能

### 1. 计划扩展
- 岗位权限预览功能
- 岗位切换历史记录
- 批量岗位操作
- 岗位权限对比

### 2. 性能优化
- 权限数据预加载
- 岗位信息缓存策略
- 菜单渲染优化

## 更新日志

### v1.0.0 (当前版本)
- ✅ 实现基础多岗位支持
- ✅ 完成岗位切换功能
- ✅ 集成权限管理系统
- ✅ 添加全局事件机制
- ✅ 完善错误处理和用户提示

### v1.1.0 (最新版本)
- ✅ **完成分管岗位查询逻辑实现**
- ✅ 添加`selectSubPositionsByPositionId`方法到WorkpositionMapper
- ✅ 基于workposition_manage_dept表实现分管岗位查询
- ✅ 修复SQL查询中的列名歧义和ORDER BY问题
- ✅ 更新PortalUserServiceImpl集成主岗位+分管岗位获取
- ✅ 优化前端数据流：从用户信息中获取岗位列表，而非单独API调用
- ✅ 完善UserMenu组件的岗位信息提取和显示逻辑
- ✅ 创建完整的测试数据SQL脚本

### 计划更新
- 🔄 添加岗位权限预览
- 🔄 优化性能和缓存策略
- 🔄 增强用户体验
- 🔄 添加岗位管理界面，支持员工副岗位分配

## 核心SQL实现

### 分管岗位查询SQL
```sql
SELECT
wp.id, wp.name, wp.short_name, wp.department_id, wp.position_level, wp.job_description, wp.requirements,
wp.salary_range, wp.max_employees, wp.menu_ids, wp.menu_func_ids, wp.is_manager, wp.is_director,
wp.sort_order, wp.tenant_id, wp.created_at, wp.updated_at, wp.created_by, wp.updated_by
FROM workposition wp
INNER JOIN workposition_manage_dept wmd ON wp.id = wmd.charge_workposition_id
WHERE wmd.workposition_id = #{positionId} AND wmd.tenant_id = #{tenantId}
AND wp.status = 1
AND wp.delflag = 0
ORDER BY wp.sort_order ASC
```

### 数据库设计说明
- `employee.position_id`: 员工主岗位ID
- `workposition_manage_dept`: 岗位分管关系表，用于多岗位管理
  - `workposition_id`: 管理者岗位ID
  - `charge_department_id`: 分管部门ID
  - `charge_workposition_id`: 分管岗位ID

### 分管岗位查询逻辑
根据用户主岗位ID，在workposition_manage_dept表中直接查询该岗位所分管的其他岗位。

### 前端数据流优化
- **v1.1.0之前**: 前端单独调用岗位列表API获取多岗位信息
- **v1.1.0之后**: 岗位信息集成在用户信息中返回，前端从`userInfo.positions`字段获取 