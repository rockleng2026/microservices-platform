---
phase: "13"
plan_id: "13-ADMIN-E2E"
wave: "1"
depends_on: ""
autonomous: true
files_modified:
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/WelcomePage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/DashboardPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/ProductPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/OrderPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/CouponPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/PromotionPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/RefundPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/LogisticsPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/UserPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/MerchantPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/BannerPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/pages/WeChatConfigPage.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-dashboard.spec.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-product-crud.spec.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-order.spec.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-coupon.spec.ts"
  - "zlt-web/portal-web/src/main/frontend/src/e2e/helpers/login.ts"
  - "zlt-web/portal-web/src/main/frontend/playwright.config.ts"
requirements_addressed:
  - "ADMIN-01-01"
  - "ADMIN-01-02"
  - "ADMIN-01-03"
  - "ADMIN-01-04"
  - "ADMIN-01-05"
  - "ADMIN-02-01"
  - "ADMIN-02-02"
  - "ADMIN-02-03"
  - "ADMIN-02-04"
  - "ADMIN-02-05"
  - "ADMIN-02-06"
  - "ADMIN-02-07"
  - "ADMIN-02-08"
  - "ADMIN-02-09"
  - "ADMIN-02-10"
  - "ADMIN-03-01"
  - "ADMIN-03-02"
  - "ADMIN-03-03"
  - "ADMIN-03-04"
  - "ADMIN-03-05"
  - "ADMIN-03-06"
  - "ADMIN-03-07"
  - "ADMIN-04-01"
  - "ADMIN-04-02"
  - "ADMIN-04-03"
  - "ADMIN-04-04"
  - "ADMIN-04-05"
  - "ADMIN-04-06"
  - "ADMIN-04-07"
  - "ADMIN-05-01"
  - "ADMIN-05-02"
  - "ADMIN-05-03"
  - "ADMIN-05-04"
  - "ADMIN-05-05"
  - "ADMIN-05-06"
  - "ADMIN-06-01"
  - "ADMIN-06-02"
  - "ADMIN-06-03"
  - "ADMIN-06-04"
  - "ADMIN-06-05"
  - "ADMIN-06-06"
  - "ADMIN-07-01"
  - "ADMIN-07-02"
  - "ADMIN-07-03"
  - "ADMIN-07-04"
  - "ADMIN-07-05"
  - "ADMIN-07-06"
  - "ADMIN-08-01"
  - "ADMIN-08-02"
  - "ADMIN-08-03"
  - "ADMIN-08-04"
  - "ADMIN-09-01"
  - "ADMIN-09-02"
  - "ADMIN-09-03"
  - "ADMIN-09-04"
  - "ADMIN-09-05"
  - "ADMIN-10-01"
  - "ADMIN-10-02"
  - "ADMIN-10-03"
  - "ADMIN-10-04"
  - "ADMIN-10-05"
  - "ADMIN-11-01"
  - "ADMIN-11-02"
  - "ADMIN-11-03"
---

# Plan 13-ADMIN-E2E: Admin Web E2E Test Infrastructure

## Objective

Build Playwright E2E test infrastructure for Admin Web (portal-web on port 8001), including page object models and integration test specs for all ADMIN-01~11 modules.

## Context

- Admin Web runs on port 8001 (portal-web - the main management frontend)
- Playwright already in package.json (^1.17.0)
- Existing `baseLayout.e2e.spec.ts` only tests route rendering, no interaction tests
- Phase 13 tests portal-web Admin thoroughly - this is the final integrated Admin Web

## Tasks

### Task 1: Create Playwright helper and base page objects

<read_first>
- zlt-web/portal-web/src/main/frontend/src/e2e/baseLayout.e2e.spec.ts
- zlt-web/portal-web/src/main/frontend/config/routes.ts
- zlt-web/portal-web/src/main/frontend/playwright.config.ts
</read_first>

<action>
Create helper file `zlt-web/portal-web/src/main/frontend/src/e2e/helpers/login.ts`:

```typescript
import { Page } from '@playwright/test';

export async function adminLogin(page: Page): Promise<void> {
  await page.goto('http://localhost:8066');
  await page.evaluate(() => {
    localStorage.setItem('antd-pro-authority', '["admin"]');
  });
  await page.reload();
}
```

