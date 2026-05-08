# v1.1 Research Summary — Refund & Marketing Modules

**Project:** mall-center v1.1
**Synthesized:** 2026-05-08
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## 1. Executive Summary

v1.1 adds three capabilities to the existing mall system (orders, WeChat Pay JSAPI, reviews, logistics, Redis stock):

| Feature | Scope | Stack Impact | Confidence |
|---------|-------|--------------|------------|
| Compilation fix | Result.succeed() generic | Code-only | HIGH |
| Refund module | User apply / Admin review / WeChat API / Stock restore | Extend existing WeChatPayUtil | MEDIUM-HIGH |
| Marketing module | Coupon, promotion, membership points | Custom rules engine + Redis caching | MEDIUM |

**No new external dependencies are required.** All v1.1 features extend existing patterns and existing stack (Spring Boot 3.1.6, Spring Cloud Alibaba, MyBatis Plus 3.5.4.1, Redisson via zlt-redis-spring-boot-starter).

---

## 2. Compilation Fix

### Problem
`Result.succeed()` with no arguments fails type inference when the return type is `Result<Void>` because Java generics cannot infer `Void` from `null`.

### Recommended Fix
Ensure the existing `Result<Void> succeed()` method is correctly typed by avoiding the ambiguous `of(null, ...)` call:

```java
public static Result<Void> succeed() {
    Result<Void> result = new Result<>(null, CodeEnum.SUCCESS.getCode(), "");
    return result;
}
```

### Risk
Fixing Result generics is low-risk but must maintain backward compatibility with existing call sites. See Pitfall 7 (PITFALLS.md).

---

## 3. Refund Module

### 3.1 Business Flow

```
User applies for refund
        │
Admin reviews (approve / reject)
        │ approve
        ▼
Call WeChat Pay Refund API (POST https://api.mch.weixin.qq.com/v3/refund/domestic/refunds)
        │
WeChat processes (async, 1-3 business days)
        │
On SUCCESS: restore stock to Redis/MySQL
On ABNORMAL: log for manual investigation
```

Refund allowed from order status: **2 (paid), 3 (shipped), 4 (completed)**
Refund NOT allowed from: 1 (pending pay — user cancels instead), 5 (already cancelled)

### 3.2 Refund Status Machine

```
PENDING_AUDIT ─┬─ approve ──► AUDIT_PASSED ──► REFUNDING ──┬─ success ──► REFUND_SUCCESS
              │                  │                         │
              └─ reject ──► AUDIT_REJECTED               └─ fail ──► REFUND_FAILED
              │
              └─ cancel ──► CANCELLED
```

### 3.3 New Database Tables

**mall_refund** — Main refund request record
```sql
CREATE TABLE `mall_refund` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `order_id` BIGINT NOT NULL,
    `order_no` VARCHAR(64) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `refund_no` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Idempotency key',
    `refund_type` TINYINT DEFAULT 1 COMMENT '1=仅退款, 2=退货退款',
    `refund_amount` DECIMAL(10,2) NOT NULL,
    `reason` VARCHAR(500),
    `evidence_images` TEXT,
    `status` TINYINT DEFAULT 1 COMMENT '1=待审核,2=审核通过,3=审核拒绝,4=退款中,5=已完成,6=已关闭',
    `admin_id` BIGINT,
    `admin_remark` VARCHAR(255),
    `wechat_refund_no` VARCHAR(64),
    `refund_time` DATETIME,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
);
```

**mall_refund_item** — Per-item refund明细
```sql
CREATE TABLE `mall_refund_item` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `refund_id` BIGINT NOT NULL,
    `order_item_id` BIGINT NOT NULL,
    `sku_id` BIGINT NOT NULL,
    `goods_id` BIGINT NOT NULL,
    `quantity` INT NOT NULL,
    `refund_amount` DECIMAL(10,2) NOT NULL,
    KEY `idx_refund_id` (`refund_id`)
);
```

MallOrder: add `status=6` (退款中), `status=7` (已退款).

### 3.4 Integration Points

| Point | How |
|-------|-----|
| Order status | Extend MallOrder status to 6, 7 |
| Stock restoration | New `restoreStockOnRefund(Long orderId)` in IStockService |
| WeChat Pay | New `processRefund(Long orderId, BigDecimal amount)` in IPayService |
| Stock log | Add operationType=5 (refund restore) in MallStockLog |

### 3.5 API Endpoints

**User:** `POST /refund` (apply), `GET /refund/list`, `GET /refund/{id}`
**Admin:** `GET /admin/refund/list`, `POST /admin/refund/{id}/approve`, `POST /admin/refund/{id}/reject`

---

## 4. Marketing Module

### 4.1 MVP Scope for v1.1

Per FEATURES.md analysis, **v1.1 should scope marketing narrowly**:

