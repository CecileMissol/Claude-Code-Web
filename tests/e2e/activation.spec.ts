import { expect, test } from '@playwright/test';

/**
 * `/activate` → `/admin` → approval → draft invitation exists.
 *
 * The buyer-facing half of this flow (submitting the activation request and
 * seeing the confirmation) is driven through the real UI below. The
 * admin-facing half (signing in as an `ADMIN_EMAILS` address, seeing the
 * request in the queue, approving it, and confirming the draft invitation)
 * needs a real Better Auth session, which in this project only ever comes
 * from clicking a magic link delivered by email. With `MAIL_DRIVER=console`
 * that link is written to the server process's stdout, which Playwright has
 * no supported way to read back from its `webServer` here — there is no
 * test-only auth bypass route in this codebase (deliberately: adding one is
 * outside this phase's file scope). That portion is therefore documented as
 * a manual verification step rather than faked, instead of asserting
 * something this test cannot actually prove.
 */

function uniqueOrderId(): string {
  // 10 digits, matching the typical Etsy order id length.
  return String(1_000_000_000 + Math.floor(Math.random() * 899_999_999));
}

test('submitting an activation request shows the confirmation', async ({ page }) => {
  const orderId = uniqueOrderId();

  await page.goto('/activate');
  await page.getByLabel(/order number|numéro de commande/i).fill(orderId);
  await page.getByLabel(/email/i).first().fill(`buyer-${orderId}@example.com`);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /activate|activer/i }).click();

  await expect(page.getByTestId('activation-confirmation')).toBeVisible();
});

test('re-submitting the same order and theme is refused as a duplicate', async ({ page }) => {
  const orderId = uniqueOrderId();
  const email = `buyer-${orderId}@example.com`;

  async function submit() {
    await page.goto('/activate');
    await page.getByLabel(/order number|numéro de commande/i).fill(orderId);
    await page.getByLabel(/email/i).first().fill(email);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /activate|activer/i }).click();
  }

  await submit();
  await expect(page.getByTestId('activation-confirmation')).toBeVisible();

  await submit();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('activation-confirmation')).not.toBeVisible();
});

test('/admin requires a signed-in admin session', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

/*
 * Manual verification for the admin half of the flow (documented, not
 * automated — see the file-level comment above):
 *
 * 1. Run `pnpm dev` with `ADMIN_EMAILS` set to an address you control and
 *    `MAIL_DRIVER=console`.
 * 2. Submit `/activate` as a buyer; the request appears under the
 *    "Activations" tab of `/admin` after signing in as the admin address
 *    (the sign-in magic link is printed to the server console).
 * 3. Click "Approve": the row disappears from the pending queue, an
 *    `activation.approved` entry appears in the "Journal" tab, and a new
 *    draft invitation for the buyer appears under the "Invitations" tab.
 */
