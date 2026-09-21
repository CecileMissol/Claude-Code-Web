import { describe, expect, it } from 'vitest';
import { defaultContent } from '@/content/defaults';
import { InvitationContent } from '@/content/schema';
import { buildContentSchema, parseDraftContent } from '@/editor/content-schema';
import { extrasGroups } from '@/editor/extras';
import { CONTENT_LIMITS, buildEditorSteps } from '@/editor/manifest';
import { setAtPath } from '@/editor/paths';
import { describeIssue, issuesByPath, stepsWithIssues, validateDraft } from '@/editor/validation';
import { manifest } from '@/themes/mariage-noir-ivoire/manifest';
import { Extras } from '@/themes/mariage-noir-ivoire/schema';

const steps = buildEditorSteps(manifest, { extras: extrasGroups(Extras) });
const base = () => defaultContent('fr') as unknown as Record<string, unknown>;

/** Translator double: returns the key and its parameters. */
const t = (key: string, params?: Record<string, number | string>) =>
  params ? `${key}(${Object.values(params).join(',')})` : key;

describe('client-side validation', () => {
  it('accepts a freshly created draft', () => {
    expect(validateDraft(steps, base())).toEqual([]);
  });

  it('refuses an empty first name and points at the step', () => {
    const content = setAtPath(base(), 'couple.partner1.firstName', '  ');
    const issues = validateDraft(steps, content);

    expect(issues).toContainEqual({ path: 'couple.partner1.firstName', code: 'required' });
    expect(stepsWithIssues(steps, content).has('couple')).toBe(true);
    expect(stepsWithIssues(steps, content).has('style')).toBe(false);
  });

  it('enforces the bounds of the manifest', () => {
    const tooMany = setAtPath(base(), 'story.lines', new Array(9).fill('x'));
    expect(validateDraft(steps, tooMany)).toContainEqual({
      path: 'story.lines',
      code: 'tooMany',
      params: { max: manifest.limits.storyLines[1] },
    });

    const tooFew = setAtPath(base(), 'program.items', []);
    expect(validateDraft(steps, tooFew)).toContainEqual({
      path: 'program.items',
      code: 'tooFew',
      params: { min: manifest.limits.programItems[0] },
    });
  });

  it('checks dates, times, numbers, links and unknown options', () => {
    const issues = issuesByPath(
      validateDraft(
        steps,
        setAtPath(
          setAtPath(
            setAtPath(
              setAtPath(setAtPath(base(), 'event.date', '12/06/2027'), 'event.time', '25:00'),
              'rsvp.maxGuestsPerReply',
              42,
            ),
            'venue.mapsUrl',
            'maps.example',
          ),
          'style.paletteId',
          'unknown-palette',
        ),
      ),
    );

    expect(issues.get('event.date')?.code).toBe('invalidDate');
    expect(issues.get('event.time')?.code).toBe('invalidTime');
    expect(issues.get('rsvp.maxGuestsPerReply')?.code).toBe('outOfRange');
    expect(issues.get('venue.mapsUrl')?.code).toBe('invalidUrl');
    expect(issues.get('style.paletteId')?.code).toBe('unknownOption');
  });

  it('only checks a theme block once it is shown', () => {
    const hidden = base();
    expect(validateDraft(steps, hidden)).toEqual([]);

    const shown = setAtPath(hidden, 'extras.memento', {
      kind: 'ticket',
      route: 'x'.repeat(31),
      date: '',
      lineA: '',
      lineB: '',
    });
    expect(validateDraft(steps, shown)).toContainEqual({
      path: 'extras.memento.route',
      code: 'tooLong',
      params: { max: 30 },
    });
  });

  it('translates an issue with its parameters', () => {
    expect(describeIssue({ path: 'x', code: 'required' }, t)).toBe('errors.required');
    expect(describeIssue({ path: 'x', code: 'tooLong', params: { max: 30 } }, t)).toBe(
      'errors.tooLong(30)',
    );
  });
});

describe('client bounds mirror the content schema', () => {
  const cases: [path: string, max: number][] = [
    ['couple.partner1.firstName', CONTENT_LIMITS.firstName],
    ['story.lines.0', CONTENT_LIMITS.line],
    ['dateChapter.highlight', CONTENT_LIMITS.highlight],
    ['signature.text', CONTENT_LIMITS.signature],
    ['venue.name', CONTENT_LIMITS.venueName],
    ['venue.addressLine', CONTENT_LIMITS.venueAddress],
    ['venue.city', CONTENT_LIMITS.venueCity],
    ['program.items.0.title', CONTENT_LIMITS.programTitle],
    ['program.items.0.detail', CONTENT_LIMITS.programDetail],
    ['info.0.title', CONTENT_LIMITS.infoTitle],
    ['info.0.body', CONTENT_LIMITS.infoBody],
  ];

  it.each(cases)('%s accepts %i characters and refuses one more', (path, max) => {
    expect(InvitationContent.safeParse(setAtPath(base(), path, 'a'.repeat(max))).success).toBe(
      true,
    );
    expect(InvitationContent.safeParse(setAtPath(base(), path, 'a'.repeat(max + 1))).success).toBe(
      false,
    );
  });
});

describe('server-side schema', () => {
  const schema = buildContentSchema(manifest, Extras);

  it('accepts the default draft of both locales', () => {
    expect(schema.safeParse(defaultContent('fr')).success).toBe(true);
    expect(schema.safeParse(defaultContent('en')).success).toBe(true);
  });

  it('refuses a palette or a script the theme does not declare', () => {
    expect(schema.safeParse(setAtPath(base(), 'style.paletteId', 'neon')).success).toBe(false);
    expect(schema.safeParse(setAtPath(base(), 'style.scriptId', 'comic')).success).toBe(false);
  });

  it('refuses a photo in a slot the theme does not declare', () => {
    const photo = { key: 'invitations/a/photos/x.webp', width: 10, height: 10, alt: '' };
    expect(schema.safeParse(setAtPath(base(), 'photos.story-1', photo)).success).toBe(true);
    expect(schema.safeParse(setAtPath(base(), 'photos.kitchen', photo)).success).toBe(false);
  });

  it('applies the manifest bounds, not only the common schema', () => {
    const sixLines = setAtPath(base(), 'story.lines', new Array(6).fill('ok'));
    const sevenLines = setAtPath(base(), 'story.lines', new Array(7).fill('ok'));

    expect(schema.safeParse(sixLines).success).toBe(true);
    expect(schema.safeParse(sevenLines).success).toBe(false);
  });

  it('validates the theme extras', () => {
    const good = setAtPath(base(), 'extras.memento', {
      kind: 'ticket',
      route: 'Marseille → Paris',
      date: '14.02.19',
      lineA: 'Voiture 12',
      lineB: 'Places 45 · 46',
    });
    const bad = setAtPath(base(), 'extras.memento', { kind: 'plane', route: 'x' });

    expect(parseDraftContent(manifest, Extras, good).success).toBe(true);
    expect(parseDraftContent(manifest, Extras, bad).success).toBe(false);
  });

  it('refuses anything that is not an invitation', () => {
    expect(schema.safeParse(null).success).toBe(false);
    expect(schema.safeParse({ version: 1 }).success).toBe(false);
  });
});
