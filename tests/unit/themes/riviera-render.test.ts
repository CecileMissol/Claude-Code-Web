import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InvitationContent } from '@/content/schema';
import demo from '@/themes/mariage-riviera-postcard/demo.json';
import Invitation from '@/themes/mariage-riviera-postcard/Invitation';
import { manifest } from '@/themes/mariage-riviera-postcard/manifest';
import type { InvitationMode } from '@/themes/types';

/**
 * Server rendering of the "Riviera Postcard" theme.
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

describe('demo content', () => {
  it('is valid against the shared schema', () => {
    expect(() => InvitationContent.parse(demo)).not.toThrow();
  });

  it('is written in English, the priority market', () => {
    expect(content.locale).toBe('en');
  });

  it('only uses a palette and a script the manifest declares', () => {
    expect(manifest.palettes.map((palette) => palette.id)).toContain(content.style.paletteId);
    expect(manifest.scripts.map((script) => script.id)).toContain(content.style.scriptId);
  });
});

describe('manifest', () => {
  it('keeps the photo slots shared by every wedding theme', () => {
    expect(manifest.photoSlots.map((slot) => slot.id)).toEqual([
      'envelope-1',
      'envelope-2',
      'story-1',
      'story-2',
      'venue',
    ]);
  });

  it('offers three palettes, each with the six shared custom properties', () => {
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
      expect(palette.swatch).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('offers the three script faces of the product strategy', () => {
    expect(manifest.scripts.map((script) => script.label)).toEqual([
      'Playball',
      'Alex Brush',
      'Yellowtail',
    ]);
  });

  it('defaults to a palette and a script it actually declares', () => {
    expect(manifest.palettes.some((p) => p.id === manifest.defaultPaletteId)).toBe(true);
    expect(manifest.scripts.some((s) => s.id === manifest.defaultScriptId)).toBe(true);
  });
});

describe('theme root', () => {
  const html = render();

  it('carries the theme, palette, mode and language attributes', () => {
    expect(html).toContain('data-theme="mariage-riviera-postcard"');
    expect(html).toContain('data-palette="azur"');
    expect(html).toContain('data-mode="demo"');
    expect(html).toContain('lang="en"');
  });

  it('injects the palette of the manifest as CSS custom properties', () => {
    expect(html).toContain('--env:#FDF8F0');
    expect(html).toContain('--seal:#1E3A5F');
    expect(html).toContain('--accent:#E8B923');
    expect(html).toContain('--stem:#4C7A5E');
    expect(html).toContain('Playball');
  });

  it('never opts into dark mode', () => {
    expect(html).not.toContain('prefers-color-scheme');
  });

  it('shows the demo banner in demo mode only', () => {
    expect(html).toContain('Demo');
    expect(render({}, 'public', 'nora-and-luca')).not.toContain('demo-banner');
  });
});

describe('intro', () => {
  const html = render();

  it('prints the couple, the short date and the initials', () => {
    expect(html).toContain('Nora &amp; Luca');
    expect(html).toContain('19.06.27');
    expect(html).toContain('N&amp;L');
  });

  it('stamps the postmark with the event date in roman-month form', () => {
    expect(html).toContain('19·VI·27');
  });

  it('is an air-mail envelope, not a wax-sealed one', () => {
    expect(html).toContain('class="air-edge"');
    expect(html).toContain('Par avion · by air mail');
  });

  it('uses the kicker from the theme extras', () => {
    expect(html).toContain('A postcard for you');
  });

  it('exposes the envelope as a labelled button, reachable by keyboard', () => {
    expect(html).toContain('aria-label="Open the envelope"');
    expect(html).toMatch(/class="env-wrap" role="button" tabindex="0"/);
  });

  it('carries the GSAP handles of every animated piece', () => {
    for (const handle of [
      'data-env-front',
      'data-env-back',
      'data-env-seal',
      'data-env-flap',
      'data-env-card',
      'data-env-snap="1"',
      'data-env-snap="2"',
      'data-env-tuck="1"',
      'data-env-tuck="2"',
    ]) {
      expect(html).toContain(handle);
    }
  });

  it('only shows the skip button in the editor preview', () => {
    expect(html).not.toContain('class="skip"');
    expect(render({}, 'preview')).toContain('class="skip"');
  });
});

describe('chapters', () => {
  const html = render();

  it('declares the four scroll chapters with their lengths', () => {
    expect(html).toContain('data-chapter="story"');
    expect(html).toContain('data-chapter="date"');
    expect(html).toContain('data-chapter="program"');
    expect(html).toContain('data-chapter="place"');
    expect(html).toContain('--len:400vh');
    expect(html).toContain('--len:340vh');
    expect(html).toContain('--len:360vh');
    expect(html).toContain('--len:320vh');
  });

  it('labels every chapter for assistive technology', () => {
    expect(html).toContain('aria-label="Our story"');
    expect(html).toContain('aria-label="The date"');
    expect(html).toContain('aria-label="The day"');
    expect(html).toContain('aria-label="The place"');
  });

  it('writes one sentence per line with its scroll threshold', () => {
    for (const line of content.story.lines) {
      expect(html).toContain(escapeHtml(line));
    }
    expect(html).toContain('data-line="0.04"');
  });

  it('glazes the date onto three azulejo tiles', () => {
    expect(html).toContain('azulejo az-day');
    expect(html).toContain('azulejo az-month');
    expect(html).toContain('azulejo az-year');
    expect(html).toContain('<b>19</b>');
    expect(html).toContain('<b>06</b>');
    expect(html).toContain('<b>27</b>');
  });

  it('substitutes {date} with the localised long date', () => {
    expect(html).toMatch(/Saturday[^<]*June[^<]*2027/);
    expect(html).not.toContain('{date}');
  });

  it('shows the highlight word of the date chapter', () => {
    expect(html).toContain('the big day');
  });

  it('renders the countdown with localised labels, starting at zero', () => {
    expect(html).toContain('days');
    expect(html).toContain('seconds');
    expect(html).toContain('role="timer"');
  });

  it('lays the programme out as a single menu board', () => {
    expect(html).toContain('class="menu"');
    expect(html).toContain('class="awning"');
    expect(html).toContain('Menu of the day');
    expect(html).toContain('--rows:4');
    for (const item of content.program.items) {
      expect(html).toContain(escapeHtml(item.title));
      // React emits the attribute camel-cased; HTML parsing is case-insensitive.
      expect(html.toLowerCase()).toContain(`datetime="${item.time}"`);
    }
  });

  it('renders the venue postcard, its typed address and the directions link', () => {
    expect(html).toContain('Positano');
    expect(html).toContain('Via Cristoforo Colombo 30');
    expect(html).toContain('class="pc-air"');
    // The `&` of the maps URL is escaped in the attribute.
    expect(html).toContain('https://www.google.com/maps/search/?api=1&amp;query=Positano');
    expect(html).toContain('Open directions');
  });
});

describe('theme extras', () => {
  it('renders the keepsake as a luggage tag, plus the napkin note', () => {
    const html = render();
    expect(html).toContain('class="luggage"');
    expect(html).toContain('Capri → Positano');
    expect(html).toContain('Seats 7 · 8');
    expect(html).toContain('we missed the last ferry');
  });

  it('hides them when the couple removed them', () => {
    const html = render({ extras: {} });
    expect(html).not.toContain('class="luggage"');
    expect(html).not.toContain('we missed the last ferry');
    // The chapter itself must still render.
    expect(html).toContain('data-chapter="story"');
  });
});

describe('photos', () => {
  it('draws an SVG placeholder, never a broken image, for an empty slot', () => {
    const html = render();
    expect(html).not.toContain('<img');
    expect(html).toContain('class="photo"');
  });

  it('renders an <img> with its alt text and dimensions when a slot is filled', () => {
    const html = render({
      photos: {
        'story-1': {
          key: 'invitations/abc/photos/one.webp',
          width: 960,
          height: 1008,
          alt: 'The two of us in Capri',
          caption: 'Capri, 2021',
        },
      },
    });
    expect(html).toContain('alt="The two of us in Capri"');
    expect(html).toContain('width="960"');
    expect(html).toContain('invitations/abc/photos/one.webp');
    expect(html).toContain('Capri, 2021');
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
    expect(html).toContain('Notre histoire');
    expect(html).toContain('Le lieu');
    expect(html).toContain('Ouvrir l&#x27;itinéraire');
    expect(html).toContain('jours');
    expect(html).toContain('lang="fr"');
  });

  it('localises the long date too', () => {
    const html = render({ locale: 'fr' });
    expect(html).toMatch(/Samedi[^<]*juin[^<]*2027/);
    expect(html).not.toContain('Saturday');
  });

  it('falls back to the theme kicker when the couple wrote none', () => {
    const html = render({ locale: 'fr', extras: {} });
    expect(html).toContain('Une carte postale pour vous');
    expect(html).toContain('Touchez l&#x27;enveloppe pour l&#x27;ouvrir');
  });
});

describe('sections', () => {
  it('renders the practical notes', () => {
    const html = render();
    expect(html).toContain('Good to know');
    expect(html).toContain('Where to stay');
    expect(html).toContain('data-observe');
  });

  it('drops the notes section entirely when there is nothing to say', () => {
    expect(render({ info: [] })).not.toContain('Good to know');
  });

  it('signs off with both first names', () => {
    const html = render();
    expect(html).toContain('See you by the sea');
    expect(html).toContain('class="sign"');
  });
});
