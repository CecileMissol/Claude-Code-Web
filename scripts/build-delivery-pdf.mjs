#!/usr/bin/env node
/**
 * Builds the Etsy delivery PDF — the single digital file attached to every
 * wedding-theme listing (identical for every buyer, per Etsy's rules for
 * digital downloads, see docs/strategie-produit.md §1.2).
 *
 * One 2-page PDF per theme is generated in marketing/etsy/delivery/, named
 * `<theme-slug>-guide.pdf`. Page 1: thank-you, big activation link + QR
 * code, order number reminder, 24h validation delay. Page 2: 6-step
 * mini-guide, FAQ, contact.
 *
 * Usage: `pnpm etsy:pdf` (see package.json). Re-run after editing the
 * BRAND_NAME / BRAND_URL constants below, or after changing a theme's
 * manifest.ts name — the PDF files are not templated at runtime, they are
 * fully regenerated.
 *
 * Fonts: standard PDF fonts only (Helvetica / Helvetica-Bold / Times-Roman
 * italic), no embedded font files — the @fontsource packages in
 * node_modules only ship .woff/.woff2, which pdf-lib/fontkit cannot embed
 * (TTF/OTF only), so this script intentionally falls back to the standard
 * 14 fonts rather than fight that mismatch.
 */

import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

// ---------------------------------------------------------------------------
// Brand variables — edit these two constants, then re-run `pnpm etsy:pdf`.
// Kept as plain JS constants (not `{{...}}` placeholders) because this
// script produces binary PDF files that cannot be `sed`-replaced afterwards.
// See marketing/brand-variables.md.
// ---------------------------------------------------------------------------
const BRAND_NAME = 'Kraft & Bloom';
const BRAND_URL = 'kraftandbloom.com'; // no protocol, no trailing slash
const ACTIVATION_PATH = '/activate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const THEMES_DIR = path.join(ROOT, 'src', 'themes');
const OUT_DIR = path.join(ROOT, 'marketing', 'etsy', 'delivery');

const ACTIVATION_URL = `https://${BRAND_URL}${ACTIVATION_PATH}`;

// Letter (612 x 792 pt). Content stays within a safe margin that also fits
// A4 (595.28 x 841.89 pt) so the same PDF prints cleanly on either paper
// size, per the brief's "A4/Letter" requirement.
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 64; // safe on both Letter (612 wide) and A4 (595 wide)

// Palette: warm, elegant, neutral — close to the "Kraft & Bloom" brand
// identity (docs/marque-et-domaines.md §5, proposition B), independent of
// any single theme's own colors so it works for all three themes.
const COLOR_INK = rgb(0x3b / 255, 0x2e / 255, 0x26 / 255); // warm brown ink
const COLOR_ACCENT = rgb(0xc1 / 255, 0x63 / 255, 0x3d / 255); // terracotta
const COLOR_MUTED = rgb(0x6b / 255, 0x5c / 255, 0x4f / 255);
const COLOR_RULE = rgb(0xd9 / 255, 0xcd / 255, 0xbb / 255);
const COLOR_PAPER = rgb(0xf7 / 255, 0xef / 255, 0xe1 / 255); // cream paper

async function findThemeManifests() {
  const entries = await readdir(THEMES_DIR, { withFileTypes: true });
  const themes = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(THEMES_DIR, entry.name, 'manifest.ts');
    try {
      await stat(manifestPath);
    } catch {
      continue;
    }
    const source = await readFile(manifestPath, 'utf8');
    const slugMatch = source.match(/slug:\s*'([^']+)'/);
    const nameMatch = source.match(/name:\s*\{\s*en:\s*'([^']+)',\s*fr:\s*'([^']+)'\s*\}/);
    if (!slugMatch || !nameMatch) {
      console.warn(`Skipping ${manifestPath}: could not find slug/name (unexpected manifest shape)`);
      continue;
    }
    themes.push({
      dir: entry.name,
      slug: slugMatch[1],
      nameEn: nameMatch[1],
      nameFr: nameMatch[2],
    });
  }
  themes.sort((a, b) => a.slug.localeCompare(b.slug));
  return themes;
}

