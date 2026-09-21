import type { z } from 'zod';
import type { ExtrasGroupSpec, ExtrasTextSpec } from './types';

/**
 * Reads a theme's `Extras` Zod schema and turns it into editable field groups.
 *
 * The decorative blocks of a theme (for "Noir & ivoire": the torn train ticket,
 * the handwritten note on kraft paper, the envelope kicker) are declared once,
 * in `src/themes/<slug>/schema.ts`. The editor introspects that schema instead
 * of repeating it, so a new theme gets its extras fields for free.
 *
 * Supported shapes — anything else is skipped rather than guessed:
 * - `z.string().max(n).optional()`            → one optional text field;
 * - `z.object({ … }).optional()` whose values are strings or literals
 *                                             → an optional group of text
 *                                               fields, literals being filled
 *                                               automatically.
 */

interface ZodLike {
  def?: { type?: string; innerType?: ZodLike; values?: readonly unknown[] };
  shape?: Record<string, ZodLike>;
  maxLength?: number | null;
}

const DEFAULT_MAX_LENGTH = 60;

function asZod(schema: unknown): ZodLike | null {
  return typeof schema === 'object' && schema !== null ? (schema as ZodLike) : null;
}

/** Unwraps `optional`, `nullable` and `default` layers. */
function unwrap(schema: ZodLike): { inner: ZodLike; optional: boolean } {
  let inner = schema;
  let optional = false;

  while (
    inner.def?.innerType &&
    ['optional', 'nullable', 'default'].includes(inner.def.type ?? '')
  ) {
    optional = optional || inner.def.type !== 'nullable';
    inner = inner.def.innerType;
  }

  return { inner, optional };
}

function stringMax(schema: ZodLike): number {
  return typeof schema.maxLength === 'number' ? schema.maxLength : DEFAULT_MAX_LENGTH;
}

function literalValue(schema: ZodLike): string | null {
  const values = schema.def?.values;
  if (schema.def?.type !== 'literal' || !values || values.length !== 1) return null;
  return typeof values[0] === 'string' ? values[0] : null;
}

/**
 * Builds the editable groups of a theme's `extras`.
 *
 * @param extras The theme's `Extras` schema (`ThemeModule['Extras']`).
 * @returns One group per supported key, in declaration order.
 */
export function extrasGroups(extras: z.ZodType | unknown): ExtrasGroupSpec[] {
  const root = asZod(extras);
  const shape = root?.def?.type === 'object' ? root.shape : undefined;
  if (!shape) return [];

  const groups: ExtrasGroupSpec[] = [];

  for (const [key, rawValue] of Object.entries(shape)) {
    const value = asZod(rawValue);
    if (!value) continue;

    const { inner, optional } = unwrap(value);
    const path = `extras.${key}`;

    if (inner.def?.type === 'string') {
      groups.push({
        id: key,
        path,
        labelKey: `extras.${key}.label`,
        shape: 'scalar',
        constants: {},
        fields: [{ id: key, path, labelKey: `extras.${key}.label`, maxLength: stringMax(inner) }],
      });
      continue;
    }

    if (inner.def?.type === 'object' && inner.shape) {
      const constants: Record<string, string> = {};
      const fields: ExtrasTextSpec[] = [];

      for (const [childKey, rawChild] of Object.entries(inner.shape)) {
        const child = asZod(rawChild);
        if (!child) continue;

        const literal = literalValue(unwrap(child).inner);
        if (literal !== null) {
          constants[childKey] = literal;
          continue;
        }

        const childInner = unwrap(child).inner;
        if (childInner.def?.type !== 'string') continue;

        fields.push({
          id: `${key}-${childKey}`,
          path: `${path}.${childKey}`,
          labelKey: `extras.${key}.${childKey}`,
          maxLength: stringMax(childInner),
        });
      }

      if (fields.length > 0) {
        groups.push({
          id: key,
          path,
          labelKey: `extras.${key}.label`,
          shape: 'object',
          constants,
          fields,
        });
      }
      continue;
    }

    void optional;
  }

  return groups;
}

/** The value written when the couple ticks "show this block". */
export function extrasGroupDefault(group: ExtrasGroupSpec): unknown {
  if (group.shape === 'scalar') return '';

  const value: Record<string, string> = { ...group.constants };
  for (const field of group.fields) {
    const key = field.path.slice(group.path.length + 1);
    value[key] = '';
  }
  return value;
}