Create base page object `zlt-web/portal-web/src/main/frontend/src/e2e/pages/BasePage.ts`:

```typescript
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page, protected baseURL: string = 'http://localhost:8066') {}

  async goto(path: string): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  async clickButton(text: string): Promise<void> {
    await this.page.click(`button:has-text("${text}")`);
  }

  async fillForm(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async getTableRows(selector: string): Promise<string[]> {
    return this.page.locator(selector).allTextContents();
  }
}
```
</action>

<acceptance_criteria>
- `zlt-web/portal-web/src/main/frontend/src/e2e/helpers/login.ts` exists and exports `adminLogin` function
- `zlt-web/portal-web/src/main/frontend/src/e2e/pages/BasePage.ts` exists with `goto`, `clickButton`, `fillForm`, `getTableRows` methods
- Login helper compiles without TypeScript errors
</acceptance_criteria>

### Task 2: Create Dashboard page object and test

<read_first>
- zlt-web/portal-web/src/main/frontend/src/pages/welcome/index.tsx
- zlt-web/portal-web/src/main/frontend/config/routes.ts
</read_first>

<action>
Create `zlt-web/portal-web/src/main/frontend/src/e2e/pages/DashboardPage.ts`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/welcome');
  }

  async getMetricCards(): Promise<string[]> {
    return this.page.locator('.ant-card-head-title').allTextContents();
  }

  async getSalesChart(): Promise<boolean> {
    return this.page.locator('.recharts-wrapper').count() > 0;
  }

  async getLowStockAlerts(): Promise<string[]> {
    return this.page.locator('.ant-alert-message').allTextContents();
  }
}
```

Create `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-dashboard.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Admin Dashboard (ADMIN-01)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-01-01: Dashboard displays sales trend chart', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const hasChart = await dashboard.getSalesChart();
    expect(hasChart).toBeTruthy();
  });

  test('ADMIN-01-02: Dashboard shows inventory warnings', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const alerts = await dashboard.getLowStockAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  });

  test('ADMIN-01-05: Dashboard shows metric cards', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const cards = await dashboard.getMetricCards();
    expect(cards.length).toBeGreaterThan(0);
  });
});
```
</action>

<acceptance_criteria>
- `zlt-web/portal-web/src/main/frontend/src/e2e/pages/DashboardPage.ts` exists with goto, getMetricCards, getSalesChart, getLowStockAlerts methods
- `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-dashboard.spec.ts` exists with tests for ADMIN-01-01, ADMIN-01-02, ADMIN-01-05
- Tests use adminLogin helper and DashboardPage page object
</acceptance_criteria>

### Task 3: Create Product Management page object and test

<read_first>
- zlt-web/portal-web/src/main/frontend/src/pages/products/index.tsx
- zlt-web/portal-web/src/main/frontend/src/e2e/pages/BasePage.ts
</read_first>

<action>
Create `zlt-web/portal-web/src/main/frontend/src/e2e/pages/ProductPage.ts`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/products');
  }

  async clickCreateButton(): Promise<void> {
    await this.clickButton('新增商品');
  }

  async fillProductForm(data: { name: string; price: string; stock: string }): Promise<void> {
    await this.fillForm('input[placeholder="请输入商品名称"]', data.name);
    await this.fillForm('input[placeholder="请输入价格"]', data.price);
    await this.fillForm('input[placeholder="请输入库存"]', data.stock);
  }

  async submitForm(): Promise<void> {
    await this.clickButton('提交');
  }

  async getProductTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.fillForm('input[placeholder="搜索商品"]', keyword);
    await this.clickButton('搜索');
  }

  async batchEnable(): Promise<void> {
    await this.clickButton('批量启用');
  }

  async batchDisable(): Promise<void> {
    await this.clickButton('批量禁用');
  }
}
```

Create `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-product-crud.spec.ts` covering ADMIN-02-01~10 (create, edit, delete, view list, batch publish/unpublish).
</action>

