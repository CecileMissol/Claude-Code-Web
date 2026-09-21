import type { Locale } from '@/i18n/config';

/**
 * Field descriptors of the editor.
 *
 * The editor never hard-codes what a theme can hold: {@link EditorStep}s are
 * generated from the theme manifest (`src/editor/manifest.ts`) and from the
 * theme's own `Extras` schema (`src/editor/extras.ts`). Descriptors are plain
 * data, so they cross the server/client boundary and drive both the rendering
 * (`src/editor/fields/`) and the client-side validation
 * (`src/editor/validation.ts`).
 */

export const EDITOR_STEP_IDS = [
  'couple',
  'event',
  'story',
  'photos',
  'program',
  'info',
  'rsvp',
  'style',
  'language',
  'publish',
] as const;

export type EditorStepId = (typeof EDITOR_STEP_IDS)[number];

/** One option of a `choice` field. */
export interface ChoiceOption {
  value: string;
  /** Plain label (locale-independent: a font name, a time zone…). */
  label?: string;
  /** Translated label, when the theme provides one per locale. */
  labelByLocale?: Record<Locale, string>;
  /** Colour shown in the palette swatch. */
  swatch?: string;
  /** CSS font stack, so the script picker can preview itself. */
  fontFamily?: string;
}

interface FieldBase {
  /** Unique within its step; used for `id`/`aria-describedby`. */
  id: string;
  /** Dot path inside the invitation content, e.g. `couple.partner1.firstName`. */
  path: string;
  /** Message key inside the `editor` namespace. */
  labelKey: string;
  helpKey?: string;
}

export interface TextFieldSpec extends FieldBase {
  kind: 'text' | 'textarea' | 'url';
  maxLength: number;
  required: boolean;
}

export interface DateFieldSpec extends FieldBase {
  kind: 'date' | 'time';
  required: boolean;
}

export interface NumberFieldSpec extends FieldBase {
  kind: 'number';
  min: number;
  max: number;
}

export interface BooleanFieldSpec extends FieldBase {
  kind: 'boolean';
}

export interface ChoiceFieldSpec extends FieldBase {
  kind: 'choice';
  /** How the picker is drawn: a `<select>`, colour swatches, or font samples. */
  presentation: 'select' | 'swatch' | 'script';
  required: boolean;
  options: ChoiceOption[];
}

/** A bounded list of short sentences, e.g. the lines of a chapter. */
export interface LinesFieldSpec extends FieldBase {
  kind: 'lines';
  min: number;
  max: number;
  maxLength: number;
}

/** One column of an `items` field (a programme entry, a practical info…). */
export type ItemFieldSpec = TextFieldSpec | DateFieldSpec;

/** A bounded, repeatable list of records. */
export interface ItemsFieldSpec extends FieldBase {
  kind: 'items';
  min: number;
  max: number;
  addLabelKey: string;
  itemLabelKey: string;
  /** Paths are relative to the item. */
  itemFields: ItemFieldSpec[];
  /** Values used when a new item is appended. */
  itemDefaults: Record<string, string>;
}

export interface PhotoSlotSpec {
  id: string;
  /** `photos.<slotId>` */
  path: string;
  label: Record<Locale, string>;
  /** width / height, used by the crop frame. */
  aspect: number;
  required: boolean;
}

export interface PhotosFieldSpec extends FieldBase {
  kind: 'photos';
  slots: PhotoSlotSpec[];
}

/** One string of a theme-specific extra block. */
export interface ExtrasTextSpec {
  id: string;
  /** Absolute path, e.g. `extras.memento.route`. */
  path: string;
  labelKey: string;
  maxLength: number;
}

/**
 * A theme-specific block of `content.extras`, read from the theme's Zod schema:
 * either a single optional string (`note`) or an optional object (`memento`).
 */
export interface ExtrasGroupSpec {
  id: string;
  /** `extras.<key>` */
  path: string;
  labelKey: string;
  shape: 'scalar' | 'object';
  /** Literal fields filled automatically, e.g. `{ kind: 'ticket' }`. */
  constants: Record<string, string>;
  fields: ExtrasTextSpec[];
}

export interface ExtrasFieldSpec extends FieldBase {
  kind: 'extras';
  groups: ExtrasGroupSpec[];
}

/** A plain link out of the editor (the publishing step). */
export interface LinkFieldSpec extends FieldBase {
  kind: 'link';
  /** `{id}` is replaced with the invitation id. */
  hrefTemplate: string;
}

export type EditorField =
  | TextFieldSpec
  | DateFieldSpec
  | NumberFieldSpec
  | BooleanFieldSpec
  | ChoiceFieldSpec
  | LinesFieldSpec
  | ItemsFieldSpec
  | PhotosFieldSpec
  | ExtrasFieldSpec
  | LinkFieldSpec;

export interface EditorStep {
  id: EditorStepId;
  /** `steps.<id>` in the `editor` namespace. */
  labelKey: string;
  fields: EditorField[];
}
