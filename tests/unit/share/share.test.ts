import { describe, expect, it } from 'vitest';
import { defaultContent } from '@/content/defaults';
import { LOCALES } from '@/i18n/config';
import { BOM, csvField, separatorFor, toCsv } from '@/lib/csv';
import { clampQrSize, qrFileName, qrSvg, QR_DEFAULT_SIZE } from '@/lib/qr';
import {
  SHARE_CHANNELS,
  mailtoHref,
  shareContext,
  shareMessage,
  shareMessages,
  smsHref,
  whatsappHref,
} from '@/lib/share-messages';

const URL_UNDER_TEST = 'https://example.test/zoe-et-dylan';

const CONTENT = {
  ...defaultContent('fr'),
  couple: { partner1: { firstName: 'Zoé' }, partner2: { firstName: 'Dylan' } },
  event: { date: '2027-06-12', time: '14:30', timezone: 'Europe/Paris' },
  venue: { name: 'Le domaine', addressLine: '', city: 'Lourmarin', photoSlot: 'venue' as const },
};

describe('share messages', () => {
  it('carries the names, the date and the link in every channel and locale', () => {
    for (const locale of LOCALES) {
      const context = shareContext(CONTENT, URL_UNDER_TEST, locale);
      for (const message of shareMessages(locale, context)) {
        expect(message.body, `${locale}/${message.channel}`).toContain('Zoé & Dylan');
        expect(message.body).toContain(URL_UNDER_TEST);
        expect(message.body).toContain(context.date);
      }
    }
  });

  it('writes the date in the language of the message, not of the invitation', () => {
    expect(shareContext(CONTENT, URL_UNDER_TEST, 'fr').date).toMatch(/juin/);
    expect(shareContext(CONTENT, URL_UNDER_TEST, 'en').date).toMatch(/June/);
  });

  it('gives the e-mail, and only the e-mail, a subject', () => {
    const context = shareContext(CONTENT, URL_UNDER_TEST, 'fr');
    expect(shareMessage('email', 'fr', context).subject).toBeTruthy();
    expect(shareMessage('sms', 'fr', context).subject).toBeUndefined();
    expect(shareMessage('whatsapp', 'fr', context).subject).toBeUndefined();
  });

  it('keeps the text message short enough for a couple of SMS segments', () => {
    for (const locale of LOCALES) {
      const context = shareContext(CONTENT, URL_UNDER_TEST, locale);
      expect(shareMessage('sms', locale, context).body.length).toBeLessThan(320);
    }
  });

  it('builds links that carry the message', () => {
    const context = shareContext(CONTENT, URL_UNDER_TEST, 'fr');
    const [sms, email, whatsapp] = shareMessages('fr', context);

    expect(sms!.href.startsWith('sms:?body=')).toBe(true);
    expect(email!.href.startsWith('mailto:?subject=')).toBe(true);
    expect(email!.href).toContain('&body=');
    expect(whatsapp!.href.startsWith('https://wa.me/?text=')).toBe(true);

    for (const message of [sms!, email!, whatsapp!]) {
      expect(decodeURIComponent(message.href)).toContain(URL_UNDER_TEST);
    }
  });

  it('percent-encodes everything a URL would otherwise swallow', () => {
    expect(smsHref('a & b')).toBe('sms:?body=a%20%26%20b');
    expect(whatsappHref('a\nb')).toBe('https://wa.me/?text=a%0Ab');
    expect(mailtoHref('x?y', 'z')).toBe('mailto:?subject=x%3Fy&body=z');
  });

  it('exposes the three channels, in a stable order', () => {
    expect(SHARE_CHANNELS).toEqual(['sms', 'email', 'whatsapp']);
    expect(
      shareMessages('en', shareContext(CONTENT, URL_UNDER_TEST, 'en')).map((m) => m.channel),
    ).toEqual(['sms', 'email', 'whatsapp']);
  });
});

describe('QR code', () => {
  it('renders an SVG document for the public URL', async () => {
    const svg = await qrSvg(URL_UNDER_TEST, { size: 256 });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox');
  });

  it('clamps the requested size', () => {
    expect(clampQrSize(1)).toBe(128);
    expect(clampQrSize(999_999)).toBe(2048);
    expect(clampQrSize(512)).toBe(512);
    expect(clampQrSize(Number.NaN)).toBe(QR_DEFAULT_SIZE);
    expect(clampQrSize(null)).toBe(QR_DEFAULT_SIZE);
  });

  it('names the downloads after the slug', () => {
    expect(qrFileName('zoe-et-dylan', 'svg')).toBe('zoe-et-dylan-qr.svg');
    expect(qrFileName('zoe-et-dylan', 'png')).toBe('zoe-et-dylan-qr.png');
  });
});

describe('CSV export', () => {
  it('uses a semicolon in French and a comma elsewhere', () => {
    expect(separatorFor('fr')).toBe(';');
    expect(separatorFor('en')).toBe(',');
  });

  it('starts with a UTF-8 BOM so Excel keeps the accents', () => {
    const csv = toCsv(['Nom'], [['Zoé']], 'fr');
    expect(csv.startsWith(BOM)).toBe(true);
    expect(csv).toContain('Zoé');
  });

  it('quotes only what needs quoting, and doubles inner quotes', () => {
    expect(csvField('simple', ';')).toBe('simple');
    expect(csvField('a;b', ';')).toBe('"a;b"');
    expect(csvField('a,b', ';')).toBe('a,b');
    expect(csvField('say "hi"', ',')).toBe('"say ""hi"""');
    expect(csvField('line\nbreak', ',')).toBe('"line\nbreak"');
    expect(csvField(null, ',')).toBe('');
  });

  it('neutralises a formula a guest could have typed into a field', () => {
    expect(csvField('=SUM(A1:A9)', ';')).toBe("'=SUM(A1:A9)");
    expect(csvField('+1 rue du Four', ';')).toBe("'+1 rue du Four");
  });

  it('renders a full document with CRLF rows', () => {
    const csv = toCsv(
      ['Nom', 'Réponse'],
      [
        ['Camille', 'Oui'],
        ['Léo; et Zoé', 'Non'],
      ],
      'fr',
    );

    expect(csv).toBe(`${BOM}Nom;Réponse\r\nCamille;Oui\r\n"Léo; et Zoé";Non\r\n`);
  });
});

describe('share and responses copy', () => {
  it('exposes the same keys in French and in English', async () => {
    const flatten = (value: unknown, prefix = ''): string[] =>
      typeof value === 'object' && value !== null
        ? Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}${key}.`))
        : [prefix.slice(0, -1)];

    for (const namespace of ['share', 'responses']) {
      const en = (await import(`@/messages/en/${namespace}.json`)) as { default: unknown };
      const fr = (await import(`@/messages/fr/${namespace}.json`)) as { default: unknown };
      expect(flatten(fr.default).sort(), namespace).toEqual(flatten(en.default).sort());
      expect(flatten(en.default).length, namespace).toBeGreaterThan(20);
    }
  });
});
