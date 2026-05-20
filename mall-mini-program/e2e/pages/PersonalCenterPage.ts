import { Page } from '@playwright/test';

export class PersonalCenterPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/pages/user/index');
    await this.page.waitForLoadState('networkidle');
  }

  async getUserInfo(): Promise<{ nickname: string; avatar: string; phone: string }> {
    const nicknameEl = this.page.locator('.nickname, .user-name');
    const avatarEl = this.page.locator('.avatar, .user-avatar');
    const phoneEl = this.page.locator('.phone, .user-phone');
    return {
      nickname: await nicknameEl.textContent() || '',
      avatar: await avatarEl.getAttribute('src') || '',
      phone: await phoneEl.textContent() || ''
    };
  }

  async editProfile(): Promise<void> {
    const editBtn = this.page.locator('.edit-profile-btn, button:has-text("编辑")');
    if (await editBtn.isVisible()) {
      await editBtn.click();
    }
  }

  async manageAddresses(): Promise<void> {
    const addressSection = this.page.locator('.address-section, a:has-text("收货地址")');
    if (await addressSection.isVisible()) {
      await addressSection.click();
    }
  }

  async addAddress(address: { name: string; phone: string; address: string }): Promise<void> {
    await this.page.click('button:has-text("新增地址"), .add-address-btn');
    await this.page.fill('input[name="name"], .name-input', address.name);
    await this.page.fill('input[name="phone"], .phone-input', address.phone);
    await this.page.fill('input[name="address"], .address-input', address.address);
    await this.page.click('button:has-text("保存")');
  }

  async editAddress(addressId: string): Promise<void> {
    await this.page.click(`[data-address-id="${addressId}"] .edit-btn`);
  }

  async deleteAddress(addressId: string): Promise<void> {
    await this.page.click(`[data-address-id="${addressId}"] .delete-btn`);
    const confirmBtn = this.page.locator('button:has-text("确定")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    await this.page.click(`[data-address-id="${addressId}"] .set-default-btn`);
  }

  async viewCoupons(): Promise<void> {
    await this.page.click('a:has-text("优惠券"), .coupon-section');
  }

  async viewFavorites(): Promise<void> {
    await this.page.click('a:has-text("收藏"), .favorite-section');
  }

  async removeFromFavorites(index: number): Promise<void> {
    const removeBtn = this.page.locator('.favorite-item .remove-btn, .goods-item .del').nth(index);
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
    }
  }

  async viewPointsBalance(): Promise<string> {
    return this.page.locator('.points-balance, .points').textContent() || '';
  }

  async viewPointsHistory(): Promise<void> {
    await this.page.click('a:has-text("积分明细"), .points-history');
  }
}