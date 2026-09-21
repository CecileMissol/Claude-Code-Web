'use client';

import type { InfoItem } from '@/content/schema';
import type { Messages } from '../messages';

/** Slight tilts, so the labels never look printed by a machine. */
const TILT = [-1.5, 1.5, -1, 2, -2, 1] as const;

/**
 * "Good to know" — the practical labels.
 *
 * No scroll scene here: each label simply slides in when it reaches the
 * viewport. `data-observe` is picked up by `useInvitationMotion`, which uses a
 * one-shot ScrollTrigger (same job as the mock-up's IntersectionObserver, one
 * fewer observer to tear down between preview re-renders).
 */
export function Info({ t, items }: { t: Messages; items: readonly InfoItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="plain" aria-label={t.info.title}>
      <h2>{t.info.title}</h2>
      <div className="tags">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="tag"
            data-observe
            style={{ '--r': `${TILT[index % TILT.length]}deg` } as React.CSSProperties}
          >
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Info;
