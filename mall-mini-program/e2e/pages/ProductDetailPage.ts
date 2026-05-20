import { Page } from '@playwright/test';

export class ProductDetailPage {
  constructor(private page: Page) {}

  async goto(productId?: string): Promise<void> {
    const url = productId ? `/pages/product-detail/index?id=${productId}` : '/pages/product-detail/index';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async getImageCarousel(): Promise<number> {
    return this.page.locator('.swiper-item, .product-image').count();
  }

  async getProductName(): Promise<string> {
    return this.page.locator('.product-name, .goods-name').textContent() || '';
  }

  async getProductPrice(): Promise<string> {
    return this.page.locator('.price, .product-price').textContent() || '';
  }

  async getStock(): Promise<string> {
    return this.page.locator('.stock, .inventory').textContent() || '';
  }

  async selectSpecification(specName: string, value: string): Promise<void> {
    // Click specification group first
    await this.page.click(`text=${specName}`);
    // Then click the value option
    await this.page.click(`.spec-item:has-text("${value}"), text="${value}"`);
  }

  async inputQuantity(amount: number): Promise<void> {
    const input = this.page.locator('input[type="number"], .quantity input');
    await input.clear();
    await input.fill(String(amount));
  }

  async addToCart(): Promise<void> {
    await this.page.click('button:has-text("加入购物车"), .add-cart-btn');
  }

  async getReviewsSummary(): Promise<{ score: string; count: string }> {
    const scoreEl = this.page.locator('.review-score, .score');
    const countEl = this.page.locator('.review-count, .comment-count');
    return {
      score: await scoreEl.textContent() || '',
      count: await countEl.textContent() || '',
    };
  }

  async viewReviewDetail(): Promise<void> {
    await this.page.click('.review-summary, a:has-text("评价")');
  }
}