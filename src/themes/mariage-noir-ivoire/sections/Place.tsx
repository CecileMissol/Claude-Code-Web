'use client';

import type { InvitationContent } from '@/content/schema';
import { Amaranth, Hydrangea, Postmark, Stamp } from '../assets/illustrations';
import {
  CHAPTER_LENGTH,
  DIRECTIONS_AT,
  lineThresholds,
  PIECE_AT,
} from '../animations/thresholds';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle, PostcardImage, type ResolvedPhotos } from './pieces';

/**
 * Chapter 4 — "The venue".
 *
 * The postcard slides in, a big stamp is slapped on it, the postmark is wiped
 * across, flowers close the composition. The directions button belongs to the
 * text column, so it stays reachable by keyboard and tappable on mobile.
 */
export function Place({
  t,
  content,
  photos,
  directionsUrl,
  postmark,
}: {
  t: Messages;
  content: InvitationContent;
  photos: ResolvedPhotos;
  directionsUrl: string;
  postmark: string;
}) {
  const at = PIECE_AT.place;
  const thresholds = lineThresholds('place', content.place.lines.length);

  return (
    <section
      className="chapter"
      data-chapter="place"
      style={{ '--len': `${CHAPTER_LENGTH.place}vh` } as React.CSSProperties}
      aria-label={t.chapters.place}
    >
      <div className="sticky">
        <div className="board">
          <Piece
            at={at.postcard}
            style={pieceStyle(
              { left: '3%', top: '14%', width: '86%' },
              { from: 'translate(-20vw, 70vh) rotate(-24deg)', to: 'rotate(-3deg)' },
            )}
          >
            <div className="postcard">
              <PostcardImage photo={photos.venue} caption={content.venue.city} />
            </div>
          </Piece>

          <Piece
            at={at.stamp}
            style={pieceStyle(
              { right: '4%', top: '4%', width: '22%' },
              { from: 'scale(2.4) rotate(-20deg)', to: 'rotate(7deg)' },
            )}
          >
            <Stamp variant="calla" className="big-stamp" value="1,39" />
          </Piece>

          <Piece
            at={at.postmark}
            className="reveal inkmark"
            style={pieceStyle(
              { right: '14%', top: '12%', width: '34%' },
              { from: 'none', to: 'rotate(-8deg)' },
            )}
          >
            <Postmark date={postmark} />
          </Piece>

          <Piece
            at={at.bloom}
            style={pieceStyle(
              { right: '-5%', bottom: '10%', width: '36%', transformOrigin: '90% 90%' },
              { from: 'scale(0) rotate(-30deg)', to: 'none' },
            )}
          >
            <Hydrangea />
          </Piece>

          <Piece
            at={at.amaranth}
            style={pieceStyle(
              { left: '-1%', top: '-8%', width: '13%', height: '50%', transformOrigin: '50% 0%' },
              { from: 'translateY(-50vh) rotate(-34deg)', to: 'rotate(-13deg)' },
            )}
          >
            <Amaranth />
          </Piece>
        </div>

        <div className="text">
          <h2 className="ch-title">{t.chapters.place}</h2>
          <ChapterLines lines={content.place.lines} thresholds={thresholds} />
          <a
            className="it btn"
            data-at={DIRECTIONS_AT}
            style={pieceStyle({}, { from: 'translateY(10px)' })}
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.place.directions}
          </a>
        </div>
      </div>
    </section>
  );
}

export default Place;
