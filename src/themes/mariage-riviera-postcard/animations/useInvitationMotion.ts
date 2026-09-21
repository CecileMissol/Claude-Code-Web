'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { InvitationMode } from '../../types';
import { buildIntroTimeline, resetIntro, type IntroElements } from './intro';
import { activeLineIndex, clamp01 } from './thresholds';

/**
 * All the motion of the "Riviera Postcard" invitation, in one effect.
 *
 * Why one hook: the editor re-renders `<Invitation mode="preview">` on every
 * keystroke, so every timeline, ScrollTrigger, listener and scroll lock must be
 * torn down deterministically. `gsap.context()` gives exactly that — one
 * `revert()` kills the tweens, restores the inline styles GSAP wrote and drops
 * the ScrollTriggers.
 *
 * GSAP is imported dynamically: it lives in its own async chunk instead of the
 * page's first-load JS.
 */

/** Custom event that replays the envelope. See `replayIntro()` in `index.ts`. */
export const REPLAY_EVENT = 'invitation:replay';

export interface MotionState {
  /** The envelope has been triggered (used to fade the kicker and the hint). */
  opened: boolean;
  /** The timeline reached its last beat: scrolling is free, the cue shows. */
  ready: boolean;
  /** `prefers-reduced-motion: reduce`, resolved on the client only. */
  reduced: boolean;
  open: () => void;
  replay: () => void;
}

export function useInvitationMotion(
  rootRef: React.RefObject<HTMLDivElement | null>,
  mode: InvitationMode,
): MotionState {
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Filled in once GSAP has loaded. Until then `open()` falls back to opening
  // instantly, so a guest is never trapped behind a sealed envelope because a
  // chunk failed to load.
  const controls = useRef<{ open?: () => void; replay?: () => void }>({});

  const setReadyNow = useCallback(() => {
    setOpened(true);
    setReady(true);
  }, []);

  const open = useCallback(() => {
    (controls.current.open ?? setReadyNow)();
  }, [setReadyNow]);

  const replay = useCallback(() => {
    controls.current.replay?.();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Reduced motion                                                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Scroll lock — only while the envelope is sealed                        */
  /* ---------------------------------------------------------------------- */

  const locking = mode !== 'preview' && !reduced && !ready;

  useEffect(() => {
    if (!locking || typeof document === 'undefined') return;

    const html = document.documentElement;
    const { body } = document;
    const previous = { html: html.style.overflow, body: body.style.overflow };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.classList.add('invitation-locked');

    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
      html.classList.remove('invitation-locked');
    };
  }, [locking]);

  /* ---------------------------------------------------------------------- */
  /* GSAP: intro timeline + chapter scroll triggers                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        /* ---------------- Intro ---------------- */

        const pick = (selector: string) => root.querySelector(selector);
        const els: IntroElements = {
          front: pick('[data-env-front]'),
          back: pick('[data-env-back]'),
          seal: pick('[data-env-seal]'),
          flap: pick('[data-env-flap]'),
          card: pick('[data-env-card]'),
          snap1: pick('[data-env-snap="1"]'),
          snap2: pick('[data-env-snap="2"]'),
          tuck1: pick('[data-env-tuck="1"]'),
          tuck2: pick('[data-env-tuck="2"]'),
        };

        const finish = () => {
          setOpened(true);
          setReady(true);
          // The document just got its full height back: recompute the triggers.
          requestAnimationFrame(() => ScrollTrigger.refresh());
        };

        resetIntro(gsap, els);
        const intro = buildIntroTimeline(gsap, els, finish);

        if (reduced) {
          // Straight to the opened state, no movement.
          intro.progress(1, true);
          setOpened(true);
          setReady(true);
        }

        controls.current.open = () => {
          if (intro.progress() > 0 || intro.isActive()) return;
          setOpened(true);
          intro.play(0);
        };

        controls.current.replay = () => {
          setOpened(false);
          setReady(false);
          intro.pause(0);
          resetIntro(gsap, els);
          if (reduced) {
            intro.progress(1, true);
            setOpened(true);
            setReady(true);
            return;
          }
          if (mode !== 'preview') window.scrollTo(0, 0);
          ScrollTrigger.refresh();
        };

        /* ---------------- Chapters ---------------- */

        const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));

        for (const chapter of chapters) {
          const pieces = Array.from(chapter.querySelectorAll<HTMLElement>('[data-at]'));
          const lines = Array.from(chapter.querySelectorAll<HTMLElement>('[data-line]'));
          const lineAts = lines.map((line) => Number(line.dataset.line ?? 0));

          const apply = (progress: number) => {
            const p = clamp01(progress);
            for (const piece of pieces) {
              piece.classList.toggle('on', p >= Number(piece.dataset.at ?? 0));
            }
            const current = activeLineIndex(p, lineAts);
            lines.forEach((line, index) => {
              line.classList.toggle('on', index === current);
              line.classList.toggle('past', index < current);
            });
          };

          if (reduced) {
            apply(1);
            continue;
          }

          // No `pin`: the scene is held by CSS `position: sticky`, which iOS
          // Safari handles natively — pinning would wrap the scene in a
          // transformed spacer and fight the address-bar resize. ScrollTrigger
          // is used purely as a scrubbed progress source (0 → 1 over the
          // chapter), which is what makes it immune to `innerHeight` jitter.
          ScrollTrigger.create({
            trigger: chapter,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(self.progress),
            onRefresh: (self) => apply(self.progress),
          });

          apply(0);
        }

        /* ---------------- Plain sections (tags) ---------------- */

        const tags = Array.from(root.querySelectorAll<HTMLElement>('[data-observe]'));
        for (const tag of tags) {
          if (reduced) {
            tag.classList.add('on');
            continue;
          }
          ScrollTrigger.create({
            trigger: tag,
            start: 'top 85%',
            once: true,
            onEnter: () => tag.classList.add('on'),
          });
        }
      }, root);

      dispose = () => context.revert();
    })();

    return () => {
      cancelled = true;
      dispose?.();
      controls.current = {};
    };
    // `reduced` and `mode` rebuild the whole motion graph, which is what we want.
  }, [rootRef, mode, reduced]);

  /* ---------------------------------------------------------------------- */
  /* External replay trigger                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handler = () => controls.current.replay?.();
    root.addEventListener(REPLAY_EVENT, handler);
    window.addEventListener(REPLAY_EVENT, handler);
    return () => {
      root.removeEventListener(REPLAY_EVENT, handler);
      window.removeEventListener(REPLAY_EVENT, handler);
    };
  }, [rootRef]);

  return { opened, ready, reduced, open, replay };
}
