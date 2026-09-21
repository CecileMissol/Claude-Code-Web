import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import type { ThemeManifest } from '@/themes/types';
import type { ChoiceOption, EditorField, EditorStep, ExtrasGroupSpec } from './types';

/**
 * Turns a {@link ThemeManifest} into the steps of the editor.
 *
 * Nothing here is theme-specific: bounds come from `manifest.limits`, the
 * pickers from `manifest.palettes` / `manifest.scripts`, the photo frames from
 * `manifest.photoSlots`, and a step disappears when the theme does not declare
 * the matching section. The theme's decorative blocks arrive as
 * {@link ExtrasGroupSpec}s read from its own Zod schema.
 */

/**
 * Maximum lengths of the common content schema (`src/content/schema.ts`).
 * They are mirrored here so the client can validate without importing Zod;
 * `tests/unit/editor/validation.test.ts` checks that the two agree.
 */
export const CONTENT_LIMITS = {
  firstName: 30,
  line: 140,
  highlight: 30,
  signature: 60,
  venueName: 80,
  venueAddress: 120,
  venueCity: 60,
  venueCountry: 60,
  programTitle: 40,
  programDetail: 60,
  infoTitle: 40,
  infoBody: 280,
  photoAlt: 160,
  photoCaption: 40,
  maxGuestsPerReply: 10,
} as const;

/** Time zones offered by the date step; the stored value is always kept. */
export const TIME_ZONES = [
  'Europe/Paris',
  'Europe/Brussels',
  'Europe/Madrid',
  'Europe/Lisbon',
  'Europe/Rome',
  'Europe/Berlin',
  'Europe/Zurich',
  'Europe/Amsterdam',
  'Europe/London',
  'Europe/Dublin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'UTC',
] as const;

function paletteOptions(manifest: ThemeManifest): ChoiceOption[] {
  return manifest.palettes.map((palette) => ({
    value: palette.id,
    labelByLocale: palette.label,
    swatch: palette.swatch,
  }));
}

function scriptOptions(manifest: ThemeManifest): ChoiceOption[] {
  return manifest.scripts.map((script) => ({
    value: script.id,
    label: script.label,
    fontFamily: script.fontFamily,
  }));
}

export interface BuildEditorStepsOptions {
  /** Groups read from the theme's `Extras` schema; see `src/editor/extras.ts`. */
  extras?: ExtrasGroupSpec[];
}

/**
 * Builds every step the given theme supports, in the order of the brief:
 * the two of you → date and venue → your story → photos → programme →
 * good to know → RSVP → style → language → publishing.
 */
