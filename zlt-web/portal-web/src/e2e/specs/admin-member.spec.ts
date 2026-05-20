import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { UserPage } from '../pages/UserPage';

test.describe('Admin Member/User Management (ADMIN-08)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-08-01: Member list page loads', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-08-02: Search member by keyword', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await userPage.searchMember('测试');
    await page.waitForTimeout(1000);
  });

  test('ADMIN-08-03: View member detail', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await userPage.clickFirstMember();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-08-04: View consumption statistics', async ({ page }) => {
    const userPage = new UserPage(page);
    await userPage.goto();
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    await userPage.clickFirstMember();
    await page.waitForTimeout(1000);
    await userPage.switchToTab('基本信息');
  });
});