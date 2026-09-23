'use client';

import { useTranslations } from 'next-intl';
import { getAtPath } from './paths';
import { extrasGroupDefault } from './extras';
import { FieldFrame, INPUT_CLASS } from './fields';
import type { FieldProps } from './fields';
import { describeIssue } from './validation';

/**
 * Theme-specific keepsakes ("extras").
 *
 * The groups are read from the theme's own Zod schema
 * (`src/editor/extras.ts`), so this component knows nothing about train
 * tickets or kraft paper: for "Noir & ivoire" it happens to render the torn
 * ticket, the handwritten note and the envelope kicker; another theme gets its
 * own blocks with no change here.
 *
 * Every block is optional and starts hidden: the "show this block" checkbox
 * adds it to `content.extras`, unticking it removes the key entirely.
 */
export function ExtrasField({ field, content, onChange, issues }: FieldProps) {
  const t = useTranslations('editor');
  if (field.kind !== 'extras') return null;

  const label = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">{t(field.labelKey)}</legend>
      {field.helpKey && (
        <p className="text-xs text-stone-500 dark:text-stone-400">{t(field.helpKey)}</p>
      )}

      {field.groups.map((group) => {
        const value = getAtPath(content, group.path);
        const shown = value !== undefined;
        const toggleId = `extras-${group.id}`;

        return (
          <div
            key={group.id}
            className="space-y-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800"
          >
            <div className="flex items-center gap-2">
              <input
                id={toggleId}
                type="checkbox"
                checked={shown}
                className="size-4 rounded border-stone-400 focus:ring-2 focus:ring-stone-400"
                onChange={(event) =>
                  onChange(group.path, event.target.checked ? extrasGroupDefault(group) : undefined)
                }
              />
              <label htmlFor={toggleId} className="text-sm font-medium">
                {label(group.labelKey, group.id)}
              </label>
            </div>

            {shown &&
              group.fields.map((extraField) => {
                const id = `extras-field-${extraField.id}`;
                const issue = issues.get(extraField.path);
                const error = issue ? describeIssue(issue, t) : undefined;
                const current = getAtPath(content, extraField.path);

                return (
                  <FieldFrame
                    key={extraField.id}
                    id={id}
                    label={label(extraField.labelKey, extraField.id)}
                    error={error}
                    optional
                  >
                    <input
                      id={id}
                      type="text"
                      maxLength={extraField.maxLength}
                      value={typeof current === 'string' ? current : ''}
                      className={INPUT_CLASS}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${id}-error` : undefined}
                      onChange={(event) => onChange(extraField.path, event.target.value)}
                    />
                  </FieldFrame>
                );
              })}
          </div>
        );
      })}
    </fieldset>
  );
}
