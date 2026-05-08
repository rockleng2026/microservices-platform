# Phase 8: Admin基础框架 + 小程序首页/商品详情 - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

为商城系统搭建管理后台基础框架（布局/路由/权限/仪表盘）并实现微信小程序首页、商品列表、商品详情页面。

**Phase 8 delivers:**
- Admin Web 基础框架: BasicLayout (侧边栏240px + 顶部60px + 内容区)、路由配置、Dashboard仪表盘
- Mini Program 首页: Banner轮播、分类入口、推荐商品、搜索
- Mini Program 商品列表: 分页加载、分类筛选、排序、搜索
- Mini Program 商品详情: 图片轮播、规格选择、加入购物车、评价摘要

</domain>

<decisions>
## Implementation Decisions

### Dashboard 布局与指标
- **D-01:** Dashboard 顶部放 4 个指标卡片（订单数、销售额、访客数、转化率）
- **D-02:** 销售趋势使用 ECharts 折线图，支持日/周/月切换
- **D-03:** Dashboard 下方区域采用单页滚动布局（指标卡片 → 图表 → 预警 → 排名）

### 小程序导航与 Tab Bar
- **D-04:** Tab Bar 设置 4 个项目：首页 | 分类 | 购物车 | 我的
- **D-05:** 图标使用 uni-icons（内置，无需额外安装）

### 商品卡片与列表样式
- **D-06:** 商品列表使用图片优先卡片，2列网格布局，图片顶部+信息底部
- **D-07:** 商品详情页采用紧凑型布局：图片300px高度 + 规格选择 + 数量增减 + 底部购买栏

### 搜索与筛选交互
- **D-08:** 搜索通过点击搜索按钮触发（非实时搜索/联想）

### 状态管理方案
- **D-09:** 管理后台使用 Zustand 管理全局状态（购物车、用户信息等）

### API 调用架构
- **D-10:** 管理后台通过 API 网关调用 mall-center（路径 /mall-center/...）

### Claude's Discretion
- Tab Bar 激活状态使用 accent 色（#ff5500）
- 分类筛选默认展开在顶部，支持折叠

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目文档
- `.planning/PROJECT.md` — 技术栈确认（React 18 + Umi 4 + Ant Design Pro, uni-app + Vue 3）
- `.planning/REQUIREMENTS.md` — Phase 8 涉及的 26 个需求（ADMIN-01, MINI-01/02/03）
- `.planning/ROADMAP.md` — Phase 8 的成功标准
- `.planning/phases/08-Admin基础框架与小程序首页商品/08-UI-SPEC.md` — UI 设计规范（已通过验证）

### 现有代码参考
- `zlt-web/portal-web/src/layouts/BasicLayout.tsx` — Admin 布局参考
- `zlt-web/portal-web/src/layouts/BasicLayout.less` — Admin 样式参考
- `zlt-web/portal-web/src/global.less` — Admin 全局样式（Primary: #1890ff）
- `zlt-web/portal-web/src/pages/Dashboard/index.tsx` — Dashboard 实现参考
- `zlt-web/portal-web/package.json` — Admin 技术栈依赖

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- BasicLayout.tsx/Less — 可复用于 Admin 基础框架
- portal-web 的组件（ProTable, ProCard）— 可用于 Admin 数据展示
- ECharts — 已在 portal-web 使用，可直接复用

### Established Patterns
- Admin: Sidebar(240px) + Header(60px) + Content(24px padding) 布局模式
- Admin: 卡片组件样式 (12px radius, shadow)
- Mini: 底部 Tab Bar 固定50px，内容区 flex-1 可滚动

### Integration Points
- Admin 布局：DynamicMenu 动态菜单组件、UserMenu 用户菜单组件
- 小程序：uni-app 的 swiper 组件用于 Banner 轮播
- API: /mall-center/ 后端服务路径通过网关代理

</code_context>

<specifics>
## Specific Ideas

- Dashboard 欢迎横幅使用蓝色渐变背景（与 portal-web 一致）
- 小程序首页搜索栏：白色背景，placeholder "搜索商品..."
- 商品卡片：图片 1:1 比例，价格红色加粗显示

</specifics>

<deferred>
## Deferred Ideas

- 管理后台权限控制 UI — 后端复用平台用户体系，前端暂不实现 RBAC UI（属于 Phase 10+）
- 小程序收藏功能 — MINI-09 个人中心的一部分，属于 Phase 12

</deferred>

---

*Phase: 8-Admin基础框架与小程序首页商品*
*Context gathered: 2026-05-09*