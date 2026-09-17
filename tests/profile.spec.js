import { test, expect } from '@playwright/test';

test('3D voyage discovers islands, persists progress and resets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#adventure');
  await expect(page.locator('#ocean')).toHaveAttribute('data-ready', 'true');
  await page.locator('#adventure').screenshot({ path: 'preview-game.png' });
  for (let i = 0; i < 3; i++) {
    await page.locator(`[data-island="${i}"]`).click();
    await expect(page.locator(`[data-island="${i}"]`)).toHaveClass(/discovered/, {
      timeout: 20000,
    });
    await expect(page.locator('#discovery-link')).toHaveAttribute(
      'href',
      ['#focus', '#notes', 'case-study.html'][i],
    );
  }
  await expect(page.locator('#discovery-count')).toContainText('Explorer’s Seal');
  await page.reload();
  await expect(page.locator('#discovery-count')).toContainText('3 / 3');
  await page.locator('#restart-voyage').click();
  await expect(page.locator('#discovery-count')).toContainText('0 / 3');
  await page.locator('[data-island="2"]').click();
  await expect(page.locator('[data-island="2"]')).toHaveClass(/discovered/, { timeout: 20000 });
  await expect(page.locator('#discovery-count')).toContainText('1 / 3');
  expect(errors).toEqual([]);
});

test('navigation preserves elapsed time with a slow animation loop', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFrame = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) =>
      nativeFrame(() => setTimeout(() => callback(performance.now()), 125));
  });
  await page.goto('/#adventure');
  await expect(page.locator('#ocean')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-island="2"]').click();
  await expect(page.locator('[data-island="2"]')).toHaveClass(/discovered/, { timeout: 15000 });
  await expect(page.locator('#discovery-count')).toContainText('1 / 3');
});

test('timer, browser notes, export and safe searchable destinations', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-minutes="5"]').click();
  await expect(page.locator('#timer')).toHaveText('05:00');
  await page.locator('#toggle').click();
  await expect(page.locator('#toggle')).toHaveText('Pause');
  await page.waitForTimeout(1100);
  await page.locator('#toggle').click();
  await expect(page.locator('#timer')).not.toHaveText('05:00');
  await page.locator('#reset').click();
  await expect(page.locator('#timer')).toHaveText('05:00');
  await page.locator('#notepad').fill('Private test note');
  await page.reload();
  await expect(page.locator('#notepad')).toHaveValue('Private test note');
  const download = page.waitForEvent('download');
  await page.locator('#export').click();
  expect((await download).suggestedFilename()).toBe('captains-notes.txt');
  await page.locator('#add-link').click();
  await page.locator('#link-name').fill('My docs');
  await page.locator('#link-url').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Add destination', exact: true }).click();
  await expect(page.locator('#link-error')).toContainText('https://');
  await page.locator('#link-url').fill('https://example.com/');
  await page.getByRole('button', { name: 'Add destination', exact: true }).click();
  await expect(page.locator('#link-dialog')).not.toBeVisible();
  await page.locator('#search').fill('My docs');
  await expect(page.locator('.link-card')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('link', { name: 'My docs' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove My docs' }).click();
  await expect(page.getByRole('link', { name: 'My docs' })).toHaveCount(0);
  await page.locator('#timezone').selectOption('UTC');
  await expect(page.locator('#clock')).toHaveText(/\d{2}:\d{2}:\d{2}/);
});

test('mobile layout, touch destination and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#adventure');
  await expect(page.locator('#ocean')).toHaveAttribute('data-ready', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'preview-mobile.png', fullPage: true });
  await page.locator('[data-island="0"]').click();
  await expect(page.locator('[data-island="0"]')).toHaveClass(/discovered/, { timeout: 20000 });
});

test('WebGL unavailable still exposes islands and tools', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return String(type).includes('webgl') ? null : original.call(this, type, ...args);
    };
  });
  await page.goto('/#adventure');
  await expect(page.locator('#game-status')).toContainText('3D is unavailable');
  await page.locator('[data-island="2"]').click();
  await expect(page.locator('#discovery-link')).toHaveAttribute('href', 'case-study.html');
});

test('case study is reachable without the game and reads on mobile', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Read the case study' }).click();
  await expect(page).toHaveURL(/case-study\.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A profile you can');
  await expect(page.getByRole('link', { name: 'View automated checks' })).toHaveAttribute(
    'href',
    /actions\/workflows\/quality\.yml/,
  );
  await page.screenshot({ path: 'preview-case-study.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Play the demo' }).click();
  await expect(page).toHaveURL(/#adventure$/);
  expect(errors).toEqual([]);
});
