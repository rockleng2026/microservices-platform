# Requirements: Mall-Center 在线商城系统 — v1.1

**Milestone:** v1.1
**Defined:** 2026-05-08
**Goal:** 修复编译问题 + 实现退款和营销模块

---

## Phase 5: 修复编译问题

- [ ] **COMPILE-01**: 修复 Result.succeed() 泛型问题，使项目可完整编译

---

## Phase 6: 退款模块

### 退款申请 (REFUND-01)
- [ ] **REFUND-01**: 用户可以发起退款申请（仅退款/退货退款）
- [ ] **REFUND-02**: 用户可以查看退款申请记录和状态
- [ ] **REFUND-03**: 用户可以取消退款申请（待审核状态）

### 退款审核 (REFUND-02)
- [ ] **REFUND-04**: 管理员可以查看所有退款申请（多条件筛选）
- [ ] **REFUND-05**: 管理员可以审核通过退款申请
- [ ] **REFUND-06**: 管理员可以审核拒绝退款申请

### 微信退款 (REFUND-03)
- [ ] **REFUND-07**: 系统调用微信支付退款API完成退款
- [ ] **REFUND-08**: 退款使用唯一 refund_no 实现幂等性

### 库存回增 (REFUND-04)
- [ ] **REFUND-09**: 退款完成后回增库存（operationType=5）
- [ ] **REFUND-10**: 退款状态机：待审核→审核通过→退款中→已完成/失败

---

## Phase 7: 营销模块

### 优惠券 (MARKETING-01)
- [ ] **MARKETING-01**: 管理员可以创建满减券模板（面额、门槛、有效期、数量）
- [ ] **MARKETING-02**: 管理员可以发布/下架优惠券
- [ ] **MARKETING-03**: 用户可以领取优惠券
- [ ] **MARKETING-04**: 下单时可以使用优惠券（与促销二选一）

### 促销 (MARKETING-02)
- [ ] **MARKETING-05**: 管理员可以创建满减促销活动（时段规则）
- [ ] **MARKETING-06**: 促销与优惠券互斥，同一订单只能使用一种

### 会员积分 (MARKETING-03)
- [ ] **MARKETING-07**: 订单完成后增加积分（基于支付金额）
- [ ] **MARKETING-08**: 用户可以查看积分余额和积分记录
- [ ] **MARKETING-09**: 退款时扣减已获得积分

---

## Phase 6: 订单增强与管理端完善

### 订单流程增强 (ORDER-EXT)
- [ ] **ORDER-EXT-01**: 管理员可关闭/取消订单（已发货订单强制关闭）
- [ ] **ORDER-EXT-02**: 管理员可修改订单金额（优惠折让/运费调整）
- [ ] **ORDER-EXT-03**: 用户和管理员可给订单添加/查看备注

### 统计看板 (STAT)
- [ ] **STAT-01**: 销售趋势统计（日/周/月维度）
- [ ] **STAT-02**: 库存预警统计（低于阈值的SKU）
- [ ] **STAT-03**: 用户分析（新增用户、活跃度）

---

## v2 Requirements (Deferred)

### 退款扩展
- 折扣券/代金券
- 部分退款（按商品项退款）
- 自动化退款审批（小额走自动）

### 营销扩展
- 限时秒杀（Redis原子扣减库存）
- 团购活动
- 会员等级与权益
- 积分抵现

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| 自动化退款审批 | 欺诈风险，一期人工审核 |
| 优惠券叠加 | 利润侵蚀，一期单一优惠 |
| 限时秒杀无Redis | 可用性问题，一期先做优惠券 |
| 积分兑换商品 | 复杂度高，二期再做 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMPILE-01 | Phase 5 | ✅ Complete |
| REFUND-01~03 | Phase 5 | ✅ Complete |
| REFUND-04~10 | Phase 5 | ✅ Complete |
| MARKETING-01~04 | Phase 5 | ✅ Complete |
| MARKETING-05~06 | Phase 5 | ✅ Complete |
| MARKETING-07~09 | Phase 5 | ✅ Complete |
| ORDER-EXT-01~03 | Phase 6 | Pending |
| STAT-01~03 | Phase 6 | ✅ Complete |

**Coverage:**
- v1.1 requirements: 20 total (COMPILE-01 + REFUND-01~10 + MARKETING-01~09)
- v1.2 requirements: 6 total (ORDER-EXT-01~03 + STAT-01~03)

---
*Requirements defined: 2026-05-08*
*Last updated: 2026-05-08 for v1.1 milestone*