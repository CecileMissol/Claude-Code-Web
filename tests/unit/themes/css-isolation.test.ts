import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_SLUGS } from '@/themes/manifests';

/**
 * Cross-theme CSS isolation.
 *
 * The three wedding themes describe the same pieces of stationery, so they
 * deliberately reuse the same class vocabulary (`.card`, `.stamp`, `.board`,
 * `.photo`…). Two of their stylesheets can end up in the same document — the
 * editor's theme picker, the dashboard, and historically `/demo/[theme]`, which
 * pre-rendered all three. Nothing arbitrates between two declarations of the
 * same property at equal specificity except the order the bundler picked, and
 * that order is not ours to choose (phase 9, §3).
 *
 * The contract, verified here for all three sheets at once:
 *
 *  1. every selector is rooted at `.invitation[data-theme='<its own slug>']`,
 *     so no rule of one theme can ever match an element of another;
 *  2. the class **and** the attribute are both present — an attribute-only
 *     scope weighs the same (0,2,0) as another theme's `.invitation .photo`
 *     and loses on source order;
 *  3. no theme mentions another theme's slug;
 *  4. the one shared exception, the `<html>` scroll lock, is written
 *     identically everywhere, so the themes cannot disagree about it.
 */

const SHEETS = THEME_SLUGS.map((slug) => ({
  slug,
  css: readFileSync(join(process.cwd(), 'src/themes', slug, 'styles.css'), 'utf8'),
}));

/** The scroll lock addresses the document, not the invitation: same in all themes. */
const SCROLL_LOCK = ['html.invitation-locked', 'html.invitation-locked body'];

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Every individual selector of the sheet, comma-separated lists split apart. */
function selectorParts(css: string): string[] {
  const parts: string[] = [];
  for (const match of stripComments(css).matchAll(/(?:^|[{}])([^{}]*?)\{/g)) {
    const selector = (match[1] ?? '').trim();
    // At-rules (@media, @supports, @keyframes) and keyframe stops (`50%`).
    if (!selector || selector.startsWith('@')) continue;
    for (const part of selector.split(',')) {
      const trimmed = part.trim();
      if (!trimmed || /^(from|to|[\d.]+%)$/.test(trimmed)) continue;
      parts.push(trimmed);
    }
  }
  return parts;
}

describe('theme stylesheets do not collide', () => {
  it('covers the three registered themes', () => {
    expect(SHEETS.map((sheet) => sheet.slug)).toEqual([...THEME_SLUGS]);
    for (const sheet of SHEETS) expect(sheet.css.length).toBeGreaterThan(1000);
  });

  for (const { slug, css } of SHEETS) {
    describe(slug, () => {
      const parts = selectorParts(css);

      it('declares rules', () => {
        expect(parts.length).toBeGreaterThan(50);
      });

      it('roots every selector at .invitation[data-theme] (scroll lock excepted)', () => {
        const scope = `.invitation[data-theme='${slug}']`;
        const offenders = parts.filter(
          (part) => !part.startsWith(scope) && !SCROLL_LOCK.includes(part),
        );
        expect(offenders).toEqual([]);
      });

      it('never names another theme', () => {
        for (const other of THEME_SLUGS) {
          if (other === slug) continue;
          expect(stripComments(css)).not.toContain(other);
        }
      });

      it('writes the shared scroll lock identically', () => {
        for (const selector of SCROLL_LOCK) expect(parts).toContain(selector);
      });
    });
  }

  it('leaves no attribute-only scope behind', () => {
    // `[data-theme='…'] .x` ties with another theme's `.invitation .x` and is
    // then decided by source order. The class must always come first.
    for (const { slug, css } of SHEETS) {
      const attributeOnly = [
        ...stripComments(css).matchAll(new RegExp(`(.{0,12})\\[data-theme='${slug}'\\]`, 'g')),
      ].filter((match) => !(match[1] ?? '').endsWith('.invitation'));
      expect(attributeOnly.map((match) => match[0])).toEqual([]);
    }
  });

  it('gives each theme a scope no other theme can match', () => {
    // Two rules of two different themes can only meet on the same element if
    // their scopes can match the same node; different `data-theme` values
    // cannot. This is the whole guarantee, restated as a property.
    const scopes = SHEETS.map(({ slug }) => `.invitation[data-theme='${slug}']`);
    expect(new Set(scopes).size).toBe(SHEETS.length);
    for (const { slug, css } of SHEETS) {
      for (const scope of scopes) {
        if (scope.includes(slug)) continue;
        expect(css).not.toContain(scope);
      }
    }
  });
});
