import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LogisticsPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/logistics');
  }

  async getLogisticsTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async clickCreateButton(): Promise<void> {
    await this.clickButton('新增');
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
}