import { describe, expect, it } from 'vitest';
import demo from '@/themes/mariage-noir-ivoire/demo.json';
import { manifest } from '@/themes/mariage-noir-ivoire/manifest';
import { Extras, parseExtras } from '@/themes/mariage-noir-ivoire/schema';
import { InvitationContent } from '@/content/schema';
import { resolvePalette, resolveScript, SECTION_IDS } from '@/themes/types';
import en from '@/themes/mariage-noir-ivoire/messages/en.json';
import fr from '@/themes/mariage-noir-ivoire/messages/fr.json';

describe('mariage-noir-ivoire manifest', () => {
  it('declares three palettes with the six mock-up variables', () => {
    expect(manifest.palettes.map((palette) => palette.id)).toEqual(['noir', 'olivier', 'encre']);

    for (const palette of manifest.palettes) {
      expect(Object.keys(palette.vars).sort()).toEqual(
        ['--accent', '--env', '--env-2', '--liner', '--seal', '--stem'].sort(),
      );
      for (const value of Object.values(palette.vars)) {
        expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('keeps the exact palette values of the validated mock-up', () => {
    expect(resolvePalette(manifest, 'noir').vars).toEqual({
      '--env': '#1D1D1B',
      '--env-2': '#262624',
      '--seal': '#55632F',
      '--accent': '#6E8228',
      '--stem': '#7C972C',
      '--liner': '#DCD7CB',
    });
  });

  it('declares three script faces', () => {
    expect(manifest.scripts.map((script) => script.id)).toEqual(['pinyon', 'delafield', 'allura']);
  });

  it('declares the five photo slots', () => {
    expect(manifest.photoSlots.map((slot) => slot.id)).toEqual([
      'envelope-1',
      'envelope-2',
      'story-1',
      'story-2',
      'venue',
    ]);
  });

  it('only declares known sections', () => {
    for (const section of manifest.sections) {
      expect(SECTION_IDS).toContain(section);
    }
  });

  it('falls back to the default palette and script for unknown ids', () => {
    expect(resolvePalette(manifest, 'nope').id).toBe(manifest.defaultPaletteId);
    expect(resolveScript(manifest, 'nope').id).toBe(manifest.defaultScriptId);
  });
});

describe('mariage-noir-ivoire demo content', () => {
  it('is valid against the common schema', () => {
    const parsed = InvitationContent.parse(demo);
    expect(parsed.locale).toBe('fr');
    expect(parsed.couple.partner1.firstName).toBe('Zoé');
    expect(parsed.couple.partner2.firstName).toBe('Dylan');
  });

  it('uses a palette and a script the manifest declares', () => {
    const parsed = InvitationContent.parse(demo);
    expect(manifest.palettes.some((p) => p.id === parsed.style.paletteId)).toBe(true);
    expect(manifest.scripts.some((s) => s.id === parsed.style.scriptId)).toBe(true);
  });

  it('carries extras this theme understands', () => {
    const parsed = InvitationContent.parse(demo);
    const extras = Extras.parse(parsed.extras);
    expect(extras.memento?.route).toBe('Marseille → Paris');
    expect(extras.note).toBe('elle a dit oui');
  });

  it('degrades gracefully on unknown extras', () => {
    expect(parseExtras({ memento: 'nonsense' })).toEqual({});
    expect(parseExtras(undefined)).toEqual({});
  });
});

describe('mariage-noir-ivoire messages', () => {
  it('has the same keys in both locales', () => {
    const flatten = (value: unknown, prefix = ''): string[] =>
      typeof value === 'object' && value !== null
        ? Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}${key}.`))
        : [prefix.slice(0, -1)];

    expect(flatten(fr).sort()).toEqual(flatten(en).sort());
  });
});
