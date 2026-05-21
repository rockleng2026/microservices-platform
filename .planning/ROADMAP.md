# Roadmap: Mall-Center 在线商城系统

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-05-08)
- ✅ **v1.2** — Phases 5-7 (shipped 2026-05-08)
- ✅ **v2.0** — Phases 8-17 (SHIPPED 2026-05-20)
- ✅ **v2.1** — Phases 18-20 (SHIPPED 2026-05-21)

---

## Phase Mapping

### Phase 14: 前端工程合并

| Module | Requirements | Count |
|--------|--------------|-------|
| ADMIN-FRONTEND-01 前端迁移 | ADMIN-FRONTEND-01-01~05 | 5 |
| **Total** | | **5** |

**Plans:**
- [x] 14-FRONTEND-01-PLAN.md — 前端迁移计划

### Phase 15: 管理后台前端UAT测试

**Plans:**
- [x] 15-ADMIN-UAT-01-PLAN.md — 管理后台页面UAT计划
- [x] 15-ADMIN-UAT-02-PLAN.md — 订单详情+发货功能修复
- [x] 15-ADMIN-UAT-03-PLAN.md — 会员地址管理功能
- [x] 15-ADMIN-UAT-04-PLAN.md — 库存搜索修复(skuCode+SQL注入)
- [x] 15-ADMIN-UAT-05-PLAN.md — 库存列表添加商品名称列
- [x] 15-ADMIN-UAT-06-PLAN.md — 库存录入接口

### Phase 16: 订单列表优化

### Phase 17: 小程序增强（物流/支付/收货地址）

### Phase 18: 接口文档 (HELP-01)

- [x] 18-01-PLAN.md — 菜单SQL + Umi路由 + ApiDoc骨架
- [x] 18-02-PLAN.md — Mermaid流程图集成

### Phase 19: 用户登录模块分析

- [x] 19-01-PLAN.md — 商城用户登录和用户信息模块分析

### Phase 20: FAQ页面 (HELP-03)

- [x] 20-01-PLAN.md — FAQ页面实现 (HELP-03-01~04)

## v2.1 里程碑详情

[见 .planning/milestones/v2.1-ROADMAP.md](./.planning/milestones/v2.1-ROADMAP.md)

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
| 10 | v2.0 | 5/5 | Complete | 2026-05-19 |
| 11 | v2.0 | 4/4 | Complete | 2026-05-19 |
| 12 | v2.0 | 5/5 | Complete | 2026-05-19 |
| 13 | v2.0 | 3/3 | Complete | 2026-05-20 |
| 14 | v2.0 | 1/5 | Complete | 2026-05-19 |
| 15 | v2.0 | 6/6 | Complete | 2026-05-19 |
| 16 | v2.0 | 0/0 | Complete | 2026-05-19 |
| 17 | v2.0 | 2/2 | Complete | 2026-05-19 |
| 18 | v2.1 | 2/2 | Complete | 2026-05-21 |
| 19 | v2.1 | 1/1 | Complete | 2026-05-21 |
| 20 | v2.1 | 1/1 | Complete | 2026-05-21 |
| **Total** | | **134** | | |

---

## Backlog

### 待完成

- HELP-02 菜单使用说明（Phase 19分析文档指出需要实现）
- Phase 17 物流查询增强（微信物流实时查询）
- Phase 17 支付接口完善（wx.login + wx.requestPayment）
- Phase 17 微信收货地址（wx.chooseAddress）

### 技术债务

- Token无签名/无过期时间 — 需要 zlt-uaa 改造
- mall_member 表缺少 address 相关字段 — 需要表结构变更

---

*Roadmap updated: 2026-05-21 — v2.1 shipped*
