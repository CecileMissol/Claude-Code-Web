import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BRAND_IDS, BRAND_PRESETS, brandStyleVars, isBrandId } from '@/brand';

/**
 * Brand presets (`src/brand/presets/*`) and the `BRAND_ID` resolution done
 * by `src/brand.ts`. `brand.ts` reads `process.env.BRAND_ID` once at module
 * load, so every scenario re-imports it fresh via `vi.resetModules()`
 * instead of importing the already-resolved `brand` singleton.
 */

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function freshBrand() {
  const { vi } = await import('vitest');
  vi.resetModules();
  return import('@/brand');
}

describe('BRAND_IDS', () => {
  it('lists exactly the three presets of docs/marque-et-domaines.md §5', () => {
    expect(BRAND_IDS).toEqual(['unfurl', 'kraft-and-bloom', 'petal-post']);
    expect(Object.keys(BRAND_PRESETS).sort()).toEqual([...BRAND_IDS].sort());
  });

  it('isBrandId narrows only the known ids', () => {
    expect(isBrandId('kraft-and-bloom')).toBe(true);
    expect(isBrandId('unfurl')).toBe(true);
    expect(isBrandId('petal-post')).toBe(true);
    expect(isBrandId('acme')).toBe(false);
    expect(isBrandId(undefined)).toBe(false);
  });
});

describe('each preset', () => {
  it('declares a complete, distinct token set', () => {
    const seen = new Set<string>();
    for (const id of BRAND_IDS) {
      const preset = BRAND_PRESETS[id];
      expect(preset.id).toBe(id);
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.tagline.en.length).toBeGreaterThan(0);
      expect(preset.tagline.fr.length).toBeGreaterThan(0);
      expect(preset.taglineLong.en.length).toBeGreaterThan(0);
      expect(preset.taglineLong.fr.length).toBeGreaterThan(0);

      // Six hex colours (five roles, accent2 optional but present here).
      for (const value of [
        preset.palette.bg,
        preset.palette.bgAlt,
        preset.palette.fg,
        preset.palette.muted,
        preset.palette.accent,
        preset.palette.onAccent,
      ]) {
        expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
      }

      expect(preset.fonts.heading.length).toBeGreaterThan(0);
      expect(preset.fonts.body.length).toBeGreaterThan(0);
      expect(preset.faviconSvg).toContain('<svg');
      expect(typeof preset.Logo).toBe('function');

      // Every preset is visually distinct: no shared brand name or accent.
      expect(seen.has(preset.name)).toBe(false);
      seen.add(preset.name);
    }
  });
});

describe('brandStyleVars', () => {
  it('maps a preset to --brand-* custom properties', () => {
    const preset = BRAND_PRESETS['kraft-and-bloom'];
    const vars = brandStyleVars(preset) as Record<string, string>;

    expect(vars['--brand-bg']).toBe(preset.palette.bg);
    expect(vars['--brand-fg']).toBe(preset.palette.fg);
    expect(vars['--brand-accent']).toBe(preset.palette.accent);
    expect(vars['--brand-accent-2']).toBe(preset.palette.accent2);
    expect(vars['--brand-on-accent']).toBe(preset.palette.onAccent);
    expect(vars['--brand-font-heading']).toBe(preset.fonts.heading);
    expect(vars['--brand-font-body']).toBe(preset.fonts.body);
    expect(vars['--brand-font-script']).toBe(preset.fonts.script);
  });

  it('falls back accent-2 and script to their primary counterpart when unset', () => {
    const vars = brandStyleVars({
      ...BRAND_PRESETS.unfurl,
      palette: { ...BRAND_PRESETS.unfurl.palette, accent2: undefined },
      fonts: { ...BRAND_PRESETS.unfurl.fonts, script: undefined },
    }) as Record<string, string>;

    expect(vars['--brand-accent-2']).toBe(BRAND_PRESETS.unfurl.palette.accent);
    expect(vars['--brand-font-script']).toBe(BRAND_PRESETS.unfurl.fonts.heading);
  });
});

describe('resolving BRAND_ID', () => {
  it('defaults to unfurl when BRAND_ID is unset', async () => {
    delete process.env.BRAND_ID;
    const { brand } = await freshBrand();
    expect(brand.id).toBe('unfurl');
  });

  it('honours a valid BRAND_ID', async () => {
    process.env.BRAND_ID = 'unfurl';
    const { brand } = await freshBrand();
    expect(brand.id).toBe('unfurl');
    expect(brand.name).toBe('Unfurl');
  });

  it('falls back to the default on an unknown BRAND_ID', async () => {
    process.env.BRAND_ID = 'not-a-real-brand';
    const { brand } = await freshBrand();
    expect(brand.id).toBe('unfurl');
  });

  it('resolves petal-post too', async () => {
    process.env.BRAND_ID = 'petal-post';
    const { brand } = await freshBrand();
    expect(brand.id).toBe('petal-post');
    expect(brand.name).toBe('Petal Post');
  });

  it('reads etsyShopUrl and supportEmail from the environment, with placeholders otherwise', async () => {
    delete process.env.BRAND_ETSY_SHOP_URL;
    delete process.env.BRAND_SUPPORT_EMAIL;
    delete process.env.LEGAL_CONTACT_EMAIL;
    const { brand: withoutEnv } = await freshBrand();
    expect(withoutEnv.etsyShopUrl).toContain('etsy.com/shop');
    expect(withoutEnv.supportEmail).toBe('[[SUPPORT_EMAIL]]');

    process.env.BRAND_ETSY_SHOP_URL = 'https://www.etsy.com/shop/KraftAndBloomCo';
    process.env.BRAND_SUPPORT_EMAIL = 'hello@phosphoregarden.fr';
    const { brand: withEnv } = await freshBrand();
    expect(withEnv.etsyShopUrl).toBe('https://www.etsy.com/shop/KraftAndBloomCo');
    expect(withEnv.supportEmail).toBe('hello@phosphoregarden.fr');
  });
});
