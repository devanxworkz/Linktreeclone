import { expect, test, type Page } from '@playwright/test';

function unique(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000)}`;
}

async function register(page: Page, opts: { name: string; username: string; email: string; password: string }) {
  await page.goto('/register');
  await page.getByLabel('Your name').fill(opts.name);
  await page.getByLabel('Username').fill(opts.username);
  await page.getByLabel('Email').fill(opts.email);
  await page.getByLabel('Password').fill(opts.password);
  await page.getByRole('button', { name: 'Create my page' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('Pehchaan happy paths', () => {
  test('landing page renders the hero and calls to action', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'One link for everything you create.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create your page — free' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'See pricing' })).toBeVisible();
  });

  test('pricing and legal pages load', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: 'Simple pricing' })).toBeVisible();
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy policy' })).toBeVisible();
  });

  test('a creator can register, add a link, publish and see the public page', async ({ page }) => {
    const username = unique('e2e').toLowerCase();
    const email = `${username}@example.com`;

    await register(page, { name: 'E2E Creator', username, email, password: 'password123' });

    // Dashboard shows the creator's name.
    await expect(page.getByRole('heading', { name: /Hi E2E Creator/ })).toBeVisible();

    // Add a link.
    await page.goto('/dashboard/links');
    await page.getByRole('button', { name: 'Add link' }).first().click();
    await page.getByLabel('Title').fill('My Instagram');
    await page.getByLabel('URL').fill('https://instagram.com/e2ecreator');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('My Instagram')).toBeVisible();

    // Publish from the preview screen.
    await page.goto('/dashboard/preview');
    const publishSwitch = page.getByRole('switch', { name: 'Publish my page' });
    await publishSwitch.click();
    await expect(publishSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('Live', { exact: true })).toBeVisible();

    // The public page is now reachable and shows the link. A link to a known
    // social host renders as a compact icon (not a full-width titled button).
    await page.goto(`/u/${username}`);
    await expect(page.getByRole('heading', { name: 'E2E Creator' })).toBeVisible();
    const ig = page.locator('[data-testid="social-links"] [data-social="instagram"]');
    await expect(ig).toBeVisible();
    await expect(ig).toHaveAttribute('href', 'https://instagram.com/e2ecreator');
  });

  test('a returning creator can log out and log back in', async ({ page }) => {
    const username = unique('ret').toLowerCase();
    const email = `${username}@example.com`;

    await register(page, { name: 'Returning Creator', username, email, password: 'password123' });

    await page.goto('/dashboard/account');
    await page.getByRole('main').getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Hi Returning Creator/ })).toBeVisible();
  });

  test('an unknown creator page shows the not-available state', async ({ page }) => {
    await page.goto('/u/definitely-not-a-real-creator');
    await expect(page.getByText('This page is not available')).toBeVisible();
  });
});
