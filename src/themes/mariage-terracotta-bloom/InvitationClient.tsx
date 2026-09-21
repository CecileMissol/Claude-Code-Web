'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';
import type { InvitationContent } from '@/content/schema';
import type { InvitationMode } from '../types';
import { IllustrationDefs } from './assets/illustrations';
import { useInvitationMotion } from './animations/useInvitationMotion';
import { messagesFor } from './messages';
import type { Extras } from './schema';
import type { ResolvedPhotos } from './sections/pieces';
import { Intro } from './sections/Intro';
import { Story } from './sections/Story';
import { DateChapter } from './sections/DateChapter';
import { Program } from './sections/Program';
import { Place } from './sections/Place';
import { Info } from './sections/Info';
import { Rsvp } from './sections/Rsvp';
import { Signature } from './sections/Signature';

/**
 * Animated root of the "Noir & ivoire" invitation.
 *
 * Everything below this component is client-side: the envelope timeline, the
 * scroll-driven chapters and the RSVP form all need the browser. The server
 * half (`Invitation.tsx`) resolves the photo URLs and the palette and hands
 * them over as plain data, so this tree re-renders cheaply — which is what the
 * editor's live preview does on every keystroke.
 */

export interface InvitationClientProps {
  content: InvitationContent;
  mode: InvitationMode;
  slug?: string;
  /** Photo slots with their public URL already resolved (server side). */
  photos: ResolvedPhotos;
  /**
   * `content.extras`, already validated on the server.
   *
   * Parsing them here instead would drag Zod — about 100 kB gzipped — into the
   * client bundle for a single `safeParse`. The type is imported type-only, so
   * nothing of Zod reaches the browser.
   */
  extras: Extras;
  /** Palette + script, as CSS custom properties. */
  paletteVars: CSSProperties;
  paletteId: string;
  /** Values derived from the content on the server, to keep the markup stable. */
  derived: {
    names: string;
    initials: string;
    shortDate: string;
    longDate: string;
    postmark: string;
    directionsUrl: string;
  };
}

export function InvitationClient({
  content,
  mode,
  slug,
  photos,
  extras,
  paletteVars,
  paletteId,
  derived,
}: InvitationClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const t = messagesFor(content.locale);
  const { opened, ready, reduced, open } = useInvitationMotion(rootRef, mode);

  return (
    <div
      ref={rootRef}
      className="invitation"
      data-theme="mariage-terracotta-bloom"
      data-palette={paletteId}
      data-mode={mode}
      data-reduced={reduced ? 'true' : 'false'}
      data-opened={opened ? 'true' : 'false'}
      data-ready={ready ? 'true' : 'false'}
      lang={content.locale}
      style={paletteVars}
    >
      <IllustrationDefs />

      {mode === 'demo' && <p className="demo-banner">{t.demoBanner}</p>}

      <Intro
        t={t}
        names={derived.names}
        initials={derived.initials}
        shortDate={derived.shortDate}
        postmark={derived.postmark}
        kicker={extras.envelope?.kicker || t.intro.kicker}
        photos={photos}
        opened={opened}
        ready={ready}
        // In the editor the envelope must never be a wall: an "Open" button is
        // always there to skip straight past it.
        showSkip={mode === 'preview'}
        onOpen={open}
      />

      <Story t={t} content={content} extras={extras} photos={photos} />
      <DateChapter t={t} content={content} longDate={derived.longDate} />
      <Program t={t} content={content} />
      <Place
        t={t}
        content={content}
        photos={photos}
        directionsUrl={derived.directionsUrl}
        postmark={derived.postmark}
      />

      <Info t={t} items={content.info} />
      <Rsvp t={t} content={content} mode={mode} slug={slug} initials={derived.initials} />
      <Signature t={t} names={derived.names} text={content.signature.text} />
    </div>
  );
}

export default InvitationClient;
