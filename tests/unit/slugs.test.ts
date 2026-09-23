import { describe, expect, it } from 'vitest';
import {
  RESERVED_SLUGS,
  isReservedSlug,
  isSlugAvailableShape,
  nextFreeSlug,
  slugify,
  suggestSlug,
} from '@/lib/slugs';

describe('slugify', () => {
  it('removes accents and lower-cases', () => {
    expect(slugify('Zoé & Dylan')).toBe('zoe-dylan');
    expect(slugify('  Château de l’Île  ')).toBe('chateau-de-lile');
  });

  it('collapses separators', () => {
    expect(slugify('a---b   c')).toBe('a-b-c');
  });

  it('returns an empty string for pure punctuation', () => {
    expect(slugify('!!! ???')).toBe('');
  });
});

describe('suggestSlug', () => {
  it('joins the first names in French', () => {
    expect(suggestSlug('Zoé', 'Dylan', 'fr')).toBe('zoe-et-dylan');
  });

  it('joins the first names in English', () => {
    expect(suggestSlug('Zoe', 'Dylan', 'en')).toBe('zoe-and-dylan');
  });

  it('copes with a single first name', () => {
    expect(suggestSlug('Zoé', '', 'fr')).toBe('zoe');
  });

  it('returns an empty string when there is nothing to work with', () => {
    expect(suggestSlug('', '', 'fr')).toBe('');
  });

  it('never produces a reserved slug', () => {
    expect(isReservedSlug(suggestSlug('admin', '', 'fr'))).toBe(false);
  });
});

describe('isSlugAvailableShape', () => {
  it('accepts a normal slug', () => {
    expect(isSlugAvailableShape('zoe-et-dylan')).toBe(true);
  });

  it('rejects every reserved slug', () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(isSlugAvailableShape(reserved)).toBe(false);
    }
  });

  it('rejects slugs that are too short, malformed or file-like', () => {
    expect(isSlugAvailableShape('ab')).toBe(false);
    expect(isSlugAvailableShape('-zoe')).toBe(false);
    expect(isSlugAvailableShape('Zoe')).toBe(false);
    expect(isSlugAvailableShape('zoe.html')).toBe(false);
  });
});

describe('nextFreeSlug', () => {
  it('returns the base slug when it is free', async () => {
    expect(await nextFreeSlug('zoe-et-dylan', async () => false)).toBe('zoe-et-dylan');
  });

  it('suffixes until it finds a free one', async () => {
    const taken = new Set(['zoe-et-dylan', 'zoe-et-dylan-2']);
    expect(await nextFreeSlug('zoe-et-dylan', async (slug) => taken.has(slug))).toBe(
      'zoe-et-dylan-3',
    );
  });

  it('gives up after the attempt budget', async () => {
    await expect(nextFreeSlug('zoe-et-dylan', async () => true, 3)).rejects.toThrow();
  });
});
