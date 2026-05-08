# Refund and Marketing Module Architecture

**Project:** mall-center v1.1
**Researched:** 2026-05-08
**Confidence:** MEDIUM (based on existing codebase analysis; no external documentation verified)

## Executive Summary

The refund module integrates with existing Order/Pay/Stock services through clear extension points. The marketing module requires new tables and a coupon/activity validation service that hooks into order creation. Both modules can be built sequentially with refund first (simpler, fewer dependencies) followed by marketing (requires price calculation integration).

## 1. Integration Points with Existing Modules

### 1.1 Refund Module Integration

| Integration Point | Existing Component | How Refund Hooks In |
|-------------------|-------------------|---------------------|
| Order Status | `MallOrder.status` | Add status 6=退款中, 7=已退款 (extend existing 1-5) |
| Order Item | `MallOrderItem` | Refund amount calculated per item |
| Stock Restoration | `IStockService` | Add `restoreStockOnRefund(Long orderId)` using existing `releaseStock` pattern |
| WeChat Pay | `IPayService` | Add `processRefund(Long orderId, BigDecimal amount)` calling WeChat refund API |
| Stock Log | `MallStockLog` | Add operationType=5 (refund restore) |

**Key insight:** The existing `releaseStock()` in StockService already handles stock restoration. Refund can reuse this pattern but needs a dedicated method to handle the different scenarios (refund after payment vs refund after shipment).

### 1.2 Marketing Module Integration

| Integration Point | Existing Component | How Marketing Hooks In |
|-------------------|-------------------|-----------------------|
| Price Calculation | `OrderServiceImpl.createOrder()` | Validate coupons before stock pre-allocation |
| Order Amount | `MallOrder.totalAmount/payAmount` | Store original amount and discount amount separately |
| Coupon Usage | `MallOrder.remark` or new field | Track which promotion was applied |

**Key insight:** Marketing validation must happen BEFORE stock pre-allocation to avoid inventory issues. The flow should be: validate coupon -> calculate discount -> create order with discounted price -> pre-allocate stock.

### 1.3 Existing Order Status Flow

```
1=待付款 → 2=已付款 → 3=已发货 → 4=已完成
    ↓           ↓           ↓
  5=已取消    退款流程     退款流程
```

### 1.4 Refund Status Flow (Proposed Extension)

```
Existing: 1=待付款, 2=已付款, 3=已发货, 4=已完成, 5=已取消
New:      6=退款中, 7=已退款, 8=退款拒绝
```

**Refund allowed from:** status 2 (paid), 3 (shipped), 4 (completed)
**Refund NOT allowed:** status 1 (pending pay - user can cancel instead), 5 (already cancelled)

## 2. New Tables and Entities Needed

### 2.1 Refund Module Tables

```sql
-- 退款申请表
CREATE TABLE `mall_refund` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
    `user_id` BIGINT NOT NULL,
    `refund_no` VARCHAR(32) NOT NULL COMMENT '退款单号',
    `refund_type` TINYINT NOT NULL DEFAULT 1 COMMENT '退款类型:1=仅退款,2=退货退款',
    `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    `refund_reason` VARCHAR(255) NOT NULL COMMENT '退款原因',
    `refund_desc` TEXT COMMENT '退款说明',
    `evidence_images` TEXT COMMENT '凭证图片(JSON数组)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1=待审核,2=同意,3=拒绝,4=已退款,5=已撤销',
    `reject_reason` VARCHAR(255) COMMENT '拒绝原因',
    `admin_id` BIGINT COMMENT '处理管理员ID',
    `process_time` DATETIME COMMENT '处理时间',
    `wechat_refund_no` VARCHAR(64) COMMENT '微信退款单号',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款申请';

