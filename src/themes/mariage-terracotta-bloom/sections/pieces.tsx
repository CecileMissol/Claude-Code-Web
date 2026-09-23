import type { CSSProperties, ReactNode } from 'react';
import { PhotoPlaceholder, PostcardPlaceholder, placeholderVariant } from '../assets/illustrations';

/**
 * Small building blocks shared by the chapters: the two photo frames (the
 * rounded "snap" on sand paper and the arch), the postcard image, and the
 * generic "piece of the collage" wrapper.
 */

/** A photo of `content.photos`, with its public R2 URL already resolved. */
export interface ResolvedPhoto {
  url: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export type ResolvedPhotos = Record<string, ResolvedPhoto | undefined>;

/**
 * CSS custom properties driving a piece's flight path.
 * `--from` is where it comes in from, `--to` where it settles.
 */
export interface PieceMotion {
  from?: string;
  to?: string;
}

export function pieceStyle(position: CSSProperties, motion: PieceMotion = {}): CSSProperties {
  return {
    ...position,
    ...(motion.from ? { '--from': motion.from } : {}),
    ...(motion.to ? { '--to': motion.to } : {}),
  } as CSSProperties;
}

/**
 * One element of the collage. It is hidden until the chapter's scroll progress
 * passes `at`, at which point `useInvitationMotion` adds `.on` and the CSS
 * transition flies it in from `--from` to `--to`.
 */
export function Piece({
  at,
  className,
  style,
  children,
}: {
  at: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`tb-it${className ? ` ${className}` : ''}`} data-at={at} style={style}>
      {children}
    </div>
  );
}

/** The two photo shapes of the theme. */
export type FrameShape = 'snap' | 'arch';

/**
 * A framed photo: either a rounded-corner "snap" mounted on sand paper, or an
 * arch — the shape that carries the whole theme, from the envelope card to the
 * desert doorway of the venue chapter.
 *
 * Renders the uploaded photo when the slot is filled, and a warm SVG scene when
 * it is not — never a broken image.
 *
 * Photos are resized and converted to WebP in the browser before upload and
 * stored at a single size (phase 2, §5.4: one key per slot,
 * `invitations/{id}/photos/{uuid}.webp`), so there is no `srcset` to build:
 * `width`/`height` come from the content and reserve the space.
 */
export function Frame({
  photo,
  slotId,
  shape = 'snap',
  caption,
  eager = false,
}: {
  photo?: ResolvedPhoto;
  slotId: string;
  shape?: FrameShape;
  caption?: string;
  eager?: boolean;
}) {
  const label = photo?.caption ?? caption;
  return (
    <>
      <span className={`tb-photo-wrap tb-photo-${shape}`}>
        {photo ? (
          // Served straight from R2 at its stored size; the next/image
          // optimizer does not exist on Workers (`images.unoptimized`).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="tb-photo"
            src={photo.url}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <PhotoPlaceholder className="tb-photo" variant={placeholderVariant(slotId)} />
        )}
      </span>
      {label ? <span className="tb-cap">{label}</span> : null}
    </>
  );
}

/** The venue photo inside the vintage card frame. */
export function PostcardImage({ photo, caption }: { photo?: ResolvedPhoto; caption: string }) {
  return (
    <div className="tb-img">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <PostcardPlaceholder />
      )}
      <span>{caption}</span>
    </div>
  );
}

/**
 * The stack of sentences of a chapter. Only one is visible at a time; the ones
 * already read drift up and blur out.
 */
export function ChapterLines({
  lines,
  thresholds,
}: {
  lines: readonly string[];
  thresholds: readonly number[];
}) {
  return (
    <div className="tb-lines">
      {lines.map((line, index) => (
        <p
          key={`${index}-${line.slice(0, 16)}`}
          className="tb-line"
          data-line={thresholds[index] ?? 1}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
