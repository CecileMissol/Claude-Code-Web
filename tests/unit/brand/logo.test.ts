import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { BRAND_IDS, BRAND_PRESETS } from '@/brand';

/**
 * Every preset's `Logo` renders to real, non-empty SVG markup in both
 * variants — server-side, no DOM required (`react-dom/server`), which is
 * how it is actually used (an RSC in `SiteHeader`/`SiteFooter`/`icon.tsx`).
 */
describe.each(BRAND_IDS)('%s logo', (id) => {
  const { Logo, name } = BRAND_PRESETS[id];

  it('renders the mark alone', () => {
    const html = renderToStaticMarkup(createElement(Logo, { variant: 'mark' }));
    expect(html).toContain('<svg');
    expect(html).toContain('role="img"');
  });

  it('renders the full lockup with the brand name as text', () => {
    const html = renderToStaticMarkup(createElement(Logo, { variant: 'full' }));
    expect(html).toContain('<svg');
    // Every preset's name starts with a single, unambiguous word ("Unfurl",
    // "Kraft", "Petal") that always appears as plain text in the wordmark
    // ("unfurl" is deliberately set in lowercase, hence the case-insensitive check).
    const firstWord = name.split(/[\s&]+/)[0] ?? name;
    expect(html.toLowerCase()).toContain(firstWord.toLowerCase());
  });

  it('scales with the size prop', () => {
    const html = renderToStaticMarkup(createElement(Logo, { variant: 'mark', size: 64 }));
    expect(html).toContain('width="64"');
    expect(html).toContain('height="64"');
  });
});
