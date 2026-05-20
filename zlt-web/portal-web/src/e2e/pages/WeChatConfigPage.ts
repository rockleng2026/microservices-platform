import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WeChatConfigPage extends BasePage {
  async goto(): Promise<void> {
    await this.goto('/mall-admin/wechat-config');
  }

  async fillAppId(value: string): Promise<void> {
    await this.fillForm('input[placeholder="请输入微信支付AppID"]', value);
  }

  async fillMchId(value: string): Promise<void> {
    await this.fillForm('input[placeholder="请输入微信支付商户号"]', value);
  }

  async fillApiKey(value: string): Promise<void> {
    await this.fillForm('input[placeholder="请输入API密钥（32位）"]', value);
  }

  async fillCertPath(value: string): Promise<void> {
    await this.fillForm('input[placeholder="请输入证书路径或上传证书文件"]', value);
  }

  async clickSaveButton(): Promise<void> {
    await this.clickButton('保存配置');
  }

  async clickTestButton(): Promise<void> {
    await this.clickButton('测试连接');
  }

  async getConfigStatus(): Promise<string | null> {
    const tag = this.page.locator('.ant-tag');
    if (await tag.isVisible()) {
      return tag.textContent();
    }
    return null;
  }
}