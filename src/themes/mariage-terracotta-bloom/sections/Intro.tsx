'use client';

import { Eucalyptus, Pampas, Postmark, Stamp } from '../assets/illustrations';
import type { Messages } from '../messages';
import { Frame, type ResolvedPhotos } from './pieces';

/**
 * The envelope.
 *
 * Same mechanics as every theme of the catalogue — the envelope turns over, the
 * seal pops, the flap swings, the pieces rise — but the pieces themselves are
 * this theme's: a terracotta envelope with a patterned liner, a sage wax seal,
 * illustrated stamps, and an *arch card* instead of a ticket.
 *
 * Markup order matters: the flap sits above the pocket until the timeline drops
 * its `z-index`, and the seal sits above the flap. `data-env-*` attributes are
 * the handles `useInvitationMotion` gives to GSAP — no class-name coupling
 * between the animation and the stylesheet.
 */
export function Intro({
  t,
  names,
  initials,
  shortDate,
  postmark,
  kicker,
  photos,
  opened,
  ready,
  showSkip,
  onOpen,
}: {
  t: Messages;
  names: string;
  initials: string;
  shortDate: string;
  postmark: string;
  kicker: string;
  photos: ResolvedPhotos;
  opened: boolean;
  ready: boolean;
  showSkip: boolean;
  onOpen: () => void;
}) {
  return (
    <section
      className={`tb-intro${opened ? ' tb-opened' : ''}${ready ? ' tb-ready' : ''}`}
      id="intro"
      aria-label={kicker}
    >
      <p className="tb-kicker">{kicker}</p>

      {showSkip && (
        <button type="button" className="tb-skip" onClick={onOpen}>
          {t.intro.openButton}
        </button>
      )}

      {/*
        A div with `role="button"`, not a real <button>: the envelope is a
        size container with absolutely positioned children, and form controls
        have engine-specific internal layout that fights `container-type` and
        `overflow`. Keyboard support is restored by hand, so Enter and Space
        both open the envelope.
      */}
      <div
        className="tb-env-wrap"
        role="button"
        tabIndex={0}
        aria-label={t.intro.openLabel}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
          }
        }}
      >
        {/* ---- Address side ---- */}
        <span className="tb-face tb-front" data-env-front>
          <span className="tb-stamps">
            <Stamp variant="pampas" value="0,68" />
            <Stamp variant="sun" value="1,20" />
          </span>
          <Postmark className="tb-postmark" date={postmark} />
          <span className="tb-addr">
            <span className="tb-script">{names}</span>
            <span className="tb-caps">{shortDate}</span>
          </span>
          <Pampas className="tb-lay" />
        </span>

        {/* ---- Inside ---- */}
        <span className="tb-face tb-back" data-env-back>
          <span className="tb-liner" />

          <span className="tb-snap tb-p1 tb-tape" data-env-polaroid="1">
            <Frame photo={photos['envelope-1']} slotId="envelope-1" eager />
          </span>
          <span className="tb-snap tb-p2" data-env-polaroid="2">
            <Frame photo={photos['envelope-2']} slotId="envelope-2" eager />
          </span>

          {/* The arch card: this theme's answer to the ticket with a stub. */}
          <span className="tb-card" data-env-ticket>
            <span className="tb-card-in">
              <span className="tb-c1">{t.intro.saveTheDate}</span>
              <span className="tb-c2">{shortDate}</span>
              <span className="tb-c3">{t.intro.weAreGettingMarried}</span>
            </span>
          </span>

          <span className="tb-pocket" />

          <span className="tb-tuck tb-tuck1" data-env-tuck="1">
            <Pampas />
          </span>
          <span className="tb-tuck tb-tuck2" data-env-tuck="2">
            <Eucalyptus rotate={-24} />
          </span>

          <span className="tb-flap" data-env-flap />
          <span className="tb-seal" data-env-seal>
            {initials}
          </span>
        </span>
      </div>

      <p className="tb-hint">{t.intro.hint}</p>

      <div className="tb-cue" aria-hidden={!ready}>
        {t.intro.scrollCue}
        <span />
      </div>
    </section>
  );
}

export default Intro;
