import { Page } from '@playwright/test';

export class OrderConfirmPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/pages/checkout/index');
    await this.page.waitForLoadState('networkidle');
  }

  async selectAddress(addressId: string): Promise<void> {
    await this.page.click(`[data-address-id="${addressId}"]`);
  }

  async addNewAddress(address: { name: string; phone: string; address: string }): Promise<void> {
    await this.page.click('button:has-text("新增地址"), .add-address-btn');
    await this.page.fill('input[name="name"], .name-input', address.name);
    await this.page.fill('input[name="phone"], .phone-input', address.phone);
    await this.page.fill('input[name="address"], .address-input', address.address);
    await this.page.click('button:has-text("保存")');
  }

  async editAddress(addressId: string): Promise<void> {
    await this.page.click(`[data-address-id="${addressId}"] .edit-btn, [data-address-id="${addressId}"] .modify`);
  }

  async deleteAddress(addressId: string): Promise<void> {
    await this.page.click(`[data-address-id="${addressId}"] .delete-btn, [data-address-id="${addressId}"] .del`);
    const confirmBtn = this.page.locator('button:has-text("确定"), button:has-text("删除")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }

  async getOrderItems(): Promise<number> {
    return this.page.locator('.order-item, .goods-item').count();
  }

  async applyCoupon(couponId: string): Promise<void> {
    await this.page.click('.coupon-select, button:has-text("使用优惠券")');
    await this.page.click(`[data-coupon-id="${couponId}"]`);
  }

  async getMutualExclusionWarning(): Promise<string | null> {
    const warning = this.page.locator('.promotion-warning, .mutual-exclusion, text=优惠券和促销活动不能同时使用');
    if (await warning.isVisible()) {
      return await warning.textContent();
    }
    return null;
  }

  async getOrderTotal(): Promise<{ subtotal: string; freight: string; total: string }> {
    const subtotal = await this.page.locator('.subtotal, .goods-total').textContent() || '';
    const freight = await this.page.locator('.freight, .shipping-fee').textContent() || '';
    const total = await this.page.locator('.total-price, .order-total').textContent() || '';
    return { subtotal, freight, total };
  }

  async addOrderRemark(remark: string): Promise<void> {
    await this.page.fill('input[name="remark"], .order-remark input, textarea[name="remark"]', remark);
  }

  async submitOrder(): Promise<void> {
    await this.page.click('button:has-text("提交订单"), .submit-order-btn');
  }
}