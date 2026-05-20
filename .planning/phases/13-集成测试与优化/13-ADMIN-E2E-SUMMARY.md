---
phase: "13"
plan_id: "13-ADMIN-E2E"
subsystem: "Admin Web E2E Testing"
tags: ["playwright", "e2e", "testing", "admin", "integration"]
dependency_graph:
  requires: []
  provides: ["ADMIN-01-01", "ADMIN-01-02", "ADMIN-01-03", "ADMIN-01-04", "ADMIN-01-05", "ADMIN-02-01", "ADMIN-02-04", "ADMIN-02-05", "ADMIN-02-08", "ADMIN-02-09", "ADMIN-02-10", "ADMIN-03-01", "ADMIN-03-02", "ADMIN-03-03", "ADMIN-03-04", "ADMIN-03-05", "ADMIN-03-06", "ADMIN-03-07", "ADMIN-04-01", "ADMIN-04-02", "ADMIN-04-03", "ADMIN-04-04", "ADMIN-04-05", "ADMIN-04-06", "ADMIN-04-07", "ADMIN-05-01", "ADMIN-05-02", "ADMIN-05-03", "ADMIN-05-04", "ADMIN-05-05", "ADMIN-05-06", "ADMIN-06-01", "ADMIN-06-02", "ADMIN-06-03", "ADMIN-06-04", "ADMIN-06-05", "ADMIN-06-06", "ADMIN-07-01", "ADMIN-07-02", "ADMIN-07-03", "ADMIN-07-04", "ADMIN-07-05", "ADMIN-07-06", "ADMIN-08-01", "ADMIN-08-02", "ADMIN-08-03", "ADMIN-08-04", "ADMIN-09-01", "ADMIN-09-02", "ADMIN-09-03", "ADMIN-09-04", "ADMIN-09-05", "ADMIN-10-01", "ADMIN-10-02", "ADMIN-10-03", "ADMIN-10-04", "ADMIN-10-05", "ADMIN-11-01", "ADMIN-11-02", "ADMIN-11-03"]
  affects: ["portal-web", "mall-admin"]
tech_stack:
  added: ["@playwright/test@1.60.0"]
  patterns: ["Page Object Model", "E2E Testing", "Playwright"]
key_files:
  created:
    - "zlt-web/portal-web/playwright.config.ts"
    - "zlt-web/portal-web/src/e2e/helpers/login.ts"
    - "zlt-web/portal-web/src/e2e/pages/BasePage.ts"
    - "zlt-web/portal-web/src/e2e/pages/WelcomePage.ts"
    - "zlt-web/portal-web/src/e2e/pages/DashboardPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/ProductPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/OrderPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/CouponPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/PromotionPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/RefundPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/LogisticsPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/StockPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/UserPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/MerchantPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/BannerPage.ts"
    - "zlt-web/portal-web/src/e2e/pages/WeChatConfigPage.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-dashboard.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-product-crud.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-order.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-coupon.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-promotion.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-stock.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-member.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-banner.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-wechat-config.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-refund.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-logistics.spec.ts"
    - "zlt-web/portal-web/src/e2e/specs/admin-merchant.spec.ts"
  modified:
    - "zlt-web/portal-web/package.json"
decisions:
  - "Renamed BasePage.goto() to navigate() to avoid method name conflict with child class goto() methods"
  - "Used async/await pattern for Playwright locator count operations to fix type errors"
  - "Admin Web runs on port 8001 (portal-web)"
  - "WeChat Config connectivity test (ADMIN-11-02) is marked as manual testing due to API credential requirements"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-20"
  tasks_completed: 2
  files_created: 29
  tests_defined: 63
---

# Phase 13 Plan ADMIN-E2E: Admin Web E2E Test Infrastructure Summary

## One-liner

Playwright E2E test infrastructure with 14 page objects and 13 spec files covering all ADMIN-01~11 modules for the Admin Web portal on port 8001.

## What Was Built

### E2E Test Infrastructure for Admin Web (portal-web on port 8001)

- **Login Helper** (`helpers/login.ts`): Simulates admin authentication via localStorage
- **BasePage** (`pages/BasePage.ts`): Foundation page object with `navigate()`, `clickButton()`, `fillForm()`, `getTableRows()`, `waitForSelector()` methods
- **14 Page Objects** covering all ADMIN modules:
  - WelcomePage, DashboardPage, ProductPage, OrderPage, CouponPage, PromotionPage, RefundPage, LogisticsPage, StockPage, UserPage, MerchantPage, BannerPage, WeChatConfigPage
- **13 Spec Files** with 63 test cases covering:
  - ADMIN-01: Dashboard (metric cards, sales chart, page title)
  - ADMIN-02: Product CRUD (list, search, batch publish/unpublish, detail view)
  - ADMIN-03: Order management (status tabs, search, ship, detail)
  - ADMIN-04: Coupon (create, edit, publish, offline, issue, statistics)
  - ADMIN-05: Promotion + member points
  - ADMIN-06: Stock (search, correct, create, history)
  - ADMIN-07: Logistics (CRUD operations)
  - ADMIN-08: Member (search, detail, consumption stats)
  - ADMIN-09: Merchant (list, approve/reject applications)
  - ADMIN-10: Banner (CRUD, drag-sort, enable/disable)
  - ADMIN-11: WeChat Config (load, test connectivity, status)
- **Playwright Config** with chromium, dev server auto-start

## Deviation Documentation

### Auto-fixed Issues

**1. [Rule 1 - Bug] BasePage.goto() naming conflict with child class methods**
- **Found during:** TypeScript compilation check
- **Issue:** Each child page object class had a `goto()` method that called `this.goto()` on BasePage, causing infinite recursion
- **Fix:** Renamed BasePage method to `navigate()` and updated all child classes
- **Files modified:** All 14 page objects
- **Commit:** fc1465536

**2. [Rule 1 - Bug] Async operator error in DashboardPage.getSalesChart()**
- **Found during:** TypeScript compilation
- **Issue:** `this.page.locator(...).count() > 0` was comparing Promise<number> to number without await
- **Fix:** Added proper async/await with separate count variables
- **Files modified:** DashboardPage.ts
- **Commit:** fc1465536

## Key Decisions Made

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Port 8001 for Admin Web | Consistent with existing portal-web configuration | matches .umirc.ts proxy config |
| navigate() vs goto() | Avoid method name conflict with child class goto() | Resolved TypeScript errors |
| WeChat connectivity as manual test | Requires real API credentials | ADMIN-11-02 marked as manual |

## Commits

- **45d441d0e** feat(13-ADMIN-E2E): Add Playwright E2E test infrastructure for Admin Web (29 files)
- **fc1465536** fix(13-ADMIN-E2E): fix BasePage.goto naming conflict and async operator errors (14 files)

## Self-Check: PASSED

All created files exist and commits verified in git log.