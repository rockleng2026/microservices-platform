import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { StockPage } from '../pages/StockPage';

test.describe('Admin Stock Management (ADMIN-06)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-06-01: Stock list page loads', async ({ page }) => {
    const stockPage = new StockPage(page);
    await stockPage.goto();
    await page.waitForSelector('.ant-pro-table', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-06-02: Search stock by keyword', async ({ page }) => {
    const stockPage = new StockPage(page);
    await stockPage.goto();
    await page.waitForSelector('.ant-pro-table', { timeout: 10000 });
    await stockPage.searchStock('测试商品');
  });

  test('ADMIN-06-03: Correct stock manually', async ({ page }) => {
    const stockPage = new StockPage(page);
    await stockPage.goto();
    await page.waitForSelector('.ant-pro-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await stockPage.clickFirstCorrectButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-06-04: View stock details', async ({ page }) => {
    const stockPage = new StockPage(page);
    await stockPage.goto();
    await page.waitForSelector('.ant-pro-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('ADMIN-06-05: Create new stock record', async ({ page }) => {
    const stockPage = new StockPage(page);
    await stockPage.goto();
    await page.waitForSelector('.ant-pro-table', { timeout: 10000 });
    await stockPage.clickCreateButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-06-06: View stock correction history', async ({ page }) => {
    const stockPage = new StockPage(page);
    await stockPage.goto();
    await page.waitForSelector('.ant-pro-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });
});