| Feature | v1.1 | Defer to v1.2 |
|---------|------|---------------|
| Refund module | HIGH — implement | — |
| 满减券 (满减 coupon) | MEDIUM-HIGH — implement | — |
| Points system (earn + log) | MEDIUM — implement | — |
| 折扣券 / 代金券 | — | v1.2 |
| Flash sale / Group buy | — | v1.2 |
| Points redemption | — | v1.2 |
| Membership levels with benefits | — | v1.2 |

### 4.2 New Database Tables

**mall_coupon_template** — Admin-created coupon definitions
```sql
CREATE TABLE `mall_coupon_template` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `name` VARCHAR(64) NOT NULL,
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '1=满减券,2=折扣券,3=无门槛券',
    `face_value` DECIMAL(10,2),
    `discount_rate` DECIMAL(5,2) COMMENT 'e.g., 0.85=85折',
    `min_amount` DECIMAL(10,2) DEFAULT 0,
    `max_discount` DECIMAL(10,2),
    `total_count` INT NOT NULL,
    `remain_count` INT NOT NULL,
    `per_user_limit` INT DEFAULT 1,
    `valid_type` TINYINT DEFAULT 1 COMMENT '1=固定日期,2=领取后N天',
    `start_time` DATETIME,
    `end_time` DATETIME,
    `valid_days` INT,
    `status` TINYINT DEFAULT 1 COMMENT '0=未发布,1=已发布,2=已下架',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**mall_coupon** — User-issued coupons
```sql
CREATE TABLE `mall_coupon` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `user_id` BIGINT NOT NULL,
    `template_id` BIGINT NOT NULL,
    `coupon_no` VARCHAR(32) NOT NULL UNIQUE,
    `name` VARCHAR(64) NOT NULL,
    `type` TINYINT NOT NULL,
    `face_value` DECIMAL(10,2),
    `discount_rate` DECIMAL(5,2),
    `min_amount` DECIMAL(10,2),
    `max_discount` DECIMAL(10,2),
    `order_id` BIGINT COMMENT 'used by order',
    `status` TINYINT DEFAULT 1 COMMENT '1=未使用,2=已使用,3=已过期',
    `receive_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `use_time` DATETIME,
    `expire_time` DATETIME NOT NULL,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_template_id` (`template_id`)
);
```

**mall_marketing_activity** — Promotion campaigns
```sql
CREATE TABLE `mall_marketing_activity` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `name` VARCHAR(128) NOT NULL,
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '1=满减,2=折扣,3=买赠',
    `rule_json` TEXT COMMENT '{"minAmount":100,"discountAmount":10}',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` TINYINT DEFAULT 1,
    `priority` INT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**mall_points_account** + **mall_points_log** — Membership points
```sql
CREATE TABLE `mall_points_account` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `user_id` BIGINT NOT NULL UNIQUE,
    `balance` INT DEFAULT 0,
    `total_earned` INT DEFAULT 0,
    `total_spent` INT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `mall_points_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `user_id` BIGINT NOT NULL,
    `type` TINYINT NOT NULL COMMENT '1=获得,2=消耗',
    `points` INT NOT NULL,
    `balance_after` INT NOT NULL,
    `source` VARCHAR(32) NOT NULL COMMENT 'ORDER,REFUND,REDEEM',
    `source_id` VARCHAR(64),
    `remark` VARCHAR(255),
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`)
);
```

MallOrder ALTER: add `discount_amount` DECIMAL(10,2) and `coupon_id` BIGINT.

### 4.3 Discount Calculation Order at Order Creation

1. **Promotions** (flash sale, group buy) — price already reduced
2. **Member discount** — based on level
3. **Coupon** — final discount applied
4. **Points redemption** — deduct from final amount

Marketing validation must happen **BEFORE stock pre-allocation**.

### 4.4 Redis Caching (via existing Redisson)

| Data | Key Pattern | TTL |
|------|-------------|-----|
| Available coupons for user | `coupon:user:{userId}:available` | 5 min |
| Active promotions | `promotion:active` | 1 min |
| User points balance | `points:user:{userId}` | 10 min |

### 4.5 Marketing API Summary

**Coupon (User):** `GET /coupon/list`, `GET /coupon/available`, `POST /coupon/{id}/claim`, `POST /order/apply-coupon`
**Coupon (Admin):** `POST /admin/coupon`, `PUT /admin/coupon/{id}`, `POST /admin/coupon/{id}/distribute`
**Member (User):** `GET /member/info`, `GET /member/points/log`
**Member (Admin):** `PUT /admin/member/{id}/points`

---

## 5. Critical Pitfalls Summary

### 5.1 Double Refund (CRITICAL)
No idempotency key on refund requests causes duplicate processing. **Prevention:** unique constraint on `refund_no`, check `hasSuccessfulRefund(orderId)` before calling WeChat, distributed lock.

### 5.2 Refund State Machine Violations (CRITICAL)
Direct status field updates bypass validation. **Prevention:** define explicit `RefundState` enum with `canTransition(from, to)` guard on all state changes.

### 5.3 Stock Restoration Timing (CRITICAL)
Stock restored before WeChat confirms refund success. **Prevention:** restore stock ONLY in WeChat refund success callback webhook, not on refund request.

### 5.4 Coupon Race Condition — Double Redemption (CRITICAL)
Check-then-act on coupon usage count is not atomic. **Prevention:** atomic SQL update: `UPDATE coupon SET used_count = used_count + 1 WHERE code = #{code} AND used_count < total_count AND status = 'ACTIVE'`.

