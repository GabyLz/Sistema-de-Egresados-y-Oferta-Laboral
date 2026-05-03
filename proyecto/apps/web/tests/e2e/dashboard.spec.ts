import { test, expect } from '@playwright/test';

test('dashboard route renders', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await expect(page.getByText('Dashboard Principal')).toBeVisible();
});
