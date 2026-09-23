import { z } from 'zod';
import {
  DateChapter,
  InvitationContent,
  PlaceBlock,
  Photo,
  ProgramBlock,
  StoryBlock,
  Style,
} from '@/content/schema';
import type { ThemeManifest } from '@/themes/types';
import { CONTENT_LIMITS } from './manifest';

/**
 * Server-side authority for what a draft may contain.
 *
 * The common schema (`src/content/schema.ts`) says what an invitation *is*; the
 * theme manifest says what *this* theme accepts (how many story lines, which
 * palettes, which photo slots), and the theme's `Extras` schema says how its
 * decorative blocks are shaped. This module merges the three, so a Server
 * Action never has to trust anything the browser sent.
 */

const Line = z.string().trim().max(CONTENT_LIMITS.line);

/**
 * Builds the schema of a draft for one theme.
 *
 * @param manifest Manifest of the theme the invitation is rendered with.
 * @param extras   The theme's `Extras` schema; a permissive record when absent.
 */
export function buildContentSchema(manifest: ThemeManifest, extras?: z.ZodType) {
  const paletteIds = manifest.palettes.map((palette) => palette.id);
  const scriptIds = manifest.scripts.map((script) => script.id);
  const slotIds = manifest.photoSlots.map((slot) => slot.id);
  const requiredSlotIds = manifest.photoSlots.filter((slot) => slot.required).map((s) => s.id);

  const inList = (values: readonly string[]) =>
    z.string().refine((value) => values.includes(value), { message: 'unknownOption' });

  const photos = z
    .record(z.string(), Photo)
    .superRefine((value, ctx) => {
      for (const key of Object.keys(value)) {
        if (!slotIds.includes(key)) {
          ctx.addIssue({ code: 'custom', message: 'unknownOption', path: [key] });
        }
      }
      for (const key of requiredSlotIds) {
        if (!value[key]) ctx.addIssue({ code: 'custom', message: 'required', path: [key] });
      }
    })
    .default({});

  return InvitationContent.extend({
    story: StoryBlock.extend({
      lines: z.array(Line).min(manifest.limits.storyLines[0]).max(manifest.limits.storyLines[1]),
    }),
    dateChapter: DateChapter.extend({
      lines: z.array(Line).min(manifest.limits.dateLines[0]).max(manifest.limits.dateLines[1]),
    }),
    program: ProgramBlock.extend({
      lines: z
        .array(Line)
        .min(manifest.limits.programLines[0])
        .max(manifest.limits.programLines[1])
        .default([]),
      items: ProgramBlock.shape.items
        .min(manifest.limits.programItems[0])
        .max(manifest.limits.programItems[1]),
    }),
    place: PlaceBlock.extend({
      lines: z
        .array(Line)
        .min(manifest.limits.placeLines[0])
        .max(manifest.limits.placeLines[1])
        .default([]),
    }),
    info: InvitationContent.shape.info
      .unwrap()
      .min(manifest.limits.infoItems[0])
      .max(manifest.limits.infoItems[1])
      .default([]),
    photos,
    style: Style.extend({ paletteId: inList(paletteIds), scriptId: inList(scriptIds) }),
    extras: (extras ?? z.record(z.string(), z.unknown())).default({}),
  });
}

export type EditorContentSchema = ReturnType<typeof buildContentSchema>;

/**
 * Validates an untrusted draft for a theme.
 * Returns the Zod result, so the caller decides how to report the issues.
 */
export function parseDraftContent(
  manifest: ThemeManifest,
  extras: z.ZodType | undefined,
  value: unknown,
) {
  return buildContentSchema(manifest, extras).safeParse(value);
}