export function buildEditorSteps(
  manifest: ThemeManifest,
  options: BuildEditorStepsOptions = {},
): EditorStep[] {
  const { limits, sections } = manifest;
  const has = (section: string) => sections.includes(section as (typeof sections)[number]);
  const steps: EditorStep[] = [];

  /* ---------------------------------------------------------------- couple */
  const coupleFields: EditorField[] = [
    {
      id: 'partner1',
      path: 'couple.partner1.firstName',
      labelKey: 'fields.partner1',
      kind: 'text',
      maxLength: CONTENT_LIMITS.firstName,
      required: true,
    },
    {
      id: 'partner2',
      path: 'couple.partner2.firstName',
      labelKey: 'fields.partner2',
      kind: 'text',
      maxLength: CONTENT_LIMITS.firstName,
      required: true,
    },
  ];
  if (has('signature')) {
    coupleFields.push({
      id: 'signature',
      path: 'signature.text',
      labelKey: 'fields.signature',
      helpKey: 'help.signature',
      kind: 'text',
      maxLength: CONTENT_LIMITS.signature,
      required: false,
    });
  }
  steps.push({ id: 'couple', labelKey: 'steps.couple', fields: coupleFields });

  /* ----------------------------------------------------------------- event */
  const eventFields: EditorField[] = [
    { id: 'date', path: 'event.date', labelKey: 'fields.date', kind: 'date', required: true },
    { id: 'time', path: 'event.time', labelKey: 'fields.time', kind: 'time', required: true },
    {
      id: 'timezone',
      path: 'event.timezone',
      labelKey: 'fields.timezone',
      helpKey: 'help.timezone',
      kind: 'choice',
      presentation: 'select',
      required: true,
      options: TIME_ZONES.map((zone) => ({ value: zone, label: zone })),
    },
    {
      id: 'venueName',
      path: 'venue.name',
      labelKey: 'fields.venueName',
      kind: 'text',
      maxLength: CONTENT_LIMITS.venueName,
      required: true,
    },
    {
      id: 'venueAddress',
      path: 'venue.addressLine',
      labelKey: 'fields.venueAddress',
      kind: 'text',
      maxLength: CONTENT_LIMITS.venueAddress,
      required: false,
    },
    {
      id: 'venueCity',
      path: 'venue.city',
      labelKey: 'fields.venueCity',
      kind: 'text',
      maxLength: CONTENT_LIMITS.venueCity,
      required: true,
    },
    {
      id: 'venueCountry',
      path: 'venue.country',
      labelKey: 'fields.venueCountry',
      kind: 'text',
      maxLength: CONTENT_LIMITS.venueCountry,
      required: false,
    },
    {
      id: 'mapsUrl',
      path: 'venue.mapsUrl',
      labelKey: 'fields.mapsUrl',
      helpKey: 'help.mapsUrl',
      kind: 'url',
      maxLength: 500,
      required: false,
    },
  ];

  if (has('date')) {
    eventFields.push(
      {
        id: 'dateLines',
        path: 'dateChapter.lines',
        labelKey: 'fields.dateLines',
        helpKey: 'help.dateLines',
        kind: 'lines',
        min: limits.dateLines[0],
        max: limits.dateLines[1],
        maxLength: CONTENT_LIMITS.line,
      },
      {
        id: 'highlight',
        path: 'dateChapter.highlight',
        labelKey: 'fields.highlight',
        kind: 'text',
        maxLength: CONTENT_LIMITS.highlight,
        required: false,
      },
    );
  }

  if (has('place')) {
    eventFields.push({
      id: 'placeLines',
      path: 'place.lines',
      labelKey: 'fields.placeLines',
      kind: 'lines',
      min: limits.placeLines[0],
      max: limits.placeLines[1],
      maxLength: CONTENT_LIMITS.line,
    });
  }

  steps.push({ id: 'event', labelKey: 'steps.event', fields: eventFields });

  /* ----------------------------------------------------------------- story */
  if (has('story')) {
    const storyFields: EditorField[] = [
      {
        id: 'storyLines',
        path: 'story.lines',
        labelKey: 'fields.storyLines',
        kind: 'lines',
        min: limits.storyLines[0],
        max: limits.storyLines[1],
        maxLength: CONTENT_LIMITS.line,
      },
    ];

    const extras = options.extras ?? [];
    if (extras.length > 0) {
      storyFields.push({
        id: 'extras',
        path: 'extras',
        labelKey: 'fields.extras',
        helpKey: 'help.extras',
        kind: 'extras',
        groups: extras,
      });
    }

    steps.push({ id: 'story', labelKey: 'steps.story', fields: storyFields });
  }

  /* ---------------------------------------------------------------- photos */
  if (manifest.photoSlots.length > 0) {
    steps.push({
      id: 'photos',
      labelKey: 'steps.photos',
      fields: [
        {
          id: 'photos',
          path: 'photos',
          labelKey: 'fields.photos',
          helpKey: 'help.photos',
          kind: 'photos',
          slots: manifest.photoSlots.map((slot) => ({
            id: slot.id,
            path: `photos.${slot.id}`,
            label: slot.label,
            aspect: slot.aspect,
            required: slot.required,
          })),
        },
      ],
    });
  }

  /* --------------------------------------------------------------- program */
  if (has('program')) {
    steps.push({
      id: 'program',
      labelKey: 'steps.program',
      fields: [
        {
          id: 'programLines',
          path: 'program.lines',
          labelKey: 'fields.programLines',
          kind: 'lines',
          min: limits.programLines[0],
          max: limits.programLines[1],
          maxLength: CONTENT_LIMITS.line,
        },
        {
          id: 'programItems',
          path: 'program.items',
          labelKey: 'fields.programItems',
          kind: 'items',
          min: limits.programItems[0],
          max: limits.programItems[1],
          addLabelKey: 'actions.addProgramItem',
          itemLabelKey: 'fields.programItem',
          itemDefaults: { time: '12:00', title: '', detail: '' },
          itemFields: [
            { id: 'time', path: 'time', labelKey: 'fields.itemTime', kind: 'time', required: true },
            {
              id: 'title',
              path: 'title',
              labelKey: 'fields.itemTitle',
              kind: 'text',
              maxLength: CONTENT_LIMITS.programTitle,
              required: true,
            },
            {
              id: 'detail',
              path: 'detail',
              labelKey: 'fields.itemDetail',
              kind: 'text',
              maxLength: CONTENT_LIMITS.programDetail,
              required: false,
            },
          ],
        },
      ],
    });
  }

  /* ------------------------------------------------------------------ info */
  if (has('info')) {
    steps.push({
      id: 'info',
      labelKey: 'steps.info',
      fields: [
        {
          id: 'info',
          path: 'info',
          labelKey: 'fields.info',
          kind: 'items',
          min: limits.infoItems[0],
          max: limits.infoItems[1],
          addLabelKey: 'actions.addInfoItem',
          itemLabelKey: 'fields.infoItem',
          itemDefaults: { title: '', body: '' },
          itemFields: [
            {
              id: 'title',
              path: 'title',
              labelKey: 'fields.infoTitle',
              kind: 'text',
              maxLength: CONTENT_LIMITS.infoTitle,
              required: true,
            },
            {
              id: 'body',
              path: 'body',
              labelKey: 'fields.infoBody',
              kind: 'textarea',
              maxLength: CONTENT_LIMITS.infoBody,
              required: true,
            },
          ],
        },
      ],
    });
  }

  /* ------------------------------------------------------------------ rsvp */
  if (has('rsvp')) {
    steps.push({
      id: 'rsvp',
      labelKey: 'steps.rsvp',
      fields: [
        { id: 'rsvpEnabled', path: 'rsvp.enabled', labelKey: 'fields.rsvpEnabled', kind: 'boolean' },
        {
          id: 'rsvpDeadline',
          path: 'rsvp.deadline',
          labelKey: 'fields.rsvpDeadline',
          helpKey: 'help.rsvpDeadline',
          kind: 'date',
          required: false,
        },
        {
          id: 'rsvpMaxGuests',
          path: 'rsvp.maxGuestsPerReply',
          labelKey: 'fields.rsvpMaxGuests',
          kind: 'number',
          min: 1,
          max: CONTENT_LIMITS.maxGuestsPerReply,
        },
        { id: 'rsvpAskEmail', path: 'rsvp.askEmail', labelKey: 'fields.rsvpAskEmail', kind: 'boolean' },
        { id: 'rsvpAskDiet', path: 'rsvp.askDiet', labelKey: 'fields.rsvpAskDiet', kind: 'boolean' },
        {
          id: 'rsvpAskMessage',
          path: 'rsvp.askMessage',
          labelKey: 'fields.rsvpAskMessage',
          kind: 'boolean',
        },
        {
          id: 'rsvpNotify',
          path: 'rsvp.notifyByEmail',
          labelKey: 'fields.rsvpNotify',
          kind: 'boolean',
        },
      ],
    });
  }

  /* ----------------------------------------------------------------- style */
  steps.push({
    id: 'style',
    labelKey: 'steps.style',
    fields: [
      {
        id: 'palette',
        path: 'style.paletteId',
        labelKey: 'fields.palette',
        kind: 'choice',
        presentation: 'swatch',
        required: true,
        options: paletteOptions(manifest),
      },
      {
        id: 'script',
        path: 'style.scriptId',
        labelKey: 'fields.script',
        kind: 'choice',
        presentation: 'script',
        required: true,
        options: scriptOptions(manifest),
      },
    ],
  });

  /* -------------------------------------------------------------- language */
  steps.push({
    id: 'language',
    labelKey: 'steps.language',
    fields: [
      {
        id: 'locale',
        path: 'locale',
        labelKey: 'fields.locale',
        helpKey: 'help.locale',
        kind: 'choice',
        presentation: 'select',
        required: true,
        options: LOCALES.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale] })),
      },
    ],
  });

  /* --------------------------------------------------------------- publish */
  steps.push({
    id: 'publish',
    labelKey: 'steps.publish',
    fields: [
      {
        id: 'share',
        path: '',
        labelKey: 'fields.share',
        helpKey: 'help.share',
        kind: 'link',
        hrefTemplate: '/app/{id}/share',
      },
    ],
  });

  return steps;
}

/** Every field of every step, flattened — handy for validation and tests. */
export function allFields(steps: readonly EditorStep[]): EditorField[] {
  return steps.flatMap((step) => step.fields);
}
