'use client';

import type { InvitationContent } from '@/content/schema';
import { Bougainvillea, Parasol } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import type { Extras } from '../schema';
import { ChapterLines, Piece, pieceStyle, Snapshot, type ResolvedPhotos } from './pieces';

/**
 * Chapter 1 — "Our story".
 *
 * A sticky scene, 400 vh of scroll. The composition is built around a striped
 * beach parasol planted in the bottom-left corner: the first snapshot leans in
 * from the left, the keepsake luggage tag drops in from above,
 * the second snapshot lands bottom-right, the note is a scribbled café napkin
 * and a bougainvillea spray closes the top-left corner.
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
            className="snap tape"
            style={pieceStyle(
              { left: '3%', top: '5%', width: '50%' },
              { from: 'translate(-70vw, 8%) rotate(-32deg)', to: 'rotate(-5deg)' },
            )}
          >
            <Snapshot photo={photos[slot1]} slotId={slot1} />
          </Piece>

          {extras.memento && (
            <Piece
              at={at.memento}
              className="shadow"
              style={pieceStyle(
                { right: '1%', top: '24%', width: '48%' },
                { from: 'translate(30vw, -70vh) rotate(24deg)', to: 'rotate(4deg)' },
              )}
            >
              <div className="luggage">
                <span className="eyelet" aria-hidden="true" />
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
            className="snap"
            style={pieceStyle(
              { right: '3%', bottom: '3%', width: '44%' },
              { from: 'translate(60vw, 30vh) rotate(28deg)', to: 'rotate(6deg)' },
            )}
          >
            <Snapshot photo={photos[slot2]} slotId={slot2} />
          </Piece>

          <Piece
            at={at.parasol}
            style={pieceStyle(
              { left: '1%', bottom: '1%', width: '42%', transformOrigin: '50% 100%' },
              { from: 'translateY(60vh) rotate(-38deg)', to: 'rotate(-6deg)' },
            )}
          >
            <Parasol />
          </Piece>

          {extras.note && (
            <Piece
              at={at.note}
              className="shadow"
              style={pieceStyle(
                { left: '8%', top: '48%', width: '46%' },
                { from: 'translateY(40vh) rotate(-12deg)', to: 'rotate(-3deg)' },
              )}
            >
              <p className="note torn">{extras.note}</p>
            </Piece>
          )}

          <Piece
            at={at.bougainvillea}
            style={pieceStyle(
              { left: '-10%', top: '-8%', width: '42%', transformOrigin: '20% 15%' },
              { from: 'scale(0) rotate(-45deg)', to: 'none' },
            )}
          >
            <Bougainvillea />
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
