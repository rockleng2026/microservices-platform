# Phase 14 Plan: 前端工程合并

## 目标
将 mall-admin-web 前端迁移到 portal-web，实现商城管理功能的统一。

## 任务分解

### ADMIN-FRONTEND-01-01: 环境准备与文件复制
**描述**: 创建目标目录结构，复制页面和服务文件

**执行步骤**:
1. 在 portal-web 中创建 `src/pages/MallAdmin/` 目录结构
2. 复制 Dashboard 相关文件:
   - `pages/Dashboard/index.tsx` → `pages/MallAdmin/Dashboard/index.tsx`
   - `pages/Dashboard/index.less` → `pages/MallAdmin/Dashboard/index.less`
   - `pages/Dashboard/components/MetricCards.tsx` → `pages/MallAdmin/Dashboard/components/MetricCards.tsx`
   - `pages/Dashboard/components/SalesTrendChart.tsx` → `pages/MallAdmin/Dashboard/components/SalesTrendChart.tsx`
   - `pages/Dashboard/components/StockWarningList.tsx` → `pages/MallAdmin/Dashboard/components/StockWarningList.tsx`
   - `pages/Dashboard/components/UserStats.tsx` → `pages/MallAdmin/Dashboard/components/UserStats.tsx`
   - `pages/Dashboard/components/TopProducts.tsx` → `pages/MallAdmin/Dashboard/components/TopProducts.tsx`
3. 复制 Goods 页面:
   - `pages/Goods/index.tsx` → `pages/MallAdmin/Goods/index.tsx`
   - `pages/Goods/detail/index.tsx` → `pages/MallAdmin/Goods/detail/index.tsx`
4. 复制 Categories 页面: `pages/Categories/index.tsx` → `pages/MallAdmin/Categories/index.tsx`
5. 复制 Orders 页面: `pages/Orders/index.tsx` → `pages/MallAdmin/Orders/index.tsx`
6. 复制 Banners 页面: `pages/Banners/index.tsx` → `pages/MallAdmin/Banners/index.tsx`
7. 创建 API 服务目录 `src/services/mall-admin/`
8. 复制 API 服务文件:
   - `services/admin/statistics.ts` → `services/mall-admin/statistics.ts`
   - `services/admin/goods.ts` → `services/mall-admin/goods.ts` (如存在)
   - `services/admin/order.ts` → `services/mall-admin/order.ts` (如存在)
   - `services/admin/category.ts` → `services/mall-admin/category.ts` (如存在)
   - `services/admin/banner.ts` → `services/mall-admin/banner.ts` (如存在)
9. 复制状态管理: `stores/useStore.ts` → `stores/mallAdminStore.ts`
10. 复制样式文件: `global.less` 中的商城相关样式 (如需要)

**验证**: 对比源目录和目标目录，文件数量一致:
- 页面目录: 6个 (Dashboard, Goods, Goods/detail, Categories, Orders, Banners)
- 服务文件: 5个 (statistics, goods, order, category, banner)
- 组件目录: 1个 (Dashboard/components, 包含5个组件)

---

### ADMIN-FRONTEND-01-02: 路由配置
**描述**: 在 portal-web 中配置商城管理路由

**执行步骤**:
1. 读取 `.umirc.ts` 了解路由配置格式
2. 添加商城管理路由:
   ```typescript
   { path: '/mall-admin', name: '商城管理', component: '@/layouts/BasicLayout',
     routes: [
       { path: '/mall-admin/dashboard', component: '@/pages/MallAdmin/Dashboard' },
       { path: '/mall-admin/goods', component: '@/pages/MallAdmin/Goods' },
       { path: '/mall-admin/goods/detail/:id', component: '@/pages/MallAdmin/Goods/detail' },
       { path: '/mall-admin/categories', component: '@/pages/MallAdmin/Categories' },
       { path: '/mall-admin/orders', component: '@/pages/MallAdmin/Orders' },
       { path: '/mall-admin/banners', component: '@/pages/MallAdmin/Banners' },
     ]
   }
   ```
3. 添加 API 代理配置 (如尚未配置):
   ```typescript
   '/mall-center': { target: 'http://127.0.0.1:7010', changeOrigin: true }
   '/api/mall/admin': { target: 'http://127.0.0.1:7010', changeOrigin: true }
   ```

**验证**: 路由配置正确，URL 可访问

---

