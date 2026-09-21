'use client';

import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

/**
 * Browser-side Better Auth client.
 * `baseURL` is left undefined on purpose: the client then talks to
 * `/api/auth/*` on the current origin, which is what we want in dev, in
 * Workers previews and in production alike.
 */
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, useSession, getSession } = authClient;
