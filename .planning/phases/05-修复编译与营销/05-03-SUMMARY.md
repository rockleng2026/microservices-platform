---
phase: "05"
plan: "03"
subsystem: mall-center
tags: [coupon, promotion, points, membership]
requirements:
  - "MARKETING-01"
  - "MARKETING-02"
  - "MARKETING-03"
  - "MARKETING-04"
  - "MARKETING-05"
  - "MARKETING-06"
  - "MARKETING-07"
  - "MARKETING-08"
  - "MARKETING-09"
---

# Phase 5 Plan 3: Marketing Module Summary

## Objective
Implement marketing module: coupon management (including discount coupons), promotional activities, and membership points system.

## Requirements Covered
- **MARKETING-01**: Admin can create full-reduction coupon templates (face value, threshold, validity, quantity)
- **MARKETING-02**: Admin can publish/unpublish coupons
- **MARKETING-03**: User can claim coupons
- **MARKETING-04**: User can use coupons at checkout (exclusive with promotion)
- **MARKETING-05**: Admin can create full-reduction promotional activities (time-based rules)
- **MARKETING-06**: Promotions and coupons are mutually exclusive, only one can be used per order
- **MARKETING-07**: Points earned after order completion (based on payment amount)
- **MARKETING-08**: User can view points balance and points history
- **MARKETING-09**: Points deducted on refund

## Implementation

### Task 1: MallOrder.java New Fields
**Files:** `MallOrder.java`
- Added `couponId` field
- Added `discountAmount` field

### Task 2: Create Marketing Entities and Mappers
**Files:**
- `MallCouponTemplate.java` - coupon template entity (name, type, faceValue, discountRate, minAmount, etc.)
- `MallCoupon.java` - user-owned coupon entity (userId, templateId, couponNo, status, etc.)
- `MallMarketingActivity.java` - promotional activity entity (name, type, ruleJson, time range, etc.)
- `MallPointsAccount.java` - user points account (userId, balance, totalEarned, totalSpent)
- `MallPointsLog.java` - points transaction log (userId, type, points, balanceAfter, source, etc.)
- 5 Mapper interfaces extending BaseMapper

### Task 3: Create IMarketingService
**Files:**
- `IMarketingService.java` - interface with coupon, promotion, and points methods
- `MarketingServiceImpl.java` - implementation with:
  - Coupon validation: check validity, user limit, minimum amount, Redis atomic operation for claim
  - Mutual exclusivity: coupon OR promotion, not both
  - Points calculation: order complete → points = payment amount (100:1 ratio)
  - Points rollback: refund → deduct from mall_points_log

### Task 4: Create Controllers
**Files:**
- `CouponController.java` - user endpoints (list, available, claim) + admin endpoints (create, publish, offline)
- `MemberController.java` - user endpoints (info, points log) + admin endpoint (adjust points)
- `AdminCouponController.java` - admin coupon management
- `AdminMemberController.java` - admin member management

### Task 5: Integrate with OrderServiceImpl
**Files:** `OrderServiceImpl.java`
- Added marketing validation BEFORE stock pre-allocation
- Coupon and promotion mutual exclusivity check

### Task 6: Database Migration
**Tables created:** mall_coupon_template, mall_coupon, mall_marketing_activity, mall_points_account, mall_points_log
**Tables modified:** mall_order (added coupon_id, discount_amount)

## Commits

| Hash | Message |
|------|---------|
| 7f279ad6c | feat(mall-center): complete marketing module (MARKETING-01~09) |

## Files Created/Modified

| File | Change |
|------|--------|
| MallOrder.java | Modified - add couponId, discountAmount |
| MallCouponTemplate.java | Created |
| MallCoupon.java | Created |
| MallMarketingActivity.java | Created |
| MallPointsAccount.java | Created |
| MallPointsLog.java | Created |
| MallCouponTemplateMapper.java | Created |
| MallCouponMapper.java | Created |
| MallMarketingActivityMapper.java | Created |
| MallPointsAccountMapper.java | Created |
| MallPointsLogMapper.java | Created |
| IMarketingService.java | Created |
| MarketingServiceImpl.java | Created |
| CouponController.java | Created |
| MemberController.java | Created |
| AdminCouponController.java | Created |
| AdminMemberController.java | Created |
| OrderServiceImpl.java | Modified - integrate marketing validation |

## Verification

- **Compilation:** `mvn compile -pl zlt-business/mall-center -am -q` - PASSED
- Coupon mutual exclusivity verified
- Points system integration verified

## Deviations from Plan

None - plan executed as written.

## Known Stubs

None

---
*Generated: 2026-05-09*
