# Roadmap: Mall-Center 在线商城系统

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-05-08)
- ✅ **v1.2** — Phases 5-7 (shipped 2026-05-08)
- 📋 **v2.0** — Phases 8-13 (In Progress)

---

## Milestone Details

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-05-08</summary>

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | 基础架构搭建 | 2/2 | ✅ | 2026-05-08 |
| 2 | 后台管理-商品与系统 | 4/4 | ✅ | 2026-05-08 |
| 3 | 订单与支付核心 | 4/4 | ✅ | 2026-05-08 |
| 4 | 用户侧评价与交互 | 2/2 | ✅ | 2026-05-08 |

</details>

<details>
<summary>✅ v1.2 (Phases 5-7) — SHIPPED 2026-05-08</summary>

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 5 | 修复编译与营销 | 3/3 | ✅ | 2026-05-08 |
| 6 | 订单增强与管理端完善 | 2/2 | ✅ | 2026-05-08 |
| 7 | 扩展功能 | 3/3 | ✅ | 2026-05-08 |

**v1.2 Summary:**
- Phase 5: COMPILE-01 + REFUND-01~10 + MARKETING-01~09
- Phase 6: ORDER-EXT-01~03 + STAT-01~03
- Phase 7: ADVANCED-02~04 (Lua库存 + 商户多租户 + 微信模板消息)

</details>

<details>
<summary>📋 v2.0 (Phases 8-13) — IN PROGRESS</summary>

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 8 | Admin基础框架 + 小程序首页/商品 | 搭建Admin Web基础框架（含布局/路由/权限），实现小程序首页+商品列表+商品详情 | ADMIN-01(5) + MINI-01(7) + MINI-02(5) + MINI-03(9) | Admin Web可运行，布局/导航/登录完成；小程序首页Banner/分类/推荐商品正常展示；商品列表筛选排序正常；商品详情规格选择/加入购物车正常 |
| 9 | 小程序交易流程 | 实现小程序购物车+订单确认+微信支付+订单列表+订单详情+退款申请 | MINI-04(7) + MINI-05(9) + MINI-06(5) + MINI-07(5) + MINI-08(6) + MINI-10(5) | 购物车增删改查正常；订单确认页地址/优惠券/总价计算正确；微信支付调起成功；订单列表状态筛选正常；退款申请提交/取消正常 |
| 10 | 管理后台核心模块 | 实现管理后台商品管理、订单管理、优惠券管理、轮播图管理、仪表盘 | ADMIN-02(10) + ADMIN-03(7) + ADMIN-04(7) + ADMIN-10(5) + ADMIN-01(5) | 商品CRUD/批量上下架正常；订单筛选/详情/改价/关单正常；优惠券创建/发放/统计正常；Banner配置正常；Dashboard图表数据正确 |
| 11 | 管理后台运营模块 | 4/4 | Complete    | 2026-05-19 |
| 12 | 管理后台配置与小程序个人中心 | 5/5 | Complete    | 2026-05-19 |
| 13 | 集成测试与优化 | 端到端测试、UI优化、性能优化、bug修复 | All v2.0 requirements | 所有功能端到端联调通过；Admin Web和小程序UI/交互优化完成；无重大bug遗留 |

**v2.0 Summary:**
- Phase 8: ADMIN-01 + MINI-01 + MINI-02 + MINI-03 (26 requirements)
- Phase 9: MINI-04 + MINI-05 + MINI-06 + MINI-07 + MINI-08 + MINI-10 (37 requirements)
- Phase 10: ADMIN-01 + ADMIN-02 + ADMIN-03 + ADMIN-04 + ADMIN-10 (34 requirements)
- Phase 11: ADMIN-06 + ADMIN-07 + ADMIN-08 + ADMIN-09 (21 requirements)
- Phase 12: ADMIN-05 + ADMIN-11 + MINI-09 (16 requirements)
- Phase 13: Integration testing + optimization (all requirements)

</details>

---

## Phase Mapping

### Phase 8: Admin基础框架 + 小程序首页/商品

| Module | Requirements | Count |
|--------|--------------|-------|
| ADMIN-01 Dashboard | ADMIN-01-01~05 | 5 |
| MINI-01 Home | MINI-01-01~07 | 7 |
| MINI-02 Product List | MINI-02-01~05 | 5 |
| MINI-03 Product Detail | MINI-03-01~09 | 9 |
| **Total** | | **26** |

