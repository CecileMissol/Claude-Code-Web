import type { gsap as GsapValue } from 'gsap';
import { INTRO } from './thresholds';

/**
 * The envelope-opening timeline.
 *
 * One GSAP timeline, paused, replayable: flip → the blue seal pops off → the
 * flap lifts → the "Save the date" postcard and the two snapshots slide out of
 * the pocket → lemon branch and bougainvillea tuck themselves into the
 * composition → scrolling is released.
 *
 * The beats are those validated in phase 3 (see `INTRO`). GSAP is used rather
 * than a chain of `setTimeout` because a timeline can be killed, scrubbed,
 * jumped to its end (reduced motion) and replayed — none of which a chain of
 * timers can do cleanly inside a React effect that may re-run on every keystroke
 * of the editor.
 *
 * `gsap` is passed in rather than imported, so the library stays in the async
 * chunk the client component loads and never lands in the page's first-load JS.
 */

export interface IntroElements {
  front: Element | null;
  back: Element | null;
  seal: Element | null;
  flap: Element | null;
  card: Element | null;
  snap1: Element | null;
  snap2: Element | null;
  tuck1: Element | null;
  tuck2: Element | null;
}

/** The GSAP instance. Type-only import: nothing is required at runtime. */
type Gsap = typeof GsapValue;
type Timeline = gsap.core.Timeline;
type TweenVars = gsap.TweenVars;

/** Puts every piece back in its "sealed envelope" position. */
export function resetIntro(gsap: Gsap, els: IntroElements): void {
  const set = (target: Element | null, vars: TweenVars) => {
    if (target) gsap.set(target, vars);
  };

  set(els.front, { scaleX: 1 });
  set(els.back, { scaleX: 0 });
  set(els.seal, { scale: 1, rotate: 0, opacity: 1 });
  set(els.flap, { rotateX: 0, zIndex: 6, transformPerspective: 900, transformOrigin: '50% 0%' });
  set(els.card, { yPercent: 0, rotate: 0 });
  set(els.snap1, { xPercent: 0, yPercent: 0, rotate: 0 });
  set(els.snap2, { xPercent: 0, yPercent: 0, rotate: 0 });
  set(els.tuck1, { scale: 0, rotate: -25, transformOrigin: '20% 90%' });
  set(els.tuck2, { scale: 0, rotate: -25, transformOrigin: '80% 80%' });
}

/**
 * Builds the paused opening timeline. `onReady` fires on the last beat, which
 * is where the scroll lock is lifted and the "scroll" cue fades in.
 */
export function buildIntroTimeline(gsap: Gsap, els: IntroElements, onReady: () => void): Timeline {
  const timeline = gsap.timeline({ paused: true });

  // The front face collapses horizontally, the back face grows back: the
  // envelope appears to turn over without a 3D flip (cheap and rock solid on
  // iOS Safari, where nested 3D contexts flicker).
  if (els.front) {
    timeline.to(els.front, { scaleX: 0, duration: 0.32, ease: 'power3.in' }, INTRO.flip);
  }
  if (els.back) {
    timeline.to(els.back, { scaleX: 1, duration: 0.32, ease: 'power2.out' }, INTRO.flip + 0.32);
  }

  // The blue postal seal pops off.
  if (els.seal) {
    timeline.to(
      els.seal,
      { scale: 1.5, rotate: 20, opacity: 0, duration: 0.35, ease: 'power2.out' },
      INTRO.crack,
    );
  }

  // The flap swings 180° over the top edge…
  if (els.flap) {
    timeline.to(els.flap, { rotateX: 180, duration: 0.75, ease: 'power2.inOut' }, INTRO.open);
    // …and then slips behind everything else, so the pieces can rise over it.
    timeline.set(els.flap, { zIndex: 1 }, INTRO.under);
  }

  // The postcard and the two snapshots come out of the pocket.
  if (els.card) {
    timeline.to(
      els.card,
      { yPercent: -54, rotate: -2.5, duration: 1.15, ease: 'expo.out' },
      INTRO.rise,
    );
  }
  if (els.snap1) {
    timeline.to(
      els.snap1,
      { xPercent: -8, yPercent: -112, rotate: -9, duration: 1.25, ease: 'expo.out' },
      INTRO.rise,
    );
  }
  if (els.snap2) {
    timeline.to(
      els.snap2,
      { xPercent: 8, yPercent: -124, rotate: 8, duration: 1.25, ease: 'expo.out' },
      INTRO.rise + 0.12,
    );
  }

  // Lemon branch and bougainvillea slide into the composition.
  if (els.tuck1) {
    timeline.to(
      els.tuck1,
      { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.3)' },
      INTRO.bloom,
    );
  }
  if (els.tuck2) {
    timeline.to(
      els.tuck2,
      { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.3)' },
      INTRO.bloom + 0.15,
    );
  }

  // Last beat: release the scroll and show the cue.
  timeline.call(onReady, undefined, INTRO.ready);
  // Keep the timeline alive until the last beat even if the tweens end sooner.
  timeline.set({}, {}, INTRO.ready + 0.01);

  return timeline;
}
