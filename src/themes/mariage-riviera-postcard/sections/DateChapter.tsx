'use client';

import { shortDateParts } from '@/content/derived';
import type { InvitationContent } from '@/content/schema';
import { Cypress, Waves } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle } from './pieces';
import { Countdown } from './Countdown';

/**
 * Chapter 2 — "The date".
 *
 * The day, the month and the year are glazed onto three **azulejo tiles**, set
 * side by side like a course of ceramic on a Mediterranean wall — not scattered
 * on torn papers. Two cypresses stand guard, the highlight is painted across
 * the wall, a line of waves runs under it and the countdown closes the scene.
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
  // A sentence may carry `{date}`, replaced by the localised long date.
  const lines = content.dateChapter.lines.map((line) => line.replace('{date}', longDate));

  // The three azulejos are read left to right, so their order follows the
  // locale: day-month-year in French, month-day-year in English
  // (`shortDateParts`). Each tile keeps the caption that matches its number,
  // and the arrival thresholds stay attached to the *position* — the leftmost
  // tile still lands first.
  const [first, second, yy] = shortDateParts(content);
  const order: [key: string, value: string, label: string][] =
    content.locale === 'en'
      ? [
          ['month', first, t.date.month],
          ['day', second, t.date.day],
          ['year', yy, t.date.year],
        ]
      : [
          ['day', first, t.date.day],
          ['month', second, t.date.month],
          ['year', yy, t.date.year],
        ];
  const arrivals = [at.day, at.month, at.year];
  const tiles: [key: string, value: string, label: string, at: number][] = order.map(
    ([key, value, label], index) => [key, value, label, arrivals[index] ?? at.year],
  );

  return (
    <section
      className="chapter"
      data-chapter="date"
      style={{ '--len': `${CHAPTER_LENGTH.date}vh` } as React.CSSProperties}
      aria-label={t.chapters.date}
    >
      <div className="sticky">
        <div className="board">
          {tiles.map(([key, value, label, tileAt], index) => (
            <Piece
              key={key}
              at={tileAt}
              className="shadow"
              style={pieceStyle(
                { left: `${2 + index * 33}%`, top: '10%', width: '31%' },
                {
                  from: `translate(${index === 1 ? '0' : index === 0 ? '-60vw' : '60vw'}, -60vh) rotate(${index === 1 ? 0 : index === 0 ? -30 : 30}deg)`,
                  to: `rotate(${[-2, 1.2, -1.4][index] ?? 0}deg)`,
                },
              )}
            >
              <div className={`azulejo az-${key}`}>
                <b>{value}</b>
                <small>{label}</small>
              </div>
            </Piece>
          ))}

          <Piece
            at={at.cypressLeft}
            style={pieceStyle(
              { left: '-7%', top: '30%', width: '22%', height: '40%' },
              { from: 'translateY(50vh) rotate(-24deg)', to: 'rotate(-4deg)' },
            )}
          >
            <Cypress />
          </Piece>

          <Piece
            at={at.cypressRight}
            style={pieceStyle(
              { right: '-7%', top: '33%', width: '21%', height: '38%' },
              { from: 'translateY(50vh) rotate(24deg)', to: 'rotate(5deg)' },
            )}
          >
            <Cypress />
          </Piece>

          {content.dateChapter.highlight && (
            <Piece
              at={at.highlight}
              className="reveal"
              style={pieceStyle(
                { left: '5%', top: '44%', width: '90%' },
                { from: 'none', to: 'none' },
              )}
            >
              <div className="bigscript">{content.dateChapter.highlight}</div>
            </Piece>
          )}

          <Piece
            at={at.waves}
            className="sea"
            style={pieceStyle(
              { left: '22%', top: '58%', width: '56%' },
              { from: 'translateY(6vh)', to: 'none' },
            )}
          >
            <Waves />
          </Piece>

          <Piece at={at.countdown} style={pieceStyle({ left: '5%', top: '74%', width: '90%' })}>
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
