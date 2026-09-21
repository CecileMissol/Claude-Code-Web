'use client';

import type { InvitationContent } from '@/content/schema';
import { Calla } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle } from './pieces';
import { Countdown } from './Countdown';

/**
 * Chapter 2 — "The date".
 *
 * Day, month and year land on three different papers, two arums frame the
 * scene, the highlight word is wiped in, and the countdown appears last.
 */
export function DateChapter({
  t,
  content,
  longDate,
}: {
  t: Messages;
  content: InvitationContent;
  longDate: string;
}) {
  const at = PIECE_AT.date;
  const thresholds = lineThresholds('date', content.dateChapter.lines.length);
  const [year = '', month = '', day = ''] = content.event.date.split('-');

  // A sentence may carry `{date}`, replaced by the localised long date.
  const lines = content.dateChapter.lines.map((line) => line.replace('{date}', longDate));

  return (
    <section
      className="chapter"
      data-chapter="date"
      style={{ '--len': `${CHAPTER_LENGTH.date}vh` } as React.CSSProperties}
      aria-label={t.chapters.date}
    >
      <div className="sticky">
        <div className="board">
          <Piece
            at={at.day}
            className="shadow"
            style={pieceStyle(
              { left: '3%', top: '6%', width: '36%' },
              { from: 'translateY(-90vh) rotate(-30deg)', to: 'rotate(-5deg)' },
            )}
          >
            <div className="scrap d1 torn">
              <b>{day}</b>
            </div>
          </Piece>

          <Piece
            at={at.month}
            className="shadow"
            style={pieceStyle(
              { left: '33%', top: '20%', width: '34%' },
              { from: 'translate(70vw, 20vh) rotate(35deg)', to: 'rotate(3deg)' },
            )}
          >
            <div className="scrap d2 torn">
              <b>{month}</b>
            </div>
          </Piece>

          <Piece
            at={at.year}
            className="shadow"
            style={pieceStyle(
              { left: '62%', top: '4%', width: '35%' },
              { from: 'translate(40vw, -80vh) rotate(-25deg)', to: 'rotate(-2deg)' },
            )}
          >
            <div className="scrap d3 torn">
              <b>{year.slice(2)}</b>
            </div>
          </Piece>

          <Piece
            at={at.callaLeft}
            style={pieceStyle(
              { left: '-2%', top: '40%', width: '11%', height: '46%' },
              { from: 'translateY(50vh) rotate(-50deg)', to: 'rotate(-14deg)' },
            )}
          >
            <Calla />
          </Piece>

          <Piece
            at={at.callaRight}
            style={pieceStyle(
              { right: '-1%', top: '44%', width: '11%', height: '44%' },
              { from: 'translateY(50vh) rotate(50deg)', to: 'rotate(16deg)' },
            )}
          >
            <Calla />
          </Piece>

          {content.dateChapter.highlight && (
            <Piece
              at={at.highlight}
              className="reveal"
              style={pieceStyle(
                { left: '5%', top: '55%', width: '90%' },
                { from: 'none', to: 'none' },
              )}
            >
              <div className="bigscript">{content.dateChapter.highlight}</div>
            </Piece>
          )}

          <Piece at={at.countdown} style={pieceStyle({ left: '6%', top: '78%', width: '88%' })}>
            <Countdown content={content} t={t} />
          </Piece>
        </div>

        <div className="text">
          <h2 className="ch-title">{t.chapters.date}</h2>
          <ChapterLines lines={lines} thresholds={thresholds} />
        </div>
      </div>
    </section>
  );
}

export default DateChapter;
