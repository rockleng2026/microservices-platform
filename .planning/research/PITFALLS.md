# Domain Pitfalls: Refund and Marketing Modules

**Domain:** E-commerce Refund & Marketing Module Integration
**Project:** Mall-Center v1.1 (adding to existing Spring Cloud Alibaba system)
**Researched:** 2026-05-08
**Confidence:** MEDIUM-HIGH (domain knowledge, web search unavailable for verification)

---

## Critical Pitfalls

Mistakes that cause financial loss, data corruption, or require rewrites.

---

### Pitfall 1: Double Refund

**What goes wrong:** A refund is processed more than once for the same order, causing financial loss.

**Why it happens:**
- No idempotency key on refund requests
- Network timeout causes client retry, but server processes both requests
- Concurrent requests from multiple admin accounts
- Database transaction isolation allows duplicate processing
- WeChat refund API called without checking prior refund status

**Consequences:**
- Financial loss from refunds exceeding original payment
- Accounting reconciliation failures
- Customer trust issues if caught
- Regulatory/audit problems if not caught

**Prevention:**
```java
// Use distributed lock or idempotency key
@GlobalTransactional
public RefundResult processRefund(RefundRequest request) {
    // 1. Check if refund already processed (idempotency)
    RefundRecord existing = refundMapper.findByIdemKey(request.getIdempotencyKey());
    if (existing != null) {
        return existing.toResult(); // Return existing result, don't reprocess
    }

    // 2. Check WeChat refund status before attempting
    if (refundMapper.hasSuccessfulRefund(request.getOrderId())) {
        throw new RefundAlreadyProcessedException();
    }

    // 3. Use database unique constraint on idempotency key
    // INSERT INTO refund_records (idempotency_key, ...) VALUES (#{key}, ...)
    // MyBatis Plus will throw DuplicateKeyException if key exists
}
```

**Detection:**
- Monitor refund count per order (should be <= 1)
- Alert when total refund amount exceeds payment amount
- Audit log for all refund state transitions

---

### Pitfall 2: Refund State Machine Violations

**What goes wrong:** Refund transitions to invalid states (e.g., refund cancelled after completed, or refund approved without payment).

**Why it happens:**
- No formal state machine definition
- Direct status field updates without validation
- Concurrent updates bypass status checks
- Missing state transition validation

**Consequences:**
- Inconsistent refund states
- UI shows wrong refund status to users/admins
- Actions allowed that should not be (e.g., re-refunding a cancelled refund)

**Prevention:**
```java
// Define explicit state transitions
public enum RefundState {
    PENDING_AUDIT,
    AUDIT_PASSED,
    AUDIT_REJECTED,
    REFUNDING,      // WeChat refund API called
    REFUND_SUCCESS,
    REFUND_FAILED,
    CANCELLED
}

// State transition rules
public boolean canTransition(RefundState from, RefundState to) {
    return switch (from) {
        case PENDING_AUDIT -> to == AUDIT_PASSED || to == AUDIT_REJECTED || to == CANCELLED;
        case AUDIT_PASSED -> to == REFUNDING || to == CANCELLED;
        case REFUNDING -> to == REFUND_SUCCESS || to == REFUND_FAILED;
        case REFUND_FAILED -> to == REFUNDING; // Allow retry
        default -> false;
    };
}

// Enforce transitions in service
public void updateRefundState(Long refundId, RefundState newState) {
    RefundRecord refund = refundMapper.selectById(refundId);
    if (!canTransition(refund.getState(), newState)) {
        throw new InvalidRefundStateTransitionException(refund.getState(), newState);
    }
    refund.setState(newState);
    refundMapper.updateById(refund);
}
```

---

### Pitfall 3: Stock Restoration Conflicts

**What goes wrong:** When refunding, stock is restored incorrectly (too much, too little, or not at all), causing inventory discrepancies.

**Why it happens:**
- Refund handler does not know if original order consumed reserved stock or real stock
- Double-restore if payment failed but refund process still runs
- Race between stock restoration and new orders consuming stock
- Stock restoration happens before WeChat refund confirmation

