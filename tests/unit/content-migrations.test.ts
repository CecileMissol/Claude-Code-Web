import { describe, expect, it } from 'vitest';
import { defaultContent } from '@/content/defaults';
import {
  ContentMigrationError,
  contentVersion,
  migrateContent,
  safeMigrateContent,
} from '@/content/migrations';
import { CONTENT_VERSION } from '@/content/schema';

describe('migrateContent', () => {
  it('returns valid current-version content untouched', () => {
    const content = defaultContent('fr');
    const migrated = migrateContent(JSON.parse(JSON.stringify(content)));
    expect(migrated).toEqual(content);
  });

  it('reads the version of a raw payload', () => {
    expect(contentVersion({ version: 1 })).toBe(1);
    expect(contentVersion({})).toBeNull();
    expect(contentVersion('nope')).toBeNull();
  });

  it('refuses a non-object payload', () => {
    expect(() => migrateContent('nope')).toThrow(ContentMigrationError);
    expect(() => migrateContent(null)).toThrow(ContentMigrationError);
  });

  it('refuses a payload without a version', () => {
    expect(() => migrateContent({ locale: 'fr' })).toThrow(ContentMigrationError);
  });

  it('refuses content from a future version', () => {
    const content = { ...defaultContent('fr'), version: CONTENT_VERSION + 1 };
    expect(() => migrateContent(content)).toThrow(/newer than the supported version/);
  });

  it('refuses content from a version with no migration path', () => {
    const content = { ...defaultContent('fr'), version: 0 };
    expect(() => migrateContent(content)).toThrow(/No migration step registered/);
  });

  it('reports failures without throwing in the safe variant', () => {
    const result = safeMigrateContent({ version: 1 });
    expect(result.success).toBe(false);
  });
});
