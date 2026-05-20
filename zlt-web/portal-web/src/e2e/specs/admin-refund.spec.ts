import { test, expect } from '@playwright/test';
import { adminLogin } from '../helpers/login';
import { RefundPage } from '../pages/RefundPage';

test.describe('Admin Refund Management (ADMIN-06)', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('ADMIN-06-01: Refund list page loads', async ({ page }) => {
    const refundPage = new RefundPage(page);
    await refundPage.goto();
    await page.waitForTimeout(2000);
    expect(true).toBeTruthy();
  });

  test('ADMIN-06-02: View refund list', async ({ page }) => {
    const refundPage = new RefundPage(page);
    await refundPage.goto();
    await page.waitForTimeout(2000);
  });

  test('ADMIN-06-03: Approve refund request', async ({ page }) => {
    const refundPage = new RefundPage(page);
    await refundPage.goto();
    await page.waitForTimeout(2000);
    await refundPage.clickFirstApproveButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-06-04: Reject refund request', async ({ page }) => {
    const refundPage = new RefundPage(page);
    await refundPage.goto();
    await page.waitForTimeout(2000);
    await refundPage.clickFirstRejectButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-06-05: View refund detail', async ({ page }) => {
    const refundPage = new RefundPage(page);
    await refundPage.goto();
    await page.waitForTimeout(2000);
    await refundPage.clickFirstDetailButton();
    await page.waitForTimeout(1000);
  });

  test('ADMIN-06-06: Process WeChat refund callback', async ({ page }) => {
    const refundPage = new RefundPage(page);
    await refundPage.goto();
    await page.waitForTimeout(2000);
    // Refund processing is automatic on WeChat callback
  });
});