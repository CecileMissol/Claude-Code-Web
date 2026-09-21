'use client';

import { Bougainvillea, LemonBranch, Postmark, Stamp } from '../assets/illustrations';
import type { Messages } from '../messages';
import { Snapshot, type ResolvedPhotos } from './pieces';

/**
 * The air-mail envelope.
 *
 * White paper, blue-and-red edging, illustrated stamps, a blue postal seal —
 * the postcard that comes back from the Riviera, not the black envelope of
 * theme 1.
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
      className={`intro${opened ? ' opened' : ''}${ready ? ' ready' : ''}`}
      id="intro"
      aria-label={kicker}
    >
      <p className="kicker">{kicker}</p>

      {showSkip && (
        <button type="button" className="skip" onClick={onOpen}>
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
        className="env-wrap"
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
        <span className="face front" data-env-front>
          <span className="air-edge" aria-hidden="true" />

          <span className="stamps">
            <Stamp motif="lemon" value="1.39" country={t.intro.stampCountry} />
            <Stamp motif="cypress" value="2.10" country={t.intro.stampCountry} />
          </span>
          <Postmark className="postmark" date={postmark} />

          <span className="par-avion">{t.intro.airmail}</span>

          <span className="addr">
            <span className="script">{names}</span>
            <span className="caps">{shortDate}</span>
          </span>

          <LemonBranch className="lay" />
        </span>

        {/* ---- Inside ---- */}
        <span className="face back" data-env-back>
          <span className="liner" />

          <span className="snap s1 tape" data-env-snap="1">
            <Snapshot photo={photos['envelope-1']} slotId="envelope-1" eager />
          </span>
          <span className="snap s2" data-env-snap="2">
            <Snapshot photo={photos['envelope-2']} slotId="envelope-2" eager />
          </span>

          {/* The save-the-date, as a small postcard slid into the pocket. */}
          <span className="card" data-env-card>
            <span className="cmain">
              <span className="c1">{t.intro.saveTheDate}</span>
              <span className="c2">{shortDate}</span>
              <span className="c3">{t.intro.weAreGettingMarried}</span>
            </span>
            <span className="cband" aria-hidden="true" />
            <span className="cnames script">{names}</span>
          </span>

          <span className="pocket" />

          <span className="tuck tuck1" data-env-tuck="1">
            <LemonBranch />
          </span>
          <span className="tuck tuck2" data-env-tuck="2">
            <Bougainvillea />
          </span>

          <span className="flap" data-env-flap />
          <span className="seal" data-env-seal>
            {initials}
          </span>
        </span>
      </div>

      <p className="hint">{t.intro.hint}</p>

      <div className="cue" aria-hidden={!ready}>
        {t.intro.scrollCue}
        <span />
      </div>
    </section>
  );
}

export default Intro;