### 5.5 Coupon Stacking Exploits (MODERATE)
Multiple discounts stack destructively. **Prevention:** define mutually exclusive coupon groups, implement "best discount" selection (one coupon per group per order).

### 5.6 Coupon Expiration Edge Cases (MODERATE)
Midnight timezone issues allow expired coupons to be used. **Prevention:** use timestamp comparisons with timezone, auto-expire Redis cache entries daily, cron job as backup.

### 5.7 Result.succeed() Fix Breaking Existing Code (MINOR)
Generic type inference fix may break existing call sites. **Prevention:** maintain backward-compatible overloaded method, migrate call sites gradually.

### 5.8 Refund Amount Precision Loss (MINOR)
Using double/float for monetary calculations. **Prevention:** always use `BigDecimal` with explicit scale and `RoundingMode`.

---

## 6. Build Order Recommendation

### Phase 1: Compilation Fix
- Fix Result.succeed() in Result.java
- Verify all call sites compile

### Phase 2: Refund Module
1. Add mall_refund, mall_refund_item tables
2. Create MallRefund, MallRefundItem entities + mappers
3. Implement IRefundService (apply, list, detail, cancel + admin process)
4. Add `restoreStockOnRefund()` to IStockService
5. Add `processRefund()` to IPayService (WeChat refund API call)
6. Add RefundController (user + admin endpoints)
7. Integration test with existing order flow

### Phase 3: Marketing Module
1. Add mall_coupon_template, mall_coupon, mall_marketing_activity, mall_points_account, mall_points_log tables
2. ALTER mall_order add discount_amount, coupon_id
3. Create entities and mappers
4. Implement IMarketingService (coupon validation, activity discount, member discount)
5. Integrate into OrderService.createOrder() BEFORE stock pre-allocation
6. Add CouponController, MemberController
7. Test: valid coupon → discount applied, coupon marked used; invalid coupon → rejected

---

## 7. Anti-Features to Avoid

| Anti-Feature | Why | Alternative |
|-------------|-----|-------------|
| Automated refund approval | Fraud risk | Manual review for all |
| Coupon stacking | Margin destruction | One coupon per order |
| Flash sale without Redis | Scalability failure | Redis atomic DECR for flash stock |
| Points earning on discounted orders | Point inflation | Points based on original price |
| Stock restore without MallStockLog | Breaks inventory audit | Always log operationType=5 |

---

## 8. File Structure for New Code

```
zlt-business/mall-center/src/main/java/com/central/mall/
├── model/
│   ├── entity/
│   │   ├── MallRefund.java
│   │   ├── MallRefundItem.java
│   │   ├── MallCouponTemplate.java
│   │   ├── MallCoupon.java
│   │   ├── MallMarketingActivity.java
│   │   ├── MallPointsAccount.java
│   │   └── MallPointsLog.java
│   └── dto/
│       ├── RefundApplyDTO.java
│       ├── RefundProcessDTO.java
│       ├── CouponValidateDTO.java
│       └── DiscountResultDTO.java
├── mapper/
│   ├── MallRefundMapper.java
│   ├── MallRefundItemMapper.java
│   ├── MallCouponTemplateMapper.java
│   ├── MallCouponMapper.java
│   ├── MallMarketingActivityMapper.java
│   ├── MallPointsAccountMapper.java
│   └── MallPointsLogMapper.java
├── service/
│   ├── IRefundService.java
│   ├── impl/RefundServiceImpl.java
│   ├── IMarketingService.java
│   └── impl/MarketingServiceImpl.java
└── controller/
    ├── RefundController.java
    ├── CouponController.java
    └── MemberController.java
```

---

## 9. Confidence and Validation

| Area | Confidence | Validation Needed |
|------|-----------|-----------------|
| Compilation fix | HIGH | Verify Result.java method signature |
| Refund status machine | MEDIUM-HIGH | Review with business requirements |
| WeChat refund API integration | MEDIUM | Verify against official WeChat Pay v3 docs |
| Stock restoration logic | MEDIUM | Confirm reserved vs real stock logic with business |
| Coupon mutual exclusion rules | MEDIUM | Validate with marketing team |
| Points-to-currency rate | LOW | Confirm with business (typically 100:1) |
