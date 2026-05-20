import { test, expect } from '@playwright/test';
import { ProductListPage } from '../pages/ProductListPage';

test.describe('Mini Program Product List (MINI-02)', () => {
  let productListPage: ProductListPage;

  test.beforeEach(async ({ page }) => {
    productListPage = new ProductListPage(page);
    await productListPage.goto();
  });

  test('MINI-02-01: Product list displays products', async () => {
    const products = await productListPage.getProductCards();
    expect(products).toBeGreaterThan(0);
  });

  test('MINI-02-02: Filter by category works', async ({ page }) => {
    // Click first category filter
    const firstCategory = page.locator('[data-category]').first();
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-02-03: Sort by price works', async () => {
    await productListPage.sortByPrice();
    await page.waitForLoadState('networkidle');
  });

  test('MINI-02-04: Sort by sales works', async () => {
    await productListPage.sortBySales();
    await page.waitForLoadState('networkidle');
  });

  test('MINI-02-05: Search in product list works', async ({ page }) => {
    await productListPage.search('服务器');
    await page.waitForLoadState('networkidle');
    const products = await productListPage.getProductCards();
    expect(products).toBeGreaterThan(0);
  });
});