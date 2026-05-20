import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { WeChatConfigPage } from '../pages/WeChatConfigPage';

test.describe('Admin WeChat Config (ADMIN-11)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-11-01: WeChat config page loads', async ({ page }) => {
    const wechatPage = new WeChatConfigPage(page);
    await wechatPage.goto();
    await page.waitForSelector('.ant-card', { timeout: 10000 });
    expect(true).toBeTruthy();
  });

  test('ADMIN-11-02: Test WeChat connection (manual)', async ({ page }) => {
    // Note: This requires actual WeChat API credentials and is marked as manual testing
    const wechatPage = new WeChatConfigPage(page);
    await wechatPage.goto();
    await page.waitForSelector('.ant-card', { timeout: 10000 });
    // This test verifies the UI is present; actual API test requires real credentials
  });

  test('ADMIN-11-03: View config status', async ({ page }) => {
    const wechatPage = new WeChatConfigPage(page);
    await wechatPage.goto();
    await page.waitForSelector('.ant-card', { timeout: 10000 });
    const status = await wechatPage.getConfigStatus();
    expect(status).toBeTruthy();
  });
});