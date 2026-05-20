import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UserPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/mall-admin/member');
  }

  async searchMember(keyword: string): Promise<void> {
    await this.fillForm('input[placeholder="昵称或手机号搜索"]', keyword);
  }

  async clickFirstMember(): Promise<void> {
    const rows = this.page.locator('.ant-table-tbody tr');
    if (await rows.first().isVisible()) {
      await rows.first().click();
    }
  }

  async switchToTab(tabName: string): Promise<void> {
    await this.page.click(`.ant-tabs-tab:has-text("${tabName}")`);
    await this.page.waitForTimeout(500);
  }

  async clickAdjustPointsButton(): Promise<void> {
    const btn = this.page.locator('button:has-text("调整积分")');
    if (await btn.isVisible()) {
      await btn.click();
    }
  }

  async clickAddAddressButton(): Promise<void> {
    const btn = this.page.locator('button:has-text("新增地址")');
    if (await btn.isVisible()) {
      await btn.click();
    }
  }
}