'use client';

import type { InvitationContent } from '@/content/schema';
import { DriedBloom, Eucalyptus, Postmark, Stamp } from '../assets/illustrations';
import { CHAPTER_LENGTH, DIRECTIONS_AT, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle, PostcardImage, type ResolvedPhotos } from './pieces';

/**
 * Chapter 4 — "Where".
 *
 * A vintage souvenir card slides in — sepia photo, double-ruled sand border,
 * the venue name letterpressed underneath — then a big illustrated stamp is
 * slapped on, the sun postmark is wiped across, and the botanicals close the
 * composition. The directions button belongs to the text column, so it stays
 * reachable by keyboard and tappable on mobile.
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
      className="tb-chapter"
      data-chapter="place"
      style={{ '--len': `${CHAPTER_LENGTH.place}vh` } as React.CSSProperties}
      aria-label={t.chapters.place}
    >
      <div className="tb-sticky">
        <div className="tb-board">
          <Piece
            at={at.postcard}
            style={pieceStyle(
              { left: '3%', top: '16%', width: '86%' },
              { from: 'translate(-20vw, 70vh) rotate(-24deg)', to: 'rotate(-2.5deg)' },
            )}
          >
            <div className="tb-postcard">
              <PostcardImage photo={photos.venue} caption={content.venue.city} />
              <p className="tb-postcard-foot">{content.venue.name}</p>
            </div>
          </Piece>

          <Piece
            at={at.stamp}
            style={pieceStyle(
              { right: '4%', top: '2%', width: '22%' },
              { from: 'scale(2.4) rotate(-20deg)', to: 'rotate(6deg)' },
            )}
          >
            <Stamp variant="eucalyptus" className="tb-big-stamp" value="0,68" />
          </Piece>

          <Piece
            at={at.postmark}
            className="tb-reveal tb-inkmark"
            style={pieceStyle(
              { right: '13%', top: '9%', width: '34%' },
              { from: 'none', to: 'rotate(-8deg)' },
            )}
          >
            <Postmark date={postmark} />
          </Piece>

          <Piece
            at={at.bloom}
            style={pieceStyle(
              { right: '-6%', bottom: '6%', width: '38%', transformOrigin: '90% 90%' },
              { from: 'scale(0) rotate(-30deg)', to: 'none' },
            )}
          >
            <DriedBloom />
          </Piece>

          <Piece
            at={at.eucalyptus}
            style={pieceStyle(
              { left: '-3%', top: '-6%', width: '14%', height: '52%', transformOrigin: '50% 0%' },
              { from: 'translateY(-50vh) rotate(-34deg)', to: 'rotate(-11deg)' },
            )}
          >
            <Eucalyptus />
          </Piece>
        </div>

        <div className="tb-text">
          <h2 className="tb-ch-title">{t.chapters.place}</h2>
          <ChapterLines lines={content.place.lines} thresholds={thresholds} />
          <a
            className="tb-it tb-btn"
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
