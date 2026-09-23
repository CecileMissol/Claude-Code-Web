import { z } from 'zod';
import { LOCALES } from '@/i18n/config';

/**
 * Common, versioned content schema shared by the editor, the API and every
 * theme renderer. Theme-specific decorative blocks live in `extras`, which each
 * theme validates with its own schema (see `src/themes/<slug>/schema.ts`).
 */

export const Locale = z.enum(LOCALES);
export type Locale = z.infer<typeof Locale>;

export const CONTENT_VERSION = 1;

const Text = (max: number) => z.string().trim().max(max);
const Line = Text(140);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export const Photo = z.object({
  /** R2 object key: `invitations/{invitationId}/photos/{uuid}.webp`. */
  key: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: Text(160).default(''),
  /** Handwritten caption printed under the polaroid. */
  caption: Text(40).optional(),
});
export type Photo = z.infer<typeof Photo>;

export const Partner = z.object({
  firstName: Text(30).min(1),
});
export type Partner = z.infer<typeof Partner>;

export const EventDate = z.object({
  date: z.string().regex(DATE_RE, 'Expected YYYY-MM-DD'),
  time: z.string().regex(TIME_RE, 'Expected HH:MM').default('14:30'),
  /** IANA time zone of the event, used by the countdown and the .ics file. */
  timezone: z.string().min(1).default('Europe/Paris'),
});
export type EventDate = z.infer<typeof EventDate>;

export const Venue = z.object({
  name: Text(80).min(1),
  addressLine: Text(120).default(''),
  city: Text(60).min(1),
  country: Text(60).optional(),
  /** Explicit directions link; derived from the address when absent. */
  mapsUrl: z.url().optional(),
  photoSlot: z.literal('venue').default('venue'),
});
export type Venue = z.infer<typeof Venue>;

export const ProgramItem = z.object({
  time: z.string().regex(TIME_RE, 'Expected HH:MM'),
  title: Text(40).min(1),
  /** e.g. "under the old oak tree" */
  detail: Text(60).optional(),
});
export type ProgramItem = z.infer<typeof ProgramItem>;

export const InfoItem = z.object({
  title: Text(40).min(1),
  body: Text(280).min(1),
});
export type InfoItem = z.infer<typeof InfoItem>;

export const RsvpSettings = z.object({
  enabled: z.boolean().default(true),
  deadline: z.string().regex(DATE_RE, 'Expected YYYY-MM-DD').optional(),
  maxGuestsPerReply: z.number().int().min(1).max(10).default(5),
  askEmail: z.boolean().default(true),
  askDiet: z.boolean().default(true),
  askMessage: z.boolean().default(true),
  /** Notify the couple by email on every reply. */
  notifyByEmail: z.boolean().default(true),
});
export type RsvpSettings = z.infer<typeof RsvpSettings>;

export const Style = z.object({
  /** Validated against the theme manifest, not here. */
  paletteId: z.string().min(1),
  scriptId: z.string().min(1),
});
export type Style = z.infer<typeof Style>;

export const StoryBlock = z.object({
  lines: z.array(Line).min(1).max(6),
  /** Photo slot ids used by this chapter, e.g. ['story-1', 'story-2']. */
  photoSlots: z.array(z.string()).max(2).default([]),
});

export const DateChapter = z.object({
  /** A line may contain the `{date}` placeholder. */
  lines: z.array(Line).min(1).max(4),
  highlight: Text(30).default('le grand jour'),
});

export const ProgramBlock = z.object({
  lines: z.array(Line).max(4).default([]),
  items: z.array(ProgramItem).min(1).max(6),
});

export const PlaceBlock = z.object({
  lines: z.array(Line).max(4).default([]),
});

export const InvitationContent = z.object({
  version: z.literal(CONTENT_VERSION),
  locale: Locale,
  /** Extensible later: 'birthday', 'baptism'… */
  eventType: z.literal('wedding'),
  couple: z.object({ partner1: Partner, partner2: Partner }),
  event: EventDate,
  venue: Venue,
  /** Keyed by the `photoSlots[].id` declared in the theme manifest. */
  photos: z.record(z.string(), Photo).default({}),
  story: StoryBlock,
  dateChapter: DateChapter,
  program: ProgramBlock,
  place: PlaceBlock,
  info: z.array(InfoItem).max(6).default([]),
  rsvp: RsvpSettings,
  signature: z.object({ text: Text(60).default('À très vite') }),
  style: Style,
  /** Theme-specific blocks, validated by the theme's own `Extras` schema. */
  extras: z.record(z.string(), z.unknown()).default({}),
});
export type InvitationContent = z.infer<typeof InvitationContent>;

/** Shape accepted as input, before Zod applies its defaults. */
export type InvitationContentInput = z.input<typeof InvitationContent>;

/** Parses untrusted JSON, throwing a `ZodError` when it does not fit. */
export function parseContent(value: unknown): InvitationContent {
  return InvitationContent.parse(value);
}

/** Non-throwing variant, handy in route handlers. */
export function safeParseContent(value: unknown) {
  return InvitationContent.safeParse(value);
}
