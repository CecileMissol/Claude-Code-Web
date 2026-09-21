import { getLocale } from 'next-intl/server';
import { getDbAsync } from '@/db';
import { getInvitationForOwner, listRsvpsForOwner } from '@/db/queries';
import { getSession } from '@/lib/auth';
import { toCsv } from '@/lib/csv';
import { isLocale, type Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

/**
 * `GET /api/rsvps/[id]/export.csv` — the replies, as a spreadsheet.
 *
 * Owner-only: the session is resolved first, then the invitation is loaded with
 * that owner id in the WHERE clause, so an id guessed from someone else's
 * dashboard returns 404 rather than data.
 */

const HEADERS: Record<Locale, readonly string[]> = {
  fr: ['Nom', 'Réponse', 'Personnes', 'E-mail', 'Régime alimentaire', 'Message', 'Reçue le'],
  en: ['Name', 'Reply', 'People', 'Email', 'Dietary requirements', 'Message', 'Received on'],
};

const ATTENDING: Record<Locale, { yes: string; no: string }> = {
  fr: { yes: 'Oui', no: 'Non' },
  en: { yes: 'Yes', no: 'No' },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const user = await getSession();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const db = await getDbAsync();
  const invitation = await getInvitationForOwner(db, id, user.id);
  if (!invitation) return new Response('Not found', { status: 404 });

  const requested = new URL(request.url).searchParams.get('locale');
  const locale: Locale = isLocale(requested) ? requested : ((await getLocale()) as Locale);

  const replies = await listRsvpsForOwner(db, id, user.id);
  const words = ATTENDING[locale];

  const body = toCsv(
    HEADERS[locale],
    replies.map((reply) => [
      reply.name,
      reply.attending ? words.yes : words.no,
      reply.attending ? reply.guests : 0,
      reply.email ?? '',
      reply.diet ?? '',
      reply.message ?? '',
      reply.createdAt.toISOString().slice(0, 16).replace('T', ' '),
    ]),
    locale,
  );

  const filename = `${invitation.slug ?? invitation.id}-rsvp.csv`;

  return new Response(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });
}
