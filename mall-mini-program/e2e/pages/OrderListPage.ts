import { Page } from '@playwright/test';

export class OrderListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/pages/order-list/index');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status: 'all' | 'pending_payment' | 'pending_shipment' | 'pending_receipt' | 'completed'): Promise<void> {
    const statusMap = {
      'all': '全部',
      'pending_payment': '待付款',
      'pending_shipment': '待发货',
      'pending_receipt': '待收货',
      'completed': '已完成'
    };
    await this.page.click(`.tab-item:has-text("${statusMap[status]}"), [data-status="${status}"]`);
  }

  async getOrderCards(): Promise<number> {
    return this.page.locator('.order-card, .order-item').count();
  }

  async cancelOrder(index: number): Promise<void> {
    const cancelBtn = this.page.locator('.order-card .cancel-btn, .order-item button:has-text("取消")').nth(index);
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      const confirmBtn = this.page.locator('button:has-text("确定"), button:has-text("取消订单")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
    }
  }

  async confirmDelivery(index: number): Promise<void> {
    const confirmBtn = this.page.locator('.order-card .confirm-btn, .order-item button:has-text("确认收货")').nth(index);
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      const confirmOk = this.page.locator('button:has-text("确定")');
      if (await confirmOk.isVisible()) {
        await confirmOk.click();
      }
    }
  }

  async viewOrderDetail(index: number): Promise<void> {
    await this.page.locator('.order-card, .order-item').nth(index).click();
  }
}