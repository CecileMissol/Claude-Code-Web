import { beforeEach, describe, expect, it } from 'vitest';
import { memoryRateLimit, resetMemoryRateLimit, hashIp } from '@/lib/rate-limit';
import { createUploadTicket, isPhotoKeyOf, photoKey, verifyUploadTicket } from '@/lib/r2';
import { EnvSchema, isAdminEmail, resetEnvCache } from '@/lib/env';
import { consoleMailer } from '@/lib/mail';

const SECRET = 'test-secret-at-least-16-chars';

describe('rate limiting fallback', () => {
  beforeEach(resetMemoryRateLimit);

  it('allows up to the limit then refuses', () => {
    const options = { limit: 3, windowMs: 1000 };
    for (let i = 0; i < 3; i += 1) {
      expect(memoryRateLimit('ip:1', options, 1000).success).toBe(true);
    }
    expect(memoryRateLimit('ip:1', options, 1000).success).toBe(false);
  });

  it('forgets hits once the window has passed', () => {
    const options = { limit: 1, windowMs: 1000 };
    expect(memoryRateLimit('ip:2', options, 1000).success).toBe(true);
    expect(memoryRateLimit('ip:2', options, 1500).success).toBe(false);
    expect(memoryRateLimit('ip:2', options, 2500).success).toBe(true);
  });

  it('keeps keys independent', () => {
    const options = { limit: 1, windowMs: 1000 };
    expect(memoryRateLimit('a', options, 0).success).toBe(true);
    expect(memoryRateLimit('b', options, 0).success).toBe(true);
  });

  it('hashes IPs into a short opaque digest', async () => {
    const hash = await hashIp('203.0.113.7', 'salt');
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(hash).not.toContain('203');
    expect(await hashIp('203.0.113.7', 'other-salt')).not.toBe(hash);
  });
});

describe('R2 upload tickets', () => {
  it('builds the documented photo key', () => {
    const key = photoKey('inv-1', '11111111-2222-3333-4444-555555555555');
    expect(key).toBe('invitations/inv-1/photos/11111111-2222-3333-4444-555555555555.webp');
    expect(isPhotoKeyOf(key, 'inv-1')).toBe(true);
    expect(isPhotoKeyOf(key, 'inv-2')).toBe(false);
  });

  it('round-trips a signed ticket', async () => {
    const { token, payload } = await createUploadTicket({ invitationId: 'inv-1' }, SECRET);
    const verified = await verifyUploadTicket(token, SECRET);
    expect(verified?.key).toBe(payload.key);
  });

  it('rejects a tampered or expired ticket', async () => {
    const { token } = await createUploadTicket({ invitationId: 'inv-1' }, SECRET);
    expect(await verifyUploadTicket(token, 'another-secret-16-chars')).toBeNull();
    expect(await verifyUploadTicket('not-a-token', SECRET)).toBeNull();

    const expired = await createUploadTicket({ invitationId: 'inv-1', ttlSeconds: -1 }, SECRET);
    expect(await verifyUploadTicket(expired.token, SECRET)).toBeNull();
  });
});

describe('environment', () => {
  beforeEach(resetEnvCache);

  it('rejects a short secret', () => {
    expect(EnvSchema.safeParse({ BETTER_AUTH_SECRET: 'short' }).success).toBe(false);
  });

  it('accepts a minimal configuration and fills the defaults', () => {
    const parsed = EnvSchema.parse({ BETTER_AUTH_SECRET: SECRET });
    expect(parsed.APP_URL).toBe('http://localhost:3000');
    expect(parsed.MAIL_DRIVER).toBe('console');
  });

  it('matches admin emails case-insensitively', () => {
    // `wrangler types` narrows process.env to literal types, hence the cast.
    const env = process.env as unknown as Record<string, string>;
    env.ADMIN_EMAILS = 'Me@Example.com, other@example.com';
    env.BETTER_AUTH_SECRET = SECRET;
    resetEnvCache();
    expect(isAdminEmail('me@example.com')).toBe(true);
    expect(isAdminEmail('  OTHER@example.com ')).toBe(true);
    expect(isAdminEmail('intruder@example.com')).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });
});

describe('mailer', () => {
  it('reports the console driver without sending anything', async () => {
    const result = await consoleMailer.send({ to: 'a@b.c', subject: 'x', text: 'y' });
    expect(result).toEqual({ id: null, driver: 'console' });
  });
});
