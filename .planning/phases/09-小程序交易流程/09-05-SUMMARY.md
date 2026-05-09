---
phase: "09"
plan: "05"
slug: "小程序交易流程"
subsystem: mall-mini-program
tags: [refund, mini-program, vue, uni-app]
dependency_graph:
  requires: []
  provides: [MINI-08-01, MINI-08-02, MINI-08-03, MINI-08-04, MINI-08-05, MINI-08-06]
  affects: [mall-mini-program/src/pages/refund/apply.vue]
tech_stack:
  added: [uni-app Vue 3 TypeScript]
  patterns: [preset radio reasons, image upload grid, refund status display]
key_files:
  created:
    - mall-mini-program/src/pages/refund/apply.vue
  modified:
    - mall-mini-program/src/config/api.ts
    - mall-mini-program/pages.json
decisions:
  - "Preset refund reasons: 不想要了/商品损坏/发错货/与描述不符/其他 (D-17)"
  - "Image upload limit: max 3 images per D-18"
  - "Cancel button only visible for pending (status=0) refunds (MINI-08-06)"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-09"
  tasks_completed: 1
  files_changed: 3
---

# Phase 09 Plan 05: Refund Application Page Summary

## One-liner
Refund application page with preset reasons, custom text input, image upload (max 3), status display, and cancel functionality.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build refund/apply.vue page | 44b20724a | apply.vue, api.ts, pages.json |

## What Was Built

**Refund Application Page** (`mall-mini-program/src/pages/refund/apply.vue`):

- **Order Info Card** at top showing orderNo, item thumbnails/names/quantities, refund amount (accent color)
- **Preset Reason Radio List**: 不想要了 | 商品损坏 | 发错货 | 与描述不符 | 其他
- **Custom Reason Textarea**: Appears when "其他" is selected, max 200 chars with character counter
- **Image Upload Grid**: Up to 3 images via `uni.chooseImage`, X delete buttons on each thumbnail
- **Submit Button**: POSTs to `/api/mall/refund/apply` with { orderId, reason, images[] }
- **Refund Status Display**: When refund exists, shows status badge (申请中/已通过/已拒绝), amount, time, rejection reason
- **Cancel Button**: Visible only for pending refunds, DELETE to `/api/mall/refund/{id}/cancel`

**API Endpoints Added** (`api.ts`):
```typescript
export const REFUND_APPLY = '/api/mall/refund/apply'
export const REFUND_DETAIL = '/api/mall/refund'
export const REFUND_CANCEL = '/api/mall/refund'
```

**Page Registration** (`pages.json`):
- Added `pages/refund/apply` with title "退款申请"

## Styling (per 08-UI-SPEC)
- Accent: #ff5500 (CTA buttons, prices, selected radio)
- Destructive: #ff4d4f (cancel button, error states)
- Cards: white bg, 8px radius
- Section spacing: 16px
- Submit button: 44px height, border-radius 22px, full width

## Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| MINI-08-01 Refund from order detail | Done | Navigate to apply.vue with orderId query param |
| MINI-08-02 Preset reasons as radio list | Done | 5 options, vertical stack, accent border on selected |
| MINI-08-03 "其他" opens text input | Done | Textarea appears when 其他 selected |
| MINI-08-04 Up to 3 images uploaded | Done | Grid with add/delete, max 3 enforced |
| MINI-08-05 Refund status display | Done | Status badge (申请中/已通过/已拒绝) shown |
| MINI-08-06 Cancel pending refund | Done | DELETE button only for status=0 |

## Deviations from Plan
None - plan executed exactly as written.

## Commits

- `44b20724a` — feat(09-05): add refund application page

## Self-Check: PASSED

- [x] Refund apply page exists: `mall-mini-program/src/pages/refund/apply.vue` — FOUND
- [x] API endpoints added to `mall-mini-program/src/config/api.ts` — FOUND
- [x] Page registered in `mall-mini-program/pages.json` — FOUND
- [x] Commit exists: `44b20724a` — FOUND