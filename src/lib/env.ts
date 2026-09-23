import { z } from 'zod';

/**
 * Runtime environment variables, validated once with Zod.
 *
 * On Cloudflare, `@opennextjs/cloudflare` copies the Worker's plain `vars` and
 * secrets into `process.env`, so a single accessor covers `next dev`,
 * `wrangler dev` and production. Bindings (D1, R2, KV, rate limiter) are NOT
 * read here: they come from `getCloudflareContext().env`.
 */

/** `"true"` / `"1"` / `"yes"` → `true`; anything else (or nothing) → `false`. */
const booleanFlag = z
  .string()
  .optional()
  .transform((value) => ['true', '1', 'yes', 'on'].includes((value ?? '').trim().toLowerCase()));

/** An optional string, empty or whitespace counting as absent. */
const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  });

/**
 * A legal identity field: left at its `[[TOKEN]]` placeholder when unset, so
 * the gap is visible on `/legal/*` instead of crashing the page.
 */
const legalField = (placeholder: string) =>
  z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : placeholder;
    });

const EnvSchema = z.object({
  APP_URL: z.url().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters'),
  MAIL_DRIVER: z.enum(['console', 'resend']).default('console'),
  MAIL_FROM: z.string().min(3).default('Invitations <no-reply@example.com>'),
  RESEND_API_KEY: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:3000/api/photos'),
  ADMIN_EMAILS: z.string().default(''),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** Salt hashing guest IPs in the RSVP API; falls back to the app secret. */
  RSVP_IP_SALT: optionalText,
  /**
   * Shared secret of the retention job (scheduled handler and
   * `POST /api/cron/retention`). Anything shorter than 16 characters counts as
   * unset — the job then refuses every call rather than deleting rows behind a
   * guessable secret — but never crashes the rest of the application.
   */
  CRON_SECRET: optionalText.transform((value) =>
    value !== undefined && value.length >= 16 ? value : undefined,
  ),
  /**
   * Lets any signed-in account create a draft from `/app` without a purchase.
   * Development convenience; buyers get their draft through the activation.
   */
  ALLOW_FREE_DRAFTS: booleanFlag,

  // Legal identity shown on /legal/* (see src/app/(app)/legal/company.ts).
  LEGAL_COMPANY_NAME: legalField('[[COMPANY_NAME]]'),
  LEGAL_COMPANY_FORM: legalField('[[LEGAL_FORM]]'),
  LEGAL_COMPANY_ADDRESS: legalField('[[COMPANY_ADDRESS]]'),
  LEGAL_SIREN: legalField('[[SIREN]]'),
  LEGAL_VAT_NUMBER: legalField('[[VAT_NUMBER]]'),
  LEGAL_PUBLICATION_DIRECTOR: legalField('[[PUBLICATION_DIRECTOR]]'),
  LEGAL_CONTACT_EMAIL: legalField('[[CONTACT_EMAIL]]'),
  LEGAL_DPO_EMAIL: legalField('[[DPO_EMAIL]]'),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * In development and in tests a missing secret must not crash the whole app on
 * import, so a placeholder is substituted. In production the schema is strict.
 */
const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-change-me';

let cached: Env | null = null;

/** Validates and memoises the environment. Throws on invalid production config. */
export function getEnv(): Env {
  if (cached) return cached;

  const source = {
    ...process.env,
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ??
      (process.env.NODE_ENV === 'production' ? undefined : DEV_FALLBACK_SECRET),
  };

  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  if (parsed.data.MAIL_DRIVER === 'resend' && !parsed.data.RESEND_API_KEY) {
    throw new Error('MAIL_DRIVER=resend requires RESEND_API_KEY to be set.');
  }

  cached = parsed.data;
  return cached;
}

/** Clears the memoised environment. Test helper only. */
export function resetEnvCache(): void {
  cached = null;
}

/** Administrator email addresses, lower-cased. */
export function adminEmails(): string[] {
  return getEnv()
    .ADMIN_EMAILS.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

/** Salt used to hash guest IPs: the dedicated one, or the application secret. */
export function rsvpIpSalt(): string {
  const env = getEnv();
  return env.RSVP_IP_SALT ?? env.BETTER_AUTH_SECRET;
}

/**
 * Shared secret of the retention job, or `null` when it is not configured —
 * in which case `/api/cron/retention` refuses every call.
 */
export function cronSecret(): string | null {
  return getEnv().CRON_SECRET ?? null;
}

/** True when a signed-in account may create a draft without a purchase. */
export function allowFreeDrafts(): boolean {
  return getEnv().ALLOW_FREE_DRAFTS;
}

/** True when the given email is allowed into `/admin`. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export { EnvSchema };
