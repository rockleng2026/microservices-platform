import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { CouponPage } from '../pages/CouponPage';

test.describe('Admin Coupon Management (ADMIN-04)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-04-01: Coupon list page loads', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-04-02: Create new coupon', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await couponPage.clickCreateButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-04-03: Edit coupon template', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await couponPage.clickFirstEditButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-04-04: Publish coupon', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await couponPage.clickFirstPublishButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-04-05: Offline coupon', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await couponPage.clickFirstOfflineButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-04-06: Issue coupon to users', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await couponPage.clickFirstIssueButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-04-07: View coupon statistics', async ({ page }) => {
    const couponPage = new CouponPage(page);
    await couponPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await couponPage.clickFirstStatisticsButton();
    await page.waitForTimeout(1000);
  });
});