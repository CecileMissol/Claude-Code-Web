'use client';

import { Postmark, Shell, Stamp, Vespa } from '../assets/illustrations';
import type { InvitationContent } from '@/content/schema';
import { CHAPTER_LENGTH, DIRECTIONS_AT, lineThresholds, PIECE_AT } from '../animations/thresholds';
import type { Messages } from '../messages';
import { ChapterLines, Piece, pieceStyle, PostcardImage, type ResolvedPhotos } from './pieces';

/**
 * Chapter 4 — "The venue".
 *
 * A real postcard: deckled white border, a striped band down its edge, the
 * "par avion" bar across the top, the city written in script over the photo and
 * the address typed on the back panel. A stamp is slapped on, the sun postmark
 * is wiped across it, a shell and a scooter finish the composition.
 *
 * The directions button belongs to the text column, so it stays reachable by
 * keyboard and tappable on mobile.
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
              { left: '2%', top: '16%', width: '88%' },
              { from: 'translate(-20vw, 70vh) rotate(-22deg)', to: 'rotate(-3deg)' },
            )}
          >
            <div className="postcard">
              <span className="pc-air" aria-hidden="true" />
              <PostcardImage photo={photos.venue} caption={content.venue.city} />
              <p className="pc-addr">
                <span>{content.venue.name}</span>
                <span>{content.venue.addressLine}</span>
                <span>
                  {content.venue.city}
                  {content.venue.country ? ` · ${content.venue.country}` : ''}
                </span>
              </p>
            </div>
          </Piece>

          <Piece
            at={at.stamp}
            style={pieceStyle(
              { right: '3%', top: '3%', width: '23%' },
              { from: 'scale(2.4) rotate(-20deg)', to: 'rotate(7deg)' },
            )}
          >
            <Stamp motif="parasol" className="big-stamp" value="2.10" country={t.intro.stampCountry} />
          </Piece>

          <Piece
            at={at.postmark}
            className="reveal inkmark"
            style={pieceStyle(
              { right: '13%', top: '10%', width: '36%' },
              { from: 'none', to: 'rotate(-8deg)' },
            )}
          >
            <Postmark date={postmark} />
          </Piece>

          <Piece
            at={at.shell}
            style={pieceStyle(
              { left: '-2%', bottom: '14%', width: '22%', transformOrigin: '20% 80%' },
              { from: 'scale(0) rotate(-40deg)', to: 'rotate(-12deg)' },
            )}
          >
            <Shell />
          </Piece>

          <Piece
            at={at.vespa}
            style={pieceStyle(
              { right: '-4%', bottom: '2%', width: '42%' },
              { from: 'translateX(70vw) rotate(6deg)', to: 'rotate(-2deg)' },
            )}
          >
            <Vespa />
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
