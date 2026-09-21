import { describe, expect, it } from 'vitest';
import { formatTime } from '@/themes/mariage-terracotta-bloom/animations/format';

/**
 * `content.event.time` and `ProgramItem.time` are stored as `HH:MM`. That is a
 * storage format: an English invitation prints "4:30 pm", a French one "16h30".
 */
describe('formatTime', () => {
  it('writes English times with a meridiem, never shifted by the visitor’s zone', () => {
    expect(formatTime('16:30', 'en')).toBe('4:30 pm');
    expect(formatTime('09:05', 'en')).toBe('9:05 am');
    expect(formatTime('00:15', 'en')).toBe('12:15 am');
    expect(formatTime('22:00', 'en')).toBe('10:00 pm');
  });

  it('writes French times the way a French invitation does', () => {
    expect(formatTime('16:30', 'fr')).toBe('16h30');
    expect(formatTime('09:05', 'fr')).toBe('9h05');
  });

  it('drops the minutes on the hour, in French', () => {
    expect(formatTime('20:00', 'fr')).toBe('20h');
    expect(formatTime('23:00', 'fr')).toBe('23h');
  });

  it('gives a malformed value straight back', () => {
    expect(formatTime('nonsense', 'fr')).toBe('nonsense');
    expect(formatTime('', 'en')).toBe('');
  });
});
