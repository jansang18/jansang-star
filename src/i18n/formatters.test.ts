import { describe, expect, it } from 'vitest';
import { formatLocalDate, formatPeriodLabel, formatZodiacDegree } from './formatters';

describe('formatters', () => {
  it('formats zodiac degree values with locale-specific sign names', () => {
    expect(formatZodiacDegree(132.5, 'ko')).toBe('사자자리 12°30′');
    expect(formatZodiacDegree(132.5, 'en')).toBe('Leo 12°30′');
  });

  it('formats dates and period labels for the active locale', () => {
    expect(formatLocalDate('2026-08-05', 'ko')).toContain('2026년');
    expect(formatLocalDate('2026-08-05', 'en')).toContain('August');
    expect(formatPeriodLabel('month', '2026-08-05', 'en')).toBe('August 2026');
  });
});
