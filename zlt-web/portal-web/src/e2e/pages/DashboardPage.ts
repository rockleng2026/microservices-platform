import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/mall-admin/dashboard');
  }

  async getMetricCards(): Promise<string[]> {
    return this.page.locator('.ant-statistic-title').allTextContents();
  }

  async getSalesChart(): Promise<boolean> {
    return this.page.locator('.echarts-wrapper, [class*="echarts"]').count() > 0 ||
           this.page.locator('canvas').count() > 0;
  }

  async getLowStockAlerts(): Promise<string[]> {
    return this.page.locator('.ant-alert-message').allTextContents();
  }

  async getPageTitle(): Promise<string> {
    return this.page.locator('.welcome-title').textContent() || '';
  }
}