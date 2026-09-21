'use client';

import type { InvitationContent } from '@/content/schema';
import { Eucalyptus, Pampas, SunArch } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle } from './pieces';
import { Countdown } from './Countdown';

/**
 * Chapter 2 — "The day".
 *
 * The day lands inside a terracotta arch, the month on sand paper and the year
 * on a sage slip; a sun rises in the corner, the highlight word is wiped in and
 * the countdown closes the scene on four arched tiles.
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
      className="tb-chapter"
      data-chapter="date"
      style={{ '--len': `${CHAPTER_LENGTH.date}vh` } as React.CSSProperties}
      aria-label={t.chapters.date}
    >
      <div className="tb-sticky">
        <div className="tb-board">
          <Piece
            at={at.day}
            style={pieceStyle(
              { right: '1%', top: '-1%', width: '30%', transformOrigin: '70% 40%' },
              { from: 'scale(0) rotate(-40deg)', to: 'none' },
            )}
          >
            <SunArch />
          </Piece>

          <Piece
            at={at.day}
            className="tb-shadow"
            style={pieceStyle(
              { left: '3%', top: '5%', width: '40%' },
              { from: 'translateY(-90vh) rotate(-22deg)', to: 'rotate(-3deg)' },
            )}
          >
            <div className="tb-arch-card tb-d1">
              <b>{day}</b>
            </div>
          </Piece>

          <Piece
            at={at.month}
            className="tb-shadow"
            style={pieceStyle(
              { right: '8%', top: '25%', width: '36%' },
              { from: 'translate(70vw, 18vh) rotate(30deg)', to: 'rotate(3deg)' },
            )}
          >
            <div className="tb-slip tb-d2 tb-torn">
              <b>{month}</b>
            </div>
          </Piece>

          <Piece
            at={at.year}
            className="tb-shadow"
            style={pieceStyle(
              { left: '12%', top: '40%', width: '32%' },
              { from: 'translate(-40vw, 30vh) rotate(-28deg)', to: 'rotate(-2deg)' },
            )}
          >
            <div className="tb-slip tb-d3 tb-torn-b">
              <b>{year.slice(2)}</b>
            </div>
          </Piece>

          <Piece
            at={at.sprigLeft}
            style={pieceStyle(
              { left: '-7%', top: '30%', width: '13%', height: '44%' },
              { from: 'translateY(50vh) rotate(-50deg)', to: 'rotate(-12deg)' },
            )}
          >
            <Eucalyptus />
          </Piece>

          <Piece
            at={at.sprigRight}
            style={pieceStyle(
              { right: '-6%', top: '40%', width: '14%', height: '44%' },
              { from: 'translateY(50vh) rotate(50deg)', to: 'rotate(14deg)' },
            )}
          >
            <Pampas />
          </Piece>

          {content.dateChapter.highlight && (
            <Piece
              at={at.highlight}
              className="tb-reveal"
              style={pieceStyle(
                { left: '4%', top: '60%', width: '92%' },
                { from: 'none', to: 'none' },
              )}
            >
              <div className="tb-bigscript">{content.dateChapter.highlight}</div>
            </Piece>
          )}

          <Piece at={at.countdown} style={pieceStyle({ left: '5%', top: '78%', width: '90%' })}>
            <Countdown content={content} t={t} />
          </Piece>
        </div>

        <div className="tb-text">
          <h2 className="tb-ch-title">{t.chapters.date}</h2>
          <ChapterLines lines={lines} thresholds={thresholds} />
        </div>
      </div>
    </section>
  );
}

export default DateChapter;
