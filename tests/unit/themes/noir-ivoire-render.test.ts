import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InvitationContent } from '@/content/schema';
import demo from '@/themes/mariage-noir-ivoire/demo.json';
import Invitation from '@/themes/mariage-noir-ivoire/Invitation';
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
    expect(html).toContain('data-theme="mariage-noir-ivoire"');
    expect(html).toContain('data-palette="noir"');
    expect(html).toContain('data-mode="demo"');
    expect(html).toContain('lang="fr"');
  });

  it('injects the palette of the manifest as CSS custom properties', () => {
    expect(html).toContain('--env:#1D1D1B');
    expect(html).toContain('--seal:#55632F');
    expect(html).toContain('--stem:#7C972C');
    expect(html).toContain('Pinyon Script');
  });

  it('never opts into dark mode', () => {
    expect(html).not.toContain('prefers-color-scheme');
  });

  it('shows the demo banner in demo mode only', () => {
    expect(html).toContain('Démonstration');
    expect(render({}, 'public', 'zoe-et-dylan')).not.toContain('Démonstration');
  });
});

describe('intro', () => {
  const html = render();

  it('prints the couple, the short date and the initials', () => {
    expect(html).toContain('Zoé &amp; Dylan');
    expect(html).toContain('12.06.27');
    expect(html).toContain('Z&amp;D');
  });

  it('stamps the postmark with the event date in roman-month form', () => {
    expect(html).toContain('12·VI·27');
  });

  it('uses the kicker from the theme extras', () => {
    expect(html).toContain('Une lettre pour vous');
  });

  it('exposes the envelope as a labelled button, reachable by keyboard', () => {
    expect(html).toContain('aria-label="Ouvrir l&#x27;enveloppe"');
    expect(html).toMatch(/class="env-wrap" role="button" tabindex="0"/);
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

  it('only shows the skip button in the editor preview', () => {
    expect(html).not.toContain('class="skip"');
    expect(render({}, 'preview')).toContain('class="skip"');
  });
});

describe('chapters', () => {
  const html = render();

  it('declares the four scroll chapters with the mock-up lengths', () => {
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
    expect(html).toContain('aria-label="Notre histoire"');
    expect(html).toContain('aria-label="La date"');
    expect(html).toContain('aria-label="Le programme"');
    expect(html).toContain('aria-label="Le lieu"');
  });

  it('writes one sentence per line with its scroll threshold', () => {
    for (const line of content.story.lines) {
      expect(html).toContain(escapeHtml(line));
    }
    expect(html).toContain('data-line="0.04"');
  });

  it('breaks the date into three papers', () => {
    expect(html).toContain('<b>12</b>');
    expect(html).toContain('<b>06</b>');
    expect(html).toContain('<b>27</b>');
  });

  it('substitutes {date} with the localised long date', () => {
    expect(html).toContain('Samedi 12 juin 2027');
    expect(html).not.toContain('{date}');
  });

  it('shows the highlight word of the date chapter', () => {
    expect(html).toContain('le grand jour');
  });

  it('renders the countdown with localised labels, starting at zero', () => {
    expect(html).toContain('jours');
    expect(html).toContain('secondes');
    expect(html).toContain('role="timer"');
  });

  it('renders every programme item', () => {
    for (const item of content.program.items) {
      expect(html).toContain(escapeHtml(item.title));
      // React emits the attribute camel-cased; HTML parsing is case-insensitive.
      expect(html.toLowerCase()).toContain(`datetime="${item.time}"`);
    }
  });

  it('renders the venue postcard and the directions link', () => {
    expect(html).toContain('Lourmarin');
    // The `&` of the maps URL is escaped in the attribute.
    expect(html).toContain('https://www.google.com/maps/search/?api=1&amp;query=Lourmarin');
    expect(html).toContain('Ouvrir l&#x27;itinéraire');
  });
});

describe('theme extras', () => {
  it('renders the train ticket and the kraft note when present', () => {
    const html = render();
    expect(html).toContain('Marseille → Paris');
    expect(html).toContain('Places 45 · 46');
    expect(html).toContain('elle a dit oui');
  });

  it('hides them when the couple removed them', () => {
    const html = render({ extras: {} });
    expect(html).not.toContain('ticket-train');
    expect(html).not.toContain('elle a dit oui');
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
          alt: 'Nous deux à Paris',
          caption: 'Paris, 2019',
        },
      },
    });
    expect(html).toContain('alt="Nous deux à Paris"');
    expect(html).toContain('width="960"');
    expect(html).toContain('invitations/abc/photos/one.webp');
    expect(html).toContain('Paris, 2019');
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
  it('renders the English copy for an English invitation', () => {
    const html = render({ locale: 'en' });
    expect(html).toContain('Our story');
    expect(html).toContain('The venue');
    expect(html).toContain('Open directions');
    expect(html).toContain('days');
    expect(html).toContain('lang="en"');
  });

  it('localises the long date too', () => {
    const html = render({ locale: 'en' });
    expect(html).toMatch(/Saturday[^<]*June[^<]*2027/);
    expect(html).not.toContain('Samedi');
  });

  it('falls back to the theme kicker when the couple wrote none', () => {
    const html = render({ locale: 'en', extras: {} });
    expect(html).toContain('A letter for you');
    expect(html).toContain('Tap the envelope to open it');
  });
});

describe('sections', () => {
  it('renders the practical labels', () => {
    const html = render();
    expect(html).toContain('Bon à savoir');
    expect(html).toContain('Hébergement');
    expect(html).toContain('data-observe');
  });

  it('drops the labels section entirely when there is nothing to say', () => {
    expect(render({ info: [] })).not.toContain('Bon à savoir');
  });

  it('signs off with both first names', () => {
    const html = render();
    expect(html).toContain('À très vite');
    expect(html).toContain('class="sign"');
  });
});
