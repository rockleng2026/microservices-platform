---
phase: "05"
plan: "02"
subsystem: mall-center
tags: [refund, refund-audit, wechat-pay, stock-restore]
requirements:
  - "REFUND-01"
  - "REFUND-02"
  - "REFUND-03"
  - "REFUND-04"
  - "REFUND-05"
  - "REFUND-06"
  - "REFUND-07"
  - "REFUND-08"
  - "REFUND-09"
  - "REFUND-10"
---

# Phase 5 Plan 2: Refund Module Summary

## Objective
Implement refund module: user applies for refund → admin reviews → WeChat refund API → stock restoration.

## Requirements Covered
- **REFUND-01**: User can apply for refund (only refund / return+refund)
- **REFUND-02**: User can view refund application records and status
- **REFUND-03**: User can cancel refund application (pending review status)
- **REFUND-04**: Admin can view all refund applications (multi-condition filter)
- **REFUND-05**: Admin can approve refund application
- **REFUND-06**: Admin can reject refund application
- **REFUND-07**: System calls WeChat Pay refund API to complete refund
- **REFUND-08**: Refund uses unique refund_no for idempotency
- **REFUND-09**: Stock restored after refund completion (operationType=5)
- **REFUND-10**: Refund state machine: pending review → approved → refunding → completed/failed

## Implementation

### Task 1: MallOrder.java New Status Constants
**Files:** `MallOrder.java`
- Added `STATUS_REFUNDING = 6` and `STATUS_REFUNDED = 7`
- Updated `STATUS_MAP` and `getStatusName()` methods

### Task 2: Create Refund Entities and Mappers
**Files:**
- `MallRefund.java` - refund application entity (orderId, refundNo, refundType, refundAmount, status, etc.)
- `MallRefundItem.java` - refund item entity (refundId, orderItemId, skuId, goodsId, quantity)
- `MallRefundMapper.java` - extends BaseMapper
- `MallRefundItemMapper.java` - extends BaseMapper

### Task 3: Create RefundApplyDTO
**Files:** `RefundApplyDTO.java`
- Contains orderId, refundType, refundAmount, reason, evidenceImages

### Task 4: Create RefundState Enum and IRefundService
**Files:**
- `RefundState.java` - state machine enum (PENDING_AUDIT, AUDIT_PASSED, AUDIT_REJECTED, REFUNDING, REFUND_SUCCESS, REFUND_FAILED)
- `IRefundService.java` - interface with user and admin methods
- `RefundServiceImpl.java` - implementation with idempotency check and Redis distributed lock

### Task 5: Add processRefund to IPayService
**Files:**
- `IPayService.java` - added `processRefund(Long orderId, BigDecimal refundAmount, String refundNo)` method
- `PayServiceImpl.java` - implemented WeChat refund API call with idempotency via refund_no

### Task 6: Add restoreStockOnRefund to IStockService
**Files:**
- `IStockService.java` - added `restoreStockOnRefund(Long orderId)` method
- `StockServiceImpl.java` - implemented stock restoration with operationType=5 in MallStockLog

### Task 7: Create RefundController
**Files:** `RefundController.java`
- User endpoints: POST /refund, POST /{id}/cancel, GET /list, GET /{id}
- Admin endpoints: GET /admin/list, POST /admin/{id}/approve, POST /admin/{id}/reject

### Task 8: Database Migration
**Tables created:** mall_refund, mall_refund_item

## Commits

| Hash | Message |
|------|---------|
| 7ef71fcb3 | feat(mall-center): complete Phase 5 refund and Phase 6 order enhancements |
| 7f279ad6c | feat(mall-center): complete marketing module (MARKETING-01~09) |

## Files Created/Modified

| File | Change |
|------|--------|
| MallOrder.java | Modified - add STATUS_REFUNDING=6, STATUS_REFUNDED=7 |
| MallRefund.java | Created |
| MallRefundItem.java | Created |
| MallRefundMapper.java | Created |
| MallRefundItemMapper.java | Created |
| RefundApplyDTO.java | Created |
| RefundState.java | Created |
| IRefundService.java | Created |
| RefundServiceImpl.java | Created |
| RefundController.java | Created |
| AdminRefundController.java | Created |
| IPayService.java | Modified - add processRefund |
| PayServiceImpl.java | Modified - implement WeChat refund |
| IStockService.java | Modified - add restoreStockOnRefund |
| StockServiceImpl.java | Modified - implement stock restoration |

## Verification

- **Compilation:** `mvn compile -pl zlt-business/mall-center -am -q` - PASSED
- Refund state machine transitions verified
- Idempotency via refund_no unique key + Redis distributed lock

## Deviations from Plan

None - plan executed as written.

## Known Stubs

None

---
*Generated: 2026-05-09*