**Consequences:**
- Inventory counts become inaccurate
- Overselling if stock restored too early and new order consumes it before refund formally completes
- Stock deficit if refund fails after inventory restored but order not formally cancelled

**Prevention:**
```java
@GlobalTransactional
public void processRefundCompletion(Long orderId, Long skuId, Integer quantity) {
    // 1. Determine if this was reserved-only stock or real stock consumed
    Order order = orderService.getOrder(orderId);

    if (OrderStockType.RESERVED == order.getStockType()) {
        // Payment never completed - only restore reserved stock
        stockService.restoreReservedStock(skuId, quantity);
    } else {
        // Payment completed - restore real stock
        stockService.restoreRealStock(skuId, quantity);
    }

    // 2. Only restore after refund is confirmed (not on refund request)
    // WeChat refund has async confirmation - use callback webhook
}

// IMPORTANT: Restore stock only on WeChat refund success callback, not on request
@PostMapping("/wechat/refund/callback")
public void handleWechatRefundCallback(@RequestBody WechatRefundNotify notify) {
    if ("SUCCESS".equals(notify.getRefundStatus())) {
        stockService.restoreRealStock(skuId, quantity); // Now safe
    }
}
```

---

### Pitfall 4: Coupon Race Condition - Double Redemption

**What goes wrong:** Same coupon code is redeemed multiple times concurrently, bypassing usage limits.

**Why it happens:**
- No row-level locking when checking coupon usage count
- Check-then-act pattern without atomicity
- Multiple requests pass the "available" check before any marks it as used

**Consequences:**
- Coupon over-issued beyond limit
- Financial loss from unauthorized discounts
- Customer complaints when they believe they received valid coupons

**Prevention:**
```java
// WRONG - Race condition
public boolean redeemCoupon(String couponCode, Long userId) {
    Coupon coupon = couponMapper.findByCode(couponCode);
    if (coupon.getUsedCount() >= coupon.getTotalCount()) {
        return false; // Too late, but another thread already passed this check
    }
    coupon.setUsedCount(coupon.getUsedCount() + 1); // Lost update
    couponMapper.updateById(coupon);
    return true;
}

// CORRECT - Atomic update with condition
public boolean redeemCoupon(String couponCode, Long userId) {
    // Atomic check-and-update: UPDATE ... WHERE used_count < total_count
    int updated = couponMapper.atomicIncrementUsedCount(couponCode);
    if (updated == 0) {
        return false; // Coupon exhausted, no change made
    }

    // Record user redemption
    couponRedemptionMapper.insert(CouponRedemption.of(couponCode, userId));
    return true;
}

// In MyBatis Plus mapper
@Update("UPDATE coupon SET used_count = used_count + 1, update_time = NOW() " +
        "WHERE code = #{code} AND used_count < total_count AND status = 'ACTIVE'")
int atomicIncrementUsedCount(@Param("code") String code);
```

---

### Pitfall 5: Coupon Code Conflicts

**What goes wrong:** Multiple coupon campaigns share codes or eligibility rules, causing unexpected stacking or conflicts.

**Why it happens:**
- Same code reused across campaigns without versioning
- No mutual exclusion rules between coupon types
- System allows both percentage discount and fixed discount to stack
- No "best discount" calculation when multiple coupons apply

**Consequences:**
- Margins destroyed by stacking discounts (e.g., 80% off + 50 off)
- Customers find exploit combinations
- Order final amount becomes negative or zero

