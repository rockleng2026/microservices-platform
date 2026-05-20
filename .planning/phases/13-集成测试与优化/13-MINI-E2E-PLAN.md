---
phase: "13"
plan_id: "13-MINI-E2E"
wave: "1"
depends_on: ""
autonomous: true
files_modified:
  - "mall-mini-program/e2e/pages/HomePage.ts"
  - "mall-mini-program/e2e/pages/ProductListPage.ts"
  - "mall-mini-program/e2e/pages/ProductDetailPage.ts"
  - "mall-mini-program/e2e/pages/CartPage.ts"
  - "mall-mini-program/e2e/pages/OrderConfirmPage.ts"
  - "mall-mini-program/e2e/pages/OrderListPage.ts"
  - "mall-mini-program/e2e/pages/OrderDetailPage.ts"
  - "mall-mini-program/e2e/pages/RefundPage.ts"
  - "mall-mini-program/e2e/pages/PersonalCenterPage.ts"
  - "mall-mini-program/e2e/specs/mini-home.spec.ts"
  - "mall-mini-program/e2e/specs/mini-product-list.spec.ts"
  - "mall-mini-program/e2e/specs/mini-product-detail.spec.ts"
  - "mall-mini-program/e2e/specs/mini-cart.spec.ts"
  - "mall-mini-program/e2e/specs/mini-checkout.spec.ts"
  - "mall-mini-program/e2e/specs/mini-order.spec.ts"
  - "mall-mini-program/e2e/specs/mini-personal-center.spec.ts"
  - "mall-mini-program/e2e/playwright.config.ts"
  - "mall-mini-program/e2e/helpers/setup.ts"
requirements_addressed:
  - "MINI-01-01"
  - "MINI-01-02"
  - "MINI-01-03"
  - "MINI-01-04"
  - "MINI-01-05"
  - "MINI-01-06"
  - "MINI-01-07"
  - "MINI-02-01"
  - "MINI-02-02"
  - "MINI-02-03"
  - "MINI-02-04"
  - "MINI-02-05"
  - "MINI-03-01"
  - "MINI-03-02"
  - "MINI-03-03"
  - "MINI-03-04"
  - "MINI-03-05"
  - "MINI-03-06"
  - "MINI-03-07"
  - "MINI-03-08"
  - "MINI-03-09"
  - "MINI-04-01"
  - "MINI-04-02"
  - "MINI-04-03"
  - "MINI-04-04"
  - "MINI-04-05"
  - "MINI-04-06"
  - "MINI-04-07"
  - "MINI-05-01"
  - "MINI-05-02"
  - "MINI-05-03"
  - "MINI-05-04"
  - "MINI-05-05"
  - "MINI-05-06"
  - "MINI-05-07"
  - "MINI-05-08"
  - "MINI-05-09"
  - "MINI-06-01"
  - "MINI-06-02"
  - "MINI-06-03"
  - "MINI-06-04"
  - "MINI-06-05"
  - "MINI-07-01"
  - "MINI-07-02"
  - "MINI-07-03"
  - "MINI-07-04"
  - "MINI-07-05"
  - "MINI-08-01"
  - "MINI-08-02"
  - "MINI-08-03"
  - "MINI-08-04"
  - "MINI-08-05"
  - "MINI-08-06"
  - "MINI-09-01"
  - "MINI-09-02"
  - "MINI-09-03"
  - "MINI-09-04"
  - "MINI-09-05"
  - "MINI-09-06"
  - "MINI-09-07"
  - "MINI-10-01"
  - "MINI-10-02"
  - "MINI-10-03"
  - "MINI-10-04"
  - "MINI-10-05"
---

# Plan 13-MINI-E2E: Mini Program E2E Test Infrastructure

## Objective

Build Playwright E2E test infrastructure for Mini Program (uni-app + Vue 3), testing via H5 build mode which is accessible from CI. All 10 MINI modules (MINI-01~10) are covered.

## Context

- Mini Program uses uni-app + Vue 3 with Vite
- Testing via H5 build (`npm run dev:h5`) - accessible from headless CI
- No test framework currently configured
- Playwright is already used in Admin Web - unified tooling across project

## Tasks

### Task 1: Set up Playwright test infrastructure for Mini Program

<read_first>
- mall-mini-program/package.json
- mall-mini-program/vite.config.js
- mall-mini-program/pages.json
</read_first>

<action>
Create `mall-mini-program/e2e/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

Create `mall-mini-program/e2e/helpers/setup.ts`:

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

Install Playwright:
```bash
cd mall-mini-program
npm install -D @playwright/test@latest
npx playwright install chromium
```
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/playwright.config.ts` exists with iPhone 13 viewport
- `mall-mini-program/e2e/helpers/setup.ts` exists with mobile viewport configuration
- `npx playwright test --version` works in mall-mini-program directory
</acceptance_criteria>

### Task 2: Create Home page object and test (MINI-01)

