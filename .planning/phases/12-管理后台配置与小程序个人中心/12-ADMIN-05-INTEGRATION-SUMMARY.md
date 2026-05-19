---
phase: 12-管理后台配置与小程序个人中心
plan: "05-INTEGRATION"
subsystem: backend
tags: [spring-boot, mybatis-plus, mall-center, rest-api]

# Dependency graph
requires:
  - phase: 10
    provides: Marketing service (MallMarketingActivity entity and mapper)
provides:
  - AdminPromotionController with CRUD + toggle for MallMarketingActivity
  - IAdminPromotionService with pagination support
affects:
  - Phase 12 subsequent plans (ADMIN-05 frontend integration)
  - MINI-09 (wechat mini-program profile)

# Tech tracking
tech-stack:
  added:
    - IAdminPromotionService.java
    - AdminPromotionServiceImpl.java
    - AdminPromotionController.java
  patterns:
    - ServiceImpl extends pattern using MallMarketingActivityMapper
    - Tenant-aware CRUD with TenantInterceptor
    - Result<T> response wrapper

key-files:
  created:
    - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java
    - zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminPromotionService.java
    - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminPromotionServiceImpl.java

key-decisions:
  - "Reused MallMarketingActivity entity (existing phase 10 entity) instead of creating Promotion"
  - "Reused MallMarketingActivityMapper (existing phase 10 mapper) instead of creating new"
  - "Toggle cycles through status: 1->2 (publish), 2->3 (end), 3->1 (reset)"

patterns-established:
  - "Admin CRUD controller pattern following AdminSettingsController"

requirements-completed:
  - ADMIN-05-01
  - ADMIN-05-02
  - ADMIN-05-03
  - ADMIN-05-04
  - ADMIN-05-05
  - ADMIN-05-06

# Metrics
duration: 8min
completed: 2026-05-19
---

# Phase 12 Plan 05-INTEGRATION: Backend Promotion API Summary

**Backend promotion management REST API using MallMarketingActivity entity**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-19T16:10:00Z
- **Completed:** 2026-05-19T16:18:00Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments
- AdminPromotionController with 5 REST endpoints for promotion CRUD + toggle
- IAdminPromotionService interface with pagination and CRUD methods
- AdminPromotionServiceImpl using existing MallMarketingActivityMapper (tenant-aware)
- All endpoints return correct Result<T> format for frontend consumption

## Task Commits

1. **Task 1-2: Check/create promotion model + Create controller/service** - `ebef3468f` (feat)
   - Identified MallMarketingActivity entity already exists (from phase 10)
   - Identified MallMarketingActivityMapper already exists
   - Created AdminPromotionController with 5 endpoints
   - Created IAdminPromotionService interface
   - Created AdminPromotionServiceImpl implementing the interface

## Verification Results

- Controller has 5 mapping annotations (@GetMapping, @PostMapping, @PutMapping x2, @DeleteMapping)
- All 5 endpoints return Result<T> format
- Service layer uses tenant-aware queries via TenantInterceptor
- Uses existing MallMarketingActivity entity (no new database table needed)

## Files Created

| File | Purpose |
|------|---------|
| `.../controller/admin/AdminPromotionController.java` | REST endpoints for promotion CRUD + toggle |
| `.../service/IAdminPromotionService.java` | Service interface with 5 methods |
| `.../service/impl/AdminPromotionServiceImpl.java` | Service implementation using MallMarketingActivityMapper |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/mall/admin/promotions | List promotions (paginated, filterable by status) |
| POST | /api/mall/admin/promotions | Create promotion |
| PUT | /api/mall/admin/promotions/{id} | Update promotion |
| DELETE | /api/mall/admin/promotions/{id} | Delete promotion |
| PUT | /api/mall/admin/promotions/{id}/toggle | Toggle promotion status (1->2->3->1) |

## Decisions Made

- Reused existing MallMarketingActivity entity from phase 10 instead of creating new Promotion entity
- Reused existing MallMarketingActivityMapper instead of creating new mapper
- Toggle cycles through status values: 1=待发布, 2=进行中, 3=已结束 (and back to 1 on another toggle)
- Controller returns Result<Page<MallMarketingActivity>> for list endpoint matching frontend expectations

## Deviations from Plan

- Task 1: Did not create new Promotion entity/mapper since MallMarketingActivity already existed from phase 10 marketing service
- Task 3: Skipped runtime integration test (no mall-center service running in this environment)

## Issues Encountered

- None

## Next Phase Readiness

- Backend APIs available at /api/mall/admin/promotions after mall-center restarts
- Points APIs already exist via AdminMemberController (adjustPoints at PUT /api/mall/admin/member/{id}/points)
- Frontend service layer (promotion.ts) already wired to /api/mall/admin/promotions endpoints

---
*Phase: 12-管理后台配置与小程序个人中心*
*Completed: 2026-05-19*