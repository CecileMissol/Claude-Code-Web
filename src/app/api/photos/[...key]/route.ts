import { getPhotosBucket } from '@/lib/r2';

/**
 * `GET /api/photos/<object key>` — public read of a stored photo.
 *
 * This is the default target of `R2_PUBLIC_BASE_URL`, so the product works
 * before an R2 public domain is attached; point that variable at a real R2
 * domain in production and this route simply stops being used by the renderer
 * (the editor keeps using it for its thumbnails, since it never knows which
 * domain is configured).
 *
 * Keys are unguessable UUIDs under `invitations/{id}/photos/`, and a published
 * invitation is public anyway, so no session is required. Cached forever:
 * an object is written once and never overwritten.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  const { key } = await params;
  const objectKey = key.map((segment) => decodeURIComponent(segment)).join('/');

  if (!/^invitations\/[A-Za-z0-9-]+\/photos\/[a-f0-9-]{36}\.webp$/.test(objectKey)) {
    return new Response('Not found', { status: 404 });
  }

  const object = await getPhotosBucket().get(objectKey);
  if (!object) return new Response('Not found', { status: 404 });

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType ?? 'image/webp',
      'cache-control': 'public, max-age=31536000, immutable',
      etag: object.httpEtag,
    },
  });
}
