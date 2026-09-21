import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Database } from '@/db';
import { activations, invitations } from '@/db/schema';
import { listAuditLog } from '@/db/queries';
import {
  approveActivationRequest,
  rejectActivationRequest,
  submitActivationRequest,
} from '@/lib/activation';
import { resetEnvCache } from '@/lib/env';
import { createTestD1, type TestD1 } from '../helpers/d1';

/**
 * End-to-end (within the database layer) coverage of the anti-duplicate rule
 * and of the approve/reject flows, against the real D1 driver.
 */

let d1: TestD1;
let db: Database;

const VALID = {
  etsyOrderId: '1234567890',
  email: 'buyer@example.com',
  themeSlug: 'mariage-noir-ivoire',
  consent: true,
};

beforeEach(() => {
  d1 = createTestD1();
  db = createDb(d1.binding);

  // `wrangler types` narrows `process.env` to literal types, hence the cast
  // (same pattern as `tests/unit/lib.test.ts`).
  const env = process.env as unknown as Record<string, string>;
  env.BETTER_AUTH_SECRET = 'test-secret-at-least-16-chars';
  env.MAIL_DRIVER = 'console';
  env.ADMIN_EMAILS = 'admin@example.com';
  resetEnvCache();
});

afterEach(() => {
  d1.close();
  resetEnvCache();
});

async function pendingRow() {
  const rows = await db.select().from(activations);
  return rows[0];
}

describe('submitActivationRequest', () => {
  it('creates a pending activation on first submission', async () => {
    const result = await submitActivationRequest(db, VALID);
    expect(result.status).toBe('created');

    const row = await pendingRow();
    expect(row?.status).toBe('pending');
    expect(row?.email).toBe('buyer@example.com');
  });

  it('refuses a second submission of the same order and theme while pending', async () => {
    await submitActivationRequest(db, VALID);
    const second = await submitActivationRequest(db, VALID);
    expect(second.status).toBe('duplicate-pending');

    const rows = await db.select().from(activations);
    expect(rows).toHaveLength(1);
  });

  it('refuses a second submission once the activation is approved', async () => {
    await submitActivationRequest(db, VALID);
    const row = await pendingRow();
    expect(row).toBeDefined();

    await approveActivationRequest(db, {
      activationId: row!.id,
      adminEmail: 'admin@example.com',
      locale: 'en',
    });

    const second = await submitActivationRequest(db, VALID);
    expect(second.status).toBe('duplicate-approved');
  });

  it('re-opens a rejected activation instead of creating a second row', async () => {
    await submitActivationRequest(db, VALID);
    const row = await pendingRow();

    await rejectActivationRequest(db, { activationId: row!.id, adminEmail: 'admin@example.com' });

    const second = await submitActivationRequest(db, VALID);
    expect(second.status).toBe('reopened');

    const rows = await db.select().from(activations);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe('pending');
  });

  it('rejects invalid input without touching the database', async () => {
    const result = await submitActivationRequest(db, { ...VALID, etsyOrderId: '123' });
    expect(result.status).toBe('invalid');

    const rows = await db.select().from(activations);
    expect(rows).toHaveLength(0);
  });
});

describe('approveActivationRequest', () => {
  it('creates the user, a draft invitation, and an audit log entry', async () => {
    await submitActivationRequest(db, VALID);
    const row = await pendingRow();

    const result = await approveActivationRequest(db, {
      activationId: row!.id,
      adminEmail: 'admin@example.com',
      locale: 'fr',
    });

    expect(result).not.toBeNull();
    expect(result?.buyerEmail).toBe('buyer@example.com');

    const createdInvitations = await db.select().from(invitations);
    expect(createdInvitations).toHaveLength(1);
    expect(createdInvitations[0]?.locale).toBe('fr');
    expect(createdInvitations[0]?.status).toBe('draft');

    const updated = await pendingRow();
    expect(updated?.status).toBe('approved');
    expect(updated?.userId).toBeTruthy();

    const log = await listAuditLog(db);
    expect(log.some((entry) => entry.action === 'activation.approved')).toBe(true);
  });

  it('refuses to approve a non-pending activation twice', async () => {
    await submitActivationRequest(db, VALID);
    const row = await pendingRow();

    await approveActivationRequest(db, { activationId: row!.id, adminEmail: 'a@example.com', locale: 'en' });
    const second = await approveActivationRequest(db, {
      activationId: row!.id,
      adminEmail: 'a@example.com',
      locale: 'en',
    });

    expect(second).toBeNull();
    expect(await db.select().from(invitations)).toHaveLength(1);
  });
});

describe('rejectActivationRequest', () => {
  it('marks the activation rejected and logs the reason', async () => {
    await submitActivationRequest(db, VALID);
    const row = await pendingRow();

    const ok = await rejectActivationRequest(db, {
      activationId: row!.id,
      adminEmail: 'admin@example.com',
      reason: 'Order number does not match our shop.',
    });
    expect(ok).toBe(true);

    const updated = await pendingRow();
    expect(updated?.status).toBe('rejected');

    const log = await listAuditLog(db);
    const entry = log.find((item) => item.action === 'activation.rejected');
    expect(entry).toBeDefined();
    expect(JSON.parse(entry!.meta ?? '{}').reason).toBe('Order number does not match our shop.');
  });
});