/** Greedy word-wrap using the font's actual metrics at the given size. */
function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function makeDrawer(page, fonts) {
  let y = PAGE_HEIGHT - MARGIN;

  return {
    get y() {
      return y;
    },
    setY(value) {
      y = value;
    },
    moveDown(amount) {
      y -= amount;
    },
    rule() {
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_WIDTH - MARGIN, y },
        thickness: 1,
        color: COLOR_RULE,
      });
      y -= 18;
    },
    text(str, { size = 11, font = fonts.body, color = COLOR_INK, gap = 6, maxWidth = PAGE_WIDTH - MARGIN * 2, x = MARGIN, align = 'left' } = {}) {
      const lines = wrapText(str, font, size, maxWidth);
      for (const line of lines) {
        let drawX = x;
        if (align === 'center') {
          const w = font.widthOfTextAtSize(line, size);
          drawX = x + (maxWidth - w) / 2;
        }
        page.drawText(line, { x: drawX, y, size, font, color });
        y -= size * 1.32;
      }
      y -= gap;
    },
    heading(str, { size = 20, gap = 10 } = {}) {
      page.drawText(str, { x: MARGIN, y, size, font: fonts.bold, color: COLOR_INK });
      y -= size * 1.25 + gap;
    },
    label(str, { size = 10, gap = 4 } = {}) {
      page.drawText(str.toUpperCase(), {
        x: MARGIN,
        y,
        size,
        font: fonts.bold,
        color: COLOR_ACCENT,
      });
      y -= size * 1.3 + gap;
    },
  };
}

