# Phase 14 Research: 前端工程合并

## 研究目标
将 mall-admin-web 前端迁移到 portal-web 工程，实现商城管理功能与Portal平台的统一。

## 现状分析

### mall-admin-web (源工程)
- **位置**: `zlt-web/mall-admin-web`
- **技术栈**: React 18 + Umi 4 + Ant Design 4 + Zustand
- **页面**: Dashboard, Goods, Categories, Orders, Banners
- **问题**: 独立工程，缺少权限菜单、用户认证等基础功能

### portal-web (目标工程)
- **位置**: `zlt-web/portal-web`
- **技术栈**: React 18 + Umi 4 + Ant Design 4 (相同)
- **已具备**:
  - 动态菜单系统 (DynamicMenu组件)
  - 用户认证 (UserMenu组件)
  - 权限管理 (MenuPermission)
  - 路由系统 (BasicLayout + Outlet)
  - API服务层 (services/portal.ts)
- **菜单数据**: central_organization.menu_page + menu_func

## 迁移范围

### 需要迁移的文件
1. **页面组件** (`mall-admin-web/src/pages/`)
   - Dashboard/* - 工作台页面
   - Goods/* - 商品管理页面
   - Categories/* - 分类管理页面
   - Orders/* - 订单管理页面
   - Banners/* - Banner管理页面

2. **服务层** (`mall-admin-web/src/services/`)
   - services/admin/statistics.ts - 统计API
   - services/admin/goods.ts - 商品API
   - services/admin/order.ts - 订单API
   - services/admin/category.ts - 分类API
   - services/admin/banner.ts - Banner API

3. **状态管理** (`mall-admin-web/src/stores/`)
   - stores/useStore.ts - Zustand状态管理

4. **工具类** (`mall-admin-web/src/utils/`)
   - utils/request.ts - HTTP请求封装

5. **样式文件**
   - pages/Dashboard/index.less
   - 可能有组件级less文件

### 需要适配的内容
1. **API路径调整**: 从 `/mall-center/*` 调整为通过API网关调用
2. **导入路径调整**: `@/` 别名保持一致
3. **菜单配置**: 已插入数据库 (ID 465-470)
4. **组件引用**: 检查不存在的类型引用 (如 MallGoods)

## 技术方案

### 方案一：完整迁移 (推荐)
将 mall-admin-web 的页面完整复制到 portal-web，保持代码一致性。

**优点**:
- 迁移工作量小
- 代码一致性好
- 保留所有功能

**缺点**:
- 可能存在重复代码 (如 request 工具)

### 方案二：按需迁移
只迁移需要的页面，根据实际使用的API和服务选择性迁移。

**优点**:
- 更精简

**缺点**:
- 需要仔细分析依赖关系
- 可能遗漏功能

## 风险与问题

1. **Umi request插件冲突**: mall-admin-web 的 @umijs/plugins/dist/request 导出问题
2. **类型引用错误**: MallGoods 类型不存在
3. **API代理配置**: portal-web 需要配置指向 mall-center 的代理
4. **菜单权限**: 用户岗位需要包含新菜单ID (465-470)

## 参考资料

- portal-web 动态菜单: `zlt-web/portal-web/src/components/DynamicMenu/index.tsx`
- mall-admin-web 页面: `zlt-web/mall-admin-web/src/pages/`
- 数据库菜单: `central_organization.menu_page` (ID 465-470 已创建)