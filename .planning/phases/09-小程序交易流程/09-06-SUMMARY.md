---
phase: "09"
plan: "06"
slug: "小程序交易流程"
type: "summary"
tags: ["mini-program", "payment", "order", "wechat-jsapi"]
dependency_graph:
  requires:
    - "09-02"
  provides:
    - "MINI-10-01"
    - "MINI-10-02"
    - "MINI-10-03"
    - "MINI-10-04"
    - "MINI-10-05"
  affects:
    - "mall-mini-program/src/services/payment.ts"
    - "mall-mini-program/src/services/order.ts"
    - "mall-mini-program/src/config/api.ts"
tech_stack:
  added:
    - "WeChat JSAPI payment integration"
    - "wx.requestPayment parameter mapping"
    - "Order CRUD service layer"
  patterns:
    - "Backend timestamp -> timeStamp mapping (capital S)"
    - "prepay_id formatting as package field"
    - "Promise-based wx.requestPayment wrapper"
key_files:
  created:
    - path: "mall-mini-program/src/services/payment.ts"
      description: "WeChat JSAPI payment service with createPayment and getOrderStatus"
  modified:
    - path: "mall-mini-program/src/services/order.ts"
      description: "Added createOrder function and OrderCreateParams interface"
    - path: "mall-mini-program/src/config/api.ts"
      description: "Already contained all required endpoints (no changes needed)"
decisions:
  - id: "D-11"
    description: "支付流程：提交订单 -> 跳转收银台 -> 前端调 /pay/create 获取 prepay_id -> 调 wx.requestPayment"
  - id: "D-12"
    description: "支付结果：专门的支付结果页展示成功/失败状态"
metrics:
  duration: "PT5M"
  completed_date: "2026-05-09T04:02:16Z"
---

# Phase 09 Plan 06 Summary: 支付与订单服务模块

## One-liner

WeChat JSAPI payment service with correct parameter mapping and order CRUD service for mini-program transaction flow.

## Completed Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Create payment.ts with WeChat JSAPI flow | fb8114209 | mall-mini-program/src/services/payment.ts |
| 2 | Add createOrder to order.ts service | f58930e75 | mall-mini-program/src/services/order.ts |
| 3 | Verify config/api.ts endpoints | N/A (already complete) | mall-mini-program/src/config/api.ts |

## What Was Built

### Task 1: payment.ts Service (fb8114209)

New file `mall-mini-program/src/services/payment.ts` providing:

- **`createPayment(orderId: number): Promise<'success' | 'fail' | 'cancel'>`**
  - POST `/api/mall/pay/create` with `{ orderId }`
  - Maps backend response to wx.requestPayment params:
    - `timestamp` (backend) -> `timeStamp` (WeChat, capital S)
    - `nonceStr` (backend) -> `nonceStr` (WeChat, same)
    - `prepay_id` (backend) -> `prepay_id=${prepay_id}` (package field)
    - `signType` and `paySign` pass through directly
  - Calls `wx.requestPayment` with mapped params
  - Returns `'success'` on success, `'cancel'` if user cancelled, `'fail'` otherwise

- **`getOrderStatus(orderId: number): Promise<string>`**
  - GET `/api/mall/order/{orderId}` returns order status
  - Used for retry payment scenarios

- **Exported interfaces:**
  - `WeChatPayParams` - WeChat JSAPI payment parameters
  - `PayCreateResponse` - Backend /pay/create response

### Task 2: order.ts Enhancement (f58930e75)

Updated `mall-mini-program/src/services/order.ts` to add:

- **`createOrder(params: OrderCreateParams): Promise<Order>`** - POST to /order/create
- **`OrderCreateParams` interface** with `skuIds`, `addressId`, `couponId?`, `remark?`
- Re-export of `ORDER_CREATE`, `ORDER_LIST`, `ORDER_DETAIL` constants

Existing functions preserved:
- `getOrderList(status?, page, pageSize)` - GET /order/list
- `getOrderDetail(orderId)` - GET /order/{orderId}
- `cancelOrder(orderId)` - DELETE /order/{orderId}
- `confirmReceipt(orderId)` - PUT /order/{orderId}/confirm

### Task 3: config/api.ts (No Changes)

All required endpoints were already present in `api.ts`:
- `ORDER_CREATE`, `ORDER_LIST`, `ORDER_DETAIL`, `PAY_CREATE`
- `ADDRESS_LIST`, `COUPON_LIST`, `REFUND_APPLY`, `REFUND_DETAIL`

## Deviations from Plan

### Rule 2 - Auto-added: ORDER_CREATE import in order.ts
- **Found during:** Task 2
- **Issue:** order.ts imported ORDER_LIST and ORDER_DETAIL but not ORDER_CREATE
- **Fix:** Added ORDER_CREATE to imports and re-exports
- **Files modified:** mall-mini-program/src/services/order.ts
- **Commit:** f58930e75

### Task 3 - No-op: API endpoints already existed
- **Finding:** All 8 required endpoints were already present in config/api.ts
- **Action:** No changes made - task marked complete
- **Verification:** Grep confirmed all ORDER_CREATE, ORDER_LIST, ORDER_DETAIL, PAY_CREATE, ADDRESS_LIST, COUPON_LIST, REFUND_APPLY, REFUND_DETAIL present

## Verification Results

- `createPayment` function calls POST to PAY_CREATE endpoint
- `wx.requestPayment` invoked with correct parameter mapping
- `timeStamp` correctly mapped from backend `timestamp` field
- `package` field formatted as `prepay_id=${prepay_id}`
- Payment result callbacks return 'success' | 'fail' | 'cancel'
- `createOrder` function POSTs to ORDER_CREATE with proper params
- All 5 order functions exported: createOrder, getOrderList, getOrderDetail, cancelOrder, confirmReceipt

## Requirements Satisfied

| Requirement | Description | Status |
|------------|-------------|--------|
| MINI-10-01 | createPayment initiates WeChat JSAPI payment | Done |
| MINI-10-02 | /pay/create called with orderId, wx.requestPayment invoked | Done |
| MINI-10-03 | Payment result determines success/fail redirect | Done |
| MINI-10-04 | Payment callback updates order status (backend handles) | Done |
| MINI-10-05 | Retry payment fetches fresh payment params via createPayment | Done |

## Self-Check: PASSED

- [x] payment.ts created with createPayment and getOrderStatus
- [x] createPayment POSTs to /pay/create and calls wx.requestPayment
- [x] Correct parameter mapping: timestamp -> timeStamp, prepay_id -> package
- [x] Payment callbacks handled: 'success'/'fail'/'cancel'
- [x] order.ts updated with createOrder and OrderCreateParams
- [x] All 5 order functions exported
- [x] config/api.ts verified - all endpoints present
- [x] Both tasks committed with proper commit messages
