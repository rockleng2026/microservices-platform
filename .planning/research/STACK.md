# Technology Stack Additions/Changes for v1.1

**Project:** mall-center v1.1
**Researched:** 2026-05-08
**Focus:** Compilation fix, refund module, marketing module

## Summary

v1.1 requires **minimal stack changes** — primarily code fixes and extensions to existing patterns. No new framework dependencies needed.

| Feature | Stack Change | Confidence |
|---------|--------------|------------|
| Compilation fix | Code-only fix (no deps) | HIGH |
| Refund module | Extend existing WeChatPayUtil, add certificate handling | MEDIUM |
| Marketing module | No new deps (custom rules engine, Redis caching) | MEDIUM |

---

## 1. Compilation Fix — Result.succeed() Generic Issue

### Problem

`Result.succeed()` with no arguments fails type inference when the return type is `Result<Void>`.

**Root cause:** The `Result.succeed()` method returns `Result<Void>` but Java generics cannot infer `Void` from `null` in `of(null, code, msg)`.

**Current Result class (line 33):**
```java
public static Result<Void> succeed() {
    return of(null, CodeEnum.SUCCESS.getCode(), "");  // T cannot be inferred from null
}
```

### Solution Options

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Add explicit `Result<Void>` cast: `Result.<Void>succeed()` | No code change to Result class | Requires widespread controller changes |
| B | Fix Result class: `succeed()` explicitly returns `Result<Void>` | Single-point fix | Minor Result class change |
| C | Add overloaded `succeed()` with no params that returns raw `Result` | Backward compatible | Breaks generic typing |

**Recommendation:** Option B — ensure the existing `Result<Void> succeed()` method is correctly typed. The method signature already says `Result<Void>` but the `of(null, ...)` call may confuse type inference. Change to:

```java
public static Result<Void> succeed() {
    Result<Void> result = new Result<>(null, CodeEnum.SUCCESS.getCode(), "");
    return result;
}
```

Or add a no-arg constructor approach:
```java
public static Result<Void> succeed() {
    return new Result<>(null, CodeEnum.SUCCESS.getCode(), "");
}
```

### Dependencies: **None** — code-only fix

---

## 2. Refund Module — WeChat Pay Refund API

### Current State

Existing payment uses WeChat Pay **API v2** (XML over HTTPS, MD5 signatures):
- `WeChatPayUtil.java` handles signature generation/verification
- `PayServiceImpl.java` calls `https://api.mch.weixin.qq.com/pay/unifiedorder`

### Refund API Requirements

**WeChat Pay Refund API v2:**
- Endpoint: `https://api.mch.weixin.qq.com/secapi/pay/refund`
- Method: POST with XML body and client certificate (PKCS12)
- **Requires SSL client certificate authentication** (differs from payment which uses MD5 signature only)

### New Dependencies Needed

| Dependency | Version | Purpose | Why |
|------------|---------|---------|-----|
| None (extend existing) | — | WeChat refund | Can extend WeChatPayUtil with refund-specific methods |

**Key consideration:** Refund API requires client certificate (`apiclient_cert.p12`). This must be:
1. Downloaded from WeChat Merchant Platform
2. Configured as a path in `application.yml`
3. Loaded as a `KeyStore` for SSL context

### Implementation Approach

Extend `WeChatPayUtil` with refund methods:

```java
// New methods in WeChatPayUtil
public static String buildRefundRequest(Map<String, String> params)
public static Map<String, String> parseRefundResponse(String xml)
public static boolean verifyRefundCallback(String xmlData, String apiKey)

// New method in PayServiceImpl or new RefundService
public RefundResult processRefund(Long orderId, BigDecimal refundAmount, String reason)
```

### Refund Workflow

1. User发起退款申请 → `mall_refund` table (new)
2. 管理员审核通过/拒绝
3. 调用微信退款API → `secapi/pay/refund`
4. 微信异步回调确认 → 更新订单状态 → 库存回增

### Database Changes

