import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb, type Database } from '@/db';
import { account, session, user, verification } from '@/db/schema';
import { getApprovedActivationByEmail } from '@/db/queries';
import { getEnv, isAdminEmail } from './env';
import { sendMail } from './mail';
import { activationApprovedEmail } from '../../emails/ActivationApproved';

/**
 * Better Auth configuration: magic link only, sessions stored in D1 through the
 * Drizzle adapter. There is no password anywhere in the product.
 */

export type Auth = ReturnType<typeof createAuth>;

const MAGIC_LINK_TTL_SECONDS = 15 * 60;

/** Builds a Better Auth instance bound to a given database handle. */
export function createAuth(db: Database) {
  const env = getEnv();

  return betterAuth({
    appName: 'Invitations',
    baseURL: env.APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: false },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_TTL_SECONDS,
        disableSignUp: false,
        sendMagicLink: async ({ email, url, metadata }) => {
          // Sign-in gate (phase 7): a magic link is only ever mailed to an
          // email that is allowed to sign in. Better Auth still returns its
          // usual `{ status: true }` either way, so the API never reveals
          // whether an address is known — see `isEmailAllowedToSignIn`.
          if (!(await isEmailAllowedToSignIn(email))) return;

          if (metadata?.kind === 'activation-approved') {
            await sendMail(activationApprovedEmail({ to: email, url }));
            return;
          }

          await sendMail({
            to: email,
            subject: 'Votre lien de connexion · Your sign-in link',
            text: [
              'Bonjour,',
              '',
              'Voici votre lien de connexion. Il expire dans 15 minutes.',
              url,
              '',
              'Hello,',
              '',
              'Here is your sign-in link. It expires in 15 minutes.',
              url,
              '',
              "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
              'If you did not request this email, you can safely ignore it.',
            ].join('\n'),
          });
        },
      }),
      // Must stay last: it forwards Set-Cookie from server actions.
      nextCookies(),
    ],
  });
}

const instances = new WeakMap<object, Auth>();

/**
 * Better Auth instance for the current request, memoised per D1 binding so a
 * Worker isolate builds it only once.
 */
export function getAuth(): Auth {
  const db = getDb();
  const cached = instances.get(db as unknown as object);
  if (cached) return cached;

  const auth = createAuth(db);
  instances.set(db as unknown as object, auth);
  return auth;
}

/**
 * Sign-in gate (phase 7): a magic link is only ever sent to an email that
 * already has an account, that is listed in `ADMIN_EMAILS`, or whose Etsy
 * purchase has been approved in `/admin`. Everyone else gets the exact same
 * neutral "check your inbox" response from the API (see `LoginForm.tsx`) —
 * this only decides whether anything is actually mailed.
 *
 * `db` defaults to the request-scoped handle so production call sites need
 * not pass one; tests pass an in-memory database directly.
 */
export async function isEmailAllowedToSignIn(email: string, db: Database = getDb()): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  if (isAdminEmail(normalized)) return true;

  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1);
  if (existingUser.length > 0) return true;

  const approved = await getApprovedActivationByEmail(db, normalized);
  return approved !== null;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

/** Current session user, or `null` when signed out. */
export async function getSession(): Promise<SessionUser | null> {
  const result = await getAuth().api.getSession({ headers: await headers() });
  if (!result?.user) return null;

  return {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name ?? '',
    isAdmin: isAdminEmail(result.user.email),
  };
}

/** Same, but redirects to `/login` when there is no session. */
export async function requireUser(redirectTo = '/login'): Promise<SessionUser> {
  const sessionUser = await getSession();
  if (!sessionUser) redirect(redirectTo);
  return sessionUser;
}

/** Guards `/admin`: signed in AND listed in `ADMIN_EMAILS`. */
export async function requireAdmin(): Promise<SessionUser> {
  const sessionUser = await requireUser();
  if (!sessionUser.isAdmin) redirect('/app');
  return sessionUser;
}
