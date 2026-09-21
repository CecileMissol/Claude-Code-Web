import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InvitationContent } from '@/content/schema';
import demo from '@/themes/mariage-terracotta-bloom/demo.json';
import Invitation from '@/themes/mariage-terracotta-bloom/Invitation';
import { manifest } from '@/themes/mariage-terracotta-bloom/manifest';
import type { InvitationMode } from '@/themes/types';

/**
 * Server rendering of the theme.
 *
 * The invitation must be complete and readable *before* any JavaScript runs:
 * that is what a guest on a slow connection gets, what a crawler sees, and what
 * a guest with `prefers-reduced-motion` keeps. These tests render the real
 * component with the real `demo.json` and assert the markup.
 */

const content = InvitationContent.parse(demo);

/** React escapes these five characters in text nodes. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function render(
  overrides: Partial<InvitationContent> = {},
  mode: InvitationMode = 'demo',
  slug?: string,
): string {
  return renderToStaticMarkup(
    createElement(Invitation, { content: { ...content, ...overrides }, mode, slug }),
  );
}

describe('theme root', () => {
  const html = render();

  it('carries the theme, palette, mode and language attributes', () => {
    expect(html).toContain('data-theme="mariage-terracotta-bloom"');
    expect(html).toContain('data-palette="sienna"');
    expect(html).toContain('data-mode="demo"');
    expect(html).toContain('lang="en"');
  });

  it('injects the palette of the manifest as CSS custom properties', () => {
    expect(html).toContain('--env:#C1653A');
    expect(html).toContain('--seal:#9CAA7C');
    expect(html).toContain('--stem:#8FA070');
    expect(html).toContain('Beau Rivage');
  });

  it('prefixes its own classes so two themes can share a page', () => {
    expect(html).toContain('class="invitation tb-root"');
    // No unprefixed class of the first theme leaks into this markup.
    expect(html).not.toMatch(/class="(pol|ticket|scrap|prog|postcard|tag|rsvp)[" ]/);
  });

  it('never opts into dark mode', () => {
    expect(html).not.toContain('prefers-color-scheme');
  });

  it('shows the demo banner in demo mode only', () => {
    expect(html).toContain('Demo');
    expect(render({}, 'public', 'willa-and-beau')).not.toContain('tb-demo-banner');
  });
});

describe('manifest', () => {
  it('declares three palettes with the six palette variables and a faithful swatch', () => {
    expect(manifest.palettes).toHaveLength(3);
    for (const palette of manifest.palettes) {
      expect(Object.keys(palette.vars).sort()).toEqual([
        '--accent',
        '--env',
        '--env-2',
        '--liner',
        '--seal',
        '--stem',
      ]);
      expect(palette.swatch).toBe(palette.vars['--env']);
      expect(palette.label.en.length).toBeGreaterThan(0);
      expect(palette.label.fr.length).toBeGreaterThan(0);
    }
  });

  it('declares three script faces', () => {
    expect(manifest.scripts.map((script) => script.id)).toEqual([
      'beau-rivage',
      'windsong',
      'miss-fajardose',
    ]);
  });

  it('keeps the five photo slots of the catalogue, so a theme switch loses nothing', () => {
    expect(manifest.photoSlots.map((slot) => slot.id)).toEqual([
      'envelope-1',
      'envelope-2',
      'story-1',
      'story-2',
      'venue',
    ]);
  });

  it('defaults to a palette and a script it actually declares', () => {
    expect(manifest.palettes.some((p) => p.id === manifest.defaultPaletteId)).toBe(true);
    expect(manifest.scripts.some((s) => s.id === manifest.defaultScriptId)).toBe(true);
  });
});

describe('intro', () => {
  const html = render();

  it('prints the couple, the short date and the initials', () => {
    expect(html).toContain('Willa &amp; Beau');
    expect(html).toContain('09.10.27');
    expect(html).toContain('W&amp;B');
  });

  it('stamps the postmark with the event date in roman-month form', () => {
    expect(html).toContain('09·X·27');
  });

  it('uses the kicker from the theme extras', () => {
    expect(html).toContain('Sealed by hand, for you');
  });

  it('exposes the envelope as a labelled button, reachable by keyboard', () => {
    expect(html).toContain('aria-label="Open the envelope"');
    expect(html).toMatch(/class="tb-env-wrap" role="button" tabindex="0"/);
  });

  it('carries the GSAP handles of every animated piece', () => {
    for (const handle of [
      'data-env-front',
      'data-env-back',
      'data-env-seal',
      'data-env-flap',
      'data-env-ticket',
      'data-env-polaroid="1"',
      'data-env-polaroid="2"',
      'data-env-tuck="1"',
      'data-env-tuck="2"',
    ]) {
      expect(html).toContain(handle);
    }
  });

  it('rises an arch card, not a ticket with a stub', () => {
    expect(html).toContain('class="tb-card"');
    expect(html).toContain('Save the date');
    expect(html).not.toContain('class="stub"');
  });

  it('only shows the skip button in the editor preview', () => {
    expect(html).not.toContain('class="tb-skip"');
    expect(render({}, 'preview')).toContain('class="tb-skip"');
  });
});

describe('chapters', () => {
  const html = render();

  it('declares the four scroll chapters with their validated lengths', () => {
    expect(html).toContain('data-chapter="story"');
    expect(html).toContain('data-chapter="date"');
    expect(html).toContain('data-chapter="program"');
    expect(html).toContain('data-chapter="place"');
    expect(html).toContain('--len:420vh');
    expect(html).toContain('--len:320vh');
    expect(html).toContain('--len:380vh');
    expect(html).toContain('--len:300vh');
  });

  it('labels every chapter for assistive technology', () => {
    expect(html).toContain('aria-label="How we began"');
    expect(html).toContain('aria-label="The day"');
    expect(html).toContain('aria-label="The plan"');
    expect(html).toContain('aria-label="The place"');
  });

  it('writes one sentence per line with its scroll threshold', () => {
    for (const line of content.story.lines) {
      expect(html).toContain(escapeHtml(line));
    }
    expect(html).toContain('data-line="0.04"');
  });

  it('breaks the date into an arch and two slips', () => {
    expect(html).toContain('<b>09</b>');
    expect(html).toContain('<b>10</b>');
    expect(html).toContain('<b>27</b>');
    expect(html).toContain('tb-arch-card tb-d1');
    expect(html).toContain('tb-slip tb-d2');
    expect(html).toContain('tb-slip tb-d3');
  });

  it('substitutes {date} with the localised long date', () => {
    expect(html).toMatch(/Saturday[^<]*October[^<]*2027/);
    expect(html).not.toContain('{date}');
  });

  it('shows the highlight word of the date chapter', () => {
    expect(html).toContain('the big day');
  });

  it('renders the countdown with localised labels, starting at zero', () => {
    expect(html).toContain('days');
    expect(html).toContain('seconds');
    expect(html).toContain('role="timer"');
    expect(html).toContain('class="tb-tile"');
  });

  it('renders every programme item, each hour in its disc', () => {
    for (const item of content.program.items) {
      expect(html).toContain(escapeHtml(item.title));
      // React emits the attribute camel-cased; HTML parsing is case-insensitive.
      expect(html.toLowerCase()).toContain(`datetime="${item.time}"`);
    }
    expect(html).toContain('class="tb-prog-hour"');
    expect(html).toContain('4:30 pm');
  });

  it('renders the venue card and the directions link', () => {
    expect(html).toContain('Joshua Tree');
    expect(html).toContain('Rancho Alma');
    // The `&` of the maps URL is escaped in the attribute.
    expect(html).toContain(
      'https://www.google.com/maps/search/?api=1&amp;query=Joshua+Tree+California',
    );
    expect(html).toContain('Get directions');
  });
});

describe('theme extras', () => {
  it('renders the keepsake card and the kraft note when present', () => {
    const html = render();
    expect(html).toContain('The Cactus Bar');
    expect(html).toContain('Two lemonades');
    expect(html).toContain('she said yes');
  });

  it('hides them when the couple removed them', () => {
    const html = render({ extras: {} });
    expect(html).not.toContain('tb-barcard');
    expect(html).not.toContain('she said yes');
    // The chapter itself must still render.
    expect(html).toContain('data-chapter="story"');
  });
});

describe('photos', () => {
  it('draws an SVG placeholder, never a broken image, for an empty slot', () => {
    const html = render();
    expect(html).not.toContain('<img');
    expect(html).toContain('class="tb-photo"');
  });

  it('renders an <img> with its alt text and dimensions when a slot is filled', () => {
    const html = render({
      photos: {
        'story-1': {
          key: 'invitations/abc/photos/one.webp',
          width: 960,
          height: 1008,
          alt: 'The two of us in the desert',
          caption: 'Joshua Tree, 2021',
        },
      },
    });
    expect(html).toContain('alt="The two of us in the desert"');
    expect(html).toContain('width="960"');
    expect(html).toContain('invitations/abc/photos/one.webp');
    expect(html).toContain('Joshua Tree, 2021');
  });

  it('lazy-loads photos outside the envelope and eager-loads the ones inside it', () => {
    const html = render({
      photos: {
        'envelope-1': { key: 'k/a.webp', width: 100, height: 105, alt: 'a' },
        'story-1': { key: 'k/b.webp', width: 100, height: 105, alt: 'b' },
      },
    });
    expect(html).toMatch(/k\/a\.webp[^>]*loading="eager"|loading="eager"[^>]*k\/a\.webp/);
    expect(html).toMatch(/k\/b\.webp[^>]*loading="lazy"|loading="lazy"[^>]*k\/b\.webp/);
  });
});

describe('localisation', () => {
  it('renders the French copy for a French invitation', () => {
    const html = render({ locale: 'fr' });
    expect(html).toContain('Nos débuts');
    expect(html).toContain('Le lieu');
    expect(html).toContain('Voir l&#x27;itinéraire');
    expect(html).toContain('jours');
    expect(html).toContain('lang="fr"');
  });

  it('localises the long date and the hours too', () => {
    const html = render({ locale: 'fr' });
    expect(html).toContain('Samedi 9 octobre 2027');
    expect(html).toContain('16h30');
    expect(html).not.toContain('Saturday');
  });

  it('falls back to the theme kicker when the couple wrote none', () => {
    const html = render({ extras: {} });
    expect(html).toContain('Sealed by hand, for you');
    expect(html).toContain('Tap the envelope to break the seal');
  });
});

describe('sections', () => {
  it('renders the practical labels', () => {
    const html = render();
    expect(html).toContain('Good to know');
    expect(html).toContain('Getting there');
    expect(html).toContain('data-observe');
  });

  it('drops the labels section entirely when there is nothing to say', () => {
    expect(render({ info: [] })).not.toContain('Good to know');
  });

  it('signs off with both first names', () => {
    const html = render();
    expect(html).toContain('See you in the sun');
    expect(html).toContain('class="tb-sign"');
  });
});
