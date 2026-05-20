import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RefundPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/mall-admin/refund');
  }

  async getRefundTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async switchToTab(tabName: string): Promise<void> {
    await this.page.click(`.ant-tabs-tab:has-text("${tabName}")`);
    await this.page.waitForTimeout(500);
  }

  async clickFirstApproveButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("审批")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstRejectButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("驳回")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }

  async clickFirstDetailButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("查看")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
  }
}