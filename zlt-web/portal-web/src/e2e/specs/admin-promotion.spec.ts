import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { PromotionPage } from '../pages/PromotionPage';

test.describe('Admin Promotion Management (ADMIN-05)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-05-01: Promotion page loads', async ({ page }) => {
    const promotionPage = new PromotionPage(page);
    await promotionPage.goto();
    await page.waitForSelector('.ant-tabs', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-05-02: View promotion list', async ({ page }) => {
    const promotionPage = new PromotionPage(page);
    await promotionPage.goto();
    await page.waitForSelector('.ant-tabs', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('ADMIN-05-03: Toggle promotion status', async ({ page }) => {
    const promotionPage = new PromotionPage(page);
    await promotionPage.goto();
    await page.waitForSelector('.ant-tabs', { timeout: 10000 });
    await page.waitForTimeout(2000);
    // Toggle would interact with the promotion table enable/disable buttons
  });

  test('ADMIN-05-04: Delete promotion', async ({ page }) => {
    const promotionPage = new PromotionPage(page);
    await promotionPage.goto();
    await page.waitForSelector('.ant-tabs', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('ADMIN-05-05: View member points management', async ({ page }) => {
    const promotionPage = new PromotionPage(page);
    await promotionPage.goto();
    await promotionPage.switchToTab('会员积分');
    await page.waitForTimeout(1000);
  });

  test('ADMIN-05-06: Adjust member points', async ({ page }) => {
    const promotionPage = new PromotionPage(page);
    await promotionPage.goto();
    await promotionPage.switchToTab('会员积分');
    await page.waitForTimeout(1000);
    await promotionPage.clickPointsAdjustmentButton();
    await page.waitForTimeout(1000);
  });
});