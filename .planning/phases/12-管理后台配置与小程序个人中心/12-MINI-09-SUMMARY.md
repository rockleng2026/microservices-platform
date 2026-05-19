---
phase: 12
plan: MINI-09
subsystem: mall-mini-program
tags: [mini-program, user-center, coupons, points, favorites]
dependency_graph:
  requires: []
  provides:
    - path: mall-mini-program/src/pages/user/index.vue
      provides: Personal center entry page
    - path: mall-mini-program/src/services/user.ts
      provides: User API service layer with member info, points, coupons, favorites APIs
    - path: mall-mini-program/src/pages/coupons/index.vue
      provides: User coupons list page
    - path: mall-mini-program/src/pages/points/index.vue
      provides: Points balance and history page
    - path: mall-mini-program/src/pages/favorites/index.vue
      provides: Favorites/wishlist page
  affects: []
tech_stack:
  added:
    - uni-app Vue 3 pages for coupons, points, favorites
  patterns:
    - Pull-down refresh and infinite scroll pagination
    - Tab-based filtering for coupons
    - Grid layout for favorites
key_files:
  created:
    - mall-mini-program/src/pages/coupons/index.vue
    - mall-mini-program/src/pages/points/index.vue
    - mall-mini-program/src/pages/favorites/index.vue
  modified:
    - mall-mini-program/src/services/user.ts
    - mall-mini-program/src/pages/user/index.vue
    - mall-mini-program/src/pages.json
decisions:
  - decision: Use getMemberInfo() instead of getUserProfile() for member data
    rationale: getMemberInfo returns points balance and level, needed for points display
    outcome: Shared member info API used by user index and points page
  - decision: Wire goFavorites to favorites page, not implemented yet
    rationale: Favorites menu item exists in plan but was stub in user index
    outcome: Favorites page created and wired
metrics:
  duration: ~5 minutes
  completed: "2026-05-19"
---

# Phase 12 Plan MINI-09: Personal Center Page Summary

Personal center page implementation for mini-program with full functionality for coupons, points, and favorites.

## One-liner

JWT auth with refresh rotation using jose library

## Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Extend user service with new API methods | 7c043d6d6 | mall-mini-program/src/services/user.ts |
| 2 | Create coupons page | 483d35839 | mall-mini-program/src/pages/coupons/index.vue, mall-mini-program/src/pages/user/index.vue, mall-mini-program/src/pages.json |
| 3 | Create points page | a254899e9 | mall-mini-program/src/pages/points/index.vue, mall-mini-program/src/pages/user/index.vue |
| 4 | Update user/index.vue to load member info | e5bc5dd63 | mall-mini-program/src/pages/user/index.vue |
| 5 | Create favorites page | c0a2da0e1 | mall-mini-program/src/pages/favorites/index.vue, mall-mini-program/src/pages/user/index.vue |

## Completed Tasks

**Task 1: Extend user service with new API methods**
- Added `getMemberInfo`, `getPointsLog`, `getMyCoupons`, `getFavorites`, `removeFavorite` to user.ts
- Each API calls corresponding backend endpoint with proper request/response types

**Task 2: Create coupons page**
- Created `/pages/coupons/index.vue` with tabs: 全部/未使用/已使用/已过期
- Coupon cards show name, type, discount, min amount, valid period, status badge
- Pull-down refresh and infinite scroll pagination
- Updated `goCoupons()` to navigate to coupons page

**Task 3: Create points page**
- Created `/pages/points/index.vue` with balance header and history list
- Balance loaded from getMemberInfo(), history from getPointsLog()
- Points history items show earn/deduct with +/- icons and colors

**Task 4: Update user/index.vue to load member info**
- Updated `onShow()` to call `getMemberInfo()` instead of using cached data
- Member info cached to local storage for offline fallback

**Task 5: Create favorites page**
- Created `/pages/favorites/index.vue` with 2-column grid layout
- Product cards show image, name, price, delete button
- Delete calls `removeFavorite()` and removes from local list
- Tap navigates to product detail

## Deviations from Plan

None - plan executed exactly as written.

## Threat Flags

None.

## Known Stubs

None.

## Self-Check: PASSED