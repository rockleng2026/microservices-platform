import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/dashboard');
  }

  async getMetricCards(): Promise<string[]> {
    return this.page.locator('.ant-statistic-title').allTextContents();
  }

  async getSalesChart(): Promise<boolean> {
    const count = await this.page.locator('.echarts-wrapper, [class*="echarts"]').count();
    if (count > 0) return true;
    const canvasCount = await this.page.locator('canvas').count();
    return canvasCount > 0;
  }

  async getLowStockAlerts(): Promise<string[]> {
    return this.page.locator('.ant-alert-message').allTextContents();
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator('.welcome-title').textContent() || '';
  }
}