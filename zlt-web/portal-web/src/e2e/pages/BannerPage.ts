import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BannerPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/mall-admin/banners');
  }

  async clickAddBannerButton(): Promise<void> {
    await this.clickButton('添加 Banner');
  }

  async clickFirstEditButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("编辑")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstDeleteButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("删除")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickRefreshButton(): Promise<void> {
    await this.clickButton('刷新');
  }

  async getBannerCount(): Promise<number> {
    return this.page.locator('.banner-list > div').count();
  }
}