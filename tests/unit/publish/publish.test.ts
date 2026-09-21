import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Database } from '@/db';
import { themes, user } from '@/db/schema';
import {
  createInvitation,
  expireDuePublications,
  getInvitationBySlugAnyStatus,
  getInvitationOwnerEmail,
  isSlugTaken,
  publishInvitationForOwner,
  setInvitationSlugForOwner,
  unpublishInvitationForOwner,
} from '@/db/queries';
import { defaultContent } from '@/content/defaults';
import { CONTENT_VERSION } from '@/content/schema';
import {
  HOSTING_MONTHS,
  addMonths,
  checkSlugShape,
  effectiveStatus,
  hostingExpiry,
  isDeadlinePassed,
  isPubliclyVisible,
  publishBlocker,
  todayInTimeZone,
} from '@/lib/publish';
import { createTestD1, type TestD1 } from '../helpers/d1';

describe('hosting window', () => {
  it('adds whole months', () => {
    expect(addMonths(new Date('2026-09-21T10:00:00Z'), 18).toISOString()).toBe(
      '2028-03-21T10:00:00.000Z',
    );
  });

  it('clamps the day when the target month is shorter', () => {
    expect(addMonths(new Date('2027-01-31T00:00:00Z'), 1).toISOString().slice(0, 10)).toBe(
      '2027-02-28',
    );
    expect(addMonths(new Date('2028-01-31T00:00:00Z'), 1).toISOString().slice(0, 10)).toBe(
      '2028-02-29',
    );
  });

  it('goes backwards too, which is what retention needs', () => {
    expect(addMonths(new Date('2026-09-21T00:00:00Z'), -6).toISOString().slice(0, 10)).toBe(
      '2026-03-21',
    );
  });

  it('expires 18 months after publication', () => {
    expect(HOSTING_MONTHS).toBe(18);
    const published = new Date('2026-09-21T12:00:00Z');
    expect(hostingExpiry(published).toISOString().slice(0, 10)).toBe('2028-03-21');
  });
});

describe('slug rules', () => {
  it('accepts a well-formed slug', () => {
    expect(checkSlugShape('zoe-et-dylan')).toEqual({ ok: true });
  });

  it('names the problem it found', () => {
    expect(checkSlugShape('')).toEqual({ ok: false, problem: 'empty' });
    expect(checkSlugShape('ab')).toEqual({ ok: false, problem: 'too_short' });
    expect(checkSlugShape('a'.repeat(61))).toEqual({ ok: false, problem: 'too_long' });
    expect(checkSlugShape('admin')).toEqual({ ok: false, problem: 'reserved' });
    expect(checkSlugShape('Zoé et Dylan')).toEqual({ ok: false, problem: 'invalid_characters' });
    expect(checkSlugShape('zoe--dylan')).toEqual({ ok: false, problem: 'invalid_characters' });
    expect(checkSlugShape('robots.txt')).toEqual({ ok: false, problem: 'reserved' });
    expect(checkSlugShape('photo.png')).toEqual({ ok: false, problem: 'invalid_characters' });
  });

  it('blocks publication without a usable slug', () => {
    expect(publishBlocker({ slug: null })).toBe('missing_slug');
    expect(publishBlocker({ slug: 'api' })).toBe('invalid_slug');
    expect(publishBlocker({ slug: 'zoe-et-dylan' })).toBeNull();
  });
});

describe('effective status', () => {
  const now = new Date('2027-01-01T00:00:00Z');

  it('keeps a live publication published', () => {
    const invitation = {
      status: 'published' as const,
      expiresAt: new Date('2028-01-01T00:00:00Z'),
      slug: 'a-b',
    };
    expect(effectiveStatus(invitation, now)).toBe('published');
    expect(isPubliclyVisible(invitation, now)).toBe(true);
  });

  it('reads a passed expiry date as expired, whatever the stored status says', () => {
    const invitation = {
      status: 'published' as const,
      expiresAt: new Date('2026-12-31T23:59:00Z'),
      slug: 'a-b',
    };
    expect(effectiveStatus(invitation, now)).toBe('expired');
    expect(isPubliclyVisible(invitation, now)).toBe(false);
  });

  it('leaves drafts and disabled invitations alone', () => {
    expect(effectiveStatus({ status: 'draft', expiresAt: null, slug: null }, now)).toBe('draft');
    expect(effectiveStatus({ status: 'disabled', expiresAt: null, slug: 'a-b' }, now)).toBe(
      'disabled',
    );
  });
});

