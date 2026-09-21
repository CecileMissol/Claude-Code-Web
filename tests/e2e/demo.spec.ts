import { expect, test } from '@playwright/test';

const THEME = 'mariage-noir-ivoire';

/**
 * Opens the public theme demo and captures one screenshot per viewport, so the
 * rendering can be reviewed visually after every theme change.
 */
test('the theme demo renders and is captured', async ({ page }, testInfo) => {
  await page.goto(`/demo/${THEME}`);

  const invitation = page.locator('.invitation');
  await expect(invitation).toBeVisible();
  await expect(invitation).toHaveAttribute('data-theme', THEME);
  await expect(invitation).toHaveAttribute('data-palette', 'noir');
  await expect(invitation).toHaveAttribute('lang', 'fr');

  // Content coming from demo.json.
  await expect(page.getByText('Zoé & Dylan').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notre histoire' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le programme' })).toBeVisible();
  await expect(page.getByRole('link', { name: "Ouvrir l'itinéraire" })).toBeVisible();

  await page.screenshot({
    path: `tests/e2e/screenshots/demo-${THEME}-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
