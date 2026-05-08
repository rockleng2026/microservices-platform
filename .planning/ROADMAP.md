# Roadmap: Mall-Center 在线商城系统

**v1.0 MVP** — SHIPPED 2026-05-08
📋 Archive: `.planning/milestones/v1.0-ROADMAP.md`
📋 Requirements: `.planning/milestones/v1.0-REQUIREMENTS.md`

---

## v1.0 MVP Summary

| Phase | Name | Plans | Status |
|-------|------|-------|--------|
| 1 | 基础架构搭建 | 2/2 | ✅ |
| 2 | 后台管理-商品与系统 | 4/4 | ✅ |
| 3 | 订单与支付核心 | 4/4 | ✅ |
| 4 | 用户侧评价与交互 | 2/2 | ✅ |

**Total:** 4 phases, 12 plans, 39 requirements — All complete ✓

## Phase 5: 修复编译与退款营销 ✅

| Phase | Name | Plans | Status |
|-------|------|-------|--------|
| 5 | 修复编译与退款营销 | 3/3 | ✅ |

**Phase 5 Summary:**
- 05-01: Result.succeed() 泛型修复 ✅
- 05-02: 退款模块（REFUND-01~10）✅
- 05-03: 营销模块（MARKETING-01~09）✅

## Phase 6: 订单增强与管理端完善 ✅ Complete

**Goal:** 订单流程完善（管理员关单/改价/备注）+ 管理端数据看板

**Requirements:**
- ORDER-EXT-01: 管理员可关闭/取消订单（已发货订单强制关闭）
- ORDER-EXT-02: 管理员可修改订单金额（优惠折让，不能高于原价）
- ORDER-EXT-03: 用户和管理员可给订单添加备注
- STAT-01: 销售趋势统计（日/周/月维度）
- STAT-02: 库存预警统计（低于阈值的SKU）
- STAT-03: 用户分析（新增用户、活跃度）

**Mode:** standard

**Plans:** 06-01（订单增强）, 06-02（数据看板）

**Commits:**
- `b74b5f699` - feat(6-01): add order extension features
- `5e769995c` - feat(6-02): implement admin dashboard statistics APIs

## Phase 7: 扩展功能 ✅ Complete

**Goal:** Redis Lua原子化库存 + 平台自营+商户模式 + 微信模板消息

**Requirements:**
- ~~ADVANCED-01: 商品搜索接入Elasticsearch提升体验~~ ❌ 已移除（增加系统复杂度和部署难度）
- ADVANCED-02: Redis Lua脚本进一步提升库存扣减并发性能
- ADVANCED-03: 多租户商户入驻（运营层面支持切换租户）
- ADVANCED-04: 模板消息通知（微信消息通知用户）

**Mode:** standard

**Plans:** 07-01, 07-02, 07-03

**Commits:**
- `b99624d52` - fix(7-01): use Spring Data Redis scripting instead of broken Redisson API
- `f3fde06c2` - feat(7-02): add MallMerchant entity and mapper for multi-tenant merchant platform
- `ad6b9b2a0` - feat(7-02): add MerchantServiceImpl and AdminMerchantController for merchant review
- `ce45acaeb` - feat(7-03): add openid field to MallOrder for WeChat template messages
- `223abdfd3` - feat(7-03): create WeChatTemplateMsgUtil for sending template messages
- `7c19fdb22` - feat(7-03): integrate WeChatTemplateMsgUtil into PayServiceImpl and OrderServiceImpl

---
*Roadmap updated: 2026-05-08*
