# Feature Landscape: Refund and Marketing Module

**Domain:** E-commerce (B2C Online Mall)
**Project:** mall-center v1.1
**Researched:** 2026-05-08
**Confidence:** MEDIUM-HIGH (based on existing project requirements + WeChat Pay API documentation)

---

## Executive Summary

The v1.1 milestone adds **refund** and **marketing** capabilities to an existing mall system that already handles orders, payment (WeChat Pay JSAPI), reviews, logistics, and inventory management (Redis预占+真实扣减).

**Refund System** is straightforward: user initiates → admin reviews → WeChat refund API called → stock restored. WeChat Pay v3 API natively supports refunds with idempotency via `out_refund_no`.

**Marketing System** requires four sub-systems: coupons (满减/折扣), promotions (秒杀/团购/限时折扣), and membership (积分/等级/权益). These are independent but often overlap at order calculation time.

---

## 1. Refund Flow

### 1.1 Business Flow

```
User applies for refund
        │
        ▼
Admin sees refund request in backend
        │
   ┌────┴────┐
   │ Approve │ or │ Reject │
   └────┬────┘
        │ approve
        ▼
Call WeChat Pay Refund API
(v3/domestic/refunds)
        │
        ▼
WeChat processes refund
(1-3 business days typically)
        │
        ▼
On success: restore stock to Redis/MySQL
```

### 1.2 Database Tables Required

