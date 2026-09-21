'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BooleanControl,
  ChoiceControl,
  DateControl,
  ItemsControl,
  LinesControl,
  NumberControl,
  TextControl,
  type FieldProps,
} from './fields';
import { ExtrasField } from './ExtrasField';
import { PhotosField } from './PhotoField';
import type { EditorStep } from './types';

/**
 * Renders one step of the editor by dispatching each of its descriptors to the
 * matching control. Adding a field kind means adding one case here and one
 * control in `src/editor/fields.tsx`.
 */
export function StepPanel({
  step,
  ...props
}: Omit<FieldProps, 'field'> & { step: EditorStep }) {
  const t = useTranslations('editor');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t(step.labelKey)}</h2>

      {step.fields.map((field) => {
        const shared = { ...props, field, key: field.id };

        switch (field.kind) {
          case 'text':
          case 'textarea':
          case 'url':
            return <TextControl {...shared} />;
          case 'date':
          case 'time':
            return <DateControl {...shared} />;
          case 'number':
            return <NumberControl {...shared} />;
          case 'boolean':
            return <BooleanControl {...shared} />;
          case 'choice':
            return <ChoiceControl {...shared} />;
          case 'lines':
            return <LinesControl {...shared} />;
          case 'items':
            return <ItemsControl {...shared} />;
          case 'photos':
            return <PhotosField {...shared} />;
          case 'extras':
            return <ExtrasField {...shared} />;
          case 'link':
            return (
              <div key={field.id} className="space-y-2">
                {field.helpKey && (
                  <p className="text-sm text-stone-600 dark:text-stone-400">{t(field.helpKey)}</p>
                )}
                <Link
                  href={field.hrefTemplate.replace('{id}', props.invitationId)}
                  className="inline-block rounded-full bg-stone-900 px-5 py-2 text-sm text-stone-50 focus:ring-2 focus:ring-stone-400 focus:outline-none dark:bg-stone-100 dark:text-stone-900"
                >
                  {t('actions.goToShare')}
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
