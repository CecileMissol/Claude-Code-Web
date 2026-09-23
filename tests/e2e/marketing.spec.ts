import { expect, test } from '@playwright/test';

const SHOTS = 'tests/e2e/screenshots/marketing';

/**
 * `/` — the marketing home page, across the three reference viewports
 * (390 / 768 / 1440 px, see `playwright.config.ts`). The screenshots in
 * `tests/e2e/screenshots/marketing/` are the deliverable to review visually
 * after any copy or layout change.
 */
test.describe('marketing home page', () => {
  test('renders every section and is captured', async ({ page }, testInfo) => {
    const project = testInfo.project.name;

    await page.goto('/');

    // Hero: a promise, and both calls to action.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /demo|démo/i }).first()).toHaveAttribute(
      'href',
      '/demo/mariage-noir-ivoire',
    );
    await expect(page.getByRole('link', { name: /activate|activer/i }).first()).toHaveAttribute(
      'href',
      '/activate',
    );

    // How it works: exactly four steps.
    const steps = page.locator('ol li');
    await expect(steps).toHaveCount(4);

    // Themes gallery: one card per registered theme, each linking to its demo.
    for (const slug of [
      'mariage-noir-ivoire',
      'mariage-terracotta-bloom',
      'mariage-riviera-postcard',
    ]) {
      await expect(page.locator(`a[href="/demo/${slug}"]`).first()).toBeVisible();
    }

    // vs Canva: five differentiators (the page's only <ul>/<li> list).
    await expect(page.locator('ul > li')).toHaveCount(5);

    // FAQ: six questions, collapsed by default, opening on click.
    const faqItems = page.locator('details');
    await expect(faqItems).toHaveCount(6);
    const firstFaq = faqItems.first();
    await expect(firstFaq).not.toHaveAttribute('open', '');
    await firstFaq.locator('summary').click();
    await expect(firstFaq).toHaveAttribute('open', '');

    // Final banner: the Etsy placeholder and the "already bought" link.
    await expect(page.locator('a[href*="etsy.com"]').first()).toBeVisible();
    await expect(page.locator('a[href="/activate"]').last()).toBeVisible();

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}/home-${project}.png`, fullPage: true });
  });

  test('the language switcher changes the hero copy', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 1 });
    const before = await heading.textContent();

    const other = page.locator('form[aria-label] button:not([aria-current="true"])').first();
    await other.click();

    await expect(heading).not.toHaveText(before ?? '');
  });

  test('404 is branded and links back home', async ({ page }, testInfo) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('svg').first()).toBeVisible();
    const home = page.getByRole('link', { name: /home|accueil/i });
    await expect(home).toHaveAttribute('href', '/');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${SHOTS}/404-${testInfo.project.name}.png` });
  });
});
