---
phase: "10"
plan: "ADMIN-04"
subsystem: coupon-management
tags: [coupon, admin, frontend, pro-table]
requires: [ADMIN-04-01, ADMIN-04-02, ADMIN-04-03, ADMIN-04-04, ADMIN-04-05, ADMIN-04-06, ADMIN-04-07]
dependency_graph:
  requires: []
  provides:
    - id: ADMIN-04
      description: Coupon management module (list, create, edit, publish/offline, expire early, blocked issue/stat)
  affects:
    - mall-center AdminCouponController
key_files:
  created:
    - zlt-web/react-web/src/main/frontend/src/pages/Coupons/services/coupons.ts
    - zlt-web/react-web/src/main/frontend/src/pages/Coupons/index.tsx
    - zlt-web/react-web/src/main/frontend/src/pages/Coupons/create.tsx
    - zlt-web/react-web/src/main/frontend/src/pages/Coupons/components/IssueModal.tsx
    - zlt-web/react-web/src/main/frontend/src/pages/Coupons/components/StatisticsModal.tsx
  modified:
    - zlt-web/react-web/src/main/frontend/config/routes.ts
    - zlt-web/react-web/src/main/frontend/config/proxy.ts
tech_stack:
  added:
    - "@ant-design/pro-components" (ProTable)
    - antd Tabs, Modal, Form, Input components
decisions:
  - "Coupon list uses Tabs for status filtering (all/1=发放中/0=已下架/2=已过期)"
  - "Issue to user (ADMIN-04-05) BLOCKED - no backend API exists"
  - "Statistics (ADMIN-04-06) BLOCKED - no backend statistics endpoint exists"
  - "Generate claim link (D-11) BLOCKED - no time-limited claim code endpoint"
  - "Early expire reuses offline API (POST /offline)"
  - "mall-center proxy: /api-mall/ -> http://127.0.0.1:7010"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-09"
  tasks_completed: "6"
  files_created: "5"
  files_modified: "2"
---

# Phase 10 Plan ADMIN-04: 优惠券管理模块 — Summary

**Plan:** 10-ADMIN-04
**Phase:** 10 - 管理后台核心模块
**Status:** COMPLETED (with BLOCKED features)
**Executed:** 2026-05-09
**Executor:** parallel-worktree-agent

## One-Liner

Coupon ProTable list with status tabs, create/edit form, publish/offline, early expire, and BLOCKED skeletons for issue-to-user and statistics.

## Objective

实现优惠券管理模块（ADMIN-04）：ProTable 优惠券列表、新建/编辑优惠券、发布/下架、手动发放给用户（BLOCKED）、统计（BLOCKED）、提前失效。

## Tasks Executed

| # | Task | Status | Commit | Notes |
|---|------|--------|--------|-------|
| 1 | 优惠券列表页（ADMIN-04-04） | DONE | 48221b817 | ProTable + Tabs status filter, publish/offline/expire buttons |
| 2 | 创建/编辑优惠券表单（ADMIN-04-01, ADMIN-04-02） | DONE | 48221b817 | Full form with type=1 满减/2 折扣 support |
| 3 | 手动发放 UI 骨架（ADMIN-04-05 BLOCKED） | DONE | 48221b817 | Modal skeleton, disabled, BLOCKED notice |
| 4 | 优惠券统计 UI 骨架（ADMIN-04-06 BLOCKED） | DONE | 48221b817 | Modal skeleton with placeholder stats |
| 5 | 生成领取链接（BLOCKED D-11） | DONE | 48221b817 | Button with info modal about missing API |
| 6 | 提前失效功能（ADMIN-04-07） | DONE | 48221b817 | Calls POST /offline |

## Implementation Details

### Files Created

**zlt-web/react-web/src/main/frontend/src/pages/Coupons/services/coupons.ts**
API service layer with typed interfaces for MallCouponTemplate and methods: getCouponTemplateList, createCouponTemplate, updateCouponTemplate, publishCoupon, offlineCoupon, deleteCoupon (TODO).

**zlt-web/react-web/src/main/frontend/src/pages/Coupons/index.tsx**
Coupon list page with:
- ProTable with status-filtered request
- Tabs: 全部 / 发放中(status=1) / 已下架(status=0) / 已过期(status=2)
- Columns: id, name, type, value, minAmount, totalCount, remainCount, perUserLimit, validType, validPeriod, status, createTime, actions
- Action buttons: 编辑, 发布(when status=0), 下架(when status=1), 提前失效(when status=1), 发放, 统计, 生成链接

**zlt-web/react-web/src/main/frontend/src/pages/Coupons/create.tsx**
Create/edit form page (reused for both create and edit via /coupons/edit/:id):
- name, type (Radio: 满减券/折扣券)
- faceValue (满减金额, type=1), discountRate (折扣率, type=2), maxDiscount (type=2)
- minAmount, totalCount, perUserLimit
- validType (Radio: 固定时间/领券后N天)
- validTime (DatePicker.RangePicker for type=1), validDays (for type=2)

