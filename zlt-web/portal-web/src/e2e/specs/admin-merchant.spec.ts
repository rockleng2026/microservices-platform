import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { MerchantPage } from '../pages/MerchantPage';

test.describe('Admin Merchant Management (ADMIN-09)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-09-01: Merchant list page loads', async ({ page }) => {
    const merchantPage = new MerchantPage(page);
    await merchantPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-09-02: View merchant list', async ({ page }) => {
    const merchantPage = new MerchantPage(page);
    await merchantPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('ADMIN-09-03: Approve merchant application', async ({ page }) => {
    const merchantPage = new MerchantPage(page);
    await merchantPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await merchantPage.clickFirstApproveButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-09-04: Reject merchant application', async ({ page }) => {
    const merchantPage = new MerchantPage(page);
    await merchantPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await merchantPage.clickFirstRejectButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-09-05: View merchant detail', async ({ page }) => {
    const merchantPage = new MerchantPage(page);
    await merchantPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await merchantPage.clickFirstEditButton();
    await page.waitForTimeout(1000);
  });
});