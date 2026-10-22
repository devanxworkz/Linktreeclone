import { test, expect } from '@playwright/test';

test.describe('Product form focus (real keystrokes)', () => {
  test.beforeEach(async ({ page }) => {
    const stamp = Date.now().toString().slice(-7);
    await page.goto('/register');
    await page.getByLabel('Your name').fill('Focus Tester');
    await page.getByLabel('Username').fill(`focus${stamp}`);
    await page.getByLabel('Email').fill(`pf${stamp}@example.com`);
    await page.getByLabel('Password').fill('Str0ngPass!x');
    await page.getByRole('button', { name: 'Create my page' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/dashboard/products');
    await page.getByRole('button', { name: 'Add product' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('typing with the keyboard stays in the field that was clicked', async ({ page }) => {
    const title = page.getByLabel('Title');
    const description = page.getByLabel('Description');

    // Click into Description and type for real (not fill()).
    await description.click();
    await expect(description).toBeFocused();
    await page.keyboard.type('Crispy dosa batter');

    // Focus must still be Description after the re-render caused by typing.
    const activeId = await page.evaluate(() => document.activeElement?.id);
    expect(activeId).toBe('product-desc');

    // All typed text landed in Description; Title stayed empty.
    await expect(description).toHaveValue('Crispy dosa batter');
    await expect(title).toHaveValue('');
  });

  test('each field receives its own keyboard text independently', async ({ page }) => {
    const title = page.getByLabel('Title');
    const description = page.getByLabel('Description');
    const price = page.getByLabel('Price (₹)');
    const image = page.getByLabel('Image URL');
    const dest = page.getByLabel('Destination URL');

    await title.click();
    await page.keyboard.type('Filter Coffee Kit');
    await description.click();
    await page.keyboard.type('Roasted beans');
    await price.click();
    await page.keyboard.type('499');
    await image.click();
    await page.keyboard.type('https://example.com/coffee.png');
    await dest.click();
    await page.keyboard.type('https://wa.me/918888888888');

    await expect(title).toHaveValue('Filter Coffee Kit');
    await expect(description).toHaveValue('Roasted beans');
    await expect(price).toHaveValue('499');
    await expect(image).toHaveValue('https://example.com/coffee.png');
    await expect(dest).toHaveValue('https://wa.me/918888888888');
  });
});