**Prevention:**
```java
// Define mutually exclusive coupon groups
public enum CouponGroup {
    PERCENTAGE_DISCOUNT,  // e.g., 20% off
    FIXED_DISCOUNT,       // e.g., 50 yuan off
    FREE_SHIPPING,
    GIFT_WITH_PURCHASE
}

// Only one coupon per group per order
public CouponSelection selectBestCoupons(List<Coupon> eligibleCoupons, Order order) {
    Map<CouponGroup, Coupon> selected = new EnumMap<>(CouponGroup.class);

    for (Coupon coupon : eligibleCoupons) {
        CouponGroup group = coupon.getGroup();
        if (selected.containsKey(group)) {
            // Pick the better discount
            Coupon existing = selected.get(group);
            if (coupon.getDiscountAmount(order) > existing.getDiscountAmount(order)) {
                selected.put(group, coupon);
            }
        } else {
            selected.put(group, coupon);
        }
    }

    // Apply mutual exclusion rules
    if (selected.containsKey(CouponGroup.PERCENTAGE_DISCOUNT) &&
        selected.containsKey(CouponGroup.FIXED_DISCOUNT)) {
        // If percentage would cause negative price, use fixed only
        Coupon pct = selected.get(CouponGroup.PERCENTAGE_DISCOUNT);
        if (wouldCauseNegativeTotal(order, pct)) {
            selected.remove(CouponGroup.PERCENTAGE_DISCOUNT);
        }
    }

    return new CouponSelection(selected.values());
}
```

---

### Pitfall 6: Coupon Expiration Edge Cases

**What goes wrong:** Coupons expire at midnight or have timezone issues, or are usable after expiration.

**Why it happens:**
- Expiration date compared without timezone consideration
- Time component ignored (midnight assumed but not enforced)
- Cache serves expired coupon status
- Batch jobs run at different times than expected

**Consequences:**
- Customers cannot use valid coupons near expiration boundary
- Customers use expired coupons (revenue loss)
- Inconsistent coupon availability across servers

**Prevention:**
```java
// Use timestamp with timezone, not date-only
public boolean isCouponValid(Coupon coupon, DateTime now) {
    // Compare timestamps with timezone
    ZonedDateTime expiresAt = coupon.getExpiresAt().atZone(coupon.getTimezone());
    ZonedDateTime nowZoned = now.toInstant().atZone(coupon.getTimezone());

    return nowZoned.isBefore(expiresAt) &&
           nowZoned.isAfter(coupon.getEffectiveAt().atZone(coupon.getTimezone()));
}

// Redis cache keys should include date to auto-expire
@Cacheable(value = "coupons", key = "'coupon:' + #code + ':' + T(java.time.LocalDate).now()")
public Coupon getCoupon(String code) {
    // Cache expires at end of day, forcing re-check tomorrow
}

// Cron job to disable expired coupons (backup validation)
@Scheduled(cron = "0 0 0 * * *") // Midnight daily
public void disableExpiredCoupons() {
    couponMapper.disableExpiredCoupons(LocalDateTime.now());
}
```

---

## Moderate Pitfalls

Issues that cause bugs or poor UX but do not directly cause financial loss.

---

### Pitfall 7: Compilation Fix Breaking Existing Code

**What goes wrong:** Fixing `Result.succeed()` generic compilation issue causes compile errors or runtime behavior changes in existing code.

**Why it happens:**
- `Result<T>.succeed()` may have been used inconsistently across codebase
- Type inference changes when adding proper generics
- Response format changes break API consumers
- Breaking change if `Result` class structure is modified

**Prevention:**
```java
// If fixing Result<T> generics, maintain backward compatibility
public class Result<T> {
    private T data;
    private String message;
    private int code;

    // Keep old non-generic method for backward compatibility
    public static Result<?> succeed() {
        return new Result<>().ok();
    }

    // New generic method
    public static <T> Result<T> succeed(T data) {
        return new Result<T>().data(data).ok();
    }

    // Explicit cast method if needed for gradual migration
    @SuppressWarnings("unchecked")
    public static <T> Result<T> succeedStrict(T data) {
        return (Result<T>) succeed(data);
    }
}

// Phase migration:
// 1. Add new generic method
// 2. Update call sites gradually (IDE find usages)
// 3. Remove old method after all migrated
// 4. Never change method signature in breaking way during v1.x
```

---

### Pitfall 8: Result API Inconsistent Usage Pattern

