---
phase: "09"
slug: "小程序交易流程"
plan: "03"
subsystem: "mall-mini-program"
tags:
  - "address"
  - "mini-program"
  - "uni-app"
dependency_graph:
  requires: []
  provides:
    - "09-MINI-05-addr-list"
    - "09-MINI-05-addr-edit"
  affects:
    - "pages/checkout"
    - "pages/order-confirm"
tech_stack:
  added:
    - "uni.picker mode=region"
    - "uni.showModal confirm dialogs"
    - "uni.request address CRUD"
  patterns:
    - "Bottom drawer mode via query param"
    - "Form validation before save"
    - "Radio button default selection"
key_files:
  created:
    - "mall-mini-program/src/pages/address/list.vue"
    - "mall-mini-program/src/pages/address/edit.vue"
  modified:
    - "mall-mini-program/src/config/api.ts"
decisions:
  - "Drawer mode detected via `drawer=true` query param, enables reuse from checkout"
  - "Region picker uses uni.picker with mode=region for native feel"
  - "Delete confirm uses uni.showModal with confirmColor #ff4d4f"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-05-09"
---

# Phase 09 Plan 03 Summary: Address Management Pages

## Objective

Implement address list page (address/list.vue) as a bottom drawer and address edit page (address/edit.vue) for add/edit/delete/setDefault address management, used by checkout page.

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Build address/list.vue | `e74de88f5` | `mall-mini-program/src/pages/address/list.vue` |
| 2 | Build address/edit.vue | `e74de88f5` | `mall-mini-program/src/pages/address/edit.vue` |

## What Was Built

### address/list.vue

Address list page with two modes:
- **Standalone mode** (no query param): Full page with nav bar "收货地址" and add button top-right
- **Drawer mode** (`drawer=true`): Bottom sheet style (max-height 60vh, top border-radius 16px) with close button

Features:
- GET `/api/mall/address` to load address list
- Each address card shows: receiverName + phone (bold), full address (gray), default badge if `isDefault === 1`
- Radio button (accent #ff5500) to set default via PUT `/api/mall/address/{id}/default`
- Edit icon navigates to `/pages/address/edit?id={addressId}`
- Delete icon shows confirm dialog then DELETE `/api/mall/address/{id}`
- Tap address item triggers selection callback (drawer mode only)
- Empty state with placeholder icon and hint text

### address/edit.vue

Create/edit address form with:
- Dynamic title: "新增收货地址" or "编辑收货地址" based on presence of `id` query param
- Form fields: receiverName, receiverPhone (11 digit), region picker, detailAddress, isDefault toggle
- Region picker uses `uni.picker({ mode: 'region' })` for native province/city/district selector
- Validation: name required, phone 11 digits, region required, detail required
- PUT `/api/mall/address/{id}` for update, POST `/api/mall/address` for create
- Delete button (only in edit mode) with confirm dialog
- Fixed bottom save button (accent #ff5500, 44px height, border-radius 22px)

### API Config

Added to `mall-mini-program/src/config/api.ts`:
```typescript
export const ADDRESS_LIST = '/api/mall/address'
```

## Deviations from Plan

None - plan executed exactly as written.

## Verification

| Check | Result |
|-------|--------|
| ADDRESS_LIST in list.vue | PASS (11 occurrences) |
| isDefault handling | PASS |
| navigateTo address/edit | PASS |
| uni.picker region in edit.vue | PASS (15 occurrences) |
| receiverName/receiverPhone fields | PASS |
| POST/PUT address endpoints | PASS |

## Self-Check

- [x] `mall-mini-program/src/pages/address/list.vue` exists
- [x] `mall-mini-program/src/pages/address/edit.vue` exists
- [x] `mall-mini-program/src/config/api.ts` updated with ADDRESS_LIST
- [x] Commit `e74de88f5` exists in git history

## TDD Gate Compliance

Not applicable - plan type is "execute", not "tdd".

---

**Plan:** 09-03
**Status:** Complete
**Commits:** `e74de88f5` (address list + edit + API config)