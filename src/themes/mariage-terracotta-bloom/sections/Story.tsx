'use client';

import type { InvitationContent } from '@/content/schema';
import { DriedBloom, Eucalyptus, Pampas } from '../assets/illustrations';
import { CHAPTER_LENGTH, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import type { Extras } from '../schema';
import { ChapterLines, Frame, Piece, pieceStyle, type ResolvedPhotos } from './pieces';

/**
 * Chapter 1 — "How it started".
 *
 * A sticky scene, 420 vh of scroll. The composition is this theme's own: the
 * first photo is an *arch* pinned top right, the keepsake is a bar card tilted
 * across the left, the second photo is a rounded snap on sand paper, and a
 * washi-taped kraft note closes the pile. Eucalyptus climbs the left edge,
 * dried blooms fill the bottom right.
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
      className="tb-chapter"
      data-chapter="story"
      style={{ '--len': `${CHAPTER_LENGTH.story}vh` } as React.CSSProperties}
      aria-label={t.chapters.story}
    >
      <div className="tb-sticky">
        <div className="tb-board">
          <Piece
            at={at.photo1}
            className="tb-arch-photo"
            style={pieceStyle(
              { right: '2%', top: '1%', width: '50%' },
              { from: 'translate(64vw, -22vh) rotate(24deg)', to: 'rotate(2.5deg)' },
            )}
          >
            <Frame photo={photos[slot1]} slotId={slot1} shape="arch" />
          </Piece>

          <Piece
            at={at.sprig}
            style={pieceStyle(
              { left: '-5%', top: '-2%', width: '15%', height: '48%', transformOrigin: '50% 0%' },
              { from: 'translate(-40vw, -20vh) rotate(-62deg)', to: 'rotate(-9deg)' },
            )}
          >
            <Eucalyptus />
          </Piece>

          {extras.memento && (
            <Piece
              at={at.memento}
              className="tb-shadow"
              style={pieceStyle(
                { left: '2%', top: '31%', width: '60%' },
                { from: 'translate(-74vw, 8vh) rotate(-26deg)', to: 'rotate(-5deg)' },
              )}
            >
              {/* The keepsake: a bar/table card rather than a torn train ticket. */}
              <div className="tb-barcard">
                <span className="tb-barcard-rule" aria-hidden="true" />
                <p className="tb-barcard-title">{extras.memento.route}</p>
                <div className="tb-barcard-grid">
                  <div>
                    <small>{t.story.mementoDate}</small>
                    <b>{extras.memento.date}</b>
                  </div>
                  <div>
                    <small>{extras.memento.lineA}</small>
                    <b>{extras.memento.lineB}</b>
                  </div>
                </div>
              </div>
            </Piece>
          )}

          <Piece
            at={at.photo2}
            className="tb-snap tb-tape"
            style={pieceStyle(
              { right: '5%', top: '45%', width: '45%' },
              { from: 'translate(46vw, 54vh) rotate(26deg)', to: 'rotate(5deg)' },
            )}
          >
            <Frame photo={photos[slot2]} slotId={slot2} />
          </Piece>

          {extras.note && (
            <Piece
              at={at.note}
              className="tb-shadow tb-tape"
              style={pieceStyle(
                { left: '3%', top: '73%', width: '48%' },
                { from: 'translateY(44vh) rotate(-14deg)', to: 'rotate(-3.5deg)' },
              )}
            >
              <p className="tb-note tb-torn">{extras.note}</p>
            </Piece>
          )}

          <Piece
            at={at.bloom}
            style={pieceStyle(
              { right: '-7%', bottom: '-3%', width: '40%', transformOrigin: '85% 90%' },
              { from: 'scale(0) rotate(-34deg)', to: 'none' },
            )}
          >
            <DriedBloom />
          </Piece>

          <Piece
            at={at.bloom}
            style={pieceStyle(
              { left: '52%', bottom: '-6%', width: '16%', height: '40%' },
              { from: 'translateY(40vh) rotate(24deg)', to: 'rotate(9deg)' },
            )}
          >
            <Pampas />
          </Piece>
        </div>

        <div className="tb-text">
          <h2 className="tb-ch-title">{t.chapters.story}</h2>
          <ChapterLines lines={content.story.lines} thresholds={thresholds} />
        </div>
      </div>
    </section>
  );
}

export default Story;
