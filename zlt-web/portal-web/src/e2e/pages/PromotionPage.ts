import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PromotionPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/promotion');
  }

  async switchToTab(tabName: string): Promise<void> {
    await this.page.click(`.ant-tabs-tab:has-text("${tabName}")`);
    await this.page.waitForTimeout(500);
  }

  async clickCreatePromotionButton(): Promise<void> {
    await this.clickButton('新建活动');
  }

  async clickRefreshButton(): Promise<void> {
    await this.clickButton('刷新');
  }

  async clickPointsAdjustmentButton(): Promise<void> {
    await this.clickButton('积分调整');
  }
}