### ADMIN-FRONTEND-01-03: 代码适配与修复
**描述**: 修复迁移过程中的代码兼容性问题

**执行步骤**:
1. **API路径检查**: 确认 `services/mall-admin/statistics.ts` 中的 API 调用路径已配置为正确的代理路径:
   - 统计API: `/mall-center/statistics/*`
   - 商品API: `/mall-center/goods/*`
   - 订单API: `/mall-center/orders/*`
2. **类型修复**: 确认 `TopProducts.tsx` 使用本地 `TopProductItem` 接口替代不存在的 `MallGoods`
3. **Store修复**: 确认 `mallAdminStore.ts` 包含完整的 `fetchTopProducts` 方法
4. **安全访问**: 确认所有组件使用 `data?.slice()` 或 `data || []` 防止空指针
5. **组件导入检查**: 确认所有组件的 `@/` 导入路径在 portal-web 中有效

**验证**: `npm run dev` 在 portal-web 目录运行无编译错误

---

### ADMIN-FRONTEND-01-04: 菜单权限与动态菜单集成
**描述**: 确认数据库菜单配置正确，动态菜单组件可显示商城管理菜单

**执行步骤**:
1. 验证数据库菜单已创建:
   ```sql
   SELECT * FROM central_organization.menu_page WHERE id >= 465;
   ```
2. 确认菜单数据:
   - ID 465: 商城管理 (父级, /mall-admin, icon: shopping)
   - ID 466: 工作台 (/mall-admin/dashboard, icon: dashboard)
   - ID 467: 商品管理 (/mall-admin/goods, icon: box)
   - ID 468: 分类管理 (/mall-admin/categories, icon: appstore)
   - ID 469: 订单管理 (/mall-admin/orders, icon: file-text)
   - ID 470: Banner管理 (/mall-admin/banners, icon: picture)
3. 验证 DynamicMenu 组件的 iconMap 包含必要图标: shopping, dashboard, box, appstore, file-text, picture
4. 如图标缺失，在 `components/DynamicMenu/index.tsx` 的 iconMap 中添加
5. 确认管理员岗位的 menuIds 包含新菜单ID (465-470)

**验证**: 管理员登录后访问 portal-web，侧边栏显示"商城管理"菜单组，点击展开可见工作台、商品管理、分类管理、订单管理、Banner管理五个子菜单项

---

### ADMIN-FRONTEND-01-05: 功能测试
**描述**: 端到端验证商城管理功能

**执行步骤**:
1. 启动 portal-web: `cd zlt-web/portal-web && npm run dev`
2. 使用管理员账号登录
3. 访问 Dashboard: http://localhost:8001/mall-admin/dashboard
   - 验证页面加载无报错
   - 验证统计卡片、图表、列表数据显示
4. 测试商品管理: http://localhost:8001/mall-admin/goods
   - 验证商品列表显示
   - 验证筛选、搜索功能
5. 测试分类管理: http://localhost:8001/mall-admin/categories
6. 测试订单管理: http://localhost:8001/mall-admin/orders
7. 测试Banner管理: http://localhost:8001/mall-admin/banners

**验证**: 每个页面完成以下检查:
- [ ] 页面正常加载，无JavaScript错误
- [ ] 数据正确显示 (非空白或加载错误)
- [ ] 菜单导航功能正常
- [ ] 主要交互操作可执行

---

## 依赖关系
```
ADMIN-FRONTEND-01-01 (环境准备)
    ↓
ADMIN-FRONTEND-01-02 (路由配置)
    ↓
ADMIN-FRONTEND-01-03 (代码适配)
    ↓
ADMIN-FRONTEND-01-04 (菜单权限)
    ↓
ADMIN-FRONTEND-01-05 (功能测试)
```

## 成功标准
1. mall-admin-web 的所有页面成功迁移到 portal-web
2. 路由配置正确，各页面可访问
3. 动态菜单显示商城管理菜单项
4. Dashboard 页面正常加载无报错
5. API 调用正常，数据展示正确

## 关键文件清单
- `zlt-web/portal-web/src/pages/MallAdmin/` - 迁移后的页面
- `zlt-web/portal-web/src/services/mall-admin/` - 迁移后的API服务
- `zlt-web/portal-web/src/stores/mallAdminStore.ts` - 状态管理
- `zlt-web/portal-web/.umirc.ts` - 路由和代理配置