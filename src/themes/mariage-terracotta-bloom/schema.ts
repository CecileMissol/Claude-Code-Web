import { z } from 'zod';

/**
 * Theme-specific `content.extras` for "Terracotta Bloom".
 *
 * The shape is deliberately the same as the one "Noir & ivoire" declares: the
 * keepsake of the story chapter, the handwritten note, and the envelope kicker
 * line. The couple can switch themes without losing them — only the drawing
 * changes (here the keepsake is printed as a bar/table card rather than as a
 * torn train ticket).
 */

const Text = (max: number) => z.string().trim().max(max);

export const Memento = z.object({
  /** Kept as `'ticket'` for cross-theme compatibility of `extras`. */
  kind: z.literal('ticket'),
  /** Headline of the card: "The Cactus Bar", "Palm Springs → Joshua Tree"… */
  route: Text(30),
  /** Free-form, printed as-is: "05.18.21" */
  date: Text(12),
  /** e.g. "Table 4" */
  lineA: Text(20),
  /** e.g. "Two lemonades" */
  lineB: Text(20),
});
export type Memento = z.infer<typeof Memento>;

export const Extras = z.object({
  memento: Memento.optional(),
  /** Short handwritten note on kraft paper: "she said yes". */
  note: Text(30).optional(),
  envelope: z
    .object({
      /** Line shown above the envelope: "Sealed by hand, for you". */
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
