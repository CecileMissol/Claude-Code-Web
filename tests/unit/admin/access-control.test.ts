import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Database } from '@/db';
import { themes, user } from '@/db/schema';
import { createActivation, markActivationApproved } from '@/db/queries';
import { isEmailAllowedToSignIn } from '@/lib/auth';
import { resetEnvCache } from '@/lib/env';
import { createTestD1, type TestD1 } from '../helpers/d1';

/**
 * The sign-in gate ("verrou de connexion"): a magic link may only be mailed
 * to an admin, an existing account, or an approved Etsy activation.
 */

let d1: TestD1;
let db: Database;

const THEME_ID = 'theme-1';

beforeEach(async () => {
  d1 = createTestD1();
  db = createDb(d1.binding);

  // `wrangler types` narrows `process.env` to literal types, hence the cast
  // (same pattern as `tests/unit/lib.test.ts`).
  const env = process.env as unknown as Record<string, string>;
  env.BETTER_AUTH_SECRET = 'test-secret-at-least-16-chars';
  env.ADMIN_EMAILS = 'admin@example.com';
  resetEnvCache();

  await db.insert(themes).values({
    id: THEME_ID,
    slug: 'mariage-noir-ivoire',
    name: 'Noir & ivoire',
    version: 1,
    status: 'active',
  });
});

afterEach(() => {
  d1.close();
  resetEnvCache();
});

describe('isEmailAllowedToSignIn', () => {
  it('always allows an admin email, even with no account or activation', async () => {
    expect(await isEmailAllowedToSignIn('Admin@Example.com', db)).toBe(true);
  });

  it('refuses an email with no account and no approved activation', async () => {
    expect(await isEmailAllowedToSignIn('stranger@example.com', db)).toBe(false);
  });

  it('allows an email that already has an account', async () => {
    await db.insert(user).values({ id: 'user-1', name: '', email: 'known@example.com' });
    expect(await isEmailAllowedToSignIn('known@example.com', db)).toBe(true);
    // Case-insensitive.
    expect(await isEmailAllowedToSignIn('KNOWN@example.com', db)).toBe(true);
  });

  it('refuses a pending activation, allows an approved one', async () => {
    const activation = await createActivation(db, {
      etsyOrderId: '1234567890',
      email: 'buyer@example.com',
      themeId: THEME_ID,
    });
    expect(await isEmailAllowedToSignIn('buyer@example.com', db)).toBe(false);

    // The approved activation's linked account can have any id; what matters
    // here is the activation's own status, not whether the buyer's email also
    // happens to have an account (that path is covered by the test above).
    await db.insert(user).values({ id: 'user-2', name: '', email: 'internal-user-2@example.com' });
    await markActivationApproved(db, activation.id, 'user-2');
    expect(await isEmailAllowedToSignIn('buyer@example.com', db)).toBe(true);
  });

  it('refuses an empty email', async () => {
    expect(await isEmailAllowedToSignIn('   ', db)).toBe(false);
  });
});
