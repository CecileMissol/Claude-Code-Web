'use client';

/* eslint-disable @next/next/no-img-element -- photos are already resized and
   converted to WebP in the browser, and `next/image` is unoptimized on Workers
   (see next.config.ts): a plain <img> is both lighter and easier to crop. */

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { getAtPath } from './paths';
import {
  DEFAULT_CROP,
  PHOTO_MAX_EDGE,
  PhotoTooLargeError,
  isAcceptedInput,
  preparePhoto,
  type CropSettings,
} from './image';
import { PhotoUploadError, editorPhotoUrl, uploadPhoto } from './upload';
import { BUTTON_CLASS, FieldFrame, INPUT_CLASS } from './fields';
import type { FieldProps } from './fields';
import type { PhotoSlotSpec } from './types';
import { describeIssue } from './validation';

/**
 * Photo step: one uploader per slot declared by the theme manifest.
 *
 * The file never leaves the browser as-is. It is cropped to the slot ratio,
 * scaled to at most {@link PHOTO_MAX_EDGE} px and encoded to WebP on a canvas
 * (`src/editor/image.ts`), then PUT to R2 through a signed ticket
 * (`src/editor/upload.ts`). Cropping is done with sliders rather than a drag
 * gesture: it works with a keyboard, a screen reader and a thumb.
 */
export function PhotosField(props: FieldProps) {
  const { field } = props;
  const t = useTranslations('editor');
  if (field.kind !== 'photos') return null;

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">{t(field.labelKey)}</legend>
      {field.helpKey && (
        <p className="text-xs text-stone-500 dark:text-stone-400">{t(field.helpKey)}</p>
      )}
      <div className="space-y-6">
        {field.slots.map((slot) => (
          <PhotoSlot key={slot.id} slot={slot} {...props} />
        ))}
      </div>
    </fieldset>
  );
}

type SlotStatus = 'idle' | 'cropping' | 'preparing' | 'uploading';

interface StoredPhoto {
  key: string;
  width: number;
  height: number;
  alt?: string;
  caption?: string;
}

