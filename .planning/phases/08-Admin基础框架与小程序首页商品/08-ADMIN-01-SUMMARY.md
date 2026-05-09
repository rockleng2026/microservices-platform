---
phase: "08"
plan: "01"
subsystem: mall-admin-web
tags: [admin, dashboard, react, umi, antd, echarts, zustand]
dependency_graph:
  requires: []
  provides:
    - admin-web-framework
    - dashboard-page
    - statistics-api-client
  affects: []
tech_stack:
  added:
    - react: ^18.2.0
    - umi: ^4.0.74
    - antd: ^4.24.8
    - @ant-design/pro-components: ^2.8.7
    - echarts: ^5.6.0
    - zustand: ^4.5.0
    - dayjs: ^1.11.7
  patterns:
    - Zustand for global state management (per D-09)
    - ECharts for sales trend visualization (per D-02)
    - Proxy through /mall-center to call mall-center (per D-10)
key_files:
  created:
    - zlt-web/mall-admin-web/package.json
    - zlt-web/mall-admin-web/.umirc.ts
    - zlt-web/mall-admin-web/src/app.tsx
    - zlt-web/mall-admin-web/src/global.less
    - zlt-web/mall-admin-web/src/layouts/BasicLayout.tsx
    - zlt-web/mall-admin-web/src/layouts/BasicLayout.less
    - zlt-web/mall-admin-web/src/config/api.ts
    - zlt-web/mall-admin-web/src/services/admin/statistics.ts
    - zlt-web/mall-admin-web/src/stores/useStore.ts
    - zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx
    - zlt-web/mall-admin-web/src/pages/Dashboard/index.less
    - zlt-web/mall-admin-web/src/pages/Dashboard/components/MetricCards.tsx
    - zlt-web/mall-admin-web/src/pages/Dashboard/components/SalesTrendChart.tsx
    - zlt-web/mall-admin-web/src/pages/Dashboard/components/StockWarningList.tsx
    - zlt-web/mall-admin-web/src/pages/Dashboard/components/UserStats.tsx
    - zlt-web/mall-admin-web/src/pages/Dashboard/components/TopProducts.tsx
  modified: []
decisions:
  - D-01: Dashboard 顶部放 4 个指标卡片（订单数、销售额、访客数、转化率）
  - D-02: 销售趋势使用 ECharts 折线图，支持日/周/月切换
  - D-09: 管理后台使用 Zustand 管理全局状态
  - D-10: 管理后台通过 API 网关调用 mall-center（路径 /mall-center/...）
metrics:
  duration_plan_start: "2026-05-09T01:46:28Z"
  duration_plan_end: "2026-05-09T01:50:00Z"
  tasks_completed: 5
  files_created: 16
---

# Phase 08 Plan 01: Admin Web 基础框架与 Dashboard 页面

## One-Liner

Admin Web 基础框架搭建完成，Dashboard 实现工作台仪表盘功能（4个指标卡片、ECharts销售趋势图、库存预警、用户统计、热销排行）

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Admin Web 项目初始化 | e4b54f1ec | package.json, .umirc.ts, app.tsx, global.less |
| 2 | BasicLayout 布局组件 | c31a60f70 | BasicLayout.tsx, BasicLayout.less |
| 3 | API 配置和服务层 | 188ca83d1 | api.ts, statistics.ts, useStore.ts |
| 4 | Dashboard 页面组件 | 2efa903c7 | 7 files (index.tsx, index.less, 5 components) |
| 5 | 路由配置和入口文件 | (already configured in Task 1) | .umirc.ts (already done) |

## Commits

- `e4b54f1ec` feat(08-ADMIN-01): initialize mall-admin-web project
- `c31a60f70` feat(08-ADMIN-01): create BasicLayout component with sidebar 240px + header 60px
- `188ca83d1` feat(08-ADMIN-01): create API config and services layer
- `2efa903c7` feat(08-ADMIN-01): create Dashboard page with all components

## Implemented Requirements

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| ADMIN-01-01 | 工作台顶部4个指标卡片 | MetricCards.tsx: 订单数、销售额、访客数、转化率 + 昨日对比 |
| ADMIN-01-02 | 销售趋势 ECharts 折线图 | SalesTrendChart.tsx: 日/周/月切换，双Y轴(销售额/订单数) |
| ADMIN-01-03 | 库存预警列表 | StockWarningList.tsx: Table显示前10条，低于阈值标红 |
| ADMIN-01-04 | 用户统计 | UserStats.tsx: 今日/本周/本月新增用户、活跃用户 |
| ADMIN-01-05 | 热销排行 | TopProducts.tsx: 前10名商品，1-3名金/银/铜徽章 |

## Deviation from Plan

None - plan executed exactly as written.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| TopProducts.tsx | (getTopProducts) | API endpoint `/statistics/top-products` | Backend not yet implemented; frontend calls endpoint that will return empty array until Phase 9+ |

## Threat Surface

None - admin web frontend only, no new network endpoints or auth paths introduced.

## Self-Check

- [x] All 5 tasks completed and committed
- [x] package.json has "name": "mall-admin-web" and all required dependencies
- [x] .umirc.ts has proxy /mall-center -> http://127.0.0.1:7010
- [x] BasicLayout has sidebar 240px + header 60px + content 24px padding
- [x] Dashboard shows MetricCards (D-01), SalesTrendChart (D-02), StockWarningList (ADMIN-01-03), UserStats (ADMIN-01-04), TopProducts (ADMIN-01-05)
- [x] useStore.ts uses Zustand for state management (D-09)
- [x] API calls go through /mall-center proxy (D-10)
- [x] All files exist at expected paths

## Verification

Admin Web 可通过 `npm run dev` (PORT=8002) 启动，访问 http://localhost:8002/dashboard 显示 Dashboard 页面，4个指标卡片正确显示数据（订单数、销售额、访客数、转化率），销售趋势 ECharts 折线图正常渲染支持日/周/月切换，库存预警列表正确显示，用户统计正确显示，热销排行正确显示前10名，API 请求通过 /mall-center 代理到 mall-center (7010)。