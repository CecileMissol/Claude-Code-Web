'use client';

import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { getAtPath } from './paths';
import type {
  ChoiceFieldSpec,
  ChoiceOption,
  EditorField,
  ItemsFieldSpec,
  LinesFieldSpec,
} from './types';
import { describeIssue, type ValidationIssue } from './validation';

/**
 * Generic form controls of the editor.
 *
 * Every control is driven by a descriptor generated from the theme manifest
 * (`src/editor/manifest.ts`), so adding a palette, a photo slot or a bound to a
 * theme changes the form without a single line of UI code.
 *
 * Accessibility: one `<label>` per control, help text and error message wired
 * through `aria-describedby`, `aria-invalid` on failure, and no colour-only
 * signal (every error also carries a sentence).
 */

const INPUT_CLASS =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 ' +
  'focus:border-stone-500 focus:ring-2 focus:ring-stone-400 focus:outline-none ' +
  'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100';

const BUTTON_CLASS =
  'rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-700 hover:bg-stone-100 ' +
  'focus:ring-2 focus:ring-stone-400 focus:outline-none disabled:opacity-40 ' +
  'dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800';

export interface FieldProps {
  field: EditorField;
  content: unknown;
  /** Writes a value at an absolute content path (`undefined` clears it). */
  onChange: (path: string, value: unknown) => void;
  /** Issues of the whole draft, indexed by path. */
  issues: Map<string, ValidationIssue>;
  /** Interface locale, used for the labels a theme provides per language. */
  locale: Locale;
  /** Invitation id, needed by the photo and link controls. */
  invitationId: string;
}

/** Translated label of an option, whichever form the theme provided. */
export function optionLabel(option: ChoiceOption, locale: Locale): string {
  return option.labelByLocale?.[locale] ?? option.label ?? option.value;
}

/** Wraps a control with its label, help text and error message. */
export function FieldFrame({
  id,
  label,
  help,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations('editor');

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-2 text-xs font-normal text-stone-500">{t('optional')}</span>
        )}
      </label>
      {children}
      {help && (
        <p id={`${id}-help`} className="text-xs text-stone-500 dark:text-stone-400">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, help: boolean, error: boolean): string | undefined {
  const ids = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/** Single-line, multi-line and URL inputs. */
function TextControl({ field, content, onChange, issues }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'text' && field.kind !== 'textarea' && field.kind !== 'url') return null;

  const id = `field-${field.id}`;
  const issue = issues.get(field.path);
  const error = issue ? describeIssue(issue, t) : undefined;
  const value =
    typeof getAtPath(content, field.path) === 'string'
      ? (getAtPath(content, field.path) as string)
      : '';
  const help = field.helpKey ? t(field.helpKey) : undefined;

  const shared = {
    id,
    value,
    maxLength: field.maxLength,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(id, Boolean(help), Boolean(error)),
    className: INPUT_CLASS,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(
        field.path,
        event.target.value === '' && !field.required ? emptyValue(field) : event.target.value,
      ),
  };

  return (
    <FieldFrame
      id={id}
      label={t(field.labelKey)}
      help={help}
      error={error}
      optional={!field.required}
    >
      {field.kind === 'textarea' ? (
        <textarea {...shared} rows={3} />
      ) : (
        <input {...shared} type={field.kind === 'url' ? 'url' : 'text'} inputMode="text" />
      )}
    </FieldFrame>
  );
}

/**
 * An emptied optional field must disappear from the content rather than be
 * stored as `""`: `venue.mapsUrl` is a URL or nothing, never an empty string.
 */
function emptyValue(field: EditorField): unknown {
  return field.kind === 'url' ? undefined : '';
}

/** Date and time inputs, kept as `YYYY-MM-DD` / `HH:MM` strings. */
function DateControl({ field, content, onChange, issues }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'date' && field.kind !== 'time') return null;

  const id = `field-${field.id}`;
  const issue = issues.get(field.path);
  const error = issue ? describeIssue(issue, t) : undefined;
  const value = (getAtPath(content, field.path) as string | undefined) ?? '';
  const help = field.helpKey ? t(field.helpKey) : undefined;

  return (
    <FieldFrame
      id={id}
      label={t(field.labelKey)}
      help={help}
      error={error}
      optional={!field.required}
    >
      <input
        id={id}
        type={field.kind}
        value={value}
        className={INPUT_CLASS}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(help), Boolean(error))}
        onChange={(event) =>
          onChange(
            field.path,
            event.target.value === '' && !field.required ? undefined : event.target.value,
          )
        }
      />
    </FieldFrame>
  );
}