/** One photo slot: pick, crop, send, describe, remove. */
function PhotoSlot({
  slot,
  content,
  onChange,
  issues,
  locale,
  invitationId,
}: FieldProps & { slot: PhotoSlotSpec }) {
  const t = useTranslations('editor');
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<SlotStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP);

  const photo = getAtPath(content, slot.path) as StoredPhoto | undefined;
  const issue = issues.get(slot.path);
  const label = slot.label[locale as Locale] ?? slot.label.en;

  function reset() {
    if (picked) URL.revokeObjectURL(picked.url);
    setPicked(null);
    setCrop(DEFAULT_CROP);
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
  }

  function pick(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!isAcceptedInput(file.type)) {
      setError(t('errors.photoType'));
      return;
    }
    if (picked) URL.revokeObjectURL(picked.url);
    setPicked({ file, url: URL.createObjectURL(file) });
    setCrop(DEFAULT_CROP);
    setStatus('cropping');
  }

  async function confirm() {
    if (!picked) return;
    setError(null);
    setStatus('preparing');

    try {
      const prepared = await preparePhoto(picked.file, { aspect: slot.aspect, crop });
      setStatus('uploading');
      const key = await uploadPhoto(invitationId, prepared.blob);

      onChange(slot.path, {
        key,
        width: prepared.width,
        height: prepared.height,
        alt: photo?.alt ?? '',
        ...(photo?.caption ? { caption: photo.caption } : {}),
      });
      reset();
    } catch (cause) {
      if (cause instanceof PhotoTooLargeError) setError(t('errors.photoTooLarge'));
      else if (cause instanceof PhotoUploadError) setError(t(`errors.${cause.code}`));
      else if (cause instanceof Error && /canvas|WebP/i.test(cause.message)) {
        setError(t('errors.photoUnsupported'));
      } else setError(t('errors.photoFailed'));
      setStatus('cropping');
    }
  }

  const busy = status === 'preparing' || status === 'uploading';

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-stone-500">{t('photo.sizeHint', { edge: PHOTO_MAX_EDGE })}</p>
      </div>

      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          pick(event.dataTransfer.files[0]);
        }}
      >
        <div
          className="relative w-40 shrink-0 overflow-hidden rounded-md bg-stone-100 dark:bg-stone-800"
          style={{ aspectRatio: String(slot.aspect) }}
        >
          {picked ? (
            <img
              src={picked.url}
              alt=""
              className="size-full object-cover"
              style={{
                objectPosition: `${crop.focusX * 100}% ${crop.focusY * 100}%`,
                transform: `scale(${crop.zoom})`,
                transformOrigin: `${crop.focusX * 100}% ${crop.focusY * 100}%`,
              }}
            />
          ) : photo ? (
            <img
              src={editorPhotoUrl(photo.key)}
              alt={photo.alt ?? ''}
              className="size-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-content-center px-2 text-center text-xs text-stone-500">
              {t('photo.empty')}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">{t('photo.dropHint')}</p>

          <input
            ref={inputRef}
            id={`photo-input-${slot.id}`}
            type="file"
            accept="image/*"
            capture="environment"
            className="block w-full text-xs file:mr-3 file:rounded-full file:border file:border-stone-300 file:bg-white file:px-3 file:py-1 file:text-xs dark:file:border-stone-700 dark:file:bg-stone-900 dark:file:text-stone-100"
            onChange={(event) => pick(event.target.files?.[0])}
          />

          {picked && (
            <div className="space-y-2">
              <Slider
                id={`zoom-${slot.id}`}
                label={t('photo.zoom')}
                min={1}
                max={3}
                step={0.05}
                value={crop.zoom}
                onChange={(zoom) => setCrop((current) => ({ ...current, zoom }))}
              />
              <Slider
                id={`x-${slot.id}`}
                label={t('photo.horizontal')}
                min={0}
                max={1}
                step={0.01}
                value={crop.focusX}
                onChange={(focusX) => setCrop((current) => ({ ...current, focusX }))}
              />
              <Slider
                id={`y-${slot.id}`}
                label={t('photo.vertical')}
                min={0}
                max={1}
                step={0.01}
                value={crop.focusY}
                onChange={(focusY) => setCrop((current) => ({ ...current, focusY }))}
              />

              <div className="flex flex-wrap gap-2">
                <button type="button" className={BUTTON_CLASS} disabled={busy} onClick={confirm}>
                  {status === 'preparing'
                    ? t('photo.preparing')
                    : status === 'uploading'
                      ? t('photo.uploading')
                      : t('actions.choosePhoto')}
                </button>
                <button type="button" className={BUTTON_CLASS} disabled={busy} onClick={reset}>
                  {t('actions.removePhoto')}
                </button>
              </div>
            </div>
          )}

          {!picked && photo && (
            <button
              type="button"
              className={BUTTON_CLASS}
              onClick={() => onChange(slot.path, undefined)}
            >
              {t('actions.removePhoto')}
            </button>
          )}

          <p aria-live="polite" className="text-xs text-stone-500">
            {busy ? (status === 'preparing' ? t('photo.preparing') : t('photo.uploading')) : ''}
          </p>

          {error && (
            <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          {issue && (
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              {describeIssue(issue, t)}
            </p>
          )}
        </div>
      </div>

      {photo && (
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldFrame
            id={`photo-alt-${slot.id}`}
            label={t('photo.alt')}
            help={t('photo.altHelp')}
            optional
          >
            <input
              id={`photo-alt-${slot.id}`}
              type="text"
              maxLength={160}
              value={photo.alt ?? ''}
              className={INPUT_CLASS}
              aria-describedby={`photo-alt-${slot.id}-help`}
              onChange={(event) => onChange(`${slot.path}.alt`, event.target.value)}
            />
          </FieldFrame>

          <FieldFrame
            id={`photo-caption-${slot.id}`}
            label={t('photo.caption')}
            help={t('photo.captionHelp')}
            optional
          >
            <input
              id={`photo-caption-${slot.id}`}
              type="text"
              maxLength={40}
              value={photo.caption ?? ''}
              className={INPUT_CLASS}
              aria-describedby={`photo-caption-${slot.id}-help`}
              onChange={(event) =>
                onChange(
                  `${slot.path}.caption`,
                  event.target.value === '' ? undefined : event.target.value,
                )
              }
            />
          </FieldFrame>
        </div>
      )}
    </div>
  );
}

/** Labelled range input, used by the crop controls. */
function Slider({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="w-32 shrink-0 text-xs">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="w-full"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