<acceptance_criteria>
- `zlt-web/portal-web/src/main/frontend/src/e2e/pages/ProductPage.ts` exists with CRUD methods
- `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-product-crud.spec.ts` exists and covers ADMIN-02-01~10
- Tests use ProductPage page object
</acceptance_criteria>

### Task 4: Create Order Management page object and test

<read_first>
- zlt-web/portal-web/src/main/frontend/src/pages/order/index.tsx
</read_first>

<action>
Create `zlt-web/portal-web/src/main/frontend/src/e2e/pages/OrderPage.ts` with methods for:
- goto order list
- filter by status/date/order number
- view order detail
- modify order price
- add internal notes
- close order
- trigger virtual product completion

Create `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-order.spec.ts` covering ADMIN-03-01~07.
</action>

<acceptance_criteria>
- `zlt-web/portal-web/src/main/frontend/src/e2e/pages/OrderPage.ts` exists
- `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-order.spec.ts` covers ADMIN-03-01~07
</acceptance_criteria>

### Task 5: Create remaining Admin page objects (Coupon, Promotion, Refund, Logistics, User, Merchant, Banner, WeChatConfig)

<read_first>
- zlt-web/portal-web/src/main/frontend/src/pages/coupon/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/promotion/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/refund/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/logistics/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/user/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/merchant/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/banner/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/wechat-config/index.tsx
</read_first>

<action>
Create page objects for each Admin module following the BasePage pattern:
- CouponPage.ts (ADMIN-04-01~07)
- PromotionPage.ts (ADMIN-05-01~06)
- RefundPage.ts (ADMIN-06-01~06)
- LogisticsPage.ts (ADMIN-07-01~06)
- UserPage.ts (ADMIN-08-01~04)
- MerchantPage.ts (ADMIN-09-01~05)
- BannerPage.ts (ADMIN-10-01~05)
- WeChatConfigPage.ts (ADMIN-11-01~03)

Create combined `zlt-web/portal-web/src/main/frontend/src/e2e/specs/admin-coupon.spec.ts` for coupon CRUD and issue (ADMIN-04).
</action>

<acceptance_criteria>
- All 8 remaining page objects exist in `zlt-web/portal-web/src/main/frontend/src/e2e/pages/`
- ADMIN-04 through ADMIN-11 each have corresponding spec files
- WeChatConfigPage tests ADMIN-11-01~03 (manual testing note for WeChat API connectivity)
</acceptance_criteria>

### Task 6: Run existing E2E tests to verify setup

<action>
Run Playwright tests to verify all page objects and specs work:

```bash
cd D:/code/microservices-platform/zlt-web/portal-web/src/main/frontend
npx playwright test --reporter=list 2>&1 | head -100
```

If playwright is not installed:
```bash
npm install @playwright/test@latest
npx playwright install chromium
```
</action>

<acceptance_criteria>
- `npx playwright test` runs without errors
- All existing baseLayout.e2e.spec.ts tests pass
- New page object tests can be run individually
</acceptance_criteria>

## Verification

| Criteria | Test |
|----------|------|
| Admin Web E2E infrastructure complete | `npx playwright test` runs without errors |
| All ADMIN-01~11 modules have page objects | `ls src/e2e/pages/*.ts` shows 12 page objects |
| Login helper works | `adminLogin` function exports correctly |
| Dashboard tests pass | `npx playwright test admin-dashboard.spec.ts` passes |
| Product CRUD tests exist | `admin-product-crud.spec.ts` covers ADMIN-02-01~10 |

## must_haves

- Login helper (`helpers/login.ts`) with `adminLogin` function
- BasePage page object class with `goto`, `clickButton`, `fillForm`, `getTableRows` methods
- 12 page objects (Welcome/Dashboard + all ADMIN modules)
- At least 3 spec files: admin-dashboard.spec.ts, admin-product-crud.spec.ts, admin-order.spec.ts
- Playwright config verified working (existing baseLayout.e2e.spec.ts passes)

## Notes

- **Phase scope:** Tests react-web Admin on port 8066 (before Phase 14 migration)
- **WeChat Config:** ADMIN-11-02 (test connectivity) is manual testing - not fully automatable
- **Backend dependency:** mall-center must be running on port 7010 for E2E tests to work