import { getDbAsync } from '@/db';
import { getInvitationBySlugAnyStatus } from '@/db/queries';
import { isPubliclyVisible, publicInvitationUrl } from '@/lib/publish';
import { clampQrSize, qrFileName, qrSvg } from '@/lib/qr';
import { isSlugAvailableShape } from '@/lib/slugs';

export const dynamic = 'force-dynamic';

/**
 * `GET /api/qr/[slug]` — QR code of a published invitation, as SVG.
 *
 * The PNG is not produced here: the share page draws this very SVG onto a
 * canvas in the browser, which keeps every image encoder out of the Worker.
 *
 * Query: `?size=512` (clamped) and `?download=1` to force a file download.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!isSlugAvailableShape(slug)) return new Response('Not found', { status: 404 });

  const db = await getDbAsync();
  const found = await getInvitationBySlugAnyStatus(db, slug);
  if (!found || !isPubliclyVisible(found.invitation)) {
    return new Response('Not found', { status: 404 });
  }

  const url = new URL(request.url);
  const size = clampQrSize(Number.parseInt(url.searchParams.get('size') ?? '', 10));
  const svg = await qrSvg(publicInvitationUrl(slug), { size });

  const headers: Record<string, string> = {
    'content-type': 'image/svg+xml; charset=utf-8',
    'cache-control': 'public, max-age=300',
    'x-robots-tag': 'noindex',
  };

  if (url.searchParams.get('download') !== null) {
    headers['content-disposition'] = `attachment; filename="${qrFileName(slug, 'svg')}"`;
  }

  return new Response(svg, { headers });
}
