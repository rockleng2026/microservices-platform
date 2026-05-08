# Phase 8: Admin基础框架 + 小程序首页/商品详情 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 8-Admin基础框架与小程序首页商品
**Areas discussed:** Dashboard布局与指标, 小程序导航与Tab Bar, 商品卡片与列表样式, 搜索与筛选交互, 状态管理方案, API调用架构

---

## Dashboard布局与指标

| Option | Description | Selected |
|--------|-------------|----------|
| 4指标卡片 | 4个核心指标横向排列，当前选中的方案 | ✓ |
| 6指标卡片 | 6个指标分2行3列展示，更全面的数据视角 | |
| 弹性网格 | 2行多列，根据可用空间自动调整 | |

**User's choice:** 4指标卡片
**Notes:** Dashboard顶部4个核心指标：订单数、销售额、访客数、转化率

---

## 图表类型

| Option | Description | Selected |
|--------|-------------|----------|
| ECharts 折线图 | ECharts 是 portal-web 现有依赖，Line Chart 展示日/周/月销售趋势 | ✓ |
| 嵌入商业 BI | 通过 iframe 嵌入商业 BI 仪表盘（如 PowerBI/Tableau） | |
| ECharts 面积图 | 基于 ECharts，封装好了的配置化图表组件，使用更简单 | |

**User's choice:** ECharts 折线图
**Notes:** 复用 portal-web 的 ECharts 依赖

---

## Dashboard下方布局

| Option | Description | Selected |
|--------|-------------|----------|
| 单页滚动 | 指标卡片、图表、预警、排名全部在同一屏幕，简洁高效 | ✓ |
| 双栏并排 | 左侧列表，右侧图表，表格和可视化分离 | |
| 上下分区 | 关键指标在顶部，图表在中间，详细列表在底部 | |

**User's choice:** 单页滚动
**Notes:** 指标卡片 → 销售趋势图表 → 库存预警 → 热销排行

---

## Tab Bar 项目数

| Option | Description | Selected |
|--------|-------------|----------|
| 4项（标准） | 首页|分类|购物车|我的 — 标准电商小程序 | ✓ |
| 5项（含订单） | 首页|分类|购物车|订单|我的 — 订单独立入口更方便 | |

**User's choice:** 4项（标准）
**Notes:** Tab Bar: 首页 | 分类 | 购物车 | 我的

---

## 图标方案

| Option | Description | Selected |
|--------|-------------|----------|
| uni-icons | 内置图标，体积小，无需额外安装 | ✓ |
| iconfont | 扩展性更好，图标更丰富，需额外安装 | |

**User's choice:** uni-icons

---

## 商品列表样式

| Option | Description | Selected |
|--------|-------------|----------|
| 图片优先卡片 | 商品图片在顶部，名称+价格+销量在底部，2列网格 | ✓ |
| 图文左右排布 | 左侧商品图，右侧名称+价格+简介，更高信息密度 | |
| 大图瀑布流 | 纯图片，商品名称悬浮在图片底部，适合时尚/服装类 | |

**User's choice:** 图片优先卡片
**Notes:** 图片顶部 + 信息底部，2列网格布局

---

## 商品详情页布局

| Option | Description | Selected |
|--------|-------------|----------|
| 紧凑型（推荐） | 图片300px高度，规格选择，数量增减，加入购物车/立即购买按钮 | ✓ |
| 大图型 | 大图轮播(50%屏幕)+详细信息，规格和按钮在下方 | |
| 分页标签型 | 图片+规格选择+详情分页标签切换，类似京东商品页 | |

**User's choice:** 紧凑型（推荐）

---

## 搜索触发方式

| Option | Description | Selected |
|--------|-------------|----------|
| 点击搜索按钮 | 输入完关键词后点击搜索按钮才触发搜索 | ✓ |
| 输入时实时搜索 | 输入关键词后等待一定时间自动触发，不用按按钮 | |
| 输入联想 | 输入后出现下拉建议，点击或回车才执行搜索 | |

**User's choice:** 点击搜索按钮
**Notes:** 非实时搜索，用户明确点击后才执行

---

## 管理后台状态管理

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand（推荐） | 轻量级，API简洁，与 React Hooks 配合良好，足够管理购物车/用户状态 | ✓ |
| Redux Toolkit | 社区更大，但体积较大，对于管理后台状态管理可能过于复杂 | |
| MobX | 基于发布订阅，响应式，但调试困难，体积较大 | |

**User's choice:** Zustand（推荐）

---

## API 调用架构

| Option | Description | Selected |
|--------|-------------|----------|
| 通过 API 网关（推荐） | 通过 Nacos 网关路由，符合微服务架构，路径 /mall-center/... | ✓ |
| 直连后端服务 | 前端直接调用后端服务，跳过网关，开发测试方便 | |
| 配置代理 | Vite 代理配置将请求转发到后端，开发环境简单，但生产环境需配合网关 | |

**User's choice:** 通过 API 网关（推荐）
**Notes:** 符合微服务架构，通过网关路由到 mall-center

---

## Claude's Discretion

- Tab Bar 激活状态使用 accent 色（#ff5500）
- 分类筛选默认展开在顶部，支持折叠

## Deferred Ideas

- 管理后台权限控制 UI — 后端复用平台用户体系，前端暂不实现 RBAC UI（属于 Phase 10+）
- 小程序收藏功能 — MINI-09 个人中心的一部分，属于 Phase 12