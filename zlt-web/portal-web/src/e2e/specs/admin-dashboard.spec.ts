import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Admin Dashboard (ADMIN-01)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-01-01: Dashboard displays metric cards', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const cards = await dashboard.getMetricCards();
    expect(cards.length).toBeGreaterThan(0);
  });

  test('ADMIN-01-02: Dashboard shows sales trend chart', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await page.waitForTimeout(1000);
    const hasChart = await dashboard.getSalesChart();
    expect(hasChart).toBeTruthy();
  });

  test('ADMIN-01-05: Dashboard shows page title', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    const title = await dashboard.getPageTitle();
    expect(title).toContain('Mall Admin');
  });
});