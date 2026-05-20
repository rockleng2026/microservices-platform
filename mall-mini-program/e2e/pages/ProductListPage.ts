import { Page } from '@playwright/test';

export class ProductListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/pages/product-list/index');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(categoryId: string): Promise<void> {
    await this.page.click(`[data-category="${categoryId}"]`);
  }

  async sortByPrice(): Promise<void> {
    await this.page.click('text=价格');
  }

  async sortBySales(): Promise<void> {
    await this.page.click('text=销量');
  }

  async sortByNewest(): Promise<void> {
    await this.page.click('text=最新');
  }

  async search(keyword: string): Promise<void> {
    await this.page.fill('input[placeholder*="搜索"]', keyword);
    await this.page.click('button:has-text("搜索")');
  }

  async getProductCards(): Promise<number> {
    return this.page.locator('.product-card, .goods-item').count();
  }

  async tapProduct(index: number): Promise<void> {
    await this.page.locator('.product-card, .goods-item').nth(index).click();
  }
}