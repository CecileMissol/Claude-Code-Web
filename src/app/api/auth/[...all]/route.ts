import { toNextJsHandler } from 'better-auth/next-js';
import { getAuth } from '@/lib/auth';

/**
 * Better Auth endpoints (`/api/auth/*`): magic-link request, verification,
 * session read, sign-out. The instance is built per request because it needs
 * the D1 binding from the Cloudflare context.
 */

export async function GET(request: Request): Promise<Response> {
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request): Promise<Response> {
  return toNextJsHandler(getAuth()).POST(request);
}
