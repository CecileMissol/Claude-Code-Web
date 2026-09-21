import { CONTENT_VERSION, InvitationContent } from './schema';

/**
 * Content migrations.
 *
 * Stored invitation content carries a `version`. `migrateContent()` upgrades an
 * arbitrary stored payload to {@link CONTENT_VERSION}, then validates it, so
 * the rest of the application only ever handles current, valid content.
 *
 * To add a version: bump `CONTENT_VERSION` in `schema.ts`, then register a step
 * `{ from: 1, to: 2, up }` below. Steps run in order.
 */

export interface MigrationStep {
  from: number;
  to: number;
  up: (input: Record<string, unknown>) => Record<string, unknown>;
}

/** Ordered list of migration steps. Empty while only version 1 exists. */
export const MIGRATIONS: MigrationStep[] = [];

export class ContentMigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentMigrationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reads the `version` field of an untrusted payload. */
export function contentVersion(json: unknown): number | null {
  if (!isRecord(json)) return null;
  const version = json.version;
  return typeof version === 'number' && Number.isInteger(version) ? version : null;
}

/**
 * Validates and, when needed, migrates a stored content payload.
 *
 * @throws {ContentMigrationError} when the payload is not an object, carries an
 *   unknown/future version, or no migration path reaches the current version.
 * @throws {z.ZodError} when the migrated payload does not match the schema.
 */
export function migrateContent(json: unknown): InvitationContent {
  if (!isRecord(json)) {
    throw new ContentMigrationError('Invitation content must be a JSON object.');
  }

  const version = contentVersion(json);
  if (version === null) {
    throw new ContentMigrationError('Invitation content has no numeric "version" field.');
  }

  if (version > CONTENT_VERSION) {
    throw new ContentMigrationError(
      `Invitation content version ${version} is newer than the supported version ${CONTENT_VERSION}.`,
    );
  }

  let current: Record<string, unknown> = json;
  let currentVersion = version;

  while (currentVersion < CONTENT_VERSION) {
    const step = MIGRATIONS.find((candidate) => candidate.from === currentVersion);
    if (!step) {
      throw new ContentMigrationError(
        `No migration step registered from content version ${currentVersion}.`,
      );
    }
    current = { ...step.up(current), version: step.to };
    currentVersion = step.to;
  }

  return InvitationContent.parse(current);
}

/** Non-throwing variant. */
export function safeMigrateContent(
  json: unknown,
): { success: true; data: InvitationContent } | { success: false; error: Error } {
  try {
    return { success: true, data: migrateContent(json) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
