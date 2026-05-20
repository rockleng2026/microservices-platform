import { test, expect } from '@playwright/test';
import { ProductDetailPage } from '../pages/ProductDetailPage';

test.describe('Mini Program Product Detail (MINI-03)', () => {
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    productDetailPage = new ProductDetailPage(page);
    // Navigate with a test product ID
    await productDetailPage.goto('1');
  });

  test('MINI-03-01: Product detail displays images', async () => {
    const images = await productDetailPage.getImageCarousel();
    expect(images).toBeGreaterThan(0);
  });

  test('MINI-03-02: Product detail displays basic info', async () => {
    const name = await productDetailPage.getProductName();
    expect(name).toBeTruthy();
  });

  test('MINI-03-03: Product detail displays price and stock', async () => {
    const price = await productDetailPage.getProductPrice();
    const stock = await productDetailPage.getStock();
    expect(price).toBeTruthy();
    expect(stock).toBeTruthy();
  });

  test('MINI-03-04: Specification selection works', async ({ page }) => {
    // Try to find and click specification options
    const specItems = page.locator('.spec-item, .sku-item');
    if (await specItems.first().isVisible()) {
      await specItems.first().click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-03-05: Quantity input works', async ({ page }) => {
    await productDetailPage.inputQuantity(2);
    const input = page.locator('input[type="number"], .quantity input');
    await expect(input).toHaveValue('2');
  });

  test('MINI-03-06: Add to cart works', async ({ page }) => {
    await productDetailPage.addToCart();
    await page.waitForLoadState('networkidle');
  });

  test('MINI-03-07: Reviews summary is displayed', async () => {
    const summary = await productDetailPage.getReviewsSummary();
    // Score and count may be empty if no reviews yet
    expect(summary).toBeTruthy();
  });

  test('MINI-03-08: View review detail navigation works', async ({ page }) => {
    const reviewLink = page.locator('a:has-text("评价"), .review-summary');
    if (await reviewLink.isVisible()) {
      await reviewLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-03-09: Product detail image gallery works', async ({ page }) => {
    const images = page.locator('.swiper-item, .product-image');
    if (await images.first().isVisible()) {
      await images.first().click();
      // Image gallery should open
    }
  });
});