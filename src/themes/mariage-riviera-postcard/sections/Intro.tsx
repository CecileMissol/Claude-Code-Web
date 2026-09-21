'use client';

import { Calla, Hydrangea, Postmark, Stamp } from '../assets/illustrations';
import type { Messages } from '../messages';
import { Polaroid, type ResolvedPhotos } from './pieces';

/**
 * The envelope.
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
        `overflow`. The mock-up does the same. Keyboard support is restored by
        hand, so Enter and Space both open the envelope.
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
          <span className="stamps">
            <Stamp variant="calla" value="1,39" />
            <Stamp variant="bloom" value="2,10" />
          </span>
          <Postmark className="postmark" date={postmark} />
          <span className="addr">
            <span className="script">{names}</span>
            <span className="caps">{shortDate}</span>
          </span>
          <Calla className="lay" />
        </span>

        {/* ---- Inside ---- */}
        <span className="face back" data-env-back>
          <span className="liner" />

          <span className="pol p1 tape" data-env-polaroid="1">
            <Polaroid photo={photos['envelope-1']} slotId="envelope-1" eager />
          </span>
          <span className="pol p2" data-env-polaroid="2">
            <Polaroid photo={photos['envelope-2']} slotId="envelope-2" eager />
          </span>

          <span className="ticket" data-env-ticket>
            <span className="stub">
              <span>{names}</span>
            </span>
            <span className="tmain">
              <span className="t1">{t.intro.saveTheDate}</span>
              <span className="t2">{shortDate}</span>
              <span className="t3">{t.intro.weAreGettingMarried}</span>
            </span>
          </span>

          <span className="pocket" />

          <span className="tuck tuck1" data-env-tuck="1">
            <Hydrangea />
          </span>
          <span className="tuck tuck2" data-env-tuck="2">
            <Calla rotate={-28} />
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
