import { z } from 'zod';

/**
 * Runtime environment variables, validated once with Zod.
 *
 * On Cloudflare, `@opennextjs/cloudflare` copies the Worker's plain `vars` and
 * secrets into `process.env`, so a single accessor covers `next dev`,
 * `wrangler dev` and production. Bindings (D1, R2, KV, rate limiter) are NOT
 * read here: they come from `getCloudflareContext().env`.
 */

const EnvSchema = z.object({
  APP_URL: z.url().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters'),
  MAIL_DRIVER: z.enum(['console', 'resend']).default('console'),
  MAIL_FROM: z.string().min(3).default('Invitations <no-reply@example.com>'),
  RESEND_API_KEY: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:3000/api/photos'),
  ADMIN_EMAILS: z.string().default(''),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
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

/** True when the given email is allowed into `/admin`. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export { EnvSchema };