<read_first>
- mall-mini-program/pages.json (home page route)
- mall-mini-program/src/pages/home/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/HomePage.ts`:

```typescript
import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async getBannerCount(): Promise<number> {
    return this.page.locator('.swiper-slide, .banner-item').count();
  }

  async tapBanner(index: number): Promise<void> {
    await this.page.locator('.swiper-slide, .banner-item').nth(index).click();
  }

  async getCategoryTiles(): Promise<number> {
    return this.page.locator('.category-tile, .cate-item').count();
  }

  async tapCategory(index: number): Promise<void> {
    await this.page.locator('.category-tile, .cate-item').nth(index).click();
  }

  async getRecommendedProducts(): Promise<string[]> {
    return this.page.locator('.product-card, .goods-item').allTextContents();
  }

  async search(keyword: string): Promise<void> {
    await this.page.fill('input[placeholder*="搜索"], input[type="search"]', keyword);
    await this.page.keyboard.press('Enter');
  }

  async getSearchHistory(): Promise<string[]> {
    return this.page.locator('.search-history .item, .history-item').allTextContents();
  }
}
```

Create `mall-mini-program/e2e/specs/mini-home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Mini Program Home (MINI-01)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('MINI-01-01: Home displays banner carousel', async () => {
    const banners = await homePage.getBannerCount();
    expect(banners).toBeGreaterThan(0);
  });

  test('MINI-01-03: Home displays category tiles', async () => {
    const categories = await homePage.getCategoryTiles();
    expect(categories).toBeGreaterThan(0);
  });

  test('MINI-01-05: Home displays recommended products', async () => {
    const products = await homePage.getRecommendedProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  test('MINI-01-06: Search works from home', async () => {
    await homePage.search('服务器');
    await this.page.waitForLoadState('networkidle');
    // Verify search results page loaded
    expect(this.page.url()).toContain('keyword');
  });
});
```
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/HomePage.ts` exists with all methods for MINI-01-01~07
- `mall-mini-program/e2e/specs/mini-home.spec.ts` exists and covers MINI-01-01~07
- HomePage uses iPhone viewport (375x667)
</acceptance_criteria>

### Task 3: Create Product List page object and test (MINI-02)

<read_first>
- mall-mini-program/pages.json (product list route)
- mall-mini-program/src/pages/product-list/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/ProductListPage.ts`:

```typescript
import { Page } from '@playwright/test';

export class ProductListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/pages/product-list/index');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(categoryId: string): Promise<void> {
    await this.page.click(`[data-category="${categoryId}"]`);
  }

  async sortByPrice(): Promise<void> {
    await this.page.click('text=价格');
  }

  async sortBySales(): Promise<void> {
    await this.page.click('text=销量');
  }

  async sortByNewest(): Promise<void> {
    await this.page.click('text=最新');
  }

  async search(keyword: string): Promise<void> {
    await this.page.fill('input[placeholder*="搜索"]', keyword);
    await this.page.click('button:has-text("搜索")');
  }

  async getProductCards(): Promise<number> {
    return this.page.locator('.product-card, .goods-item').count();
  }

  async tapProduct(index: number): Promise<void> {
    await this.page.locator('.product-card, .goods-item').nth(index).click();
  }
}
```

Create `mall-mini-program/e2e/specs/mini-product-list.spec.ts` covering MINI-02-01~05.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/ProductListPage.ts` exists
- `mall-mini-program/e2e/specs/mini-product-list.spec.ts` covers MINI-02-01~05
</acceptance_criteria>

### Task 4: Create Product Detail page object and test (MINI-03)

<read_first>
- mall-mini-program/pages.json (product detail route)
- mall-mini-program/src/pages/product-detail/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/ProductDetailPage.ts` with methods for:
- view image carousel
- view product info (name, price, stock)
- select specification (color, size)
- input quantity
- add to cart
- view reviews summary
- navigate to evaluation detail

Create `mall-mini-program/e2e/specs/mini-product-detail.spec.ts` covering MINI-03-01~09.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/ProductDetailPage.ts` exists
- `mall-mini-program/e2e/specs/mini-product-detail.spec.ts` covers MINI-03-01~09
</acceptance_criteria>

### Task 5: Create Shopping Cart page object and test (MINI-04)

<read_first>
- mall-mini-program/pages.json (cart route)
- mall-mini-program/src/pages/cart/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/CartPage.ts` with methods for:
- view cart items
- modify quantity
- delete item
- select/deselect all
- view total
- proceed to checkout
- verify mixed cart warning (MINI-04-07)

Create `mall-mini-program/e2e/specs/mini-cart.spec.ts` covering MINI-04-01~07.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/CartPage.ts` exists
- `mall-mini-program/e2e/specs/mini-cart.spec.ts` covers MINI-04-01~07
- Tests verify mixed physical/virtual cart warning
</acceptance_criteria>

### Task 6: Create Order Confirmation page object and test (MINI-05)

