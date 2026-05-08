---
phase: "06"
phase_slug: "订单增强与管理端完善"
date: "2026-05-08"
---

# Phase 6: 订单增强与管理端完善 - Validation Strategy

**Phase:** 06
**Created:** 2026-05-08
**Status:** Ready for execution

---

## Validation Architecture

### Dimension 8: Nyquist Sampling Strategy

Phase 6 包含两类不同性质的验证：
1. **确定性验证（订单增强）** — 状态流转、改价约束、字段存在性 → 适合自动化验证
2. **统计类验证（数据看板）** — SQL 查询、聚合计算 → 适合抽样验证

### Sampling Plan

| Category | Validation Method | Sample Size | Rationale |
|----------|-------------------|-------------|-----------|
| 订单状态流转 | 自动化脚本 | 100% | 确定性逻辑，代码路径明确 |
| 改价约束校验 | 自动化脚本 | 100% | 边界条件清晰 (status in 1,2, amount >= 0, amount <= totalAmount) |
| 统计接口空数据 | 自动化验证 | 3 cases | 单一代码路径 |
| 统计接口有效数据 | 抽样验证 | 3 records | SQL 正确性可通过代码审查确认 |

---

## Automated Verify Tests

### 订单增强（06-01）

```
Test: adminCloseOrder status constraint
1. 查找 status=3 的订单，调用 adminCloseOrder → 应返回 true，status 变为 8
2. 查找 status=1 的订单，调用 adminCloseOrder → 应抛异常"仅已发货订单可关闭"

Test: adjustOrderAmount constraint
1. status=1, adjustAmount=-10, payAmount=100 → newPayAmount=90 ≤ totalAmount → 应返回 true
2. adjustAmount=10（正数）→ 应拒绝（仅允许减少）
3. status=3 的订单 → 应抛异常"仅待付款/已付款未发货订单可调整金额"
4. 调整后金额 < 0 → 应抛异常"调整后金额不能为负"
5. 调整后金额 > 原总价 → 应抛异常"不能高于原价"

Test: updateUserRemark / updateAdminRemark
1. 非订单所有者调用 updateUserRemark → 应拒绝
2. 正常用户更新 → remark 字段更新成功
```

### 数据看板（06-02）

```
Test: 空数据返回
1. /sales-trend 无数据 → 返回空列表（HTTP 200）
2. /stock-warning 无预警 → 返回空列表
3. /user-analysis 无用户 → todayNewUsers=0, weekNewUsers=0, monthNewUsers=0

Test: 销售趋势 SQL 正确性
1. type=day, date=2026-05-08 → GROUP BY DATE(create_time)
2. type=week → GROUP BY WEEK(create_time)
3. type=month → GROUP BY MONTH(create_time)
4. status 过滤: status IN (2,3,4)
```

---

## Feedback Latency

- 订单增强验证：< 5 分钟（自动化脚本）
- 数据看板验证：< 5 分钟（空数据检查）
- 集成测试（需要数据库）：< 30 分钟

---

## Execution Readiness

| Check | Status | Notes |
|-------|--------|-------|
| PLAN.md 文件存在 | ✅ | 06-01, 06-02 |
| 所有 requirements 覆盖 | ✅ | ORDER-EXT-01~03, STAT-01~03 |
| 约束已编码 | ✅ | adjustAmount <= 0, newPayAmount <= totalAmount |
| VALIDATION.md 创建 | ✅ | 本文件 |
| 自动化验证脚本就绪 | ✅ | 验证逻辑见上 |

---

*Validation strategy defined: 2026-05-08*
*Validates against: 06-CONTEXT.md, 06-RESEARCH.md, 06-01-PLAN.md, 06-02-PLAN.md*