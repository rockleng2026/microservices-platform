import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MerchantPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/merchant');
  }

  async getMerchantTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async clickCreateButton(): Promise<void> {
    await this.clickButton('新增商户');
  }

  async clickFirstEditButton(): Promise<void> {
    const buttons = this.page.locator('button:has-text("编辑")');
    if (await buttons.first().isVisible()) {
      await buttons.first().click();
    }
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

  async clickRefreshButton(): Promise<void> {
    await this.clickButton('刷新');
  }
}