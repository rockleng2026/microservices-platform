---
phase: 12
plan: MINI-09
subsystem: mall-mini-program
tags: [mini-program, user-center, coupons, points, favorites, integration]
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
    - path: zlt-business/mall-center/src/main/java/com/central/mall/controller/MemberController.java
      provides: Backend member API endpoints: /info, /update, /points/log, /coupons, /favorites
  affects: []
tech_stack:
  added:
    - MallUserFavorite entity for user favorites persistence
    - IFavoriteService for favorites CRUD
    - Backend API transformations for frontend compatibility
  patterns:
    - API response transformation to match frontend TypeScript interfaces
    - Pagination support for favorites and points log
key_files:
  created:
    - mall-mini-program/src/pages/coupons/index.vue
    - mall-mini-program/src/pages/points/index.vue
    - mall-mini-program/src/pages/favorites/index.vue
    - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallUserFavorite.java
    - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallUserFavoriteMapper.java
    - zlt-business/mall-center/src/main/java/com/central/mall/service/IFavoriteService.java
    - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/FavoriteServiceImpl.java
  modified:
    - mall-mini-program/src/services/user.ts
    - mall-mini-program/src/pages/user/index.vue
    - mall-mini-program/src/pages.json
    - zlt-business/mall-center/src/main/java/com/central/mall/controller/MemberController.java
    - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/MarketingServiceImpl.java
decisions:
  - decision: Add points alias in getMemberInfo response
    rationale: Frontend expects points field but backend returns balance
    outcome: Added points = balance as alias for frontend compatibility
  - decision: Create MallUserFavorite entity instead of reusing existing tables
    rationale: Favorites is a separate concern from orders/coupons, needs dedicated table
    outcome: New mall_user_favorite table with user_id, goods_id, goodsName, price, image
  - decision: Transform coupon and points responses in backend
    rationale: Frontend TypeScript interfaces expect specific field names and formats
    outcome: Backend transforms internal entity format to frontend-compatible format
metrics:
  duration: ~15 minutes
  completed: "2026-05-19"
---

# Phase 12 Plan MINI-09-INTEGRATION: Backend Integration Summary

Backend integration for mini-program personal center - verifying and fixing API endpoints to match frontend expectations.

## One-liner

Backend APIs fully integrated with mini-program personal center: member info, points log, coupons, and favorites.

## Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Integrate member/coupons/favorites APIs | a20e5c455 | MemberController.java, MarketingServiceImpl.java, MallUserFavorite*.java, IFavoriteService.java, FavoriteServiceImpl.java |
| 2 | Add points alias fix | ede93ad71 | MarketingServiceImpl.java |

## Completed Tasks

**Task 1: Integrate member/coupons/favorites APIs**
- Added `/api/mall/member/coupons` endpoint returning transformed coupon list
- Added `/api/mall/member/favorites` endpoint for favorites list with pagination
- Added `/api/mall/member/favorites/{id}` DELETE endpoint for remove
- Created MallUserFavorite entity with user_id, goodsId, goodsName, price, image, createTime
- Created MallUserFavoriteMapper for database access
- Created IFavoriteService with getUserFavorites(), addFavorite(), removeFavorite()
- Created FavoriteServiceImpl implementing IFavoriteService
- getMemberInfo now includes nickname, avatar, phone, level from MallMember table
- getUserCouponList transforms internal entity to frontend format (type, status as strings)
- getPointsLog transforms MallPointsLog to frontend format (type as "earn"/"deduct")

**Task 2: Add points alias fix**
- getMemberInfo response now includes both `balance` and `points` fields
- Frontend expects `points` for balance display

## Deviations from Plan

None - plan executed exactly as written.

## Threat Flags

None.

## Known Stubs

None.

## Self-Check: PASSED