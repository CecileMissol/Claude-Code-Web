import { describe, expect, it } from 'vitest';
import { getAtPath, setAtPath, setManyAtPath } from '@/editor/paths';

describe('getAtPath', () => {
  const content = { couple: { partner1: { firstName: 'Zoé' } }, story: { lines: ['a', 'b'] } };

  it('reads nested objects and array items', () => {
    expect(getAtPath(content, 'couple.partner1.firstName')).toBe('Zoé');
    expect(getAtPath(content, 'story.lines.1')).toBe('b');
    expect(getAtPath(content, '')).toBe(content);
  });

  it('returns undefined instead of throwing on a missing branch', () => {
    expect(getAtPath(content, 'venue.city')).toBeUndefined();
    expect(getAtPath(content, 'story.lines.9')).toBeUndefined();
    expect(getAtPath(content, 'story.lines.x')).toBeUndefined();
    expect(getAtPath(null, 'a.b')).toBeUndefined();
  });
});

describe('setAtPath', () => {
  it('never mutates its input', () => {
    const before = { couple: { partner1: { firstName: 'Zoé' } } };
    const after = setAtPath(before, 'couple.partner1.firstName', 'Alex');

    expect(before.couple.partner1.firstName).toBe('Zoé');
    expect(after.couple.partner1.firstName).toBe('Alex');
    expect(after).not.toBe(before);
  });

  it('only copies the branch it touches', () => {
    const before = { couple: { partner1: { firstName: 'Zoé' } }, venue: { city: 'Lourmarin' } };
    const after = setAtPath(before, 'couple.partner1.firstName', 'Alex');

    expect(after.venue).toBe(before.venue);
    expect(after.couple).not.toBe(before.couple);
  });

  it('writes into arrays and creates missing branches', () => {
    const content = { story: { lines: ['a', 'b'] } };
    expect(setAtPath(content, 'story.lines.1', 'B').story.lines).toEqual(['a', 'B']);

    const created = setAtPath({} as Record<string, unknown>, 'venue.city', 'Paris');
    expect(created).toEqual({ venue: { city: 'Paris' } });
  });

  it('removes a key when the value is undefined', () => {
    const content = { venue: { city: 'Paris', mapsUrl: 'https://example.com' } };
    expect(setAtPath(content, 'venue.mapsUrl', undefined).venue).toEqual({ city: 'Paris' });

    const list = { story: { lines: ['a', 'b', 'c'] } };
    expect(setAtPath(list, 'story.lines.1', undefined).story.lines).toEqual(['a', 'c']);
  });

  it('applies several writes at once', () => {
    const content = { a: 1, b: { c: 2 } };
    expect(setManyAtPath(content, { a: 9, 'b.c': 8 })).toEqual({ a: 9, b: { c: 8 } });
  });
});