<read_first>
- mall-mini-program/pages.json (order confirm route)
- mall-mini-program/src/pages/order-confirm/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/OrderConfirmPage.ts` with methods for:
- select shipping address
- add new address
- edit/delete address
- view order items
- apply coupon
- verify coupon/promotion mutual exclusion (MINI-05-06)
- view order total breakdown
- add order remark
- submit order

Create `mall-mini-program/e2e/specs/mini-checkout.spec.ts` covering MINI-05-01~09.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/OrderConfirmPage.ts` exists
- `mall-mini-program/e2e/specs/mini-checkout.spec.ts` covers MINI-05-01~09
- Tests verify mutual exclusion rule for coupon/promotion
</acceptance_criteria>

### Task 7: Create Order List and Order Detail page objects and tests (MINI-06, MINI-07)

<read_first>
- mall-mini-program/pages.json (order list and detail routes)
- mall-mini-program/src/pages/order-list/index.vue
- mall-mini-program/src/pages/order-detail/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/OrderListPage.ts` with methods for:
- view order list with tab filters (All, Pending Payment, Pending Shipment, Pending Receipt, Completed)
- view order card info
- cancel order (Pending Payment)
- confirm delivery (Pending Receipt)

Create `mall-mini-program/e2e/pages/OrderDetailPage.ts` with methods for:
- view full order info
- view logistics tracking timeline
- navigate to evaluate
- view refund/return button
- copy order number

Create `mall-mini-program/e2e/specs/mini-order.spec.ts` covering MINI-06-01~05 and MINI-07-01~05.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/OrderListPage.ts` exists
- `mall-mini-program/e2e/pages/OrderDetailPage.ts` exists
- `mall-mini-program/e2e/specs/mini-order.spec.ts` covers MINI-06-01~05 and MINI-07-01~05
</acceptance_criteria>

### Task 8: Create Refund Application page object and test (MINI-08)

<read_first>
- mall-mini-program/pages.json (refund route)
- mall-mini-program/src/pages/refund/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/RefundPage.ts` with methods for:
- apply for refund from order detail
- select preset refund reason
- input custom refund reason text
- upload refund reason images
- view refund status
- cancel refund application

Create `mall-mini-program/e2e/specs/mini-refund.spec.ts` covering MINI-08-01~06.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/RefundPage.ts` exists
- `mall-mini-program/e2e/specs/mini-refund.spec.ts` covers MINI-08-01~06
</acceptance_criteria>

### Task 9: Create Personal Center page object and test (MINI-09)

<read_first>
- mall-mini-program/pages.json (personal center route)
- mall-mini-program/src/pages/user/index.vue
</read_first>

<action>
Create `mall-mini-program/e2e/pages/PersonalCenterPage.ts` with methods for:
- view avatar, nickname, phone
- edit personal profile
- manage shipping addresses (add, edit, delete, set default)
- view my coupons list
- view my favorites (wishlist)
- remove item from favorites
- view points balance and history

Create `mall-mini-program/e2e/specs/mini-personal-center.spec.ts` covering MINI-09-01~07.
</action>

<acceptance_criteria>
- `mall-mini-program/e2e/pages/PersonalCenterPage.ts` exists
- `mall-mini-program/e2e/specs/mini-personal-center.spec.ts` covers MINI-09-01~07
</acceptance_criteria>

### Task 10: Run Mini Program E2E tests

<action>
Start H5 dev server and run tests:

```bash
# Terminal 1: Start H5 dev server
cd mall-mini-program
npm run dev:h5 &

# Wait for server to start
sleep 10

# Terminal 2: Run tests
npx playwright test --reporter=list
```

If H5 server fails to start, check vite.config.js for H5-specific configuration.
</action>

<acceptance_criteria>
- `npm run dev:h5` starts successfully on port 5173
- `npx playwright test` runs without compilation errors
- At minimum, mini-home.spec.ts passes (verifying test infrastructure works)
</acceptance_criteria>

## Verification

| Criteria | Test |
|----------|------|
| Playwright installed in Mini Program | `npx playwright test --version` succeeds |
| H5 build works | `npm run dev:h5` starts on port 5173 |
| Home page tests pass | `npx playwright test mini-home.spec.ts` passes |
| All MINI-01~10 modules have page objects | `ls e2e/pages/*.ts` shows 10 page objects |
| All MINI-01~10 modules have spec files | `ls e2e/specs/*.spec.ts` shows spec files |

## must_haves

- Playwright config (`e2e/playwright.config.ts`) with iPhone 13 viewport
- Mobile test helper (`e2e/helpers/setup.ts`) with viewport configuration
- 10 page objects (one per MINI module)
- 7 spec files: mini-home, mini-product-list, mini-product-detail, mini-cart, mini-checkout, mini-order, mini-personal-center
- Mini-refund.spec.ts covering MINI-08
- H5 dev server starts successfully on port 5173
- At least 1 spec file passes when run against H5 build

## Notes

- **Testing approach:** Test Mini Program via H5 build (not WeChat MP simulator) - WeChat MP requires client and is not accessible from CI
- **Viewport:** Use iPhone 13 (375x667) as standard mobile viewport
- **Backend dependency:** mall-center must be running on port 7010 for full E2E tests
- **MINI-10 (WeChat Payment):** Test payment initiation flow, but mock the actual `wx.requestPayment` call since it requires WeChat environment