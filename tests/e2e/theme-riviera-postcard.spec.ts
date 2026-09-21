import { expect, test, type Page } from '@playwright/test';

/**
 * Visual acceptance of the "Riviera Postcard" theme.
 *
 * The screenshots in `tests/e2e/screenshots/riviera-postcard/` are the
 * deliverable: they are what gets reviewed after every change to the theme, on
 * the three viewports of the brief (390 / 768 / 1440 px). The demo is in
 * English — the priority market (`docs/strategie-produit.md` §2).
 */

const THEME = 'mariage-riviera-postcard';
const SHOTS = 'tests/e2e/screenshots/riviera-postcard';

/** Scrolls to a fraction of a chapter and waits for the pieces to settle. */
async function scrollChapter(page: Page, chapter: string, fraction: number) {
  await page.evaluate(
    ({ chapter, fraction }) => {
      const section = document.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`);
      if (!section) throw new Error(`No chapter "${chapter}"`);
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + travel * fraction, behavior: 'instant' });
    },
    { chapter, fraction },
  );
  // One frame for ScrollTrigger, then the CSS transitions of the pieces.
  await page.waitForTimeout(1600);
}

async function shot(page: Page, name: string, project: string) {
  // The dev server paints its own overlay in a corner; these captures are the
  // deliverable, so it has to go before the shutter.
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach((node) => node.remove());
  });
  await page.screenshot({ path: `${SHOTS}/${name}-${project}.png` });
}

test.describe('Riviera Postcard', () => {
  test('opens, scrolls through every chapter and is captured', async ({ page }, testInfo) => {
    const project = testInfo.project.name;

    await page.goto(`/demo/${THEME}`);

    const invitation = page.locator('.invitation');
    await expect(invitation).toBeVisible();
    await expect(invitation).toHaveAttribute('data-theme', THEME);
    await expect(invitation).toHaveAttribute('data-palette', 'azur');
    await expect(invitation).toHaveAttribute('lang', 'en');

    /* ---------------- Intro, sealed ---------------- */

    const envelope = page.getByRole('button', { name: 'Open the envelope' });
    await expect(envelope).toBeVisible();
    await expect(page.locator('.hint')).toHaveText('Tap the envelope to open it');
    await expect(page.locator('.par-avion')).toHaveText('Par avion · by air mail');
    await expect(invitation).toHaveAttribute('data-opened', 'false');

    // Wait for the fonts and the GSAP chunk so the capture is stable.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await shot(page, 'intro-closed', project);

    // Scrolling is locked until the envelope is opened: the guest cannot wheel
    // or swipe past it. (`overflow: hidden` clips user scrolling but still
    // answers `scrollTo`, so the wheel is what must be asserted.)
    await expect(page.locator('html')).toHaveClass(/invitation-locked/);
    await page.mouse.move(195, 400);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    /* ---------------- Intro, opening ---------------- */

    await envelope.click();
    await expect(invitation).toHaveAttribute('data-ready', 'true', { timeout: 10_000 });
    await expect(invitation).toHaveAttribute('data-opened', 'true');

    // The save-the-date postcard is out, and its date is readable through the
    // pocket — the defect of theme 1 that this envelope is shaped to avoid.
    await expect(page.locator('.card .c1')).toHaveText('Save the date');
    await expect(page.locator('.card .c2')).toHaveText('06.19.27');
    await expect(page.locator('.cue')).toContainText('Scroll');
    await page.waitForTimeout(400);
    await shot(page, 'intro-open', project);

    // Scrolling is free again.
    await expect(page.locator('html')).not.toHaveClass(/invitation-locked/);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    /* ---------------- Chapter 1: the story ---------------- */

    await scrollChapter(page, 'story', 0.85);
    await expect(page.getByRole('heading', { name: 'Our story' })).toBeVisible();
    await expect(page.locator('[data-chapter="story"] .note')).toHaveText(
      'we missed the last ferry',
    );
    await expect(page.locator('[data-chapter="story"] .luggage .route')).toHaveText(
      'Capri → Positano',
    );
    // Every piece of the collage has arrived by 85 %.
    expect(await countOn(page, 'story')).toBe(await countPieces(page, 'story'));
    await shot(page, 'chapter-story', project);

    /* ---------------- Chapter 2: the date ---------------- */

    await scrollChapter(page, 'date', 0.88);
    await expect(page.getByRole('heading', { name: 'The date' })).toBeVisible();
    await expect(page.locator('[data-chapter="date"] .bigscript')).toHaveText('the big day');
    await expect(page.locator('[data-chapter="date"] .azulejo')).toHaveCount(3);
    await expect(page.getByRole('timer')).toBeVisible();
    // The countdown is running, not stuck on the server's zeros.
    const days = await page.locator('.count b').first().textContent();
    expect(Number(days)).toBeGreaterThan(0);
    expect(await countOn(page, 'date')).toBe(await countPieces(page, 'date'));
    await shot(page, 'chapter-date', project);

    /* ---------------- Chapter 3: the programme ---------------- */

    await scrollChapter(page, 'program', 0.9);
    await expect(page.getByRole('heading', { name: 'The day' })).toBeVisible();
    const program = page.locator('[data-chapter="program"]');
    await expect(program.locator('.menu-kicker')).toHaveText('Menu of the day');
    await expect(program.getByText('Ceremony', { exact: true })).toBeVisible();
    await expect(program.getByText('Dancing', { exact: true })).toBeVisible();
    // Every row of the menu has been written by 90 %.
    expect(await countOn(page, 'program')).toBe(await countPieces(page, 'program'));
    await shot(page, 'chapter-program', project);

    /* ---------------- Chapter 4: the venue ---------------- */

    await scrollChapter(page, 'place', 0.9);
    await expect(page.getByRole('heading', { name: 'The place' })).toBeVisible();
    await expect(page.locator('[data-chapter="place"] .postcard .img span')).toHaveText('Positano');
    const directions = page.getByRole('link', { name: 'Open directions' });
    await expect(directions).toHaveAttribute('href', /google\.com\/maps/);
    expect(await countOn(page, 'place')).toBe(await countPieces(page, 'place'));
    await shot(page, 'chapter-place', project);

    /* ---------------- Good to know ---------------- */

    await page.getByRole('heading', { name: 'Good to know' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await expect(page.locator('.tag.on').first()).toBeVisible();
    await shot(page, 'info', project);

    /* ---------------- RSVP ---------------- */

    await page.locator('#rsvp').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await shot(page, 'rsvp', project);

    await page.getByLabel('Full name').fill('Camille Roy');
    await page.getByLabel('Email').fill('camille@example.com');
    await page.getByText('With joy').click();
    await page.getByRole('button', { name: 'Send my reply' }).click();

    // Demo mode fakes the success: the postal seal lands and the thanks show.
    await expect(page.locator('.rsvp.sent')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.thanks')).toHaveText('Thank you, your reply has arrived.');
    await page.waitForTimeout(800);
    await shot(page, 'rsvp-sent', project);

    /* ---------------- Signature ---------------- */

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await shot(page, 'signature', project);
  });

  test('replays the intro on demand', async ({ page }) => {
    await page.goto(`/demo/${THEME}`);
    const invitation = page.locator('.invitation');

    await page.getByRole('button', { name: 'Open the envelope' }).click();
    await expect(invitation).toHaveAttribute('data-ready', 'true', { timeout: 10_000 });

    await page.evaluate(() =>
      window.dispatchEvent(new CustomEvent('invitation:replay', { bubbles: true })),
    );

    await expect(invitation).toHaveAttribute('data-opened', 'false');
    await expect(invitation).toHaveAttribute('data-ready', 'false');

    // And it can be opened again.
    await page.getByRole('button', { name: 'Open the envelope' }).click();
    await expect(invitation).toHaveAttribute('data-ready', 'true', { timeout: 10_000 });
  });

  test('respects prefers-reduced-motion', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/demo/${THEME}`);

    const invitation = page.locator('.invitation');
    await expect(invitation).toHaveAttribute('data-reduced', 'true');
    // Already open, nothing to click, nothing locked.
    await expect(invitation).toHaveAttribute('data-ready', 'true');

    await expect(page.locator('html')).not.toHaveClass(/invitation-locked/);
    await page.mouse.move(195, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    // Every sentence is readable at once, no piece is hidden.
    await page.getByRole('heading', { name: 'Our story' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-chapter="story"] .line')].filter(
          (line) => getComputedStyle(line).opacity === '0',
        ).length,
    );
    expect(hidden).toBe(0);

    await shot(page, 'reduced-motion', testInfo.project.name);
  });
});

/** Number of collage pieces declared by a chapter. */
function countPieces(page: Page, chapter: string) {
  return page.locator(`[data-chapter="${chapter}"] .board [data-at]`).count();
}

/** Number of those pieces that have arrived. */
function countOn(page: Page, chapter: string) {
  return page.locator(`[data-chapter="${chapter}"] .board [data-at].on`).count();
}
