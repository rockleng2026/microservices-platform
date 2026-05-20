import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await use(page);
  },
});

export { expect } from '@playwright/test';