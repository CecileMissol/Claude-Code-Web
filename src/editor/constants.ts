/**
 * Constants shared by the editor, the dashboard and the photo routes.
 * They live apart from `actions.ts`, because a `'use server'` module may only
 * export asynchronous functions.
 */

/**
 * Theme used for the drafts created from the dashboard.
 * Until the Etsy activation is live, every couple starts on this one.
 */
export const DEFAULT_THEME_SLUG = 'mariage-noir-ivoire';

/** Debounce before the draft is sent to the server, in milliseconds. */
export const AUTOSAVE_DELAY_MS = 800;

/** Preview widths of the device switcher, in CSS pixels. */
export const PREVIEW_DEVICES = [
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'desktop', width: 1280, height: 800 },
] as const;

export type PreviewDeviceId = (typeof PREVIEW_DEVICES)[number]['id'];

/** Message exchanged between the editor and the preview iframe. */
export const PREVIEW_MESSAGE = {
  /** Sent by the iframe once its bridge is listening. */
  ready: 'invitation-preview:ready',
  /** Sent by the editor after a successful save. */
  refresh: 'invitation-preview:refresh',
} as const;