Plans:
- [x] 08-ADMIN-01-PLAN.md — Admin Web Dashboard (ADMIN-01-01~05)
- [x] 08-MINI-01-PLAN.md — 小程序首页 (MINI-01-01~07)
- [x] 08-MINI-02-PLAN.md — 商品列表 (MINI-02-01~05)
- [x] 08-MINI-03-PLAN.md — 商品详情 (MINI-03-01~09)

### Phase 9: 小程序交易流程

| Module | Requirements | Count |
|--------|--------------|-------|
| MINI-04 Shopping Cart | MINI-04-01~07 | 7 |
| MINI-05 Order Confirmation | MINI-05-01~09 | 9 |
| MINI-06 Order List | MINI-06-01~05 | 5 |
| MINI-07 Order Detail | MINI-07-01~05 | 5 |
| MINI-08 Refund Application | MINI-08-01~06 | 6 |
| MINI-10 WeChat Payment | MINI-10-01~05 | 5 |
| **Total** | | **37** |

### Phase 10: 管理后台核心模块

| Module | Requirements | Count |
|--------|--------------|-------|
| ADMIN-01 Dashboard | ADMIN-01-01~05 | 5 |
| ADMIN-02 Product Management | ADMIN-02-01~10 | 10 |
| ADMIN-03 Order Management | ADMIN-03-01~07 | 7 |
| ADMIN-04 Coupon Management | ADMIN-04-01~07 | 7 |
| ADMIN-10 Banner Management | ADMIN-10-01~05 | 5 |
| **Total** | | **34** |

**Plans:**
- [x] 11-ADMIN-06-PLAN.md — 退款审核页面 (ADMIN-06-01~06)
- [x] 11-ADMIN-07-PLAN.md — 物流管理页面 (ADMIN-07-01~06)
- [x] 11-ADMIN-08-PLAN.md — 用户管理页面 (ADMIN-08-01~04)
- [x] 11-ADMIN-09-PLAN.md — 商户管理页面 (ADMIN-09-01~05)

---

## Phase 12: 管理后台配置与小程序个人中心

| Module | Requirements | Count |
|--------|--------------|-------|
| ADMIN-05 Promotion Management | ADMIN-05-01~06 | 6 |
| ADMIN-11 WeChat Configuration | ADMIN-11-01~03 | 3 |
| MINI-09 Personal Center | MINI-09-01~07 | 7 |
| **Total** | | **16** |

**Plans:**
- [x] 12-ADMIN-05-PLAN.md — 促销管理页面 (ADMIN-05-01~06)
- [x] 12-ADMIN-05-INTEGRATION-PLAN.md — 促销后端 API
- [x] 12-ADMIN-11-PLAN.md — 微信支付配置 (ADMIN-11-01~03)
- [x] 12-MINI-09-PLAN.md — 小程序个人中心 (MINI-09-01~07)
- [x] 12-MINI-09-INTEGRATION-PLAN.md — 个人中心后端 API

---

## Phase 13: 集成测试与优化

| Scope | Description |
|-------|-------------|
| Integration Testing | End-to-end testing of all Admin Web and Mini Program features |
| UI/UX Optimization | Visual polish, responsive design, interaction improvements |
| Performance | Load time optimization, lazy loading, caching strategies |
| Bug Fixes | Resolve any issues found during integration testing |

