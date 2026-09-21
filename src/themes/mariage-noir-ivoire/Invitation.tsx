import type { InvitationProps } from '../types';
import { paletteStyle, resolvePalette, resolveScript } from '../types';
import { directionsUrl, initials, longDate, postmarkDate, shortDate } from '@/content/derived';
import type { InvitationContent } from '@/content/schema';
import { publicPhotoUrl } from '@/lib/r2';
import { manifest } from './manifest';
import { parseExtras } from './schema';
import InvitationClient from './InvitationClient';
import type { ResolvedPhotos } from './sections/pieces';
import './fonts';
import './styles.css';

/**
 * "Noir & ivoire" — server half of the theme.
 *
 * It does the three things that must not happen in the browser:
 *
 *  1. turns each photo's R2 key into a public URL (`publicPhotoUrl` reads the
 *     runtime environment, which only exists on the server),
 *  2. resolves the palette and the script face declared by the manifest into
 *     the seven CSS custom properties the stylesheet consumes,
 *  3. derives the dates and the initials once, so the server markup and the
 *     first client render are byte-identical, and validates `content.extras`
 *     with Zod — which is precisely why Zod stays out of the browser bundle.
 *
 * The animated tree itself lives in `InvitationClient.tsx`.
 */
export default function Invitation({ content, mode, slug }: InvitationProps) {
  const palette = resolvePalette(manifest, content.style.paletteId);
  const script = resolveScript(manifest, content.style.scriptId);

  return (
    <InvitationClient
      content={content}
      mode={mode}
      slug={slug}
      photos={resolvePhotos(content)}
      extras={parseExtras(content.extras)}
      paletteVars={paletteStyle(palette, script)}
      paletteId={palette.id}
      derived={{
        names: `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`,
        initials: initials(content),
        shortDate: shortDate(content),
        longDate: longDate(content),
        postmark: postmarkDate(content),
        directionsUrl: directionsUrl(content),
      }}
    />
  );
}

/**
 * Maps every filled photo slot to its public URL.
 *
 * Photos are stored at a single size — the browser resizes and converts them to
 * WebP before upload (phase 2, §5.4) — so there is no `srcset` to build; the
 * stored `width`/`height` reserve the box and prevent layout shift. An empty
 * slot is simply absent, and the theme draws an engraved placeholder instead of
 * a broken image.
 *
 * `publicPhotoUrl` throws when the environment is incomplete; the demo and the
 * editor preview must survive that, so a failure degrades to "no photo".
 */
function resolvePhotos(content: InvitationContent): ResolvedPhotos {
  const resolved: ResolvedPhotos = {};

  for (const [slotId, photo] of Object.entries(content.photos)) {
    if (!photo?.key) continue;
    try {
      resolved[slotId] = {
        url: publicPhotoUrl(photo.key),
        alt: photo.alt,
        caption: photo.caption,
        width: photo.width,
        height: photo.height,
      };
    } catch {
      // Missing R2_PUBLIC_BASE_URL: fall back to the placeholder.
    }
  }

  return resolved;
}