-- 退款商品明细表
CREATE TABLE `mall_refund_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `refund_id` BIGINT NOT NULL,
    `order_item_id` BIGINT NOT NULL COMMENT '订单商品ID',
    `sku_id` BIGINT NOT NULL,
    `goods_id` BIGINT NOT NULL,
    `goods_name` VARCHAR(128),
    `sku_specs` VARCHAR(255),
    `price` DECIMAL(10,2) COMMENT '单价',
    `quantity` INT NOT NULL COMMENT '退款数量',
    `refund_amount` DECIMAL(10,2) NOT NULL COMMENT '该商品退款金额',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_refund_id` (`refund_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款商品明细';
```

### 2.2 Marketing Module Tables

```sql
-- 优惠券模板表
CREATE TABLE `mall_coupon_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `name` VARCHAR(64) NOT NULL COMMENT '优惠券名称',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型:1=满减券,2=折扣券,3=无门槛券',
    `face_value` DECIMAL(10,2) COMMENT '面额(满减/无门槛)',
    `discount_rate` DECIMAL(5,2) COMMENT '折扣率(折扣券,如0.85表示85折)',
    `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '使用门槛:满X元可用',
    `max_discount` DECIMAL(10,2) COMMENT '最高折扣金额(折扣券上限)',
    `total_count` INT NOT NULL COMMENT '发放总量',
    `remain_count` INT NOT NULL COMMENT '剩余数量',
    `per_user_limit` INT DEFAULT 1 COMMENT '每人限领数量',
    `valid_type` TINYINT NOT NULL DEFAULT 1 COMMENT '有效期类型:1=固定日期,2=领取后N天',
    `start_time` DATETIME COMMENT '开始时间',
    `end_time` DATETIME COMMENT '结束时间',
    `valid_days` INT COMMENT '领取后有效天数',
    `status` TINYINT DEFAULT 1 COMMENT '状态:0=未发布,1=已发布,2=已下架',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券模板';

-- 用户优惠券表
CREATE TABLE `mall_coupon` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `template_id` BIGINT NOT NULL COMMENT '模板ID',
    `coupon_no` VARCHAR(32) NOT NULL COMMENT '优惠券码',
    `name` VARCHAR(64) NOT NULL,
    `type` TINYINT NOT NULL,
    `face_value` DECIMAL(10,2),
    `discount_rate` DECIMAL(5,2),
    `min_amount` DECIMAL(10,2),
    `max_discount` DECIMAL(10,2),
    `order_id` BIGINT COMMENT '使用的订单ID',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1=未使用,2=已使用,3=已过期',
    `receive_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    `use_time` DATETIME COMMENT '使用时间',
    `expire_time` DATETIME NOT NULL COMMENT '过期时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_template_id` (`template_id`),
    KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券';

-- 营销活动表
CREATE TABLE `mall_marketing_activity` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL COMMENT '活动名称',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型:1=满减,2=折扣,3=买赠',
    `rule_json` TEXT COMMENT '规则JSON:{"minAmount":100,"discountAmount":10}或{"minAmount":200,"discountRate":0.9}',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '状态:0=未开始,1=进行中,2=已结束',
    `priority` INT DEFAULT 0 COMMENT '优先级(数字越大越优先)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营销活动';

-- 会员等级表
CREATE TABLE `mall_member_level` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `name` VARCHAR(32) NOT NULL COMMENT '等级名称',
    `level` INT NOT NULL COMMENT '等级数值',
    `discount_rate` DECIMAL(5,2) DEFAULT 1.00 COMMENT '享受折扣率',
    `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '升级门槛:累计消费满X',
    `icon` VARCHAR(255) COMMENT '等级图标',
    `sort` INT DEFAULT 0,
    `status` TINYINT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级';

-- 用户会员信息表
CREATE TABLE `mall_member` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(32) NOT NULL,
    `user_id` BIGINT NOT NULL UNIQUE,
    `level_id` BIGINT NOT NULL COMMENT '当前等级ID',
    `total_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '累计消费金额',
    `order_count` INT DEFAULT 0 COMMENT '订单数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户会员信息';
```

### 2.3 MallOrder Extension (for Marketing)

The existing `MallOrder` should have two new fields added via ALTER TABLE:

```sql
ALTER TABLE `mall_order` ADD COLUMN `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额';
ALTER TABLE `mall_order` ADD COLUMN `coupon_id` BIGINT COMMENT '使用的优惠券ID';
```

## 3. Service Boundaries and Dependencies

### 3.1 Refund Service (`IRefundService`)

```
IRefundService
├── applyRefund(userId, dto)    → User submits refund request
├── getRefundList(userId)       → User views their refunds
├── getRefundDetail(id)         → User views refund detail
├── cancelRefund(id, userId)    → User cancels refund request
│
├── adminGetList(params)        → Admin lists all refunds (with filters)
├── adminProcessRefund(id, adminId, result) → Admin approves/rejects
├── adminExecuteRefund(id)      → Admin triggers WeChat refund API
```

**Dependencies:**
- `MallOrderMapper` - read order info
- `MallOrderItemMapper` - read order items
- `MallRefundMapper` - CRUD on refund records
- `MallRefundItemMapper` - CRUD on refund items
- `IStockService` - restore stock on approved refund
- `IPayService` - call WeChat refund API

### 3.2 Marketing Service (`IMarketingService`)

```
IMarketingService
├── validateCoupon(userId, couponNo, orderAmount) → Check if coupon is valid
├── useCoupon(userId, couponNo, orderId)           → Mark coupon as used
├── calculateDiscount(userId, orderAmount, goodsType) → Get best discount
├── getAvailableCoupons(userId)                    → List user's available coupons
│
├── getActivityList()                             → Public list of active activities
├── getMemberInfo(userId)                          → Get user's member level & benefits
```

**Dependencies:**
- `MallCouponTemplateMapper` - coupon template CRUD
- `MallCouponMapper` - user coupon CRUD
- `MallMarketingActivityMapper` - activity CRUD
- `MallMemberMapper` - member info
- `MallMemberLevelMapper` - level definitions
- `MallOrderMapper` - update order with discount

### 3.3 New Service Method in StockService

```java
// Add to IStockService interface
/**
 * Restore stock on refund (STOCK-07)
 * Similar to releaseStock but:
 * - Works on paid orders (not just pre-allocated)
 * - Updates database stock directly (not Redis only)
 * - Writes operationType=5 in stock log
 */
void restoreStockOnRefund(Long orderId, List<Map<String, Object>> items);
```

### 3.4 New Service Method in PayService

```java
// Add to IPayService interface
/**
 * Process WeChat refund
 * @return refund transaction ID from WeChat
 */
String processRefund(Long orderId, BigDecimal refundAmount, String refundReason);
```

## 4. Suggested Build Order

### Phase 4.1: Refund Module (Estimated simpler)

**Build sequence:**

1. **Add refund tables** (mall_refund, mall_refund_item)
2. **Create MallRefund, MallRefundItem entities**
3. **Create MallRefundMapper, MallRefundItemMapper**
4. **Implement IRefundService and RefundServiceImpl**
   - User: apply, list, detail, cancel
   - Admin: list, process, execute
5. **Add restoreStockOnRefund() to StockService**
   - Updates MallGoodsSku.stock
   - Writes MallStockLog with operationType=5
   - Syncs Redis
6. **Add processRefund() to PayService**
   - Call WeChat refund API (similar to initiatePay pattern)
   - Update refund record with wechat_refund_no
7. **Add refund controller** (user + admin endpoints)
8. **Integration test with existing order flow**

**Test scenarios:**
- User applies refund for paid order -> creates refund record
- Admin approves -> stock restored, WeChat refund called
- Admin rejects -> refund closed, no stock change
- User cancels before admin processes -> refund closed

### Phase 4.2: Marketing Module (Estimated more complex)

**Build sequence:**

1. **Add marketing tables** (coupon_template, coupon, marketing_activity, member_level, member)
2. **Extend MallOrder with discount_amount and coupon_id fields**
3. **Create entity classes** for all new tables
4. **Create mappers** for all new tables
5. **Implement IMarketingService and MarketingServiceImpl**
   - Coupon validation logic
   - Activity discount calculation
   - Member level discount
   - Best discount selection
6. **Integrate into OrderService.createOrder()**
   - Before stock pre-allocation: call marketingService.calculateDiscount()
   - Store discount info in order
   - Mark coupon as used after order creation
7. **Add marketing controller** (user coupon list, admin coupon/template/activity CRUD)
8. **Add member controller** (user member info)

**Test scenarios:**
- Create order with valid coupon -> discount applied, coupon marked used
- Create order with expired/invalid coupon -> reject with message
- Multiple activities applicable -> highest discount selected
- Member discount + coupon -> both applied (or best of)

## 5. File Structure for New Modules

```
zlt-business/mall-center/src/main/java/com/central/mall/
├── model/
│   ├── entity/
│   │   ├── MallRefund.java
│   │   ├── MallRefundItem.java
│   │   ├── MallCouponTemplate.java
│   │   ├── MallCoupon.java
│   │   ├── MallMarketingActivity.java
│   │   ├── MallMemberLevel.java
│   │   └── MallMember.java
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
│   ├── MallMemberLevelMapper.java
│   └── MallMemberMapper.java
├── service/
│   ├── IRefundService.java
│   ├── impl/RefundServiceImpl.java
│   ├── IMarketingService.java
│   └── impl/MarketingServiceImpl.java
└── controller/
    ├── RefundController.java
    ├── CouponController.java
    ├── MarketingController.java
    └── MemberController.java
```

## 6. Configuration Requirements

### 6.1 New application.yml properties

```yaml
# Refund configuration
wechat:
  pay:
    # existing properties...
    refund-url: https://api.mch.weixin.qq.com/secapi/pay/refund

# Marketing configuration
marketing:
  coupon:
    default-per-user-limit: 5
    auto-expire-days: 30
  member:
    enabled: true
```

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Refund status 6/7/8 extend existing 1-5 | Avoids schema migration of existing status checks |
| Refund restores stock via StockService | Ensures consistent stock tracking with MallStockLog |
| Marketing validates BEFORE stock pre-allocation | Prevents inventory issues when discounts attract more buyers |
| Coupon used AFTER order creation (not during) | Atomic operation - order creation and coupon usage in same transaction |
| Store discount_amount in MallOrder | Enables audit trail and refund calculations |

## 8. Anti-Patterns to Avoid

- **DO NOT** allow refund for cancelled orders (status 5) - already handled
- **DO NOT** call WeChat refund API without admin approval - manual review required
- **DO NOT** restore stock without recording in MallStockLog - breaks inventory audit
- **DO NOT** apply marketing discounts after stock pre-allocation - inventory already reserved at full price
- **DO NOT** allow coupon reuse - check status=1 before using

## Sources

- Existing mall-center codebase analysis (MEDIUM confidence)
- WeChat Pay API documentation pattern (from existing PayServiceImpl)
- Standard e-commerce refund/marketing patterns (LOW confidence - not verified)