**Plans:**
- [x] 13-ADMIN-E2E-PLAN.md — Admin Web E2E Test Infrastructure (Wave 1)
- [x] 13-ADMIN-E2E-SUMMARY.md — Admin Web E2E Summary ✅ (completed 2026-05-20)
- [x] 13-MINI-E2E-PLAN.md — Mini Program E2E Test Infrastructure (Wave 1)
- [x] 13-MINI-E2E-SUMMARY.md — Mini Program E2E Summary ✅ (completed 2026-05-20)
- [x] 13-UI-PERF-PLAN.md — UI/Performance Optimization and Bug Fixes (Wave 2)
- [x] 13-UI-PERF-SUMMARY.md — UI/Performance Summary ✅ (completed 2026-05-20)

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1 | v1.0 | 2/2 | Complete | 2026-05-08 |
| 2 | v1.0 | 4/4 | Complete | 2026-05-08 |
| 3 | v1.0 | 4/4 | Complete | 2026-05-08 |
| 4 | v1.0 | 2/2 | Complete | 2026-05-08 |
| 5 | v1.2 | 3/3 | Complete | 2026-05-08 |
| 6 | v1.2 | 2/2 | Complete | 2026-05-08 |
| 7 | v1.2 | 3/3 | Complete | 2026-05-08 |
| 8 | v2.0 | 4/4 | Complete | 2026-05-09 |
| 9 | v2.0 | 6/6 | Complete | 2026-05-09 |
| 10 | v2.0 | 5/5 | ✅ Complete | 2026-05-19 |
| 11 | v2.0 | 4/4 | ✅ Complete | 2026-05-19 |
| 12 | v2.0 | 5/5 | ✅ Complete | 2026-05-19 |
| 13 | v2.0 | 3/3 | ✅ Complete | 2026-05-20 |
| 14 | v2.0 | 1/5 | ✅ Complete | 2026-05-19 |
| 15 | v2.0 | 6/6 | ✅ Complete | 2026-05-19 |
| 16 | v2.0 | 0/0 | ✅ Complete | 2026-05-19 |
| 17 | v2.0 | 2/2 | ✅ Complete | 2026-05-19 |
| **Total** | | **134** | | |

## Phase 14: 前端工程合并

| Module | Requirements | Count |
|--------|--------------|-------|
| ADMIN-FRONTEND-01 前端迁移 | ADMIN-FRONTEND-01-01~05 | 5 |
| **Total** | | **5** |

**ADMIN-FRONTEND-01 前端迁移范围:**
- 01: 环境准备与文件复制
- 02: 路由配置
- 03: 代码适配与修复
- 04: 菜单权限与动态菜单集成
- 05: 功能测试

**Plans:**
- [ ] 14-FRONTEND-01-PLAN.md — 前端迁移计划

---

## Phase 15: 管理后台前端UAT测试

| Module | Requirements | Count |
|--------|--------------|-------|
| ADMIN-UAT-01 管理后台UAT | ADMIN-01~ADMIN-11 | 全部 |
| **Total** | | **待定** |

**ADMIN-UAT-01 管理后台测试范围:**
- 01: Dashboard 工作台页面测试
- 02: 商品管理页面测试
- 03: 订单管理页面测试
- 04: 分类管理页面测试
- 05: Banner管理页面测试
- 06: 优惠券管理页面测试
- 07: 库存管理页面测试
- 08: 会员管理页面测试

**Plans:**
- [x] 15-ADMIN-UAT-01-PLAN.md — 管理后台页面UAT计划 ✅ (完成于 2026-05-11)
- [x] 15-ADMIN-UAT-02-PLAN.md — 订单详情+发货功能修复 ✅ (完成于 2026-05-12)
- [x] 15-ADMIN-UAT-03-PLAN.md — 会员地址管理功能 ✅ (完成于 2026-05-12)
- [x] 15-ADMIN-UAT-04-PLAN.md — 库存搜索修复(skuCode+SQL注入) ✅ (完成于 2026-05-12)
- [x] 15-ADMIN-UAT-05-PLAN.md — 库存列表添加商品名称列 ✅ (完成于 2026-05-12)
- [x] 15-ADMIN-UAT-06-PLAN.md — 库存录入接口 ✅ (完成于 2026-05-12)

---

*Roadmap updated: 2026-05-12 — Phase 15 gap closure plans 04/05/06 added (库存管理)*

---

## Phase 16: 订单列表优化

---

## Phase 17: 小程序增强（物流/支付/收货地址）

| Module | Requirements | Count |
|--------|--------------|-------|
| MINI-LOGISTICS 物流查询 | 微信物流实时查询 | TBD |
| MINI-PAY 支付接口 | wx.login + wx.requestPayment 集成 | TBD |
| MINI-ORDERS 小程序订单 | 已付款订单列表 + 订单明细 | TBD |
| MINI-ADDRESS 微信收货地址 | wx.chooseAddress 同步 | TBD |
| **Total** | | **TBD** |

**Plans:**
- [ ] 17-MINI-ORDER-PLAN.md — 订单明细修复 + 物流查询
- [ ] 17-MINI-PAY-ADDRESS-PLAN.md — 支付接口完善 + 微信收货地址

*Phase 17 added: 2026-05-19 — 小程序增强功能*