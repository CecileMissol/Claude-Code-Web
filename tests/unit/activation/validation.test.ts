import { describe, expect, it } from 'vitest';
import { ActivationInputSchema, ETSY_ORDER_ID_PATTERN } from '@/lib/activation';

/**
 * Pure schema tests: no database, no network. `submitActivationRequest`
 * (tested in `duplicate.test.ts`) runs this same schema first.
 */

const VALID = {
  etsyOrderId: '1234567890',
  email: 'buyer@example.com',
  themeSlug: 'mariage-noir-ivoire',
  consent: true,
};

describe('ETSY_ORDER_ID_PATTERN', () => {
  it('accepts 8 to 12 digits', () => {
    expect(ETSY_ORDER_ID_PATTERN.test('12345678')).toBe(true);
    expect(ETSY_ORDER_ID_PATTERN.test('123456789012')).toBe(true);
  });

  it('rejects too short, too long, or non-digit values', () => {
    expect(ETSY_ORDER_ID_PATTERN.test('1234567')).toBe(false);
    expect(ETSY_ORDER_ID_PATTERN.test('1234567890123')).toBe(false);
    expect(ETSY_ORDER_ID_PATTERN.test('12345abcd0')).toBe(false);
  });
});

describe('ActivationInputSchema', () => {
  it('accepts a well-formed submission', () => {
    const result = ActivationInputSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('lower-cases and trims the email', () => {
    const result = ActivationInputSchema.safeParse({ ...VALID, email: '  Buyer@Example.COM ' });
    expect(result.success).toBe(true);
    expect(result.success && result.data.email).toBe('buyer@example.com');
  });

  it('trims the order id', () => {
    const result = ActivationInputSchema.safeParse({ ...VALID, etsyOrderId: '  1234567890  ' });
    expect(result.success).toBe(true);
    expect(result.success && result.data.etsyOrderId).toBe('1234567890');
  });

  it('rejects an order id that is not 8 to 12 digits', () => {
    expect(ActivationInputSchema.safeParse({ ...VALID, etsyOrderId: '123' }).success).toBe(false);
    expect(ActivationInputSchema.safeParse({ ...VALID, etsyOrderId: 'not-a-number' }).success).toBe(
      false,
    );
  });

  it('rejects an invalid email', () => {
    expect(ActivationInputSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(
      false,
    );
  });

  it('rejects an unknown theme', () => {
    expect(ActivationInputSchema.safeParse({ ...VALID, themeSlug: 'unknown-theme' }).success).toBe(
      false,
    );
  });

  it('rejects a missing or false consent', () => {
    expect(ActivationInputSchema.safeParse({ ...VALID, consent: false }).success).toBe(false);
    const { consent: _consent, ...withoutConsent } = VALID;
    expect(ActivationInputSchema.safeParse(withoutConsent).success).toBe(false);
  });
});
