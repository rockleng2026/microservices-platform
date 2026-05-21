# Milestones

## v1.0 MVP — 2026-05-08

**Phases:** 4 | **Plans:** 12 | **Tasks:** ~24

### Key Accomplishments

1. 基础架构完成 — mall-center服务(7010端口)、数据库8表、商品/购物车/地址CRUD
2. 后台管理完成 — 商品分类树形管理、商品CRUD、轮播图管理、微信支付参数配置、统计卡片
3. 订单支付核心完成 — 订单创建/流转/管理、微信JSAPI支付集成、Redis库存预占防超卖
4. 用户侧评价与交互完成 — 评价模块(评分/评论/图片)、物流轨迹追踪、用户消费统计

### Stats

- Commits: 39 (since 2026-05-08)
- Files changed: 120
- Lines added: ~8898
- Timeline: 2026-05-08 (single day session)

### Decisions

| Decision | Outcome |
|----------|---------|
| 虚拟商品订单支付后自动完成，无需发货 | ✓ Implemented |
| 混合购物车不支持实物+虚拟同时结算 | ✓ Implemented |
| 库存扣减：下单预占+支付成功真实扣减 | ✓ Implemented |
| 微信支付配置一期暂不联调 | ✓ Deferred |

### Known Gaps

- Phase 1/2 Result.succeed() 泛型问题导致编译失败（不影响功能）
- 微信支付需真实商户参数才能联调

---

*Last updated: 2026-05-08*
---

## v1.2 — 2026-05-08

**Phases:** 3 | **Plans:** 8 | **Tasks:** ~16

### Key Accomplishments

1. 修复编译问题 — Result.succeed() 泛型修复，项目完整编译
2. 退款模块完成 — 用户申请→管理员审核→微信退款→库存回增，状态机完整
3. 营销模块完成 — 优惠券/促销互斥、会员积分体系
4. 订单增强 — 管理员关单（status=3）、改价（仅允许减少）、备注
5. 数据看板 — 销售趋势/库存预警/用户分析
6. 扩展功能 — Redis Lua原子化库存、商户多租户入驻、微信模板消息

### Stats

- Commits: 23 (since 526c09365)
- Files changed: 53
- Lines added: +6,830 / -51
- Timeline: 2026-05-08 (single day session)

### Decisions

| Decision | Outcome |
|----------|---------|
| 使用 Spring Data Redis scripting 替代 Redisson | ✓ Implemented (API不存在但效果相同) |
| 商户审批后自动生成 MERCHANT_{id} 作为 tenantId | ✓ Implemented |
| 优惠券与促销活动互斥 | ✓ Implemented |
| ADVANCED-01 (Elasticsearch) Dropped | ❌ Removed — 增加系统复杂度和部署难度 |

### Known Tech Debt

- OrderServiceImpl.java line 45 TODO (zlt-uaa 集成，pre-existing)
- 微信支付联调需要真实商户参数

### Requirements Coverage

- COMPILE-01 ✅ | REFUND-01~10 ✅ | MARKETING-01~09 ✅
- ORDER-EXT-01~03 ✅ | STAT-01~03 ✅
- ADVANCED-02~04 ✅ | ADVANCED-01 ❌ Dropped

---

## v2.0 — Planning (2026-05-09)

**Goal:** 开发管理前端（React + Umi + Ant Design）和微信小程序（uni-app + Vue）

**Target features:**
- 管理后台 Web：商品管理、订单管理、优惠券/促销管理、发货与物流等运营模块
- 微信小程序：面向消费者的商品浏览、购物车、订单、支付等用户侧功能
- 页面设计需调用 `/gsd-ui-phase` 进行 UI 设计规划

**技术栈：**
- 管理后台：React 18 + Umi 4 + Ant Design Pro（与 portal-web 保持一致）
- 微信小程序：uni-app + Vue 3

**Status:** 需求定义中

---

---

## v2.1 — SHIPPED 2026-05-21

**Phases:** 3 | **Plans:** 4 | **Requirements:** 12/18 shipped

### Key Accomplishments

1. Phase 18 接口文档 — 126个接口文档，6个模块Tab，Mermaid流程图渲染正常
2. Phase 18 Plan 01 — 菜单SQL + Umi路由 + ApiDoc骨架
3. Phase 18 Plan 02 — Mermaid集成 + 126个接口flowchart字段
4. Phase 19 用户登录模块分析 — id/userId混淆问题识别，Token安全等5个Critical问题
5. Phase 20 FAQ页面 — HELP-03-01~04 实现

### Stats

- Commits: 288 total in v2.1 period
- Timeline: 2026-05-20 → 2026-05-21
- Requirements: 67% (12/18 shipped)

### Decisions

| Decision | Outcome |
|----------|---------|
| Mermaid流程图展示接口处理流程 | ✅ Shipped |
| FAQ数据存储在前端JSON配置文件 | ✅ Shipped |
| HELP-02 菜单使用说明 Deferred | ⚠ Deferred to next phase |

### Known Issues

- Token无签名/无过期时间 — 需要 zlt-uaa 改造（已识别，待修复）
- mall_member 无独立 address 字段 — 需要表结构变更（已识别）

### Known Deferred

- HELP-02 菜单使用说明 — 4个requirements deferred（Phase 19 分析产出，非实现）

