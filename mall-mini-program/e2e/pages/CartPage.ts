import { Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/pages/cart/index');
    await this.page.waitForLoadState('networkidle');
  }

  async getCartItems(): Promise<number> {
    return this.page.locator('.cart-item, .goods-item').count();
  }

  async modifyQuantity(index: number, amount: number): Promise<void> {
    const quantityInput = this.page.locator('.cart-item .quantity input, .goods-item input[type="number"]').nth(index);
    await quantityInput.clear();
    await quantityInput.fill(String(amount));
  }

  async deleteItem(index: number): Promise<void> {
    await this.page.locator('.cart-item .delete-btn, .goods-item .del').nth(index).click();
    // Confirm deletion if dialog appears
    const confirmBtn = this.page.locator('button:has-text("确定"), button:has-text("删除")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }

  async selectItem(index: number): Promise<void> {
    await this.page.locator('.cart-item checkbox, .goods-item checkbox').nth(index).click();
  }

  async selectAll(): Promise<void> {
    const selectAllBtn = this.page.locator('.select-all, button:has-text("全选")');
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click();
    }
  }

  async deselectAll(): Promise<void> {
    await this.selectAll(); // Toggle
  }

  async getTotal(): Promise<string> {
    return this.page.locator('.total-price, .cart-total').textContent() || '';
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.click('button:has-text("结算"), button:has-text("去结算")');
  }

  async getMixedCartWarning(): Promise<string | null> {
    const warning = this.page.locator('.warning, .mixed-cart-warning, text=实物和虚拟商品不能混合结算');
    if (await warning.isVisible()) {
      return await warning.textContent();
    }
    return null;
  }
}