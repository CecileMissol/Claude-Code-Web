import { getAtPath } from './paths';
import type { EditorField, EditorStep, ItemFieldSpec } from './types';

/**
 * Client-side validation, driven by the same field descriptors that draw the
 * form. It is deliberately the *mirror* of the server rules, not the authority:
 * `src/editor/content-schema.ts` re-validates everything with Zod (plus the
 * theme's own `Extras` schema) before anything reaches the database.
 *
 * Issues carry a code and its parameters rather than a sentence, so the message
 * can be translated with {@link describeIssue} in either locale.
 */

export type IssueCode =
  | 'required'
  | 'tooLong'
  | 'tooFew'
  | 'tooMany'
  | 'invalidUrl'
  | 'invalidDate'
  | 'invalidTime'
  | 'outOfRange'
  | 'unknownOption';

export interface ValidationIssue {
  /** Absolute content path of the offending value. */
  path: string;
  code: IssueCode;
  params?: Record<string, number | string>;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function checkText(
  path: string,
  value: unknown,
  options: { required: boolean; maxLength: number; url?: boolean },
): ValidationIssue[] {
  const text = asString(value).trim();

  if (text.length === 0) {
    return options.required ? [{ path, code: 'required' }] : [];
  }
  if (text.length > options.maxLength) {
    return [{ path, code: 'tooLong', params: { max: options.maxLength } }];
  }
  if (options.url && !/^https?:\/\/\S+$/i.test(text)) {
    return [{ path, code: 'invalidUrl' }];
  }
  return [];
}

function checkItemField(field: ItemFieldSpec, basePath: string, item: unknown): ValidationIssue[] {
  const path = `${basePath}.${field.path}`;
  const value = getAtPath(item, field.path);

  switch (field.kind) {
    case 'time':
    case 'date': {
      const text = asString(value).trim();
      if (text.length === 0) return field.required ? [{ path, code: 'required' }] : [];
      const valid = field.kind === 'time' ? TIME_RE.test(text) : DATE_RE.test(text);
      return valid ? [] : [{ path, code: field.kind === 'time' ? 'invalidTime' : 'invalidDate' }];
    }
    default:
      return checkText(path, value, {
        required: field.required,
        maxLength: field.maxLength,
        url: field.kind === 'url',
      });
  }
}

/** Validates one field against the draft content. */
export function validateField(field: EditorField, content: unknown): ValidationIssue[] {
  const value = getAtPath(content, field.path);

  switch (field.kind) {
    case 'text':
    case 'textarea':
    case 'url':
      return checkText(field.path, value, {
        required: field.required,
        maxLength: field.maxLength,
        url: field.kind === 'url',
      });

    case 'date':
    case 'time': {
      const text = asString(value).trim();
      if (text.length === 0) return field.required ? [{ path: field.path, code: 'required' }] : [];
      const valid = field.kind === 'time' ? TIME_RE.test(text) : DATE_RE.test(text);
      return valid
        ? []
        : [{ path: field.path, code: field.kind === 'time' ? 'invalidTime' : 'invalidDate' }];
    }

    case 'number': {
      const numeric = typeof value === 'number' ? value : Number.NaN;
      return Number.isInteger(numeric) && numeric >= field.min && numeric <= field.max
        ? []
        : [
            {
              path: field.path,
              code: 'outOfRange',
              params: { min: field.min, max: field.max },
            },
          ];
    }

    case 'boolean':
      return [];

    case 'choice': {
      const text = asString(value);
      if (text.length === 0) return field.required ? [{ path: field.path, code: 'required' }] : [];
      return field.options.some((option) => option.value === text)
        ? []
        : [{ path: field.path, code: 'unknownOption' }];
    }

    case 'lines': {
      const lines = Array.isArray(value) ? value : [];
      const issues: ValidationIssue[] = [];
      if (lines.length < field.min) {
        issues.push({ path: field.path, code: 'tooFew', params: { min: field.min } });
      }
      if (lines.length > field.max) {
        issues.push({ path: field.path, code: 'tooMany', params: { max: field.max } });
      }
      lines.forEach((line, index) => {
        if (asString(line).trim().length > field.maxLength) {
          issues.push({
            path: `${field.path}.${index}`,
            code: 'tooLong',
            params: { max: field.maxLength },
          });
        }
      });
      return issues;
    }

    case 'items': {
      const items = Array.isArray(value) ? value : [];
      const issues: ValidationIssue[] = [];
      if (items.length < field.min) {
        issues.push({ path: field.path, code: 'tooFew', params: { min: field.min } });
      }
      if (items.length > field.max) {
        issues.push({ path: field.path, code: 'tooMany', params: { max: field.max } });
      }
      items.forEach((item, index) => {
        for (const itemField of field.itemFields) {
          issues.push(...checkItemField(itemField, `${field.path}.${index}`, item));
        }
      });
      return issues;
    }

    case 'photos': {
      const issues: ValidationIssue[] = [];
      for (const slot of field.slots) {
        const photo = getAtPath(content, slot.path);
        if (!photo) {
          if (slot.required) issues.push({ path: slot.path, code: 'required' });
          continue;
        }
        issues.push(
          ...checkText(`${slot.path}.alt`, getAtPath(content, `${slot.path}.alt`), {
            required: false,
            maxLength: 160,
          }),
          ...checkText(`${slot.path}.caption`, getAtPath(content, `${slot.path}.caption`), {
            required: false,
            maxLength: 40,
          }),
        );
      }
      return issues;
    }

    case 'extras': {
      const issues: ValidationIssue[] = [];
      for (const group of field.groups) {
        if (getAtPath(content, group.path) === undefined) continue;
        for (const extraField of group.fields) {
          issues.push(
            ...checkText(extraField.path, getAtPath(content, extraField.path), {
              required: false,
              maxLength: extraField.maxLength,
            }),
          );
        }
      }
      return issues;
    }

    case 'link':
      return [];

    default:
      return [];
  }
}

/** Validates the whole draft against every step. */
export function validateDraft(steps: readonly EditorStep[], content: unknown): ValidationIssue[] {
  return steps.flatMap((step) => step.fields.flatMap((field) => validateField(field, content)));
}

/** Indexes issues by content path, keeping the first one per path. */
export function issuesByPath(issues: readonly ValidationIssue[]): Map<string, ValidationIssue> {
  const map = new Map<string, ValidationIssue>();
  for (const issue of issues) if (!map.has(issue.path)) map.set(issue.path, issue);
  return map;
}

/** Ids of the steps holding at least one issue, for the step navigation. */
export function stepsWithIssues(
  steps: readonly EditorStep[],
  content: unknown,
): ReadonlySet<string> {
  const flagged = new Set<string>();
  for (const step of steps) {
    if (step.fields.some((field) => validateField(field, content).length > 0)) flagged.add(step.id);
  }
  return flagged;
}

/** A translator, narrowed to what {@link describeIssue} needs. */
export type IssueTranslator = (key: string, params?: Record<string, number | string>) => string;

/** Turns an issue into a sentence in the interface language. */
export function describeIssue(issue: ValidationIssue, t: IssueTranslator): string {
  return t(`errors.${issue.code}`, issue.params);
}
