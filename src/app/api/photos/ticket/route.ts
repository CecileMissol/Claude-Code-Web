import { getDb } from '@/db';
import { getInvitationForOwner } from '@/db/queries';
import { getSession } from '@/lib/auth';
import {
  MAX_PHOTO_BYTES,
  PHOTO_CONTENT_TYPE,
  UPLOAD_TICKET_TTL_SECONDS,
  createUploadTicket,
} from '@/lib/r2';

/**
 * `POST /api/photos/ticket` — mints a short-lived, HMAC-signed upload ticket.
 *
 * The R2 binding cannot produce S3 presigned URLs, so this is our equivalent:
 * the caller must be signed in **and** own the invitation, and the ticket it
 * receives is bound to one object key, one content type and one deadline
 * (`src/lib/r2.ts`). The upload route trusts nothing but that signature.
 *
 * Body: `{ "invitationId": "…" }`
 * 200 : `{ token, key, uploadPath, expiresAt, maxBytes, contentType }`
 */
export async function POST(request: Request): Promise<Response> {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let invitationId: unknown;
  try {
    const body = (await request.json()) as { invitationId?: unknown };
    invitationId = body.invitationId;
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (typeof invitationId !== 'string' || invitationId.length === 0) {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }

  const invitation = await getInvitationForOwner(getDb(), invitationId, sessionUser.id);
  if (!invitation) {
    // Same answer whether the invitation does not exist or belongs to someone
    // else: the endpoint must not confirm that an id is in use.
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

  const { token, payload } = await createUploadTicket({
    invitationId,
    ttlSeconds: UPLOAD_TICKET_TTL_SECONDS,
  });

  return Response.json({
    token,
    key: payload.key,
    uploadPath: '/api/photos/upload',
    expiresAt: payload.exp,
    maxBytes: MAX_PHOTO_BYTES,
    contentType: PHOTO_CONTENT_TYPE,
  });
}
