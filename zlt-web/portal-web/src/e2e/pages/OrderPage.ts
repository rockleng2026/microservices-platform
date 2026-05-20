import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/mall-admin/orders');
  }

  async getOrderTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async filterByStatus(status: string): Promise<void> {
    await this.page.click(`.ant-tabs-tab:has-text("${status}")`);
    await this.page.waitForTimeout(1000);
  }

  async searchOrder(orderNo: string): Promise<void> {
    await this.fillForm('input[placeholder="请输入订单号"]', orderNo);
    await this.clickButton('搜索');
  }

  async clickFirstDetailButton(): Promise<void> {
    const detailButtons = this.page.locator('button:has-text("查看详情")');
    await detailButtons.first().click();
  }

  async clickFirstShipButton(): Promise<void> {
    const shipButtons = this.page.locator('button:has-text("发货")');
    if (await shipButtons.first().isVisible()) {
      await shipButtons.first().click();
    }
  }

  async switchToTab(tabName: string): Promise<void> {
    await this.page.click(`.ant-tabs-tab:has-text("${tabName}")`);
    await this.page.waitForTimeout(500);
  }
}