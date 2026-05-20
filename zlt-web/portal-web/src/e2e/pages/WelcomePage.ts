import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WelcomePage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/welcome');
  }

  async getWelcomeTitle(): Promise<string> {
    return this.page.locator('.welcome-title').textContent() || '';
  }

  async getMetricCards(): Promise<string[]> {
    return this.page.locator('.ant-statistic-title').allTextContents();
  }
}