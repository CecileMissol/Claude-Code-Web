import type { ThemeManifest } from '../types';

/**
 * Manifest of the "Terracotta Bloom" wedding theme (bohemian desert).
 *
 * The three palettes are the ones specified in `docs/strategie-produit.md` §3.2
 * — *Sienna Dust*, *Desert Rose*, *Amber Dune* — mapped onto the six CSS custom
 * properties every theme must define (`--env`, `--env-2`, `--seal`, `--accent`,
 * `--stem`, `--liner`).
 *
 * Two of the three envelopes are light (dusty rose, mustard): the stylesheet
 * repaints the address ink per palette through `[data-palette]`, so the names
 * on the envelope stay readable whichever palette the couple picks.
 *
 * The photo slots are deliberately the same five as "Noir & ivoire"
 * (`envelope-1`, `envelope-2`, `story-1`, `story-2`, `venue`): switching theme
 * must never lose the couple's content (BRIEF §7.2).
 */
export const manifest: ThemeManifest = {
  slug: 'mariage-terracotta-bloom',
  name: { en: 'Terracotta Bloom', fr: 'Terracotta Bloom' },
  version: 1,
  eventTypes: ['wedding'],

  palettes: [
    {
      id: 'sienna',
      label: { en: 'Sienna dust', fr: 'Terre de Sienne' },
      swatch: '#C1653A',
      vars: {
        '--env': '#C1653A',
        '--env-2': '#AE5631',
        '--seal': '#9CAA7C',
        '--accent': '#7A3B2E',
        '--stem': '#8FA070',
        '--liner': '#F3E3CD',
      },
    },
    {
      id: 'desert-rose',
      label: { en: 'Desert rose', fr: 'Rose du désert' },
      swatch: '#D9A79C',
      vars: {
        '--env': '#D9A79C',
        '--env-2': '#C9948A',
        '--seal': '#7C8B6F',
        '--accent': '#B5651D',
        '--stem': '#7C8B6F',
        '--liner': '#F7EFE6',
      },
    },
    {
      id: 'amber-dune',
      label: { en: 'Amber dune', fr: 'Dune ambrée' },
      swatch: '#D9A441',
      vars: {
        '--env': '#D9A441',
        '--env-2': '#C4902F',
        '--seal': '#93A187',
        '--accent': '#4A342A',
        '--stem': '#93A187',
        '--liner': '#EFE3CE',
      },
    },
  ],

  scripts: [
    {
      id: 'beau-rivage',
      label: 'Beau Rivage',
      fontFamily: "'Beau Rivage', 'Snell Roundhand', cursive",
    },
    {
      id: 'windsong',
      label: 'WindSong',
      fontFamily: "'WindSong', 'Snell Roundhand', cursive",
    },
    {
      id: 'miss-fajardose',
      label: 'Miss Fajardose',
      fontFamily: "'Miss Fajardose', 'Snell Roundhand', cursive",
    },
  ],

  photoSlots: [
    {
      id: 'envelope-1',
      label: { en: 'Envelope, left photo', fr: 'Enveloppe, photo de gauche' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'envelope-2',
      label: { en: 'Envelope, right photo', fr: 'Enveloppe, photo de droite' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'story-1',
      label: { en: 'Story, arch photo', fr: 'Histoire, photo en arche' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'story-2',
      label: { en: 'Story, second photo', fr: 'Histoire, deuxième photo' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'venue',
      label: { en: 'Venue postcard', fr: 'Carte postale du lieu' },
      aspect: 3 / 2,
      required: false,
    },
  ],

  sections: ['intro', 'story', 'date', 'program', 'place', 'info', 'rsvp', 'signature'],

  limits: {
    storyLines: [1, 6],
    dateLines: [1, 4],
    programLines: [0, 4],
    programItems: [1, 6],
    placeLines: [0, 4],
    infoItems: [0, 6],
  },

  defaultPaletteId: 'sienna',
  defaultScriptId: 'beau-rivage',
};

export default manifest;
