import { z } from 'zod';

/**
 * Theme-specific `content.extras` for "Riviera Postcard".
 *
 * The shape is deliberately the one every wedding theme shares, so switching
 * theme never loses a couple's words (BRIEF §7.2). Only the drawing changes:
 * the keepsake `memento` that theme 1 prints as a torn train ticket is printed
 * here as a **luggage tag** hanging from its string, and the `note` is a line
 * scribbled on a café napkin.
 */

const Text = (max: number) => z.string().trim().max(max);

export const Memento = z.object({
  kind: z.literal('ticket'),
  /** e.g. "Capri → Positano" */
  route: Text(30),
  /** Free-form, printed as-is: "06.19.21" */
  date: Text(12),
  /** e.g. "Ferry 12" */
  lineA: Text(20),
  /** e.g. "Seats 7 · 8" */
  lineB: Text(20),
});
export type Memento = z.infer<typeof Memento>;

export const Extras = z.object({
  memento: Memento.optional(),
  /** Short handwritten note on a napkin: "we missed the last ferry". */
  note: Text(30).optional(),
  envelope: z
    .object({
      /** Line shown above the envelope: "A postcard for you". */
      kicker: Text(40).optional(),
    })
    .optional(),
});
export type Extras = z.infer<typeof Extras>;

/**
 * Parses `content.extras` for this theme. Unknown or invalid extras degrade
 * gracefully to an empty object so a theme switch never breaks the render.
 */
export function parseExtras(value: unknown): Extras {
  const result = Extras.safeParse(value ?? {});
  return result.success ? result.data : {};
}

export default Extras;
