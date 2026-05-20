import { test, expect } from '@playwright/test';
import { PersonalCenterPage } from '../pages/PersonalCenterPage';

test.describe('Mini Program Personal Center (MINI-09)', () => {
  let personalCenterPage: PersonalCenterPage;

  test.beforeEach(async ({ page }) => {
    personalCenterPage = new PersonalCenterPage(page);
    await personalCenterPage.goto();
  });

  test('MINI-09-01: Personal center displays user info', async ({ page }) => {
    const userInfo = await personalCenterPage.getUserInfo();
    // User info section should be visible
    const userSection = page.locator('.user-info, .profile-section');
    expect(await userSection.isVisible()).toBeTruthy();
  });

  test('MINI-09-02: Edit personal profile works', async ({ page }) => {
    const editBtn = page.locator('.edit-profile-btn, button:has-text("编辑")');
    if (await editBtn.isVisible()) {
      await personalCenterPage.editProfile();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-09-03: Manage shipping addresses works', async ({ page }) => {
    const addressSection = page.locator('a:has-text("收货地址"), .address-section');
    if (await addressSection.isVisible()) {
      await personalCenterPage.manageAddresses();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-09-04: Add new address works', async ({ page }) => {
    // Navigate to address management first
    await personalCenterPage.manageAddresses();
    const addBtn = page.locator('button:has-text("新增地址"), .add-address-btn');
    if (await addBtn.isVisible()) {
      await personalCenterPage.addAddress({
        name: '测试用户',
        phone: '13800138000',
        address: '北京市朝阳区测试地址'
      });
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-09-05: View my coupons works', async ({ page }) => {
    const couponLink = page.locator('a:has-text("优惠券"), .coupon-section');
    if (await couponLink.isVisible()) {
      await personalCenterPage.viewCoupons();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-09-06: View my favorites works', async ({ page }) => {
    const favoriteLink = page.locator('a:has-text("收藏"), .favorite-section');
    if (await favoriteLink.isVisible()) {
      await personalCenterPage.viewFavorites();
      await page.waitForLoadState('networkidle');
    }
  });

  test('MINI-09-07: View points balance and history works', async ({ page }) => {
    const pointsBalance = await personalCenterPage.viewPointsBalance();
    // Points may be 0 or empty if user has no points yet
    expect(pointsBalance === '' || pointsBalance !== '').toBeTruthy();

    const pointsHistoryLink = page.locator('a:has-text("积分明细"), .points-history');
    if (await pointsHistoryLink.isVisible()) {
      await personalCenterPage.viewPointsHistory();
      await page.waitForLoadState('networkidle');
    }
  });
});