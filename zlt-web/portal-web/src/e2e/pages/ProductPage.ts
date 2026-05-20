import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate('/mall-admin/goods');
  }

  async clickCreateButton(): Promise<void> {
    await this.clickButton('新建商品');
  }

  async fillProductForm(data: { name: string; price: string; stock: string }): Promise<void> {
    await this.fillForm('input[placeholder="请输入商品名称"]', data.name);
    await this.fillForm('input[placeholder="请输入价格"]', data.price);
    await this.fillForm('input[placeholder="请输入库存"]', data.stock);
  }

  async submitForm(): Promise<void> {
    await this.clickButton('提交');
  }

  async getProductTableRows(): Promise<string[]> {
    return this.getTableRows('.ant-table-tbody tr');
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.fillForm('input[placeholder="搜索商品"]', keyword);
    await this.clickButton('搜索');
  }

  async batchEnable(): Promise<void> {
    await this.clickButton('批量上架');
  }

  async batchDisable(): Promise<void> {
    await this.clickButton('批量下架');
  }

  async clickFirstEditButton(): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑")');
    await editButtons.first().click();
  }

  async clickFirstDetailButton(): Promise<void> {
    const detailButtons = this.page.locator('button:has-text("详情")');
    await detailButtons.first().click();
  }

  async clickFirstDeleteButton(): Promise<void> {
    const deleteButtons = this.page.locator('button:has-text("删除")');
    await deleteButtons.first().click();
  }

  async confirmDelete(): Promise<void> {
    await this.clickButton('确定');
  }
}