**What goes wrong:** Mixed usage of `Result.succeed(data)`, `Result.ok()`, `Result.success()` across codebase creates confusion and potential NPE.

**Why it happens:**
- No enforced convention for Result API usage
- Different developers use different methods
- Old code not updated during refactoring
- IDE autocomplete leads to wrong overload selection

**Consequences:**
- Null data in successful responses
- Inconsistent response structure
- Potential NullPointerException when chaining
- API documentation becomes inaccurate

**Prevention:**
```java
// Define clear usage conventions in coding standards:

// 1. For endpoints returning data: Result.succeed(data)
//    @GetMapping("/{id}")
//    public Result<User> getUser(@PathVariable Long id) {
//        return Result.succeed(userService.getById(id));
//    }

// 2. For endpoints returning void/single boolean: Result.ok()
//    @PostMapping("/enabled")
//    public Result<Void> setEnabled(@RequestParam Boolean enabled) {
//        service.setEnabled(enabled);
//        return Result.ok();
//    }

// 3. Never return null data - wrap in Optional or use empty collection
//    CORRECT:   Result.succeed(List.of())   // Empty list, not null
//    CORRECT:   Result.succeed(Optional.empty()) if single optional
//    WRONG:     Result.succeed(null)

// Enforce with code review checklist:
// [ ] All controller methods return Result<?>
// [ ] No raw ResponseEntity or primitive returns
// [ ] Optional wrapped before returning
```

---

## Minor Pitfalls

---

### Pitfall 9: Refund Amount Precision Loss

**What goes wrong:** Decimal discount amounts lose precision during calculation, causing rounding disputes.

**Prevention:**
```java
// Use BigDecimal for monetary calculations, never double/float
private BigDecimal calculateRefundAmount(Order order) {
    BigDecimal paidAmount = order.getPaidAmount(); // Already BigDecimal
    BigDecimal refundRatio = BigDecimal.valueOf(refundQuantity)
                                       .divide(BigDecimal.valueOf(order.getTotalQuantity()), 4, RoundingMode.HALF_UP);
    return paidAmount.multiply(refundRatio).setScale(2, RoundingMode.HALF_UP);
}
```

---

### Pitfall 10: Marketing Module Database Schema Changes Affecting Existing Queries

**What goes wrong:** Adding new marketing tables/columns causes query performance regression or breaks existing MyBatis XML files.

**Prevention:**
- Add new tables with `marketing_` prefix instead of modifying existing `order_`, `goods_` tables
- If extending existing tables, add nullable columns only
- New indexes should be carefully named and tested
- Always add columns at the end of existing tables in migration scripts

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Refund Request Handler | Double refund on network retry | Implement idempotency key with unique constraint |
| Refund Audit Flow | State machine violation | Define explicit state transitions and validate |
| WeChat Refund Callback | Stock restoration timing | Restore only on confirmed refund, not on request |
| Coupon Redemption | Race condition on usage count | Atomic SQL update with WHERE condition |
| Coupon Selection | Discount stacking exploits | Define mutual exclusion groups, implement "best deal" logic |
| Coupon Expiration | Timezone/midnight edge case | Use timestamp comparisons, auto-expire cache entries |
| Result.succeed() Fix | Breaking existing call sites | Add overloaded method, migrate gradually |
| Result API Usage | Inconsistent return patterns | Establish conventions, code review enforcement |

---

## Sources

- **Confidence: MEDIUM-HIGH** — Domain knowledge from e-commerce system design patterns. Web search was unavailable at time of writing (API error). Findings are consistent with established best practices in payment systems and should be validated against WeChat Pay official documentation before implementation.

**Primary references relied upon:**
- General software engineering knowledge of distributed systems pitfalls
- Payment processing idempotency patterns
- State machine design patterns
- Database transaction isolation levels
- Redis distributed locking patterns
- WeChat Pay merchant documentation (to be verified)

**Validation recommended:**
- Review WeChat refund API idempotency requirements
- Confirm stock restoration logic with business requirements (reserved vs real stock)
- Validate coupon mutual exclusion rules with marketing team
