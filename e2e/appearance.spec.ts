import { expect, test, type Page } from '@playwright/test';

function unique(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000)}`;
}

async function register(
  page: Page,
  opts: { name: string; username: string; email: string; password: string },
) {
  await page.goto('/register');
  await page.getByLabel('Your name').fill(opts.name);
  await page.getByLabel('Username').fill(opts.username);
  await page.getByLabel('Email').fill(opts.email);
  await page.getByLabel('Password').fill(opts.password);
  await page.getByRole('button', { name: 'Create my page' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

/** The editor's live preview root. */
function preview(page: Page) {
  return page.locator('[data-testid="appearance-preview"] [data-public-view]');
}

/** The button colour the preview is actually painting with. */
function previewAccent(page: Page): Promise<string> {
  return preview(page).evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--pub-accent').trim(),
  );
}

function previewBackground(page: Page): Promise<string> {
  return preview(page).evaluate((el) => (el as HTMLElement).style.background);
}

async function saveAppearance(page: Page) {
  await page.getByRole('button', { name: 'Save appearance' }).click();
  await expect(page.getByRole('status')).toContainText('Appearance saved.');
}

test.describe('storefront appearance editor', () => {
  test('switching a template repaints the preview instantly, no reload', async ({ page }) => {
    const username = unique('look').toLowerCase();

    await register(page, {
      name: 'Look Creator',
      username,
      email: `${username}@example.com`,
      password: 'password123',
    });

    await page.goto('/dashboard/appearance');
    await expect(page.getByTestId('template-gallery')).toBeVisible();
    await expect(page.getByTestId('editor-preview-badge')).toBeVisible();

    // A new creator's preview starts from the accent they had.
    await expect.poll(() => previewAccent(page)).toBe('#e8590c');

    // Pick a dark template.
    const midnight = page.locator('[data-template="midnight-pro"]');
    await midnight.click();
    await expect(midnight).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Selected')).toBeVisible();

    // Preview updates in place — same URL, new paint.
    await expect.poll(() => previewAccent(page)).toBe('#38bdf8');
    await expect.poll(() => previewBackground(page)).toContain('165deg');
    await expect(page).toHaveURL(/\/dashboard\/appearance$/);

    // And switch again without saving anything.
    await page.locator('[data-template="indian-boutique"]').click();
    await expect.poll(() => previewAccent(page)).toBe('#7d1430');
    await expect(page.locator('[data-template="midnight-pro"]')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('a saved design survives a full page reload', async ({ page }) => {
    const username = unique('save').toLowerCase();

    await register(page, {
      name: 'Save Creator',
      username,
      email: `${username}@example.com`,
      password: 'password123',
    });

    await page.goto('/dashboard/appearance');
    await page.locator('[data-template="soft-pastel"]').click();
    await expect.poll(() => previewAccent(page)).toBe('#a78bfa');
    await saveAppearance(page);

    await page.reload();
    await expect(page.getByTestId('template-gallery')).toBeVisible();
    await expect.poll(() => previewAccent(page)).toBe('#a78bfa');
    await expect(page.locator('[data-template="soft-pastel"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('the published public page wears the saved design on every screen', async ({ page }) => {
    const username = unique('wear').toLowerCase();

    await register(page, {
      name: 'Wear Creator',
      username,
      email: `${username}@example.com`,
      password: 'password123',
    });

    await page.goto('/dashboard/appearance');
    await page.locator('[data-template="indian-boutique"]').click();
    await expect.poll(() => previewAccent(page)).toBe('#7d1430');
    await saveAppearance(page);

    // Publish from the preview screen.
    await page.goto('/dashboard/preview');
    const publishSwitch = page.getByRole('switch', { name: 'Publish my page' });
    await publishSwitch.click();
    await expect(publishSwitch).toHaveAttribute('aria-checked', 'true');

    // Desktop: the real page uses the design.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/u/${username}`);
    const publicView = page.locator('[data-public-view]');
    await expect(publicView).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wear Creator' })).toBeVisible();
    await expect
      .poll(() =>
        publicView.evaluate((el) => getComputedStyle(el).getPropertyValue('--pub-accent').trim()),
      )
      .toBe('#7d1430');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    // Mobile: still fine, no sideways scroll.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Wear Creator' })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test('one creator never sees another creator\'s design', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    const userA = unique('isoA').toLowerCase();
    const userB = unique('isoB').toLowerCase();

    try {
      await register(a, {
        name: 'Iso A',
        username: userA,
        email: `${userA}@example.com`,
        password: 'password123',
      });
      await a.goto('/dashboard/appearance');
      await a.locator('[data-template="indian-boutique"]').click();
      await expect.poll(() => previewAccent(a)).toBe('#7d1430');
      await saveAppearance(a);

      await register(b, {
        name: 'Iso B',
        username: userB,
        email: `${userB}@example.com`,
        password: 'password123',
      });
      await b.goto('/dashboard/appearance');
      // B still starts from their own default, untouched by A.
      await expect.poll(() => previewAccent(b)).toBe('#e8590c');
      await b.locator('[data-template="soft-pastel"]').click();
      await saveAppearance(b);

      // A's saved design is unchanged.
      await a.reload();
      await expect.poll(() => previewAccent(a)).toBe('#7d1430');
      await expect(a.locator('[data-template="indian-boutique"]')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}
