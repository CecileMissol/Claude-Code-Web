import { migrateContent } from '@/content/migrations';
import { getDbAsync } from '@/db';
import { getInvitationBySlugAnyStatus } from '@/db/queries';
import { invitationIcs } from '@/lib/ics';
import { isPubliclyVisible, publicInvitationUrl } from '@/lib/publish';
import { isSlugAvailableShape } from '@/lib/slugs';

export const dynamic = 'force-dynamic';

/**
 * `GET /api/ics/[slug]` — the calendar file a guest adds to their phone.
 *
 * Public, like the invitation itself, and only for a published one: an expired
 * or unpublished invitation must not keep handing out an event.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!isSlugAvailableShape(slug)) return new Response('Not found', { status: 404 });

  const db = await getDbAsync();
  const found = await getInvitationBySlugAnyStatus(db, slug);
  if (!found || !isPubliclyVisible(found.invitation)) {
    return new Response('Not found', { status: 404 });
  }

  const content = migrateContent(JSON.parse(found.invitation.content));
  const { filename, body } = invitationIcs(content, {
    slug,
    url: publicInvitationUrl(slug),
  });

  return new Response(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'public, max-age=300',
      'x-robots-tag': 'noindex',
    },
  });
}