async function buildPdfForTheme(theme) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${BRAND_NAME} — ${theme.nameEn} — activation guide`);
  pdf.setAuthor(BRAND_NAME);
  pdf.setSubject('Etsy digital download — activation link and quick-start guide');

  const fonts = {
    body: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
  };

  const qrPngDataUrl = await QRCode.toDataURL(ACTIVATION_URL, {
    margin: 1,
    width: 600,
    color: { dark: '#3B2E26', light: '#F7EFE1' },
  });
  const qrPngBytes = Buffer.from(qrPngDataUrl.split(',')[1], 'base64');
  const qrImage = await pdf.embedPng(qrPngBytes);

  // -------------------------------------------------------------- Page 1 --
  const page1 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page1.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLOR_PAPER });

  const d1 = makeDrawer(page1, fonts);
  d1.label(BRAND_NAME);
  d1.heading('Thank you for your order!');
  d1.text(
    `Your ${theme.nameEn} wedding website is almost ready. This guide gets you from download to a live, shareable invitation link.`,
    { gap: 18 },
  );

  d1.label('Your theme');
  d1.text(theme.nameEn, { size: 16, font: fonts.bold, gap: 24 });

  d1.rule();

  d1.label('Step 1 — activate your account');
  d1.text('Go to the link below and enter your Etsy order number and your email address.', { gap: 10 });

  // Big activation link, bold and centered.
  const linkSize = 18;
  const linkWidth = fonts.bold.widthOfTextAtSize(ACTIVATION_URL, linkSize);
  const linkX = MARGIN + (PAGE_WIDTH - MARGIN * 2 - linkWidth) / 2;
  page1.drawRectangle({
    x: linkX - 16,
    y: d1.y - 10,
    width: linkWidth + 32,
    height: linkSize + 20,
    color: rgb(1, 1, 1),
    borderColor: COLOR_ACCENT,
    borderWidth: 1.2,
  });
  page1.drawText(ACTIVATION_URL, {
    x: linkX,
    y: d1.y,
    size: linkSize,
    font: fonts.bold,
    color: COLOR_ACCENT,
  });
  d1.moveDown(linkSize + 34);

  // QR code, centered, same destination as the link above.
  const qrSize = 150;
  const qrX = MARGIN + (PAGE_WIDTH - MARGIN * 2 - qrSize) / 2;
  d1.moveDown(qrSize - 10);
  page1.drawImage(qrImage, { x: qrX, y: d1.y, width: qrSize, height: qrSize });
  const scanLabel = 'Scan to open the activation page';
  const scanSize = 9;
  const scanWidth = fonts.italic.widthOfTextAtSize(scanLabel, scanSize);
  page1.drawText(scanLabel, {
    x: MARGIN + (PAGE_WIDTH - MARGIN * 2 - scanWidth) / 2,
    y: d1.y - 14,
    size: scanSize,
    font: fonts.italic,
    color: COLOR_MUTED,
  });
  d1.moveDown(36);

  d1.rule();
  d1.label('Have ready');
  d1.text('Your Etsy order number (find it under Etsy > Your account > Purchases and reviews) and the email you used at checkout.', { gap: 14 });

  d1.label('Validation delay');
  d1.text(`We confirm activations within 24 hours of your request — often much faster. You'll get an email the moment your ${BRAND_NAME} account is ready, with a secure magic-link sign-in (no password to remember).`, { gap: 10 });

  page1.drawText(`${BRAND_NAME} · page 1 / 2`, {
    x: MARGIN,
    y: 32,
    size: 9,
    font: fonts.italic,
    color: COLOR_MUTED,
  });

  // -------------------------------------------------------------- Page 2 --
  const page2 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page2.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLOR_PAPER });
  const d2 = makeDrawer(page2, fonts);

  d2.label(BRAND_NAME);
  d2.heading('Your quick-start guide');

  const steps = [
    ['Activate', 'Enter your Etsy order number and email at the activation link on page 1. Confirmation within 24 hours.'],
    ['Sign in', 'Follow the magic-link email we send you — one click, no password to create or remember.'],
    ['Start your invitation', `Your ${theme.nameEn} theme opens as a draft, already loaded with its palettes and scripts.`],
    ['Customize', 'Fill in your names, date, story, photos, program and venue in the step-by-step editor. Watch the live preview update as you type.'],
    ['Choose your link', `Pick your address, e.g. ${BRAND_URL}/your-names, then publish.`],
    ['Share & track', 'Download your QR code, send the ready-made messages to your guests, and follow RSVPs on your dashboard.'],
  ];
  steps.forEach(([title, body], index) => {
    d2.text(`${index + 1}. ${title}`, { size: 12.5, font: fonts.bold, gap: 3 });
    d2.text(body, { size: 10.5, color: COLOR_MUTED, gap: 10 });
  });

  d2.rule();
  d2.label('FAQ');
  const faqs = [
    ['Can I edit after publishing?', 'Yes, anytime, unlimited edits — changes go live instantly on your existing link.'],
    ['How long is my invitation hosted?', '18 months from publication, included in your purchase. Extensions available separately in our shop.'],
    ['I bought more than one theme — do I activate twice?', 'Yes, one activation per order: each order number unlocks its own invitation and dashboard.'],
  ];
  faqs.forEach(([q, a]) => {
    d2.text(q, { size: 10.5, font: fonts.bold, gap: 2 });
    d2.text(a, { size: 10.5, color: COLOR_MUTED, gap: 10 });
  });

  d2.rule();
  d2.label('Need help?');
  d2.text('Message us anytime through Etsy — we read every message and reply quickly with activation or customization help.', { gap: 4 });

  page2.drawText(`${BRAND_NAME} · page 2 / 2`, {
    x: MARGIN,
    y: 32,
    size: 9,
    font: fonts.italic,
    color: COLOR_MUTED,
  });

  return pdf.save();
}

async function main() {
  const themes = await findThemeManifests();
  if (themes.length === 0) {
    throw new Error(`No theme manifests found under ${THEMES_DIR}`);
  }
  await mkdir(OUT_DIR, { recursive: true });

  for (const theme of themes) {
    const bytes = await buildPdfForTheme(theme);
    const outPath = path.join(OUT_DIR, `${theme.slug}-guide.pdf`);
    await writeFile(outPath, bytes);
    const sizeKb = (bytes.byteLength / 1024).toFixed(1);
    console.log(`Wrote ${path.relative(ROOT, outPath)} (${sizeKb} KB) — theme "${theme.nameEn}"`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
