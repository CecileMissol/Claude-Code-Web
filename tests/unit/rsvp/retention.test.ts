import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Database } from '@/db';
import { themes, user } from '@/db/schema';
import {
  countRecentRsvpsByIp,
  createInvitation,
  deleteRsvpForOwner,
  insertRsvp,
  listRsvpsForOwner,
  publishInvitationForOwner,
  rsvpStatsForOwner,
} from '@/db/queries';
import { defaultContent } from '@/content/defaults';
import { CONTENT_VERSION } from '@/content/schema';
import { hostingExpiry } from '@/lib/publish';
import {
  RSVP_RETENTION_MONTHS,
  purgeExpiredRsvps,
  retentionCutoff,
  secretMatches,
} from '@/lib/retention';
import { createTestD1, type TestD1 } from '../helpers/d1';

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

async function seed(ownerId: string, eventDate: string, slug: string) {
  const content = defaultContent('fr');
  return createInvitation(db, {
    ownerId,
    themeId: THEME_ID,
    locale: 'fr',
    content: JSON.stringify({ ...content, event: { ...content.event, date: eventDate } }),
    contentVersion: CONTENT_VERSION,
    slug,
  });
}

describe('dashboard counters', () => {
  it('counts yes, no, replies and heads, for the owner only', async () => {
    const invitation = await seed(ALICE, '2027-06-12', 'zoe-et-dylan');

    await insertRsvp(db, { invitationId: invitation.id, name: 'A', attending: true, guests: 2 });
    await insertRsvp(db, { invitationId: invitation.id, name: 'B', attending: true, guests: 3 });
    await insertRsvp(db, { invitationId: invitation.id, name: 'C', attending: false, guests: 1 });

    expect(await rsvpStatsForOwner(db, invitation.id, ALICE)).toEqual({
      yes: 2,
      no: 1,
      replies: 3,
      people: 5,
    });

    // Someone else's dashboard sees nothing at all.
    expect(await rsvpStatsForOwner(db, invitation.id, BOB)).toEqual({
      yes: 0,
      no: 0,
      replies: 0,
      people: 0,
    });
  });

  it('returns zeros rather than nulls on an invitation with no reply', async () => {
    const invitation = await seed(ALICE, '2027-06-12', 'zoe-et-dylan');
    expect(await rsvpStatsForOwner(db, invitation.id, ALICE)).toEqual({
      yes: 0,
      no: 0,
      replies: 0,
      people: 0,
    });
  });
});

describe('deleting a reply', () => {
  it('only lets the owner delete', async () => {
    const invitation = await seed(ALICE, '2027-06-12', 'zoe-et-dylan');
    const reply = await insertRsvp(db, {
      invitationId: invitation.id,
      name: 'Camille',
      attending: true,
    });

    expect(await deleteRsvpForOwner(db, reply.id, invitation.id, BOB)).toBe(false);
    expect(await listRsvpsForOwner(db, invitation.id, ALICE)).toHaveLength(1);

    expect(await deleteRsvpForOwner(db, reply.id, invitation.id, ALICE)).toBe(true);
    expect(await listRsvpsForOwner(db, invitation.id, ALICE)).toHaveLength(0);
  });
});

describe('per-IP counting', () => {
  it('counts only this invitation, this hash, and this window', async () => {
    const mine = await seed(ALICE, '2027-06-12', 'zoe-et-dylan');
    const other = await seed(BOB, '2027-06-12', 'alex-and-sam');

    for (let index = 0; index < 3; index += 1) {
      await insertRsvp(db, {
        invitationId: mine.id,
        name: `G${index}`,
        attending: true,
        ipHash: 'aaaa',
      });
    }
    await insertRsvp(db, { invitationId: mine.id, name: 'X', attending: true, ipHash: 'bbbb' });
    await insertRsvp(db, { invitationId: other.id, name: 'Y', attending: true, ipHash: 'aaaa' });

    const since = new Date(Date.now() - 10 * 60 * 1000);
    expect(await countRecentRsvpsByIp(db, mine.id, 'aaaa', since)).toBe(3);
    expect(await countRecentRsvpsByIp(db, mine.id, 'bbbb', since)).toBe(1);
    expect(await countRecentRsvpsByIp(db, mine.id, 'cccc', since)).toBe(0);

    // A window that starts in the future contains nothing.
    expect(await countRecentRsvpsByIp(db, mine.id, 'aaaa', new Date(Date.now() + 60_000))).toBe(0);
  });
});

describe('GDPR retention', () => {
  it('keeps replies for six months after the event', () => {
    expect(RSVP_RETENTION_MONTHS).toBe(6);
    expect(retentionCutoff(new Date('2027-12-21T00:00:00Z'))).toBe('2027-06-21');
  });

  it('deletes the replies of old events and leaves recent ones alone', async () => {
    const old = await seed(ALICE, '2026-01-10', 'old-wedding');
    const recent = await seed(ALICE, '2026-09-01', 'recent-wedding');

    await insertRsvp(db, { invitationId: old.id, name: 'Gone', attending: true });
    await insertRsvp(db, { invitationId: old.id, name: 'Gone too', attending: false });
    await insertRsvp(db, { invitationId: recent.id, name: 'Kept', attending: true });

    // Cut-off on 2026-09-21 is 2026-03-21: the January wedding is out.
    const report = await purgeExpiredRsvps(db, new Date('2026-09-21T03:15:00Z'));

    expect(report.cutoff).toBe('2026-03-21');
    expect(report.deletedRsvps).toBe(2);
    expect(await listRsvpsForOwner(db, old.id, ALICE)).toHaveLength(0);
    expect(await listRsvpsForOwner(db, recent.id, ALICE)).toHaveLength(1);
  });

  it('also closes the publications whose hosting window has passed, and is idempotent', async () => {
    const invitation = await seed(ALICE, '2027-06-12', 'zoe-et-dylan');
    const publishedAt = new Date('2024-01-01T00:00:00Z');

    await publishInvitationForOwner(db, invitation.id, ALICE, {
      publishedAt,
      expiresAt: hostingExpiry(publishedAt),
    });

    const now = new Date('2026-09-21T03:15:00Z');
    expect((await purgeExpiredRsvps(db, now)).expiredInvitations).toBe(1);
    expect((await purgeExpiredRsvps(db, now)).expiredInvitations).toBe(0);
  });
});

describe('cron secret', () => {
  it('compares without leaking the length through an early exit', () => {
    expect(secretMatches('abc', 'abc')).toBe(true);
    expect(secretMatches('abd', 'abc')).toBe(false);
    expect(secretMatches('ab', 'abc')).toBe(false);
    expect(secretMatches(null, 'abc')).toBe(false);
    expect(secretMatches(undefined, 'abc')).toBe(false);
  });
});
