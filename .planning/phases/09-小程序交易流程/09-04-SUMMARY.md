---
phase: "09"
plan: "04"
subsystem: "mall-mini-program"
tags: [mini-program, order-list, order-detail, vue]
dependency_graph:
  requires:
    - "09-01"
    - "09-03"
  provides:
    - "mall-mini-program/src/pages/order-list/index.vue"
    - "mall-mini-program/src/pages/order-detail/index.vue"
  affects:
    - "mall-mini-program/pages.json"
    - "mall-mini-program/src/config/api.ts"
tech_stack:
  added:
    - "uni-app Vue 3 component (order-list, order-detail)"
    - "TypeScript order service"
  patterns:
    - "scroll-view with refresher-enabled for pull-to-refresh"
    - "scroll-view @scrolltolower for infinite scroll pagination"
    - "status badge color mapping"
    - "uni.setClipboardData for copy functionality"
key_files:
  created:
    - "mall-mini-program/src/services/order.ts"
    - "mall-mini-program/src/pages/order-list/index.vue"
    - "mall-mini-program/src/pages/order-detail/index.vue"
  modified:
    - "mall-mini-program/src/config/api.ts"
    - "mall-mini-program/pages.json"
decisions:
  - "Used scroll-view with refresher-enabled/refresher-triggered for pull-to-refresh (not uni.startPullDownRefresh)"
  - "Status badge colors follow UI-SPEC: orange for pending_payment, blue for paid/shipped, green for delivered/completed, gray for cancelled, red for refunding"
  - "Tab index to status mapping: 0=all, 1=pending_payment, 2=paid, 3=shipped, 4=delivered"
metrics:
  duration_seconds: 222
  completed: "2026-05-09T03:55:20Z"
---

# Phase 09 Plan 04: Order List and Order Detail Pages — Summary

## One-liner

Implemented order list page with 5 tabs (全部/待付款/待发货/待收货/已完成), pull-to-refresh, and load-more pagination; implemented order detail page with status banner, items, address, payment info, logistics, and status-dependent action buttons.

## Completed Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Build order-list/index.vue | 706c47f | order-list/index.vue, order-detail/index.vue, order.ts, api.ts, pages.json |

## What Was Built

### Order List Page (mall-mini-program/src/pages/order-list/index.vue)
- **5 sticky tabs**: 全部 | 待付款 | 待发货 | 待收货 | 已完成
- **Active tab styling**: accent #ff5500 text + 2px bottom border underline
- **Pull-to-refresh**: scroll-view with refresher-enabled/refresher-triggered
- **Load-more pagination**: scroll-view @scrolltolower, 10 items/page
- **Order card** (white, 8px radius):
  - Header: orderNo + copy icon (uni.setClipboardData)
  - Status badge (colored pill): pending_payment=orange, paid/shipped=blue, delivered/completed=green, cancelled=gray, refunding=red
  - Items row: horizontal scroll of 40x40 thumbnails (tap navigates to product-detail)
  - Footer: finalAmount (accent) + created time + action buttons
  - Card tap navigates to order-detail
- **Action buttons**: Cancel (destructive) + Pay (accent) for pending_payment; Confirm Receipt (accent) for delivered
- **API calls**: GET /api/mall/order/list, DELETE /api/mall/order/{id}, PUT /api/mall/order/{id}/confirm

### Order Detail Page (mall-mini-program/src/pages/order-detail/index.vue)
- **Status banner** (top, full-width, gradient colored by status): status text + description
- **Logistics section** (only shipped/delivered): company + tracking number + copy + timeline
- **Order info card**: orderNo + copy button, created time
- **Address section**: receiver name + phone + full address (or "无需收货" for virtual goods)
- **Items section**: 60x60 image + name + specs + price + quantity, tap navigates to product-detail
- **Payment info section**: totalAmount + freightFee + discountAmount + finalAmount (accent bold)
- **Fixed bottom action bar**:
  - Left: "合计: ¥{finalAmount}" (accent)
  - Right buttons (status-dependent):
    - pending_payment: "取消订单" (destructive outline) + "去支付" (accent filled)
    - paid: "等待发货中"
    - shipped: "查看物流" (outline) + "确认收货" (accent filled)
    - delivered/completed: "评价" (outline) + "申请退款" (destructive outline)
    - refunding: "查看退款进度" (outline)

### API Endpoints Added
- `ORDER_LIST = '/api/mall/order/list'`
- `ORDER_DETAIL = '/api/mall/order'`

### Order Service (mall-mini-program/src/services/order.ts)
- Type definitions: Order, OrderItem, Address, LogisticsInfo, OrderListResponse
- TAB_STATUS_MAP for tab index to status filter mapping
- Functions: getOrderList, getOrderDetail, cancelOrder, confirmReceipt

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new security surface introduced.

## Self-Check

- [x] All task files created
- [x] Commits exist (706c47f)
- [x] pages.json updated with order-list and order-detail
- [x] api.ts updated with ORDER_LIST and ORDER_DETAIL

## Verification Commands

```bash
# Check order-list has all 5 tabs
grep "tabs = \['全部', '待付款', '待发货', '待收货', '已完成'\]" mall-mini-program/src/pages/order-list/index.vue

# Check order-detail has all sections
grep "状态banner\|商品信息\|收货信息\|支付信息\|物流信息" mall-mini-program/src/pages/order-detail/index.vue

# Check API endpoints
grep "ORDER_LIST\|ORDER_DETAIL" mall-mini-program/src/config/api.ts
```