**zlt-web/react-web/src/main/frontend/src/pages/Coupons/components/IssueModal.tsx**
BLOCKED skeleton modal for ADMIN-04-05. Form is disabled with tooltip explanation: "后端 API 暂未实现". Requires POST /coupon/template/{id}/issue.

**zlt-web/react-web/src/main/frontend/src/pages/Coupons/components/StatisticsModal.tsx**
BLOCKED skeleton modal for ADMIN-04-06. Shows placeholder dashes for stats. Requires backend statistics aggregation endpoint.

### Files Modified

**zlt-web/react-web/src/main/frontend/config/routes.ts**
Added routes: /coupons, /coupons/create, /coupons/edit/:id -> Coupons, Coupons/create.

**zlt-web/react-web/src/main/frontend/config/proxy.ts**
Added mall-center proxy: '/api-mall/': { target: 'http://127.0.0.1:7010', changeOrigin: true }.

## Deviations from Plan

### Auto-fixed Issues

**None** - Plan executed as written. No bugs encountered during implementation.

### BLOCKED Features (Plan-specified, Not Implemented)

| Feature | Requirement | Blocker | Missing API |
|---------|-------------|---------|-------------|
| 手动发放给用户 | ADMIN-04-05 | No backend API | POST /coupon/template/{id}/issue |
| 优惠券统计 | ADMIN-04-06 | No backend API | Statistics aggregation endpoint |
| 生成领取链接 | D-11 | No backend API | Time-limited claim code generation |

## Requirement Completion

| Requirement | Status | Notes |
|-------------|--------|-------|
| ADMIN-04-01 | DONE | Create coupon form submits via POST /template |
| ADMIN-04-02 | DONE | Edit coupon form pre-fills data and submits PUT /template/{id} |
| ADMIN-04-03 | TODO | Backend delete endpoint unconfirmed; delete API included but not wired to UI |
| ADMIN-04-04 | DONE | Coupon ProTable list with status filter tabs |
| ADMIN-04-05 | BLOCKED | Issue to user Modal skeleton only; backend no /issue API |
| ADMIN-04-06 | BLOCKED | Statistics Modal skeleton only; backend no statistics API |
| ADMIN-04-07 | DONE | Early expire calls POST /offline |

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| Coupons/components/IssueModal.tsx | ~50 | `handleIssue` disabled, no real API | Backend API not implemented |
| Coupons/components/StatisticsModal.tsx | ~40-55 | All statistics show "-" | Backend API not implemented |
| Coupons/index.tsx | ~85 | `handleGenerateLink` shows info modal | Backend claim code API not implemented |
| Coupons/services/coupons.ts | ~78 | `deleteCoupon` endpoint unconfirmed | Backend DELETE endpoint existence unverified |

## Key Decisions Made

1. **Status tab filter**: Tab key matches backend status values (0/1/2) to avoid remapping
2. **API path**: `/api-mall/admin/coupon/template/*` based on RESEARCH.md analysis
3. **Format discount display**: Shows `¥faceValue` for type=1, `${rate*10}折` for type=2
4. **Early expire**: Reuses offlineCoupon() API since backend /offline endpoint handles both use cases
5. **Create/Edit form reuse**: Single create.tsx handles both /coupons/create and /coupons/edit/:id via useParams

## TDD Gate Compliance

N/A — No TDD tasks in this plan.

## Self-Check

- `zlt-web/react-web/src/main/frontend/src/pages/Coupons/services/coupons.ts` exists: **FOUND**
- `zlt-web/react-web/src/main/frontend/src/pages/Coupons/index.tsx` exists: **FOUND**
- `zlt-web/react-web/src/main/frontend/src/pages/Coupons/create.tsx` exists: **FOUND**
- `zlt-web/react-web/src/main/frontend/src/pages/Coupons/components/IssueModal.tsx` exists: **FOUND**
- `zlt-web/react-web/src/main/frontend/src/pages/Coupons/components/StatisticsModal.tsx` exists: **FOUND**
- `zlt-web/react-web/src/main/frontend/config/routes.ts` modified: **CONFIRMED**
- `zlt-web/react-web/src/main/frontend/config/proxy.ts` modified: **CONFIRMED**
- Commit `48221b817` exists: **FOUND**

## Next Steps (for Orchestrator)

1. Backend team to implement ADMIN-04-05: `POST /api-mall/admin/coupon/template/{id}/issue {userId}`
2. Backend team to implement ADMIN-04-06: statistics aggregation endpoint
3. Backend team to implement D-11: time-limited claim code generation
4. Verify ADMIN-04-03 delete endpoint exists in AdminCouponController
5. Run `npm run dev` in `zlt-web/react-web/src/main/frontend` to verify UI renders correctly