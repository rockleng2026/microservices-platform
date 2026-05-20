import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async getBannerCount(): Promise<number> {
    return this.page.locator('.swiper-slide, .banner-item').count();
  }

  async tapBanner(index: number): Promise<void> {
    await this.page.locator('.swiper-slide, .banner-item').nth(index).click();
  }

  async getCategoryTiles(): Promise<number> {
    return this.page.locator('.category-tile, .cate-item').count();
  }

  async tapCategory(index: number): Promise<void> {
    await this.page.locator('.category-tile, .cate-item').nth(index).click();
  }

  async getRecommendedProducts(): Promise<string[]> {
    return this.page.locator('.product-card, .goods-item').allTextContents();
  }

  async search(keyword: string): Promise<void> {
    await this.page.fill('input[placeholder*="搜索"], input[type="search"]', keyword);
    await this.page.keyboard.press('Enter');
  }

  async getSearchHistory(): Promise<string[]> {
    return this.page.locator('.search-history .item, .history-item').allTextContents();
  }
}