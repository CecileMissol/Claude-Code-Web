import type { ReactNode } from 'react';
import type { z } from 'zod';
import type { Locale } from '@/i18n/config';
import type { InvitationContent } from '@/content/schema';

/**
 * Contract every theme must satisfy.
 *
 * The editor only ever reads the manifest: it derives its form fields (photo
 * slots, palettes, scripts, bounds) without knowing how the theme draws them.
 * Creating a new theme means copying a folder and rewriting the visuals.
 */

/** Sections a theme may declare support for. */
export const SECTION_IDS = [
  'intro',
  'story',
  'date',
  'program',
  'place',
  'info',
  'rsvp',
  'signature',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Inclusive `[min, max]` bound. */
export type Range = readonly [min: number, max: number];

/**
 * The six CSS custom properties a palette must define. They match exactly the
 * variables used by the validated mock-up (`reference/invitation-mariage-demo.html`).
 */
export interface PaletteVars {
  /** Envelope front. */
  '--env': string;
  /** Envelope flap, slightly shifted. */
  '--env-2': string;
  /** Wax seal. */
  '--seal': string;
  /** Accent colour (stamps, script highlights, focus ring). */
  '--accent': string;
  /** Stems and foliage of the colourable illustrations. */
  '--stem': string;
  /** Envelope liner. */
  '--liner': string;
}

export interface ThemePalette {
  id: string;
  label: Record<Locale, string>;
  /** Colour shown in the editor swatch. */
  swatch: string;
  vars: PaletteVars;
}

export interface ThemeScript {
  id: string;
  /** Human-readable font name; not translated. */
  label: string;
  /** Full CSS `font-family` stack assigned to `--script`. */
  fontFamily: string;
}

export interface ThemePhotoSlot {
  id: string;
  label: Record<Locale, string>;
  /** width / height. */
  aspect: number;
  required: boolean;
}

export interface ThemeLimits {
  storyLines: Range;
  dateLines: Range;
  programLines: Range;
  programItems: Range;
  placeLines: Range;
  infoItems: Range;
}

export interface ThemeManifest {
  /** Folder name, and value stored in `themes.slug`. */
  slug: string;
  name: Record<Locale, string>;
  /** Bumped when the theme's rendering changes in a breaking way. */
  version: number;
  /** Extensible later: 'birthday', 'baptism'… */
  eventTypes: readonly ('wedding' | 'birthday' | 'baptism' | 'baby-shower' | 'corporate')[];
  palettes: readonly ThemePalette[];
  scripts: readonly ThemeScript[];
  photoSlots: readonly ThemePhotoSlot[];
  sections: readonly SectionId[];
  limits: ThemeLimits;
  defaultPaletteId: string;
  defaultScriptId: string;
}

/**
 * How the invitation is being rendered.
 * - `public`  : the published page an invited guest opens.
 * - `preview` : the live preview inside the editor.
 * - `demo`    : the public showcase at `/demo/<slug>`.
 */
export type InvitationMode = 'public' | 'preview' | 'demo';

export interface InvitationProps {
  content: InvitationContent;
  mode: InvitationMode;
  /** Public slug of the published invitation (undefined in preview/demo). */
  slug?: string;
  /** Database id of the invitation (undefined in demo). */
  invitationId?: string;
}

/**
 * A theme root component. It may be an async React Server Component, which is
 * how a theme loads its own message file from `content.locale`.
 */
export type InvitationComponent = (props: InvitationProps) => ReactNode | Promise<ReactNode>;

export interface ThemeModule {
  manifest: ThemeManifest;
  /** Validates `content.extras` for this theme. */
  Extras: z.ZodType;
  Invitation: InvitationComponent;
}

/** Looks a palette up, falling back to the theme default. */
export function resolvePalette(manifest: ThemeManifest, paletteId: string): ThemePalette {
  const found = manifest.palettes.find((palette) => palette.id === paletteId);
  if (found) return found;

  const fallback = manifest.palettes.find((palette) => palette.id === manifest.defaultPaletteId);
  if (!fallback) throw new Error(`Theme "${manifest.slug}" declares no usable palette.`);
  return fallback;
}

/** Looks a script font up, falling back to the theme default. */
export function resolveScript(manifest: ThemeManifest, scriptId: string): ThemeScript {
  const found = manifest.scripts.find((script) => script.id === scriptId);
  if (found) return found;

  const fallback = manifest.scripts.find((script) => script.id === manifest.defaultScriptId);
  if (!fallback) throw new Error(`Theme "${manifest.slug}" declares no usable script font.`);
  return fallback;
}

/** Turns a palette into an inline `style` object usable on the theme root. */
export function paletteStyle(palette: ThemePalette, script: ThemeScript): React.CSSProperties {
  return { ...palette.vars, '--script': script.fontFamily } as React.CSSProperties;
}
