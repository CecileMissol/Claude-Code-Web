'use client';

import type { InvitationContent } from '@/content/schema';
import { Hydrangea } from '../assets/illustrations';
import {
  CHAPTER_LENGTH,
  lineThresholds,
  PIECE_AT,
  programLayout,
} from '../animations/thresholds';
import { formatTime } from '../animations/format';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle } from './pieces';

/** Papers the programme cards are torn from, cycling through the palette. */
const CARD_TONE = ['', 'dark', '', 'kraft', 'dark', ''] as const;

/**
 * Chapter 3 — "The programme".
 *
 * A pile of torn notes flying in alternately from the left and the right. The
 * layout is computed (`programLayout`), so one item or six both look composed:
 * the cards keep alternating, share the same vertical band and narrow as they
 * get more numerous.
 */
export function Program({ t, content }: { t: Messages; content: InvitationContent }) {
  const items = content.program.items;
  const layout = programLayout(items.length);
  const thresholds = lineThresholds('program', content.program.lines.length);

  return (
    <section
      className="chapter"
      data-chapter="program"
      style={{ '--len': `${CHAPTER_LENGTH.program}vh` } as React.CSSProperties}
      aria-label={t.chapters.program}
    >
      <div className="sticky">
        <div className="board">
          {items.map((item, index) => {
            const slot = layout[index];
            if (!slot) return null;
            const tone = CARD_TONE[index % CARD_TONE.length];
            const edge = slot.fromRight
              ? { right: `${index % 4 === 1 ? 2 : 3}%` }
              : { left: `${index % 4 === 0 ? 2 : 3}%` };

            return (
              <Piece
                key={`${item.time}-${item.title}`}
                at={slot.at}
                className="shadow"
                style={pieceStyle(
                  { ...edge, top: `${slot.top}%`, width: `${slot.width}%` },
                  {
                    from: `translate(${slot.fromRight ? '70vw' : '-70vw'}, ${
                      index > 1 ? '10vh' : '0'
                    }) rotate(${slot.fromRight ? 20 : -20}deg)`,
                    to: `rotate(${slot.rotate}deg)`,
                  },
                )}
              >
                <div className={`prog torn${tone ? ` ${tone}` : ''}`}>
                  {/* `dateTime` keeps the machine-readable value; the text is
                      written the way the invitation's language writes it. */}
                  <time dateTime={item.time}>{formatTime(item.time, content.locale)}</time>
                  <strong>{item.title}</strong>
                  {item.detail && <em>{item.detail}</em>}
                </div>
              </Piece>
            );
          })}

          <Piece
            at={PIECE_AT.program.bloom}
            style={pieceStyle(
              { left: '-6%', bottom: '-4%', width: '36%', transformOrigin: '10% 90%' },
              { from: 'scale(0) rotate(40deg)', to: 'none' },
            )}
          >
            <Hydrangea />
          </Piece>
        </div>

        <div className="text">
          <h2 className="ch-title">{t.chapters.program}</h2>
          <ChapterLines lines={content.program.lines} thresholds={thresholds} />
        </div>
      </div>
    </section>
  );
}

export default Program;