```sql
-- Refund request table
CREATE TABLE `mall_refund` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `order_id` bigint NOT NULL COMMENT 'Original order ID',
    `order_no` varchar(32) NOT NULL COMMENT 'Original order No',
    `user_id` bigint NOT NULL,
    `refund_no` varchar(64) NOT NULL COMMENT 'Unique refund order No',
    `refund_amount` decimal(10,2) NOT NULL COMMENT 'Refund amount',
    `refund_type` tinyint NOT NULL DEFAULT 1 COMMENT '1仅退款,2退货退款',
    `reason` varchar(500) COMMENT 'User refund reason',
    `images` text COMMENT 'Proof images JSON',
    `status` tinyint NOT NULL DEFAULT 0 COMMENT '0待审核,1审核通过,2审核拒绝,3退款中,4已完成,5已关闭',
    `admin_id` bigint COMMENT 'Review admin ID',
    `admin_remark` varchar(255) COMMENT 'Admin review remark',
    `wechat_refund_id` varchar(64) COMMENT 'WeChat refund ID',
    `wechat_refund_status` varchar(32) COMMENT 'WeChat refund status',
    `refund_time` datetime COMMENT 'Refund completion time',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refund_no` (`refund_no`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款申请表';
```

### 1.3 WeChat Pay Refund API Integration

**API Endpoint:** `POST https://api.mch.weixin.qq.com/v3/refund/domestic/refunds`

**Key Request Parameters:**
| Field | Required | Description |
|-------|----------|-------------|
| `out_refund_no` | Yes | Merchant's unique refund order No (use UUID or business-prefixed timestamp) |
| `amount.refund` | Yes | Refund amount in cents/yuan |
| `amount.total` | Yes | Original transaction total |
| `amount.currency` | Yes | Always "CNY" |
| `transaction_id` | No | WeChat transaction ID (prefer over out_trade_no) |
| `out_trade_no` | No | Merchant order No |
| `reason` | No | Refund reason (max 80 chars displayed to user) |
| `notify_url` | No | Callback URL for refund status |
| `goods_detail` | No | Specific items to refund (for partial refund) |

**Response Statuses:** `SUCCESS` | `CLOSED` | `PROCESSING` | `ABNORMAL`

**Critical Implementation Notes:**
1. **Idempotency**: Use same `out_refund_no` for retries - WeChat prevents duplicate refunds
2. **Async nature**: Success response only means acceptance, not completion. Poll or use callback for final status
3. **Rate limits**: 150 QPS for success path, 6 QPS for failures (older orders)
4. **Partial refunds**: Support up to 50 partial refunds per original transaction
5. **Stock restoration**: Only restore stock after WeChat confirms refund success

### 1.4 API Endpoints

**User-facing (Mini Program):**
| Method | Path | Description |
|--------|------|-------------|
| POST | /refund | User applies for refund |
| GET | /refund/list | User's refund records |
| GET | /refund/{id} | Refund detail |

**Admin:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/refund/list | All refund requests |
| GET | /admin/refund/{id} | Refund detail |
| POST | /admin/refund/{id}/approve | Approve refund |
| POST | /admin/refund/{id}/reject | Reject refund |

### 1.5 Refund Status Machine

```
0 待审核 ──┬── approve ──► 1 审核通过 ──► 3 退款中 ──► 4 已完成
           │
           └── reject ──► 2 审核拒绝 ──► (end)

3 退款中 ──┬── success ──► 4 已完成
           │
           └── fail/abnormal ──► 5 已关闭
```

### 1.6 Stock Restoration Logic

Stock restoration must happen **only after WeChat confirms success**:

```java
// Pseudocode
if (wechatRefundCallback.status == "SUCCESS") {
    // Restore stock to Redis
    redisStockService.incrementStock(skuId, quantity);
    // Mark refund as completed
    refundService.completeRefund(refundId);
} else if (wechatRefundCallback.status == "ABNORMAL") {
    // Log for manual investigation, do NOT restore stock
    refundService.markAbnormal(refundId);
}
```

---

## 2. Coupon System

### 2.1 Coupon Types

| Type | Chinese | Description | Example |
|------|---------|-------------|---------|
| `MANJIAN` | 满减券 | Spend X, get Y off | 满100减20 |
| `ZHEKOU` | 折扣券 | X% off | 8折券 (20% off) |
| `DAIJIN` | 代金券 | Fixed amount credit | 50元代金券 |

### 2.2 Coupon Rules (Conditions)

```sql
-- Coupon template (created by admin)
CREATE TABLE `mall_coupon` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `name` varchar(64) NOT NULL COMMENT 'Coupon name',
    `type` tinyint NOT NULL COMMENT '1满减,2折扣,3代金',
    `face_value` decimal(10,2) COMMENT 'Face value (for 满减/代金)',
    `discount_rate` decimal(5,2) COMMENT 'Discount rate (for 折扣, e.g., 0.8=80%)',
    `min_amount` decimal(10,2) COMMENT 'Minimum spend to use',
    `max_discount` decimal(10,2) COMMENT 'Maximum discount cap (for 折扣)',
    `total_count` int NOT NULL COMMENT 'Total coupons to distribute',
    `remain_count` int NOT NULL COMMENT 'Remaining count',
    `per_user_limit` int DEFAULT 1 COMMENT 'Max per user',
    `valid_start` datetime NOT NULL,
    `valid_end` datetime NOT NULL,
    `status` tinyint DEFAULT 1 COMMENT '1启用,0禁用',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- User's coupon (distributed to user)
CREATE TABLE `mall_coupon_user` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `coupon_id` bigint NOT NULL,
    `user_id` bigint NOT NULL,
    `coupon_code` varchar(64) NOT NULL COMMENT 'Unique code for user',
    `status` tinyint DEFAULT 0 COMMENT '0未使用,1已使用,2已过期',
    `receive_time` datetime DEFAULT CURRENT_TIMESTAMP,
    `use_time` datetime COMMENT 'When coupon was used',
    `order_id` bigint COMMENT 'Order ID when used',
    `expire_time` datetime NOT NULL COMMENT 'Coupon expiry time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_coupon_code` (`coupon_code`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';
```

### 2.3 Coupon Distribution Methods

| Method | Description | Implementation |
|--------|-------------|----------------|
| **User claims** | User manually claims from coupon center | Admin publishes coupon, user clicks "claim" |
| **Order reward** | Auto-issue after order completion | Cron job or event-driven after payment |
| **Level reward** | Issue when user reaches membership level | Triggered by level upgrade |
| **Activity reward** | Issue during promotional events | Admin batch distributes |
| **Manual issue** | Admin manually issues to users | Backend bulk operation |

### 2.4 Coupon Usage Flow at Order Creation

```
Order creation request
        │
        ▼
Check if user has applicable coupon(s)
        │
   ┌────┴────┐
   │ Coupons │ no coupons ──► Calculate order without discount
   │ found   │
   └────┬────┘
        │
        ▼
Validate coupon:
  - Not expired?
  - Min amount met?
  - Still within per-user limit?
  - Coupon still active?
        │
   ┌────┴────┐
   │ Valid   │ invalid ──► Return validation error
   └────┬────┘
        │
        ▼
Calculate discount:
  - 满减: min(orderAmount, faceValue)
  - 折扣: min(orderAmount * (1-discountRate), maxDiscount)
  - 代金: min(orderAmount, faceValue)
        │
        ▼
Lock coupon to order (status=1)
        │
        ▼
Return order with discount_amount
```

### 2.5 Coupon APIs

**User:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /coupon/list | User's coupons (filter by status) |
| GET | /coupon/available | Available coupons for an order |
| POST | /coupon/{id}/claim | Claim a published coupon |
| POST | /order/apply-coupon | Apply coupon to order (at checkout) |

**Admin:**
| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/coupon | Create coupon |
| PUT | /admin/coupon/{id} | Edit coupon |
| PUT | /admin/coupon/{id}/status | Enable/disable |
| GET | /admin/coupon/list | All coupons |
| POST | /admin/coupon/{id}/distribute | Distribute to users |
| GET | /admin/coupon/{id}/usage | Usage statistics |

---

## 3. Promotion Activities

### 3.1 Promotion Types

| Type | Chinese | Description | Time-sensitive |
|------|---------|-------------|---------------|
| `FLASH_SALE` | 秒杀 | Limited quantity, limited time | Yes |
| `GROUP_BUY` | 团购 | N users required to unlock price | No (ends when quota filled) |
| `LIMITED_DISCOUNT` | 限时折扣 | Discount for duration | Yes |

### 3.2 Flash Sale (秒杀) Design

```sql
-- Flash sale activity
CREATE TABLE `mall_flash_sale` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `name` varchar(128) NOT NULL COMMENT 'Activity name',
    `start_time` datetime NOT NULL,
    `end_time` datetime NOT NULL,
    `status` tinyint DEFAULT 0 COMMENT '0未开始,1进行中,2已结束',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀活动表';

-- Flash sale items (which SKUs, price, quantity)
CREATE TABLE `mall_flash_sale_goods` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `flash_sale_id` bigint NOT NULL,
    `goods_id` bigint NOT NULL,
    `sku_id` bigint NOT NULL,
    `flash_price` decimal(10,2) NOT NULL COMMENT 'Flash sale price',
    `flash_stock` int NOT NULL COMMENT 'Flash sale stock (separate from normal)',
    `sold_count` int DEFAULT 0 COMMENT 'Already sold',
    `per_user_limit` int DEFAULT 1 COMMENT 'Max per user',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_flash_sale_id` (`flash_sale_id`),
    KEY `idx_sku_id` (`sku_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀商品表';
```

**Key Design Points:**
1. **Separate stock**: Flash sale uses independent `flash_stock`, does NOT affect normal inventory until purchase
2. **Stock preemption**: Use Redis atomic operations (DECR) for flash stock during order creation
3. **Per-user limit**: Track in Redis `flash_sale:{activityId}:{skuId}:{userId}` with count
4. **Anti-scalping**: Combine with rate limiting on order creation

### 3.3 Group Buy (团购) Design

```sql
-- Group buy activity
CREATE TABLE `mall_group_buy` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `name` varchar(128) NOT NULL,
    `goods_id` bigint NOT NULL,
    `sku_id` bigint NOT NULL,
    `group_price` decimal(10,2) NOT NULL COMMENT 'Price when group is filled',
    `original_price` decimal(10,2) NOT NULL COMMENT 'Original price',
    `required_count` int NOT NULL COMMENT 'Number of users needed',
    `valid_hours` int DEFAULT 24 COMMENT 'Hours group buy stays valid',
    `total_stock` int NOT NULL COMMENT 'Total group buy slots',
    `sold_count` int DEFAULT 0,
    `start_time` datetime NOT NULL,
    `end_time` datetime NOT NULL,
    `status` tinyint DEFAULT 1 COMMENT '1进行中,2已结束',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团购活动表';

-- Group buy participants
CREATE TABLE `mall_group_buy_partner` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `group_buy_id` bigint NOT NULL,
    `group_no` varchar(64) NOT NULL COMMENT 'Group identifier',
    `user_id` bigint NOT NULL,
    `is_leader` tinyint DEFAULT 0 COMMENT '1是团长',
    `status` tinyint DEFAULT 0 COMMENT '0待付款,1已付款,2已退款',
    `join_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_group_no_user` (`group_no`, `user_id`),
    KEY `idx_group_buy_id` (`group_buy_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团购参与者表';
```

**Key Design Points:**
1. **Group formation**: User creates group (becomes leader) or joins existing group
2. **Group validity**: Group expires after `valid_hours` if not filled
3. **Payment timing**: Usually pay immediately upon joining group
4. **Refund handling**: If group expires without reaching `required_count`, full refund
5. **Partial fill**: Once `required_count` reached, group succeeds and goods ship

### 3.4 Promotion APIs

**User:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /promotion/flash-sale/list | Available flash sales |
| GET | /promotion/flash-sale/{id} | Flash sale detail with items |
| GET | /promotion/group-buy/list | Available group buys |
| POST | /promotion/group-buy | Create a new group (become leader) |
| GET | /promotion/group-buy/{groupNo} | Group detail and participants |
| POST | /promotion/group-buy/{groupNo}/join | Join existing group |
| GET | /promotion/discount/list | Limited time discounts |

**Admin:**
| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/flash-sale | Create flash sale |
| PUT | /admin/flash-sale/{id} | Edit flash sale |
| POST | /admin/flash-sale/{id}/publish | Start flash sale |
| POST | /admin/group-buy | Create group buy |
| PUT | /admin/group-buy/{id} | Edit group buy |
| POST | /admin/discount | Create limited discount |

---

## 4. Membership System

### 4.1 Points System

```sql
-- Points account
CREATE TABLE `mall_points_account` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `user_id` bigint NOT NULL UNIQUE,
    `balance` int DEFAULT 0 COMMENT 'Current points balance',
    `totalEarned` int DEFAULT 0 COMMENT 'Lifetime earned',
    `totalSpent` int DEFAULT 0 COMMENT 'Lifetime spent',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户积分账户表';

-- Points transaction log
CREATE TABLE `mall_points_log` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `user_id` bigint NOT NULL,
    `type` tinyint NOT NULL COMMENT '1获得,2消耗',
    `points` int NOT NULL COMMENT 'Points amount',
    `balance_after` int NOT NULL COMMENT 'Balance after this transaction',
    `source` varchar(32) NOT NULL COMMENT 'ORDER,GIFT,EXPIRE,REDEEM',
    `source_id` varchar(64) COMMENT 'Related order ID or reference',
    `remark` varchar(255) COMMENT 'Description',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_source` (`source`, `source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分变动记录表';
```

**Points Rules:**
| Event | Points Earned | Calculation |
|-------|---------------|-------------|
| Order payment | Yes | `payAmount * pointsPerYuan` (e.g., 1元=1积分) |
| Order refund | Deduct | Reverse the earned points |
| Manual adjustment | Admin | Add/subtract manually |
| Points expire | System | Configurable expiration (e.g., 12 months) |

### 4.2 Membership Levels

```sql
-- Membership level config
CREATE TABLE `mall_member_level` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `name` varchar(32) NOT NULL COMMENT 'Level name',
    `level` int NOT NULL COMMENT 'Level number',
    `minPoints` int NOT NULL COMMENT 'Minimum points to reach',
    `discount_rate` decimal(5,2) COMMENT 'Extra discount rate for members',
    `benefits` text COMMENT 'Benefits description JSON',
    `status` tinyint DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级配置表';
```

**Typical Levels:**
| Level | Name | Points Threshold | Benefits |
|-------|------|------------------|----------|
| 1 | Bronze | 0 | Base price |
| 2 | Silver | 1000 | 1% extra discount |
| 3 | Gold | 5000 | 3% extra discount + free shipping threshold lowered |
| 4 | Platinum | 15000 | 5% extra discount + priority support |

### 4.3 Level Calculation

Level is determined by **cumulative points** (not current balance):

```java
// Pseudocode for level calculation
public int calculateLevel(int totalPoints) {
    List<MemberLevel> levels = memberLevelService.getActiveLevels();
    for (int i = levels.size() - 1; i >= 0; i--) {
        if (totalPoints >= levels.get(i).getMinPoints()) {
            return levels.get(i).getLevel();
        }
    }
    return 1; // Default level
}
```

### 4.4 Points Redemption

Points can be redeemed for:
- Coupons (e.g., 1000 points = 10元 coupon)
- Gifts (configurable in separate redemption catalog)
- Discounts (rare, usually as fallback)

**Points-to-Currency Rate:** Typically 100:1 (100 points = 1 yuan)

```sql
-- Points redemption rule
CREATE TABLE `mall_points_mall` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tenant_id` varchar(32) NOT NULL,
    `name` varchar(64) NOT NULL COMMENT 'Redemption item name',
    `type` tinyint NOT NULL COMMENT '1优惠券,2礼品,3折扣',
    `redeem_points` int NOT NULL COMMENT 'Points required',
    `coupon_id` bigint COMMENT 'If type=1, link to coupon',
    `stock` int COMMENT 'Stock, -1 for unlimited',
    `status` tinyint DEFAULT 1,
    `start_time` datetime,
    `end_time` datetime,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分商城表';
```

### 4.5 Membership APIs

**User:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /member/info | User's membership info (level, points) |
| GET | /member/points/log | Points transaction history |
| GET | /member/points/mall | Available redemption items |
| POST | /member/points/redeem | Redeem points for item |
| GET | /member/level/benefits | Benefits by level |

**Admin:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/member/list | Member list with levels |
| PUT | /admin/member/{id}/points | Manual points adjustment |
| POST | /admin/member/level | Create member level |
| PUT | /admin/member/level/{id} | Edit member level |
| POST | /admin/points/mall | Add redemption item |
| GET | /admin/points/mall/list | Redemption items |

---

## 5. Integration with Existing System

### 5.1 Order Discount Calculation Order

When multiple discounts apply, calculate in this order:
1. **Promotions** (flash sale, group buy) - Price already reduced
2. **Member discount** - Based on level
3. **Coupon** - Final discount applied
4. **Points redemption** - Deduct from final amount

### 5.2 Refund Impact on Related Records

| Action | Impact |
|--------|--------|
| Refund approved | Flag order as "refunding" |
| Refund completed | Restore stock, cancel coupon, reverse points earned |
| Points already spent | Cannot reverse (points already spent by user) - compensate via admin adjustment |

### 5.3 Stock Impact Matrix

| Feature | Redis Stock | MySQL Stock | Notes |
|---------|-------------|-------------|-------|
| Flash sale | Yes (separate) | Yes | `flash_stock` field |
| Group buy | No (normal) | Yes | Uses normal `stock` |
| Coupon redemption | N/A | N/A | No stock impact |
| Points redemption | N/A | N/A | No stock impact |

---

## 6. MVP Recommendation for v1.1

**Priority Order:**

1. **Refund Module** (HIGH)
   - Admin can review/approve refunds
   - WeChat refund API integration
   - Stock restoration on success

2. **Basic Coupon System** (MEDIUM-HIGH)
   - 满减券 (满减) only first
   - Admin creates/distributes coupons
   - User applies coupon at checkout
   - Skip 折扣券 and 代金券 for now

3. **Points System** (MEDIUM)
   - Earn points on order payment
   - Points balance display
   - Points log query
   - Skip redemption initially

**Defer to v1.2:**
- Flash sale / Group buy (complex inventory and timing logic)
- Points redemption
- Membership levels with benefits
- 折扣券 / 代金券 coupon types

---

## 7. Anti-Features to Avoid

| Anti-Feature | Why Avoid | Alternative |
|--------------|-----------|-------------|
| Automated refund approval | Risk of fraud | Manual review for all refunds |
| Coupon stacking | Complexity in calculation | One coupon per order |
| Flash sale without Redis | Scalability issues | Redis atomic stock operations required |
| Points earning on discounted orders | Point inflation | Points based on original price, not discounted |

---

## Sources

- [WeChat Pay v3 Refund API](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_9.shtml) (HIGH confidence - official documentation)
- Project requirements: `docs/mall-center/在线销售服务器硬件小程序开发V1.0.md` (HIGH confidence)
- Project requirements: `docs/mall-center/在线销售服务器硬件小程序开发V1.1.md` (HIGH confidence)
- Industry practice for e-commerce marketing features (MEDIUM confidence - general knowledge)