/** Bounded integer. */
function NumberControl({ field, content, onChange, issues }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'number') return null;

  const id = `field-${field.id}`;
  const issue = issues.get(field.path);
  const error = issue ? describeIssue(issue, t) : undefined;
  const value = getAtPath(content, field.path);

  return (
    <FieldFrame id={id} label={t(field.labelKey)} error={error}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={field.min}
        max={field.max}
        value={typeof value === 'number' ? value : ''}
        className={`${INPUT_CLASS} max-w-28`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, false, Boolean(error))}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(field.path, Number.isNaN(parsed) ? event.target.value : parsed);
        }}
      />
    </FieldFrame>
  );
}

/** Checkbox, for the RSVP options. */
function BooleanControl({ field, content, onChange }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'boolean') return null;

  const id = `field-${field.id}`;
  const value = getAtPath(content, field.path) === true;

  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        type="checkbox"
        checked={value}
        className="mt-1 size-4 rounded border-stone-400 focus:ring-2 focus:ring-stone-400"
        onChange={(event) => onChange(field.path, event.target.checked)}
      />
      <label htmlFor={id} className="text-sm">
        {t(field.labelKey)}
      </label>
    </div>
  );
}

/** Select, colour swatches or font samples, depending on the descriptor. */
function ChoiceControl({ field, content, onChange, issues, locale }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'choice') return null;

  const spec = field as ChoiceFieldSpec;
  const id = `field-${spec.id}`;
  const issue = issues.get(spec.path);
  const error = issue ? describeIssue(issue, t) : undefined;
  const raw = getAtPath(content, spec.path);
  const value = typeof raw === 'string' ? raw : '';
  const help = spec.helpKey ? t(spec.helpKey) : undefined;

  if (spec.presentation === 'select') {
    const options =
      value && !spec.options.some((option) => option.value === value)
        ? [...spec.options, { value, label: value }]
        : spec.options;

    return (
      <FieldFrame id={id} label={t(spec.labelKey)} help={help} error={error}>
        <select
          id={id}
          value={value}
          className={INPUT_CLASS}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, Boolean(help), Boolean(error))}
          onChange={(event) => onChange(spec.path, event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {optionLabel(option, locale)}
            </option>
          ))}
        </select>
      </FieldFrame>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{t(spec.labelKey)}</legend>
      <div className="flex flex-wrap gap-2">
        {spec.options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                checked
                  ? 'border-stone-900 bg-stone-100 dark:border-stone-200 dark:bg-stone-800'
                  : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option.value}
                checked={checked}
                className="size-4 focus:ring-2 focus:ring-stone-400"
                onChange={() => onChange(spec.path, option.value)}
              />
              {option.swatch && (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-stone-300"
                  style={{ backgroundColor: option.swatch }}
                />
              )}
              <span
                style={
                  option.fontFamily
                    ? { fontFamily: option.fontFamily, fontSize: '1.1rem' }
                    : undefined
                }
              >
                {optionLabel(option, locale)}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-red-700 dark:text-red-400">{error}</p>}
    </fieldset>
  );
}

/** Bounded list of sentences, with add / remove / reorder. */
function LinesControl({ field, content, onChange, issues }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'lines') return null;

  const spec = field as LinesFieldSpec;
  const raw = getAtPath(content, spec.path);
  const lines: string[] = Array.isArray(raw) ? (raw as string[]) : [];
  const listIssue = issues.get(spec.path);
  const help = spec.helpKey ? t(spec.helpKey) : undefined;

  const replace = (next: string[]) => onChange(spec.path, next);

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{t(spec.labelKey)}</legend>
      {help && <p className="text-xs text-stone-500 dark:text-stone-400">{help}</p>}

      <ol className="space-y-2">
        {lines.map((line, index) => {
          const id = `field-${spec.id}-${index}`;
          const issue = issues.get(`${spec.path}.${index}`);
          const error = issue ? describeIssue(issue, t) : undefined;

          return (
            <li key={index} className="space-y-1">
              <label htmlFor={id} className="sr-only">
                {`${t(spec.labelKey)} ${index + 1}`}
              </label>
              <textarea
                id={id}
                rows={2}
                value={line}
                maxLength={spec.maxLength}
                className={INPUT_CLASS}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = event.target.value;
                  replace(next);
                }}
              />
              {error && (
                <p
                  id={`${id}-error`}
                  className="text-xs font-medium text-red-700 dark:text-red-400"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className={BUTTON_CLASS}
                  disabled={index === 0}
                  onClick={() => replace(swap(lines, index, index - 1))}
                >
                  {t('actions.moveUp')}
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASS}
                  disabled={index === lines.length - 1}
                  onClick={() => replace(swap(lines, index, index + 1))}
                >
                  {t('actions.moveDown')}
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASS}
                  disabled={lines.length <= spec.min}
                  onClick={() => replace(lines.filter((_, i) => i !== index))}
                >
                  {t('actions.removeLine')}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        className={BUTTON_CLASS}
        disabled={lines.length >= spec.max}
        onClick={() => replace([...lines, ''])}
      >
        {t('actions.addLine')}
      </button>

      {listIssue && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">
          {describeIssue(listIssue, t)}
        </p>
      )}
    </fieldset>
  );
}

