import { Page } from '@playwright/test';

export class RefundPage {
  constructor(private page: Page) {}

  async goto(orderId?: string): Promise<void> {
    const url = orderId ? `/pages/refund/apply?orderId=${orderId}` : '/pages/refund/apply';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async selectPresetReason(reason: string): Promise<void> {
    await this.page.click(`.reason-item:has-text("${reason}"), [data-reason="${reason}"]`);
  }

  async inputCustomReason(text: string): Promise<void> {
    const textarea = this.page.locator('textarea[name="reason"], .refund-reason textarea, .reason-input');
    if (await textarea.isVisible()) {
      await textarea.fill(text);
    }
  }

  async uploadReasonImage(imagePath: string): Promise<void> {
    // Playwright file upload
    const fileInput = this.page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(imagePath);
    }
  }

  async getRefundStatus(): Promise<string> {
    return this.page.locator('.refund-status, .status-text').textContent() || '';
  }

  async cancelRefundApplication(): Promise<void> {
    const cancelBtn = this.page.locator('button:has-text("取消退款"), .cancel-refund-btn');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      const confirmBtn = this.page.locator('button:has-text("确定")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
    }
  }

  async submitRefund(): Promise<void> {
    await this.page.click('button:has-text("提交退款"), .submit-refund-btn');
  }
}