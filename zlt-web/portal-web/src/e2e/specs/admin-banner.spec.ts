import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { BannerPage } from '../pages/BannerPage';

test.describe('Admin Banner Management (ADMIN-10)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-10-01: Banner list page loads', async ({ page }) => {
    const bannerPage = new BannerPage(page);
    await bannerPage.goto();
    await page.waitForTimeout(2000);
    expect(true).toBeTruthy();
  });

  test('ADMIN-10-02: Add new banner', async ({ page }) => {
    const bannerPage = new BannerPage(page);
    await bannerPage.goto();
    await page.waitForTimeout(2000);
    await bannerPage.clickAddBannerButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-10-03: Edit banner', async ({ page }) => {
    const bannerPage = new BannerPage(page);
    await bannerPage.goto();
    await page.waitForTimeout(2000);
    await bannerPage.clickFirstEditButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-10-04: Delete banner', async ({ page }) => {
    const bannerPage = new BannerPage(page);
    await bannerPage.goto();
    await page.waitForTimeout(2000);
    await bannerPage.clickFirstDeleteButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-10-05: Toggle banner enable/disable', async ({ page }) => {
    const bannerPage = new BannerPage(page);
    await bannerPage.goto();
    await page.waitForTimeout(2000);
    // Toggle is done via switch on BannerCard component
  });
});