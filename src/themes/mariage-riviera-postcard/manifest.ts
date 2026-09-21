import type { ThemeManifest } from '../types';

/**
 * Manifest of the "Riviera Postcard" wedding theme.
 *
 * The three palettes are the ones specified in `docs/strategie-produit.md` §3.3
 * (Côte d'Azur, Positano Sunset, Capri Citrus), mapped onto the six CSS custom
 * properties every theme shares (`--env`, `--env-2`, `--seal`, `--accent`,
 * `--stem`, `--liner`).
 *
 * The mapping is not the one of a dark theme, and that is the point: here the
 * envelope is a **white air-mail envelope**, so `--env` and `--env-2` are the
 * two whites of the paper, `--seal` is the strong ink (cobalt, coral, azure) —
 * it colours the wax seal, the buttons and every heavy rule — `--accent` is the
 * citrus yellow of the stamps and the awnings, `--stem` the foliage of the
 * lemon tree and the cypresses, and `--liner` the ink of the striped lining
 * printed inside the envelope.
 *
 * The photo slots are deliberately identical to the other wedding themes
 * (`envelope-1`, `envelope-2`, `story-1`, `story-2`, `venue`): switching theme
 * must never lose a couple's uploads (BRIEF §7.2).
 */
export const manifest: ThemeManifest = {
  slug: 'mariage-riviera-postcard',
  name: { en: 'Riviera Postcard', fr: 'Carte postale Riviera' },
  version: 1,
  eventTypes: ['wedding'],

  palettes: [
    {
      id: 'azur',
      label: { en: "Côte d'Azur", fr: "Côte d'Azur" },
      swatch: '#1E3A5F',
      vars: {
        '--env': '#FDF8F0',
        '--env-2': '#F4ECDD',
        '--seal': '#1E3A5F',
        '--accent': '#E8B923',
        '--stem': '#4C7A5E',
        '--liner': '#1E3A5F',
      },
    },
    {
      id: 'positano',
      label: { en: 'Positano Sunset', fr: 'Coucher de Positano' },
      swatch: '#E8735C',
      vars: {
        '--env': '#FFF8EE',
        '--env-2': '#F8EADA',
        '--seal': '#E8735C',
        '--accent': '#D8A83B',
        '--stem': '#3E8E8E',
        '--liner': '#3E8E8E',
      },
    },
    {
      id: 'capri',
      label: { en: 'Capri Citrus', fr: 'Citrons de Capri' },
      swatch: '#F4C430',
      vars: {
        '--env': '#FCFBF6',
        '--env-2': '#F2EFE2',
        '--seal': '#2F6690',
        '--accent': '#F4C430',
        '--stem': '#6E7F4B',
        '--liner': '#2F6690',
      },
    },
  ],

  scripts: [
    {
      id: 'playball',
      label: 'Playball',
      fontFamily: "'Playball', 'Brush Script MT', cursive",
    },
    {
      id: 'alex-brush',
      label: 'Alex Brush',
      fontFamily: "'Alex Brush', 'Snell Roundhand', cursive",
    },
    {
      id: 'yellowtail',
      label: 'Yellowtail',
      fontFamily: "'Yellowtail', 'Brush Script MT', cursive",
    },
  ],

  photoSlots: [
    {
      id: 'envelope-1',
      label: { en: 'Envelope, left snapshot', fr: 'Enveloppe, photo de gauche' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'envelope-2',
      label: { en: 'Envelope, right snapshot', fr: 'Enveloppe, photo de droite' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'story-1',
      label: { en: 'Story, first photo', fr: 'Histoire, première photo' },
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

  defaultPaletteId: 'azur',
  defaultScriptId: 'playball',
};

export default manifest;
