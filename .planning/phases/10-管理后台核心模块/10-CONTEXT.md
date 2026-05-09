# Phase 10: 管理后台核心模块 - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

实现管理后台核心模块：商品管理、订单管理、优惠券管理、轮播图管理。

**Phase 10 delivers:**
- 商品管理：ProTable 列表、Modal弹窗新增/编辑、批量上下架、分类管理、规格管理（与商品同表单）、多图上传（最多5张，拖拽排序）
- 订单管理：ProTable 列表、数字分页、详情查看、改价（输入框直改+可选原因+确认，不允许低于成本价）、备注、关单、虚拟商品自动完成
- 优惠券管理：ProTable 列表、手动发放给指定用户、限时领取链接（一次性码）、站内信通知状态变化、提前失效、统计
- 轮播图管理：多Banner管理（最多5张）、商品/分类页跳转、拖拽排序

</domain>

<decisions>
## Implementation Decisions

### 表格交互模式
- **D-01:** 使用 **ProTable 组件**（Ant Design Pro 内置），内置搜索/筛选/分页/批量操作
- **D-02:** 批量操作：顶部工具栏（批量上架/批量下架/批量删除），勾选后 Modal 弹窗确认
- **D-03:** 分页模式：**数字分页**（1 2 3 ... 10）

### 商品编辑形态
- **D-04:** 新增/编辑商品使用 **Modal 弹窗**（右侧滑出或居中弹出，不跳页）
- **D-05:** 规格管理：**与商品同表单**，一个弹窗内完成所有编辑
- **D-06:** 商品图片：**多图上传（最多5张），支持拖拽排序**

### 订单价格修改
- **D-07:** 改价交互：**输入框直接修改**，订单详情页金额旁直接可编辑
- **D-08:** 改价提交：**可选原因 + 确认**（不强制填写原因，但提交时需确认）
- **D-09:** 改价校验：**不允许改价低于成本价**，系统在前端和后端双重校验

### 优惠券发放方式
- **D-10:** 发放方式：**手动发放 + 生成领取链接/码** 两种都支持
- **D-11:** 领取链接：**限时领取链接**（一次性码，有时间限制）
- **D-12:** 状态变化通知：优惠券用完/过期时发送**站内信/通知**给用户

### Banner 管理
- **D-13:** Banner 数量：**多Banner管理（最多5张）**，可排序
- **D-14:** Banner 跳转：支持**商品详情页 + 分类页**两种跳转类型
- **D-15:** Banner 排序交互：**拖拽排序**

### Claude's Discretion
- 商品列表搜索：ProTable 内置搜索栏，支持关键词搜索
- 订单列表状态筛选：5个Tab（全部/待付款/待发货/待收货/已完成）+ 日期范围筛选
- 优惠券有效期配置：创建时设置生效时间/失效时间

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目文档
- `.planning/PROJECT.md` — 技术栈确认（React 18 + Umi 4 + Ant Design Pro）
- `.planning/REQUIREMENTS.md` — Phase 10 的 34 个需求（ADMIN-01/02/03/04/10）
- `.planning/ROADMAP.md` — Phase 10 成功标准
- `.planning/phases/08-Admin基础框架与小程序首页商品/08-CONTEXT.md` — Phase 8 决策（Admin 布局/技术栈）
- `.planning/phases/08-Admin基础框架与小程序首页商品/08-UI-SPEC.md` — UI 设计规范

### 现有代码参考
- `zlt-web/portal-web/src/layouts/BasicLayout.tsx` — Admin 基础布局参考（Sidebar240px + Header60px）
- `zlt-web/portal-web/src/layouts/BasicLayout.less` — Admin 样式参考
- `zlt-web/portal-web/src/global.less` — Admin 全局样式（Primary: #1890ff）
- `zlt-web/portal-web/src/pages/Dashboard/index.tsx` — Dashboard 实现参考
- `zlt-web/portal-web/package.json` — Admin 技术栈依赖

### 后端 API（参考）
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/` — Admin 相关 Controller
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/` — 商品/订单/优惠券 Service 实现

### Phase 9 决策参考
- `.planning/phases/09-小程序交易流程/09-CONTEXT.md` — Phase 9 微信支付/订单流程决策

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- BasicLayout.tsx/Less — 可直接复用为 Admin 基础框架
- portal-web 的 ProTable、ProCard 组件 — 可用于 Admin 数据展示
- ECharts — 已在 portal-web 使用，可直接复用

### Established Patterns
- Admin 布局：Sidebar(240px) + Header(60px) + Content(24px padding) 模式
- 卡片组件样式：12px radius, shadow，per portal-web
- ProTable 批量操作：工具栏 + Modal 确认
- API 路径：/mall-center/ 后端服务通过网关代理

### Integration Points
- Admin 布局：DynamicMenu 动态菜单组件、UserMenu 用户菜单组件
- 商品管理 → 订单管理：订单关联商品ID
- 优惠券发放 → 用户通知：站内信系统

</code_context>

<specifics>
## Specific Ideas

- 商品列表：ProTable 带搜索栏，筛选条件包括分类/状态/关键词
- 订单详情：改价输入框旁显示成本价参考，支持快速调整
- 优惠券列表：状态Tab筛选（全部/发放中/已过期/已失效）
- Banner 管理：拖拽排序实时保存，显示排序号

</specifics>

<deferred>
## Deferred Ideas

- 商品列表高级搜索（多条件组合筛选）— 可在 Phase 11+ 优化
- 订单导出功能（Excel/CSV）— 可在 Phase 11+ 实现
- 管理员权限控制 UI — 后端复用平台用户体系，前端暂不实现 RBAC UI

</deferred>

---

*Phase: 10-管理后台核心模块*
*Context gathered: 2026-05-09*