import { expect, test, type Page } from '@playwright/test';

function unique(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 1000)}`;
}

async function register(page: Page, name: string, username: string) {
  await page.goto('/register');
  await page.getByLabel('Your name').fill(name);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(`${username}@example.com`);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create my page' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function addLink(page: Page, link: { title: string; url: string; icon: string }) {
  const res = await page.request.post('/api/links', { data: link });
  expect(res.ok(), `create link ${link.title}`).toBeTruthy();
}

async function publish(page: Page) {
  const res = await page.request.post('/api/profile/publish', { data: { isPublished: true } });
  expect(res.ok()).toBeTruthy();
}

test.describe('public page social icon row', () => {
  test('social links become icons with correct, safe destinations; other links stay buttons', async ({
    page,
  }) => {
    const username = unique('soc').toLowerCase();
    await register(page, 'Social Creator', username);

    await addLink(page, { title: 'Myself', url: 'https://instagram.com/myself', icon: 'instagram' });
    await addLink(page, { title: 'my link', url: 'https://linkedin.com/in/me', icon: 'linkedin' });
    await addLink(page, { title: 'Studio', url: 'https://youtube.com/@studio', icon: 'youtube' });
    // Saved before platform icons existed: only the URL identifies the platform.
    await addLink(page, { title: 'My shop', url: 'https://example.com/shop', icon: 'link' });
    await addLink(page, { title: 'Old TikTok', url: 'https://tiktok.com/@me', icon: 'link' });
    await publish(page);

    await page.goto(`/u/${username}`);
    await expect(page.getByRole('heading', { name: 'Social Creator' })).toBeVisible();

    const row = page.locator('[data-testid="social-links"]');
    await expect(row).toBeVisible();

    const expected: [string, string][] = [
      ['instagram', 'https://instagram.com/myself'],
      ['linkedin', 'https://linkedin.com/in/me'],
      ['youtube', 'https://youtube.com/@studio'],
      ['tiktok', 'https://tiktok.com/@me'],
    ];
    for (const [platform, href] of expected) {
      const icon = row.locator(`a[data-social="${platform}"]`);
      await expect(icon).toBeVisible();
      await expect(icon).toHaveAttribute('href', href);
      await expect(icon).toHaveAttribute('target', '_blank');
      await expect(icon).toHaveAttribute('rel', /noreferrer/);
      // Accessible label names the platform (and keeps the creator's own title).
      await expect(icon).toHaveAttribute('aria-label', new RegExp(platform, 'i'));
    }

    // Icons are round and consistently sized.
    const box = await row.locator('a[data-social="instagram"]').boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.width)).toBe(Math.round(box!.height));

    // The normal link keeps the full-width titled button (with its domain).
    const shop = page.getByRole('link', { name: /My shop/ });
    await expect(shop).toBeVisible();
    await expect(shop).toHaveAttribute('href', 'https://example.com/shop');
    await expect(page.getByText('example.com')).toBeVisible();

    // Social domain text is gone from the page.
    await expect(page.getByText('instagram.com')).toHaveCount(0);
    await expect(page.getByText('linkedin.com')).toHaveCount(0);
  });

  test('an icon opens its destination in a new tab', async ({ page }) => {
    const username = unique('tab').toLowerCase();
    await register(page, 'Tab Creator', username);
    await addLink(page, { title: 'Myself', url: 'https://instagram.com/tabtest', icon: 'instagram' });
    await publish(page);

    await page.goto(`/u/${username}`);
    const icon = page.locator('[data-testid="social-links"] [data-social="instagram"]');
    await expect(icon).toBeVisible();

    const [popup] = await Promise.all([page.waitForEvent('popup'), icon.click()]);
    expect(popup.url()).toContain('instagram.com/tabtest');
    await popup.close();
  });

  test('no social links means no empty icon row', async ({ page }) => {
    const username = unique('nosoc').toLowerCase();
    await register(page, 'Plain Creator', username);
    // Only generic links (no platform icon, non-social host): no icon row.
    await addLink(page, { title: 'Portfolio', url: 'https://example.com/portfolio', icon: 'link' });
    await addLink(page, { title: 'Shop', url: 'https://myshop.example', icon: 'bag' });
    await publish(page);

    await page.goto(`/u/${username}`);
    await expect(page.getByRole('heading', { name: 'Plain Creator' })).toBeVisible();
    await expect(page.locator('[data-testid="social-links"]')).toHaveCount(0);
    // Both links keep the full-width titled button treatment.
    await expect(page.getByRole('link', { name: /Portfolio/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Shop/ })).toBeVisible();
  });

  test('the icon row wraps gracefully on a narrow screen', async ({ page }) => {
    const username = unique('wrap').toLowerCase();
    await register(page, 'Wrap Creator', username);
    for (const [platform, url] of [
      ['instagram', 'https://instagram.com/wrap'],
      ['linkedin', 'https://linkedin.com/in/wrap'],
      ['youtube', 'https://youtube.com/@wrap'],
      ['facebook', 'https://facebook.com/wrap'],
      ['tiktok', 'https://tiktok.com/@wrap'],
      ['x', 'https://x.com/wrap'],
      ['whatsapp', 'https://wa.me/919876543210'],
      ['globe', 'https://example.com'],
    ] as const) {
      await addLink(page, { title: platform, url, icon: platform });
    }
    await publish(page);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/u/${username}`);
    const row = page.locator('[data-testid="social-links"]');
    await expect(row).toBeVisible();
    await expect(row.locator('a[data-social]')).toHaveCount(8);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    // With 8 icons at 375px the row must wrap to more than one line.
    const box = await row.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(48);
  });
});