New table: `mall_refund`
```sql
CREATE TABLE `mall_refund` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `order_id` BIGINT NOT NULL,
    `order_no` VARCHAR(64) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `refund_amount` DECIMAL(10,2) NOT NULL,
    `refund_reason` VARCHAR(500),
    `status` TINYINT DEFAULT 1 COMMENT '1=申请中,2=审核通过,3=审核拒绝,4=退款中,5=已完成,6=失败',
    `admin_remark` VARCHAR(255),
    `transaction_id` VARCHAR(64) COMMENT '微信退款单号',
    `refund_time` DATETIME,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Order status addition: `status=6` for refunding, `status=7` for refunded

### Dependencies: **None** — extend existing `WeChatPayUtil` and `RestTemplate`

---

## 3. Marketing Module — Coupon, Promotion, Membership Points

### Current State

No marketing infrastructure exists. Tables: `mall_goods`, `mall_order`, `mall_cart`, etc. — but no coupons, promotions, or points.

### Required Components

| Component | Description | Complexity |
|-----------|-------------|------------|
| Coupon system | Create, distribute, redeem coupons | Medium |
| Promotion rules |满减 (threshold discount), percentage off | Medium |
| Membership points | Points earned/spent per order | Low-Medium |

### No New External Dependencies

| Category | Decision | Rationale |
|---------|----------|-----------|
| Rules engine | Custom implementation | Drools is overkill for simple threshold rules |
| Coupon validation | Redis caching via Redisson | Already in use via `zlt-redis-spring-boot-starter` |
| Points calculation | Application code | No library needed |

### Database Tables Required

#### Coupon Tables

```sql
-- 优惠券模板 (created by admin)
CREATE TABLE `mall_coupon` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `name` VARCHAR(128) NOT NULL,
    `type` TINYINT NOT NULL COMMENT '1=满减券,2=折扣券,3=直减券',
    `discount_value` DECIMAL(10,2) NOT NULL COMMENT '折扣值(金额或折扣率)',
    `min_order_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '最低订单金额',
    `max_discount_amount` DECIMAL(10,2) COMMENT '最大折扣金额(折扣券上限)',
    `total_count` INT NOT NULL COMMENT '发放总量',
    `remain_count` INT NOT NULL COMMENT '剩余数量',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '1=有效,0=禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户优惠券 (issued to users)
CREATE TABLE `mall_user_coupon` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `user_id` BIGINT NOT NULL,
    `coupon_id` BIGINT NOT NULL,
    `coupon_code` VARCHAR(64) NOT NULL UNIQUE,
    `status` TINYINT DEFAULT 1 COMMENT '1=未使用,2=已使用,3=已过期',
    `order_id` BIGINT COMMENT '使用的订单ID',
    `receive_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `use_time` DATETIME,
    `expire_time` DATETIME NOT NULL
);

-- 促销活动表 (promotion campaigns)
CREATE TABLE `mall_promotion` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `name` VARCHAR(128) NOT NULL,
    `type` TINYINT NOT NULL COMMENT '1=满减,2=折扣,3=买赠',
    `rule_json` TEXT NOT NULL COMMENT '规则JSON: {"threshold":100,"discount":10}',
    `goods_ids` TEXT COMMENT '适用商品ID列表(JSON),空=全部',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` TINYINT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 会员积分表
CREATE TABLE `mall_member_points` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `user_id` BIGINT NOT NULL UNIQUE,
    `total_points` INT DEFAULT 0 COMMENT '累计积分',
    `available_points` INT DEFAULT 0 COMMENT '可用积分',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 积分变动记录
CREATE TABLE `mall_points_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(32),
    `user_id` BIGINT NOT NULL,
    `points` INT NOT NULL COMMENT '正=获得,负=消耗',
    `type` VARCHAR(32) NOT NULL COMMENT 'ORDER=订单获得,REFUND=退款扣回,REDEEM=兑换',
    `order_id` BIGINT COMMENT '关联订单ID',
    `remark` VARCHAR(255),
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`)
);
```

### Service Architecture

```
IMarketingService (interface)
  ├── ICouponService      → CouponServiceImpl
  ├── IPromotionService   → PromotionServiceImpl  
  └── IMemberPointsService → MemberPointsServiceImpl
```

### Integration Points

1. **Order creation** → Check applicable promotions/coupons → Apply discount
2. **Order payment** → Award membership points
3. **Order refund** → Deduct points, return coupon if applicable

### Redis Caching (via existing Redisson)

| Data | Cache Key Pattern | TTL |
|------|------------------|-----|
| Available coupons for user | `coupon:user:{userId}:available` | 5 min |
| Active promotions | `promotion:active` | 1 min |
| User points balance | `points:user:{userId}` | 10 min |

### Dependencies: **None** — reuse existing:
- `zlt-redis-spring-boot-starter` (Redisson)
- `zlt-db-spring-boot-starter` (MyBatis Plus)
- `spring-boot-starter-web` (REST APIs)

---

## Full Dependency Summary

| Feature | New Dependency | Group/Artifact | Version |
|---------|---------------|-----------------|---------|
| Compilation fix | None | — | — |
| Refund | None | Extend existing WeChatPayUtil | — |
| Marketing | None | Custom implementation | — |

**Existing dependencies already cover all v1.1 needs.**

---

## Installation

No new dependencies required. All v1.1 features extend existing stack.

---

## Sources

- [wechatpay-java SDK](https://github.com/wechatpay-apiv3/wechatpay-java) (v0.2.17) — Reference for API v3 migration path
- Existing `WeChatPayUtil.java` — Current v2 implementation
- Existing `zlt-redis-spring-boot-starter` — Redisson usage pattern
- Project constraint: Spring Boot 3.1.6 + Spring Cloud Alibaba + MyBatis Plus 3.5.4.1