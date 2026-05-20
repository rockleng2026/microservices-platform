import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CouponPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/coupon');
  }

  async getCouponTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async clickCreateButton(): Promise<void> {
    await this.clickButton('新建优惠券');
  }

  async clickFirstPublishButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("发布")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstOfflineButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("下架")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstEditButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("编辑")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstIssueButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("发放")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstStatisticsButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("统计")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstGenerateLinkButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("生成链接")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickRefreshButton(): Promise<void> {
    await this.clickButton('刷新');
  }
}