describe('RSVP deadline', () => {
  it('reads the date in the time zone of the event, not the guest', () => {
    // 2027-06-12T23:30Z is already the 13th in Paris.
    const instant = new Date('2027-06-12T23:30:00Z');
    expect(todayInTimeZone('Europe/Paris', instant)).toBe('2027-06-13');
    expect(todayInTimeZone('UTC', instant)).toBe('2027-06-12');
  });

  it('is inclusive of the deadline day', () => {
    const onTheDay = new Date('2027-06-01T10:00:00Z');
    expect(isDeadlinePassed('2027-06-01', 'Europe/Paris', onTheDay)).toBe(false);
    expect(isDeadlinePassed('2027-05-31', 'Europe/Paris', onTheDay)).toBe(true);
    expect(isDeadlinePassed(undefined, 'Europe/Paris', onTheDay)).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Database                                                                   */
/* -------------------------------------------------------------------------- */

const THEME_ID = 'theme-1';
const ALICE = 'user-alice';
const BOB = 'user-bob';

let d1: TestD1;
let db: Database;

beforeEach(async () => {
  d1 = createTestD1();
  db = createDb(d1.binding);

  await db.insert(user).values([
    { id: ALICE, name: 'Alice', email: 'alice@example.com' },
    { id: BOB, name: 'Bob', email: 'bob@example.com' },
  ]);
  await db.insert(themes).values({
    id: THEME_ID,
    slug: 'mariage-noir-ivoire',
    name: 'Noir & ivoire',
    version: 1,
    status: 'active',
  });
});

afterEach(() => d1.close());

function seed(ownerId: string, slug: string | null = null) {
  return createInvitation(db, {
    ownerId,
    themeId: THEME_ID,
    locale: 'fr',
    content: JSON.stringify(defaultContent('fr')),
    contentVersion: CONTENT_VERSION,
    slug,
  });
}

describe('publication queries', () => {
  it('reports a slug as taken, except for the invitation that owns it', async () => {
    const invitation = await seed(ALICE, 'zoe-et-dylan');

    expect(await isSlugTaken(db, 'zoe-et-dylan')).toBe(true);
    expect(await isSlugTaken(db, 'zoe-et-dylan', invitation.id)).toBe(false);
    expect(await isSlugTaken(db, 'someone-else')).toBe(false);
  });

  it('refuses to set a slug on somebody else’s invitation', async () => {
    const invitation = await seed(ALICE);

    expect(await setInvitationSlugForOwner(db, invitation.id, BOB, 'stolen')).toBeNull();
    expect(await isSlugTaken(db, 'stolen')).toBe(false);

    const updated = await setInvitationSlugForOwner(db, invitation.id, ALICE, 'zoe-et-dylan');
    expect(updated?.slug).toBe('zoe-et-dylan');
  });

  it('publishes, keeps the first publication date, then takes offline', async () => {
    const invitation = await seed(ALICE, 'zoe-et-dylan');
    const first = new Date('2026-09-21T12:00:00Z');

    const published = await publishInvitationForOwner(db, invitation.id, ALICE, {
      publishedAt: first,
      expiresAt: hostingExpiry(first),
    });

    expect(published?.status).toBe('published');
    expect(published?.publishedAt?.toISOString()).toBe(first.toISOString());
    expect(published?.expiresAt?.toISOString().slice(0, 10)).toBe('2028-03-21');

    const offline = await unpublishInvitationForOwner(db, invitation.id, ALICE);
    expect(offline?.status).toBe('disabled');
    expect(offline?.slug).toBe('zoe-et-dylan');

    // Re-publishing must not restart the hosting clock.
    const later = new Date('2027-01-01T00:00:00Z');
    const again = await publishInvitationForOwner(db, invitation.id, ALICE, {
      publishedAt: later,
      expiresAt: hostingExpiry(first),
    });
    expect(again?.publishedAt?.toISOString()).toBe(first.toISOString());
  });

  it('never publishes for a user who does not own the invitation', async () => {
    const invitation = await seed(ALICE, 'zoe-et-dylan');
    const result = await publishInvitationForOwner(db, invitation.id, BOB, {
      expiresAt: hostingExpiry(new Date()),
    });
    expect(result).toBeNull();
  });

  it('serves any status by slug, so the public page can tell 404 from expired', async () => {
    const invitation = await seed(ALICE, 'zoe-et-dylan');

    const draft = await getInvitationBySlugAnyStatus(db, 'zoe-et-dylan');
    expect(draft?.invitation.id).toBe(invitation.id);
    expect(draft?.themeSlug).toBe('mariage-noir-ivoire');
    expect(effectiveStatus(draft!.invitation)).toBe('draft');

    expect(await getInvitationBySlugAnyStatus(db, 'nobody')).toBeNull();
  });

  it('expires the publications whose hosting window has closed', async () => {
    const past = await seed(ALICE, 'past-couple');
    const future = await seed(BOB, 'future-couple');

    await publishInvitationForOwner(db, past.id, ALICE, {
      publishedAt: new Date('2024-01-01T00:00:00Z'),
      expiresAt: new Date('2025-07-01T00:00:00Z'),
    });
    await publishInvitationForOwner(db, future.id, BOB, {
      publishedAt: new Date('2026-01-01T00:00:00Z'),
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    });

    const now = new Date('2026-09-21T00:00:00Z');
    expect(await expireDuePublications(db, now)).toBe(1);
    expect(await expireDuePublications(db, now)).toBe(0);

    const stale = await getInvitationBySlugAnyStatus(db, 'past-couple');
    const alive = await getInvitationBySlugAnyStatus(db, 'future-couple');
    expect(stale?.invitation.status).toBe('expired');
    expect(alive?.invitation.status).toBe('published');
  });

  it('finds the owner email behind an invitation, for the notification', async () => {
    const invitation = await seed(ALICE, 'zoe-et-dylan');
    expect(await getInvitationOwnerEmail(db, invitation.id)).toBe('alice@example.com');
    expect(await getInvitationOwnerEmail(db, 'ghost')).toBeNull();
  });
});
