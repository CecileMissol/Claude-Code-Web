import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Drizzle schema for Cloudflare D1 (SQLite).
 *
 * Property names are camelCase because Better Auth's Drizzle adapter looks its
 * fields up by JS key; the SQL column names stay snake_case.
 *
 * Access control is explicit rather than declarative (no Postgres RLS here):
 * every query in `src/db/queries/` filters by `ownerId`.
 */

const now = sql`(unixepoch())`;

/* -------------------------------------------------------------------------- */
/* Better Auth core tables                                                    */
/* -------------------------------------------------------------------------- */

export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().default(''),
    email: text('email').notNull(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [uniqueIndex('user_email_unique').on(table.email)],
);

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('session_token_unique').on(table.token),
    index('session_user_id_idx').on(table.userId),
  ],
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

/* -------------------------------------------------------------------------- */
/* Application tables                                                         */
/* -------------------------------------------------------------------------- */

export const THEME_STATUSES = ['active', 'draft'] as const;
export type ThemeStatus = (typeof THEME_STATUSES)[number];

export const themes = sqliteTable(
  'themes',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    version: integer('version').notNull().default(1),
    status: text('status', { enum: THEME_STATUSES }).notNull().default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [uniqueIndex('themes_slug_unique').on(table.slug)],
);

export const ACTIVATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number];

export const activations = sqliteTable(
  'activations',
  {
    id: text('id').primaryKey(),
    etsyOrderId: text('etsy_order_id').notNull(),
    email: text('email').notNull(),
    themeId: text('theme_id')
      .notNull()
      .references(() => themes.id),
    status: text('status', { enum: ACTIVATION_STATUSES }).notNull().default('pending'),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [
    index('activations_etsy_order_id_idx').on(table.etsyOrderId),
    // One Etsy order can carry several products, but only one per theme.
    uniqueIndex('activations_order_theme_unique').on(table.etsyOrderId, table.themeId),
    index('activations_email_idx').on(table.email),
  ],
);

export const INVITATION_STATUSES = ['draft', 'published', 'expired', 'disabled'] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const invitations = sqliteTable(
  'invitations',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    themeId: text('theme_id')
      .notNull()
      .references(() => themes.id),
    /** Null while the invitation is a draft; unique once chosen. */
    slug: text('slug'),
    locale: text('locale').notNull().default('en'),
    /** JSON content, validated by `src/content/schema.ts`. */
    content: text('content').notNull(),
    contentVersion: integer('content_version').notNull().default(1),
    status: text('status', { enum: INVITATION_STATUSES }).notNull().default('draft'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [
    uniqueIndex('invitations_slug_unique').on(table.slug),
    index('invitations_owner_id_idx').on(table.ownerId),
    index('invitations_status_idx').on(table.status),
  ],
);

export const rsvps = sqliteTable(
  'rsvps',
  {
    id: text('id').primaryKey(),
    invitationId: text('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email'),
    attending: integer('attending', { mode: 'boolean' }).notNull(),
    guests: integer('guests').notNull().default(1),
    diet: text('diet'),
    message: text('message'),
    /** Salted hash of the guest IP; never the raw address. */
    ipHash: text('ip_hash'),
    notifiedAt: integer('notified_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [
    index('rsvps_invitation_id_idx').on(table.invitationId),
    index('rsvps_created_at_idx').on(table.createdAt),
  ],
);

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    actorEmail: text('actor_email'),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    /** Free-form JSON payload. */
    meta: text('meta'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (table) => [
    index('audit_log_created_at_idx').on(table.createdAt),
    index('audit_log_target_idx').on(table.targetType, table.targetId),
  ],
);

export const schema = {
  user,
  session,
  account,
  verification,
  themes,
  activations,
  invitations,
  rsvps,
  auditLog,
};

export type User = typeof user.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Rsvp = typeof rsvps.$inferSelect;
export type NewRsvp = typeof rsvps.$inferInsert;
export type Activation = typeof activations.$inferSelect;
export type Theme = typeof themes.$inferSelect;
