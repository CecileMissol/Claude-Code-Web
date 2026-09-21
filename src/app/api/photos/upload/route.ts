import { getDb } from '@/db';
import { getInvitationForOwner } from '@/db/queries';
import { getSession } from '@/lib/auth';
import { PHOTO_CONTENT_TYPE, putPhoto, verifyUploadTicket } from '@/lib/r2';

/**
 * `PUT /api/photos/upload?token=…` — stores one prepared photo in R2.
 *
 * The body is the WebP produced in the browser (`src/editor/image.ts`). Three
 * gates, in order: a valid, unexpired ticket; a session that still owns the
 * invitation the ticket was minted for; the declared type and size.
 *
 * 200 : `{ key }`
 */
export async function PUT(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return Response.json({ error: 'missing_token' }, { status: 400 });

  const ticket = await verifyUploadTicket(token);
  if (!ticket) return Response.json({ error: 'invalid_token' }, { status: 401 });

  const sessionUser = await getSession();
  if (!sessionUser) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const invitation = await getInvitationForOwner(getDb(), ticket.invitationId, sessionUser.id);
  if (!invitation) return Response.json({ error: 'not_found' }, { status: 404 });

  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim();
  if (contentType !== PHOTO_CONTENT_TYPE) {
    return Response.json({ error: 'unsupported_media_type' }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > ticket.maxBytes) {
    return Response.json({ error: 'too_large' }, { status: 413 });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) return Response.json({ error: 'empty' }, { status: 400 });
  if (body.byteLength > ticket.maxBytes) {
    return Response.json({ error: 'too_large' }, { status: 413 });
  }

  await putPhoto(ticket.key, body);

  return Response.json({ key: ticket.key });
}
