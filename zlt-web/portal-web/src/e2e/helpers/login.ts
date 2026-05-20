import { Page } from '@playwright/test';

export async function adminLogin(page: Page): Promise<void> {
  await page.goto('http://localhost:8001');
  await page.evaluate(() => {
    localStorage.setItem('antd-pro-authority', '["admin"]');
  });
  await page.reload();
}