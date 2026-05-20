import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Mini Program Home (MINI-01)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('MINI-01-01: Home displays banner carousel', async () => {
    const banners = await homePage.getBannerCount();
    expect(banners).toBeGreaterThan(0);
  });

  test('MINI-01-03: Home displays category tiles', async () => {
    const categories = await homePage.getCategoryTiles();
    expect(categories).toBeGreaterThan(0);
  });

  test('MINI-01-05: Home displays recommended products', async () => {
    const products = await homePage.getRecommendedProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  test('MINI-01-06: Search works from home', async () => {
    await homePage.search('服务器');
    await page.waitForLoadState('networkidle');
    // Verify search results page loaded
    expect(page.url()).toContain('keyword');
  });
});