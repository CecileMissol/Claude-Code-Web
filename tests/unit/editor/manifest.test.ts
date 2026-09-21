import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { manifest } from '@/themes/mariage-noir-ivoire/manifest';
import { Extras } from '@/themes/mariage-noir-ivoire/schema';
import { extrasGroups, extrasGroupDefault } from '@/editor/extras';
import { allFields, buildEditorSteps } from '@/editor/manifest';
import type { ThemeManifest } from '@/themes/types';

/**
 * The editor must be generated from the theme, never written against one
 * theme in particular. These tests change the manifest and check that the form
 * follows.
 */

const groups = extrasGroups(Extras);
const steps = buildEditorSteps(manifest, { extras: groups });

function field(id: string) {
  return allFields(steps).find((candidate) => candidate.id === id);
}

describe('steps built from a manifest', () => {
  it('follows the order of the brief', () => {
    expect(steps.map((step) => step.id)).toEqual([
      'couple',
      'event',
      'story',
      'photos',
      'program',
      'info',
      'rsvp',
      'style',
      'language',
      'publish',
    ]);
  });

  it('takes the list bounds from manifest.limits', () => {
    expect(field('storyLines')).toMatchObject({
      kind: 'lines',
      min: manifest.limits.storyLines[0],
      max: manifest.limits.storyLines[1],
    });
    expect(field('programItems')).toMatchObject({
      kind: 'items',
      min: manifest.limits.programItems[0],
      max: manifest.limits.programItems[1],
    });
    expect(field('info')).toMatchObject({
      min: manifest.limits.infoItems[0],
      max: manifest.limits.infoItems[1],
    });
  });

  it('offers exactly the palettes and scripts of the theme', () => {
    const palette = field('palette');
    const script = field('script');

    expect(palette).toMatchObject({ kind: 'choice', presentation: 'swatch' });
    expect(palette?.kind === 'choice' && palette.options.map((option) => option.value)).toEqual(
      manifest.palettes.map((entry) => entry.id),
    );
    expect(palette?.kind === 'choice' && palette.options[0]?.swatch).toBe(
      manifest.palettes[0]?.swatch,
    );
    expect(script?.kind === 'choice' && script.options.map((option) => option.value)).toEqual(
      manifest.scripts.map((entry) => entry.id),
    );
  });

  it('creates one photo frame per declared slot, with its ratio', () => {
    const photos = field('photos');
    expect(photos?.kind).toBe('photos');
    if (photos?.kind !== 'photos') return;

    expect(photos.slots.map((slot) => slot.id)).toEqual(manifest.photoSlots.map((slot) => slot.id));
    expect(photos.slots[0]?.aspect).toBe(manifest.photoSlots[0]?.aspect);
    expect(photos.slots[0]?.path).toBe(`photos.${manifest.photoSlots[0]?.id}`);
  });

  it('drops the steps of the sections a theme does not declare', () => {
    const minimal: ThemeManifest = {
      ...manifest,
      sections: ['intro', 'date'],
      photoSlots: [],
    };

    expect(buildEditorSteps(minimal).map((step) => step.id)).toEqual([
      'couple',
      'event',
      'style',
      'language',
      'publish',
    ]);
  });

  it('ends on a plain link to the sharing page', () => {
    const share = field('share');
    expect(share).toMatchObject({ kind: 'link', hrefTemplate: '/app/{id}/share' });
  });
});

describe('extras read from the theme schema', () => {
  it('finds the theme blocks and their maximum lengths', () => {
    expect(groups.map((group) => group.id)).toEqual(['memento', 'note', 'envelope']);

    const memento = groups.find((group) => group.id === 'memento');
    expect(memento).toMatchObject({ shape: 'object', constants: { kind: 'ticket' } });
    expect(memento?.fields.map((entry) => entry.path)).toEqual([
      'extras.memento.route',
      'extras.memento.date',
      'extras.memento.lineA',
      'extras.memento.lineB',
    ]);
    expect(memento?.fields[0]?.maxLength).toBe(30);
    expect(memento?.fields[1]?.maxLength).toBe(12);

    const note = groups.find((group) => group.id === 'note');
    expect(note).toMatchObject({ shape: 'scalar', path: 'extras.note' });
    expect(note?.fields[0]?.maxLength).toBe(30);
  });

  it('fills the literal fields when a block is shown', () => {
    const memento = groups.find((group) => group.id === 'memento');
    expect(memento && extrasGroupDefault(memento)).toEqual({
      kind: 'ticket',
      route: '',
      date: '',
      lineA: '',
      lineB: '',
    });

    const note = groups.find((group) => group.id === 'note');
    expect(note && extrasGroupDefault(note)).toBe('');
  });

  it('ignores what it cannot draw, and survives a theme without extras', () => {
    const odd = z.object({
      ok: z.string().max(5).optional(),
      weird: z.array(z.number()).optional(),
    });

    expect(extrasGroups(odd).map((group) => group.id)).toEqual(['ok']);
    expect(extrasGroups(z.object({}))).toEqual([]);
    expect(extrasGroups(undefined)).toEqual([]);
    expect(extrasGroups(z.string())).toEqual([]);
  });

  it('puts the theme blocks in the story step', () => {
    const story = steps.find((step) => step.id === 'story');
    const extras = story?.fields.find((entry) => entry.kind === 'extras');
    expect(extras?.kind === 'extras' && extras.groups).toHaveLength(groups.length);
  });
});
