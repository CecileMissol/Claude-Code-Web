'use client';

import type { InvitationContent } from '@/content/schema';
import { LemonBranch } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT, programRows } from '../animations/thresholds';
import { formatTime } from '../animations/format';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle } from './pieces';

/**
 * Chapter 3 — "The programme".
 *
 * A single trattoria menu under its striped awning, rather than a pile of torn
 * notes flying in from both sides. The board arrives first and the hours are
 * written onto it one after another, which is what keeps six items legible on a
 * 390 px screen: nothing overlaps, nothing shrinks, the eye reads down a list.
 *
 * `--rows` tells the stylesheet how tall the board has to be.
 */
export function Program({ t, content }: { t: Messages; content: InvitationContent }) {
  const items = content.program.items;
  const rows = programRows(items.length);
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
          <Piece
            at={PIECE_AT.program.board}
            className="shadow"
            style={pieceStyle(
              { left: '4%', top: '5%', width: '92%', '--rows': items.length } as React.CSSProperties,
              { from: 'translateY(-40vh) rotate(-4deg)', to: 'rotate(-1deg)' },
            )}
          >
            <div className="menu">
              <div className="awning" aria-hidden="true" />
              <p className="menu-kicker">{t.program.menuKicker}</p>
              <ul className="menu-list">
                {items.map((item, index) => {
                  const row = rows[index];
                  return (
                    <li
                      key={`${item.time}-${item.title}`}
                      className="it row"
                      data-at={row?.at ?? 1}
                      style={{ '--tilt': `${row?.tilt ?? 0}deg` } as React.CSSProperties}
                    >
                      {/* `dateTime` keeps the machine-readable value; the text
                          is written the way the invitation's language writes it. */}
                      <time dateTime={item.time}>{formatTime(item.time, content.locale)}</time>
                      <span className="what">
                        <strong>{item.title}</strong>
                        {item.detail && <em>{item.detail}</em>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Piece>

          <Piece
            at={PIECE_AT.program.lemon}
            style={pieceStyle(
              { right: '-6%', bottom: '-4%', width: '30%', transformOrigin: '70% 100%' },
              { from: 'scale(0.2) rotate(40deg)', to: 'rotate(8deg)' },
            )}
          >
            <LemonBranch />
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
