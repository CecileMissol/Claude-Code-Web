import { z } from 'zod';

/**
 * Theme-specific `content.extras` for "Noir & ivoire".
 *
 * These are the decorative blocks of the mock-up that other themes may not be
 * able to draw: the torn train ticket of the story chapter, the handwritten
 * note on kraft paper, and the envelope kicker line.
 */

const Text = (max: number) => z.string().trim().max(max);

export const Memento = z.object({
  kind: z.literal('ticket'),
  /** e.g. "Marseille → Paris" */
  route: Text(30),
  /** Free-form, printed as-is: "14.02.19" */
  date: Text(12),
  /** e.g. "Voiture 12" */
  lineA: Text(20),
  /** e.g. "Places 45 · 46" */
  lineB: Text(20),
});
export type Memento = z.infer<typeof Memento>;

export const Extras = z.object({
  memento: Memento.optional(),
  /** Short handwritten note on kraft paper: "elle a dit oui". */
  note: Text(30).optional(),
  envelope: z
    .object({
      /** Line shown above the envelope: "Une lettre pour vous". */
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
