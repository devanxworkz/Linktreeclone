import { expect, test, type Page } from '@playwright/test';

function unique(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000)}`;
}

async function register(page: Page, username: string) {
  await page.goto('/register');
  await page.getByLabel('Your name').fill('Prod Tester');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(`${username}@example.com`);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create my page' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('Product form field independence', () => {
  test('each of the five fields updates only its own value', async ({ page }) => {
    const username = unique('prod').toLowerCase();
    await register(page, username);

    await page.goto('/dashboard/products');
    await page.getByRole('button', { name: 'Add product' }).first().click();

    const title = page.getByLabel('Title');
    const description = page.getByLabel('Description');
    const price = page.getByLabel('Price (₹)');
    const image = page.getByLabel('Image URL');
    const destination = page.getByLabel('Destination URL');

    // Start from empty.
    for (const f of [title, description, price, image, destination]) {
      await expect(f).toHaveValue('');
    }

    // 1. Title
    await title.fill('Masala Dosa Box');
    await expect(title).toHaveValue('Masala Dosa Box');
    await expect(description).toHaveValue('');
    await expect(price).toHaveValue('');
    await expect(image).toHaveValue('');
    await expect(destination).toHaveValue('');

    // 2. Description — must not touch Title
    await description.fill('Crispy dosa with coconut chutney');
    await expect(description).toHaveValue('Crispy dosa with coconut chutney');
    await expect(title).toHaveValue('Masala Dosa Box');
    await expect(price).toHaveValue('');
    await expect(image).toHaveValue('');
    await expect(destination).toHaveValue('');

    // 3. Price — must not touch Title or Description
    await price.fill('250');
    await expect(price).toHaveValue('250');
    await expect(title).toHaveValue('Masala Dosa Box');
    await expect(description).toHaveValue('Crispy dosa with coconut chutney');
    await expect(image).toHaveValue('');
    await expect(destination).toHaveValue('');

    // 4. Image URL — must not touch the three above
    await image.fill('https://example.com/dosa.png');
    await expect(image).toHaveValue('https://example.com/dosa.png');
    await expect(title).toHaveValue('Masala Dosa Box');
    await expect(description).toHaveValue('Crispy dosa with coconut chutney');
    await expect(price).toHaveValue('250');
    await expect(destination).toHaveValue('');

    // 5. Destination URL — must not touch the four above
    await destination.fill('https://wa.me/919999999999');
    await expect(destination).toHaveValue('https://wa.me/919999999999');
    await expect(title).toHaveValue('Masala Dosa Box');
    await expect(description).toHaveValue('Crispy dosa with coconut chutney');
    await expect(price).toHaveValue('250');
    await expect(image).toHaveValue('https://example.com/dosa.png');
  });

  test('saving a product with all five fields works, and editing keeps other fields', async ({ page }) => {
    const username = unique('edit').toLowerCase();
    await register(page, username);

    await page.goto('/dashboard/products');
    await page.getByRole('button', { name: 'Add product' }).first().click();

    await page.getByLabel('Title').fill('Filter Coffee Kit');
    await page.getByLabel('Description').fill('South Indian filter coffee');
    await page.getByLabel('Price (₹)').fill('499');
    await page.getByLabel('Image URL').fill('https://example.com/coffee.png');
    await page.getByLabel('Destination URL').fill('https://wa.me/918888888888');
    await page.getByRole('button', { name: 'Save' }).click();

    // Saved product appears with its own price and host.
    await expect(page.getByText('Filter Coffee Kit')).toBeVisible();
    await expect(page.getByText('₹499 · wa.me')).toBeVisible();

    // Re-open and change ONLY the description.
    await page.getByRole('button', { name: 'Edit details' }).first().click();
    await page.getByLabel('Description').fill('Freshly roasted beans');
    await page.getByRole('button', { name: 'Save' }).click();

    // The list still shows the product (list rows render title + price·host only).
    await expect(page.getByText('Filter Coffee Kit')).toBeVisible();
    await expect(page.getByText('₹499 · wa.me')).toBeVisible();

    // Re-open to confirm persistence: only the description changed; every
    // other field kept its own value.
    await page.getByRole('button', { name: 'Edit details' }).first().click();
    await expect(page.getByLabel('Title')).toHaveValue('Filter Coffee Kit');
    await expect(page.getByLabel('Description')).toHaveValue('Freshly roasted beans');
    await expect(page.getByLabel('Price (₹)')).toHaveValue('499');
    await expect(page.getByLabel('Image URL')).toHaveValue('https://example.com/coffee.png');
    await expect(page.getByLabel('Destination URL')).toHaveValue('https://wa.me/918888888888');
  });
});
