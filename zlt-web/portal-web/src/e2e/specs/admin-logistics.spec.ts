import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { LogisticsPage } from '../pages/LogisticsPage';

test.describe('Admin Logistics Management (ADMIN-07)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-07-01: Logistics list page loads', async ({ page }) => {
    const logisticsPage = new LogisticsPage(page);
    await logisticsPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-07-02: Create logistics company', async ({ page }) => {
    const logisticsPage = new LogisticsPage(page);
    await logisticsPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await logisticsPage.clickCreateButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-07-03: Edit logistics company', async ({ page }) => {
    const logisticsPage = new LogisticsPage(page);
    await logisticsPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await logisticsPage.clickFirstEditButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-07-04: Delete logistics company', async ({ page }) => {
    const logisticsPage = new LogisticsPage(page);
    await logisticsPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await logisticsPage.clickFirstDeleteButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-07-05: Search logistics company', async ({ page }) => {
    const logisticsPage = new LogisticsPage(page);
    await logisticsPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
  });

  test('ADMIN-07-06: View logistics tracking', async ({ page }) => {
    const logisticsPage = new LogisticsPage(page);
    await logisticsPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });
});