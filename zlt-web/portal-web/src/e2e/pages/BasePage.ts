import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page, protected baseURL: string = 'http://localhost:8001') {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  async clickButton(text: string): Promise<void> {
    await this.page.click(`button:has-text("${text}")`);
  }

  async fillForm(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async getTableRows(selector: string): Promise<string[]> {
    return this.page.locator(selector).allTextContents();
  }

  async waitForSelector(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }
}