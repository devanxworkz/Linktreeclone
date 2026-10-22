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

test.describe('Admin console', () => {
  test('a creator cannot reach the admin console', async ({ page }) => {
    const username = unique('plain').toLowerCase();
    await register(page, {
      name: 'Plain Creator',
      username,
      email: `${username}@example.com`,
      password: 'password123',
    });

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toHaveCount(0);
  });

  test('an admin can sign in, suspend a creator and see the audit entry', async ({ page }) => {
    const username = unique('victim').toLowerCase();
    const email = `${username}@example.com`;

    // A creator signs up, then signs out.
    await register(page, { name: 'Victim Creator', username, email, password: 'password123' });
    await page.goto('/dashboard/account');
    await page.getByRole('main').getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login/);

    // The bootstrap admin signs in (seeded by SEED_ON_BOOT).
    await page.getByLabel('Email').fill('admin@e2e.test');
    await page.getByLabel('Password').fill('Admin@12345');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Overview loads with real metric cards.
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toBeVisible();
    await expect(page.getByText('Creators', { exact: true })).toBeVisible();

    // Find the creator and suspend them.
    await page.goto('/admin/creators');
    await page.getByLabel('Search', { exact: true }).fill(username);
    await page.getByRole('button', { name: 'Search' }).click();

    const row = page.getByRole('row', { name: new RegExp(username, 'i') });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Suspend' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Suspend account' }).click();
    await expect(page.getByText('Account suspended.')).toBeVisible();
    await expect(row.getByText('Suspended')).toBeVisible();

    // The action is recorded in the audit log.
    await page.goto('/admin/roles');
    const auditRow = page.getByRole('row', { name: new RegExp(email, 'i') });
    await expect(auditRow).toBeVisible();
    await expect(auditRow.getByText('User · suspend')).toBeVisible();
  });
});
