import { PHOTO_MIME } from './image';

/**
 * Browser side of the photo upload.
 *
 * Two hops, because the R2 binding has no presigned URLs: ask the application
 * for a signed ticket (`POST /api/photos/ticket`, which checks the session and
 * the ownership), then PUT the prepared WebP with that ticket
 * (`PUT /api/photos/upload`). The object key is chosen by the server and
 * returned here, never by the browser.
 */

export interface UploadTicketResponse {
  token: string;
  key: string;
  uploadPath: string;
  expiresAt: number;
  maxBytes: number;
  contentType: string;
}

export class PhotoUploadError extends Error {
  constructor(
    message: string,
    /** `errors.*` message key for the interface. */
    readonly code: 'photoFailed' | 'photoTooLarge' | 'forbidden',
  ) {
    super(message);
    this.name = 'PhotoUploadError';
  }
}

/** Requests a signed ticket for one photo of one invitation. */
export async function requestUploadTicket(invitationId: string): Promise<UploadTicketResponse> {
  const response = await fetch('/api/photos/ticket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ invitationId }),
  });

  if (response.status === 401 || response.status === 404) {
    throw new PhotoUploadError(`Ticket refused (${response.status})`, 'forbidden');
  }
  if (!response.ok) {
    throw new PhotoUploadError(`Ticket refused (${response.status})`, 'photoFailed');
  }

  return (await response.json()) as UploadTicketResponse;
}

/**
 * Sends one prepared WebP and returns its R2 key.
 * @throws {PhotoUploadError} on any refusal; the caller shows `error.code`.
 */
export async function uploadPhoto(invitationId: string, blob: Blob): Promise<string> {
  const ticket = await requestUploadTicket(invitationId);

  if (blob.size > ticket.maxBytes) {
    throw new PhotoUploadError('Photo above the allowed size', 'photoTooLarge');
  }

  const response = await fetch(`${ticket.uploadPath}?token=${encodeURIComponent(ticket.token)}`, {
    method: 'PUT',
    headers: { 'content-type': ticket.contentType || PHOTO_MIME },
    body: blob,
  });

  if (response.status === 413) {
    throw new PhotoUploadError('Photo too large', 'photoTooLarge');
  }
  if (!response.ok) {
    throw new PhotoUploadError(`Upload refused (${response.status})`, 'photoFailed');
  }

  return ticket.key;
}

/**
 * URL used by the editor to show a stored photo.
 *
 * Always the application route, never `R2_PUBLIC_BASE_URL`: the browser does
 * not know which public domain is configured, and the route works in every
 * environment.
 */
export function editorPhotoUrl(key: string): string {
  return `/api/photos/${key}`;
}
