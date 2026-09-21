'use client';

import type { InvitationContent } from '@/content/schema';
import { Calla, Hydrangea } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import type { Extras } from '../schema';
import { ChapterLines, Piece, pieceStyle, Polaroid, type ResolvedPhotos } from './pieces';

/**
 * Chapter 1 — "Our story".
 *
 * A sticky scene, 420 vh of scroll: taped polaroids, the torn train ticket, an
 * arum, the kraft note, a hydrangea; the sentences replace one another.
 * Positions and flight paths are the mock-up's, verbatim.
 */
export function Story({
  t,
  content,
  extras,
  photos,
}: {
  t: Messages;
  content: InvitationContent;
  extras: Extras;
  photos: ResolvedPhotos;
}) {
  const at = PIECE_AT.story;
  const thresholds = lineThresholds('story', content.story.lines.length);
  const [slot1 = 'story-1', slot2 = 'story-2'] = content.story.photoSlots;

  return (
    <section
      className="chapter"
      data-chapter="story"
      style={{ '--len': `${CHAPTER_LENGTH.story}vh` } as React.CSSProperties}
      aria-label={t.chapters.story}
    >
      <div className="sticky">
        <div className="board">
          <Piece
            at={at.photo1}
            className="pol tape"
            style={pieceStyle(
              { left: '4%', top: '4%', width: '42%' },
              { from: 'translate(-70vw, 10%) rotate(-40deg)', to: 'rotate(-6deg)' },
            )}
          >
            <Polaroid photo={photos[slot1]} slotId={slot1} />
          </Piece>

          {extras.memento && (
            <Piece
              at={at.memento}
              className="shadow"
              style={pieceStyle(
                { left: '30%', top: '47%', width: '62%' },
                { from: 'translate(80vw, 5%) rotate(25deg)', to: 'rotate(4deg)' },
              )}
            >
              <div className="ticket-train torn">
                <p className="route">{extras.memento.route}</p>
                <div>
                  <small>{t.story.mementoDate}</small>
                  <b>{extras.memento.date}</b>
                </div>
                <div>
                  <small>{extras.memento.lineA}</small>
                  <b>{extras.memento.lineB}</b>
                </div>
              </div>
            </Piece>
          )}

          <Piece
            at={at.photo2}
            className="pol"
            style={pieceStyle(
              { right: '3%', top: '2%', width: '40%' },
              { from: 'translate(50vw, -60vh) rotate(30deg)', to: 'rotate(7deg)' },
            )}
          >
            <Polaroid photo={photos[slot2]} slotId={slot2} />
          </Piece>

          <Piece
            at={at.calla}
            style={pieceStyle(
              { left: 0, top: '34%', width: '13%', height: '50%' },
              { from: 'translate(-40vw, 30vh) rotate(-80deg)', to: 'rotate(-18deg)' },
            )}
          >
            <Calla />
          </Piece>

          {extras.note && (
            <Piece
              at={at.note}
              className="shadow"
              style={pieceStyle(
                { left: '8%', top: '76%', width: '44%' },
                { from: 'translateY(40vh) rotate(-10deg)', to: 'rotate(-3deg)' },
              )}
            >
              <p className="note torn">{extras.note}</p>
            </Piece>
          )}

          <Piece
            at={at.bloom}
            style={pieceStyle(
              { right: '-4%', bottom: '-2%', width: '38%', transformOrigin: '80% 90%' },
              { from: 'scale(0) rotate(-40deg)', to: 'none' },
            )}
          >
            <Hydrangea />
          </Piece>
        </div>

        <div className="text">
          <h2 className="ch-title">{t.chapters.story}</h2>
          <ChapterLines lines={content.story.lines} thresholds={thresholds} />
        </div>
      </div>
    </section>
  );
}

export default Story;
