import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getEnv } from './env';

/**
 * Photo storage on Cloudflare R2.
 *
 * The R2 *binding* does not expose S3 presigned URLs, so uploads go through our
 * own short-lived signed token: `createUploadTicket()` mints an HMAC-signed
 * token, the browser PUTs the file to `/api/photos/upload?token=…`, and the
 * route handler verifies the token before writing to the bucket. No AWS
 * signature library, no extra dependency.
 *
 * Photos are resized and converted to WebP in the browser before upload, so the
 * Worker never processes images.
 */

export const PHOTO_CONTENT_TYPE = 'image/webp';

/** Maximum accepted upload size: 5 MB. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Default lifetime of an upload ticket: 10 minutes. */
export const UPLOAD_TICKET_TTL_SECONDS = 600;

/** `invitations/{invitationId}/photos/{uuid}.webp` */
export function photoKey(invitationId: string, uuid: string = crypto.randomUUID()): string {
  return `invitations/${invitationId}/photos/${uuid}.webp`;
}

/** True when a key is a well-formed photo key for that invitation. */
export function isPhotoKeyOf(key: string, invitationId: string): boolean {
  return new RegExp(
    `^invitations/${invitationId.replace(/[^a-zA-Z0-9-]/g, '')}/photos/[a-f0-9-]{36}\\.webp$`,
  ).test(key);
}

/** Public read URL of a stored photo. */
export function publicPhotoUrl(key: string): string {
  const base = getEnv().R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
  return `${base}/${key}`;
}

/** The R2 bucket bound as `PHOTOS`. */
export function getPhotosBucket(): R2Bucket {
  const { env } = getCloudflareContext();
  if (!env.PHOTOS) {
    throw new Error('Missing R2 binding "PHOTOS". Check wrangler.jsonc.');
  }
  return env.PHOTOS;
}

/* -------------------------------------------------------------------------- */
/* Signed upload tickets                                                      */
/* -------------------------------------------------------------------------- */

export interface UploadTicketPayload {
  key: string;
  invitationId: string;
  contentType: string;
  maxBytes: number;
  /** Unix seconds. */
  exp: number;
}

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Mints a signed, time-limited upload ticket. */
export async function createUploadTicket(
  input: { invitationId: string; key?: string; ttlSeconds?: number },
  secret: string = getEnv().BETTER_AUTH_SECRET,
): Promise<{ token: string; payload: UploadTicketPayload }> {
  const payload: UploadTicketPayload = {
    key: input.key ?? photoKey(input.invitationId),
    invitationId: input.invitationId,
    contentType: PHOTO_CONTENT_TYPE,
    maxBytes: MAX_PHOTO_BYTES,
    exp: Math.floor(Date.now() / 1000) + (input.ttlSeconds ?? UPLOAD_TICKET_TTL_SECONDS),
  };

  const body = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret),
    new TextEncoder().encode(body),
  );

  return { token: `${body}.${base64url(new Uint8Array(signature))}`, payload };
}

/** Full upload URL handed to the browser. */
export async function createSignedUploadUrl(
  input: { invitationId: string; key?: string; ttlSeconds?: number },
  secret?: string,
): Promise<{ url: string; key: string; expiresAt: number }> {
  const { token, payload } = await createUploadTicket(input, secret);
  const base = getEnv().APP_URL.replace(/\/+$/, '');
  return {
    url: `${base}/api/photos/upload?token=${encodeURIComponent(token)}`,
    key: payload.key,
    expiresAt: payload.exp,
  };
}

/** Verifies a ticket. Returns `null` when the signature or the deadline fails. */
export async function verifyUploadTicket(
  token: string,
  secret: string = getEnv().BETTER_AUTH_SECRET,
  now: number = Math.floor(Date.now() / 1000),
): Promise<UploadTicketPayload | null> {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const valid = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(secret),
    fromBase64url(signature),
    new TextEncoder().encode(body),
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64url(body)),
    ) as UploadTicketPayload;
    if (typeof payload.exp !== 'number' || payload.exp < now) return null;
    if (!isPhotoKeyOf(payload.key, payload.invitationId)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Writes an object to the bucket. */
export async function putPhoto(key: string, body: ReadableStream | ArrayBuffer): Promise<void> {
  await getPhotosBucket().put(key, body, {
    httpMetadata: {
      contentType: PHOTO_CONTENT_TYPE,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });
}

/** Deletes every photo of an invitation (used when a couple deletes it). */
export async function deleteInvitationPhotos(invitationId: string): Promise<number> {
  const bucket = getPhotosBucket();
  const prefix = `invitations/${invitationId}/photos/`;
  let deleted = 0;
  let cursor: string | undefined;

  do {
    const listing = await bucket.list({ prefix, cursor });
    const keys = listing.objects.map((object) => object.key);
    if (keys.length > 0) {
      await bucket.delete(keys);
      deleted += keys.length;
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);

  return deleted;
}