/** Bounded list of records: the programme, the practical notes. */
function ItemsControl({ field, content, onChange, issues }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'items') return null;

  const spec = field as ItemsFieldSpec;
  const raw = getAtPath(content, spec.path);
  const items: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : [];
  const listIssue = issues.get(spec.path);

  const replace = (next: unknown[]) => onChange(spec.path, next);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{t(spec.labelKey)}</legend>

      {items.map((item, index) => (
        <div
          key={index}
          className="space-y-2 rounded-lg border border-stone-200 p-3 dark:border-stone-800"
        >
          <p className="text-xs font-semibold text-stone-500 uppercase">
            {t(spec.itemLabelKey, { number: index + 1 })}
          </p>

          {spec.itemFields.map((itemField) => {
            const path = `${spec.path}.${index}.${itemField.path}`;
            const id = `field-${spec.id}-${index}-${itemField.id}`;
            const issue = issues.get(path);
            const error = issue ? describeIssue(issue, t) : undefined;
            const value = (getAtPath(item, itemField.path) as string | undefined) ?? '';
            const isText = itemField.kind === 'text' || itemField.kind === 'textarea';

            return (
              <FieldFrame
                key={itemField.id}
                id={id}
                label={t(itemField.labelKey)}
                error={error}
                optional={!itemField.required}
              >
                {itemField.kind === 'textarea' ? (
                  <textarea
                    id={id}
                    rows={2}
                    value={value}
                    maxLength={itemField.maxLength}
                    className={INPUT_CLASS}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) =>
                      replace(setItem(items, index, itemField.path, event.target.value))
                    }
                  />
                ) : (
                  <input
                    id={id}
                    type={
                      itemField.kind === 'time' || itemField.kind === 'date'
                        ? itemField.kind
                        : 'text'
                    }
                    value={value}
                    maxLength={isText ? itemField.maxLength : undefined}
                    className={INPUT_CLASS}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) =>
                      replace(setItem(items, index, itemField.path, event.target.value))
                    }
                  />
                )}
              </FieldFrame>
            );
          })}

          <div className="flex gap-2">
            <button
              type="button"
              className={BUTTON_CLASS}
              disabled={index === 0}
              onClick={() => replace(swap(items, index, index - 1))}
            >
              {t('actions.moveUp')}
            </button>
            <button
              type="button"
              className={BUTTON_CLASS}
              disabled={index === items.length - 1}
              onClick={() => replace(swap(items, index, index + 1))}
            >
              {t('actions.moveDown')}
            </button>
            <button
              type="button"
              className={BUTTON_CLASS}
              disabled={items.length <= spec.min}
              onClick={() => replace(items.filter((_, i) => i !== index))}
            >
              {t('actions.removeItem')}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={BUTTON_CLASS}
        disabled={items.length >= spec.max}
        onClick={() => replace([...items, { ...spec.itemDefaults }])}
      >
        {t(spec.addLabelKey)}
      </button>

      {listIssue && (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">
          {describeIssue(listIssue, t)}
        </p>
      )}
    </fieldset>
  );
}

function swap<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  const moved = next[from] as T;
  next[from] = next[to] as T;
  next[to] = moved;
  return next;
}

function setItem(
  items: readonly Record<string, unknown>[],
  index: number,
  key: string,
  value: unknown,
): Record<string, unknown>[] {
  return items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
}

export {
  TextControl,
  DateControl,
  NumberControl,
  BooleanControl,
  ChoiceControl,
  LinesControl,
  ItemsControl,
  INPUT_CLASS,
  BUTTON_CLASS,
};
