import { describe, expect, it } from 'vitest';
import { formatTime } from '@/themes/mariage-noir-ivoire/animations/format';

/**
 * `content.event.time` and `ProgramItem.time` are stored as `HH:MM`. That is a
 * storage format: the validated mock-up prints "14h30".
 */
describe('formatTime', () => {
  it('writes French times the way the mock-up does', () => {
    expect(formatTime('14:30', 'fr')).toBe('14h30');
    expect(formatTime('16:30', 'fr')).toBe('16h30');
    expect(formatTime('09:05', 'fr')).toBe('9h05');
  });

  it('drops the minutes on the hour, in French', () => {
    expect(formatTime('20:00', 'fr')).toBe('20h');
    expect(formatTime('23:00', 'fr')).toBe('23h');
  });

  it('writes English times with a meridiem, never shifted by the visitor’s zone', () => {
    expect(formatTime('14:30', 'en')).toBe('2:30 pm');
    expect(formatTime('09:05', 'en')).toBe('9:05 am');
    expect(formatTime('00:15', 'en')).toBe('12:15 am');
  });

  it('gives a malformed value straight back', () => {
    expect(formatTime('nonsense', 'fr')).toBe('nonsense');
    expect(formatTime('', 'en')).toBe('');
  });
});
