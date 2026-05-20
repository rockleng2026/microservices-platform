import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class StockPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/stock');
  }

  async getStockTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async searchStock(keyword: string): Promise<void> {
    await this.fillForm('input[placeholder="输入关键词搜索"]', keyword);
    await this.clickButton('搜索');
  }

  async clickFirstCorrectButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("修正")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickCreateButton(): Promise<void> {
    await this.clickButton('录入');
  }

  async clickRefreshButton(): Promise<void> {
    await this.clickButton('刷新');
  }
}