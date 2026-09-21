import type { ThemeManifest } from '../types';

/**
 * Manifest of the "Noir & ivoire" wedding theme.
 *
 * Palette values are taken verbatim from the validated mock-up
 * (`reference/invitation-mariage-demo.html`): the six CSS custom properties
 * `--env`, `--env-2`, `--seal`, `--accent`, `--stem` and `--liner`.
 */
export const manifest: ThemeManifest = {
  slug: 'mariage-terracotta-bloom',
  name: { en: 'Terracotta Bloom', fr: 'Terracotta Bloom' },
  version: 1,
  eventTypes: ['wedding'],

  palettes: [
    {
      id: 'noir',
      label: { en: 'Black & ivory', fr: 'Noir et ivoire' },
      swatch: '#1D1D1B',
      vars: {
        '--env': '#1D1D1B',
        '--env-2': '#262624',
        '--seal': '#55632F',
        '--accent': '#6E8228',
        '--stem': '#7C972C',
        '--liner': '#DCD7CB',
      },
    },
    {
      id: 'olivier',
      label: { en: 'Olive', fr: 'Olivier' },
      swatch: '#4B5632',
      vars: {
        '--env': '#4B5632',
        '--env-2': '#414B2B',
        '--seal': '#1D1D1B',
        '--accent': '#4B5632',
        '--stem': '#6F8A2A',
        '--liner': '#E3DDCF',
      },
    },
    {
      id: 'encre',
      label: { en: 'Blue ink', fr: 'Encre bleue' },
      swatch: '#1F324E',
      vars: {
        '--env': '#1F324E',
        '--env-2': '#1A2B44',
        '--seal': '#9A3A2A',
        '--accent': '#1F324E',
        '--stem': '#6F8A2A',
        '--liner': '#E1DDD3',
      },
    },
  ],

  scripts: [
    {
      id: 'pinyon',
      label: 'Pinyon Script',
      fontFamily: "'Pinyon Script', 'Snell Roundhand', cursive",
    },
    {
      id: 'delafield',
      label: 'Mrs Saint Delafield',
      fontFamily: "'Mrs Saint Delafield', 'Snell Roundhand', cursive",
    },
    {
      id: 'allura',
      label: 'Allura',
      fontFamily: "'Allura', 'Snell Roundhand', cursive",
    },
  ],

  photoSlots: [
    {
      id: 'envelope-1',
      label: { en: 'Envelope, left polaroid', fr: 'Enveloppe, polaroïd de gauche' },
      aspect: 1 / 1.05,
      required: false,
    },
    {
      id: 'envelope-2',
      label: { en: 'Envelope, right polaroid', fr: 'Enveloppe, polaroïd de droite' },
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

  defaultPaletteId: 'noir',
  defaultScriptId: 'pinyon',
};

export default manifest;
