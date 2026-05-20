import { Page } from '@playwright/test';

export class OrderDetailPage {
  constructor(private page: Page) {}

  async goto(orderId?: string): Promise<void> {
    const url = orderId ? `/pages/order-detail/index?id=${orderId}` : '/pages/order-detail/index';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async getOrderInfo(): Promise<{ orderNo: string; status: string; total: string }> {
    const orderNoEl = this.page.locator('.order-no, .order-number');
    const statusEl = this.page.locator('.order-status, .status');
    const totalEl = this.page.locator('.order-total, .total-price');
    return {
      orderNo: await orderNoEl.textContent() || '',
      status: await statusEl.textContent() || '',
      total: await totalEl.textContent() || ''
    };
  }

  async getLogisticsTimeline(): Promise<{ time: string; description: string }[]> {
    const events = this.page.locator('.logistics-item, .timeline-item');
    const result = [];
    for (let i = 0; i < await events.count(); i++) {
      const time = await events.nth(i).locator('.time, .logistics-time').textContent();
      const desc = await events.nth(i).locator('.description, .logistics-desc').textContent();
      result.push({ time: time || '', description: desc || '' });
    }
    return result;
  }

  async navigateToEvaluate(): Promise<void> {
    const evaluateBtn = this.page.locator('button:has-text("评价"), a:has-text("评价")');
    if (await evaluateBtn.isVisible()) {
      await evaluateBtn.click();
    }
  }

  async getRefundButton(): Promise<boolean> {
    const refundBtn = this.page.locator('button:has-text("退款"), a:has-text("退款")');
    return await refundBtn.isVisible();
  }

  async copyOrderNumber(): Promise<string> {
    const copyBtn = this.page.locator('.copy-order-no, button:has-text("复制")');
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
    }
    // Clipboard API may not be accessible in test
    return await this.page.locator('.order-no, .order-number').textContent() || '';
  }
}