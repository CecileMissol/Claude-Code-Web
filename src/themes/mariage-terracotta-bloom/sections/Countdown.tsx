'use client';

import { useEffect, useState } from 'react';
import type { InvitationContent } from '@/content/schema';
import { countdownParts, type CountdownParts } from '../animations/thresholds';
import { remainingMs } from '../animations/time';
import type { Messages } from '../messages';

/**
 * The countdown of the "date" chapter — four arched tiles of clay, sand and
 * sage.
 *
 * Anchored on the event's own time zone (`content.event.timezone`), not the
 * guest's: a guest in Los Angeles and a guest in Paris must see the same number
 * of days left. See `animations/time.ts`.
 *
 * The first render is deterministic (all zeros) so the server markup and the
 * first client markup agree; the real figures land on the first tick.
 */
export function Countdown({ content, t }: { content: InvitationContent; t: Messages }) {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(countdownParts(remainingMs(content)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [content]);

  const shown = parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const cells: [number, string][] = [
    [shown.days, t.countdown.days],
    [shown.hours, t.countdown.hours],
    [shown.minutes, t.countdown.minutes],
    [shown.seconds, t.countdown.seconds],
  ];

  return (
    <div className="tb-count" role="timer" aria-label={t.countdown.label}>
      {cells.map(([value, label]) => (
        <div key={label} className="tb-tile">
          <b>{value}</b>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

export default Countdown;
