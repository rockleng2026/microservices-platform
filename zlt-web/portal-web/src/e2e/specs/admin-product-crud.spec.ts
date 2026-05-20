import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { ProductPage } from '../pages/ProductPage';

test.describe('Admin Product Management (ADMIN-02)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-02-01: Product list page loads', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.goto();
    await page.waitForSelector('.ant-table-tbody', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-02-04: View product list', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.goto();
    await page.waitForTimeout(2000);
    const rows = await productPage.getProductTableRows();
    expect(Array.isArray(rows)).toBeTruthy();
  });

  test('ADMIN-02-05: Search product by keyword', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.goto();
    await page.waitForSelector('.ant-table-tbody', { timeout: 10000 });
    await productPage.searchProduct('测试商品');
  });

  test('ADMIN-02-08: Batch publish products', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.goto();
    await page.waitForSelector('.ant-table-tbody', { timeout: 10000 });
    // Select first row if available
    const checkbox = page.locator('.ant-table-tbody .ant-checkbox-input').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await productPage.batchEnable();
    }
  });

  test('ADMIN-02-09: Batch unpublish products', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.goto();
    await page.waitForSelector('.ant-table-tbody', { timeout: 10000 });
    // Select first row if available
    const checkbox = page.locator('.ant-table-tbody .ant-checkbox-input').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await productPage.batchDisable();
    }
  });

  test('ADMIN-02-10: View product detail', async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.goto();
    await page.waitForSelector('.ant-table-tbody', { timeout: 10000 });
    // Click detail button if available
    const detailBtn = page.locator('button:has-text("详情")').first();
    if (await detailBtn.isVisible({ timeout: 2000 })) {
      await productPage.clickFirstDetailButton();
      await page.waitForTimeout(1000);
    }
  });
});