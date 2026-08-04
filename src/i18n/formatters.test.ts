import { describe, expect, it, vi } from 'vitest';
import { houseLabel } from './astrologyTerms';
import { formatLocalDate, formatPeriodLabel, formatPeriodTickLabel, formatZodiacDegree } from './formatters';

describe('formatters', () => {
  it('formats zodiac degree values with locale-specific sign names', () => {
    expect(formatZodiacDegree(132.5, 'ko')).toBe('사자자리 12°30′');
    expect(formatZodiacDegree(132.5, 'en')).toBe('Leo 12°30′');
  });

  it('routes degrees, padded minutes, and house numbers through locale number formatting', () => {
    const nativeNumberFormat = Intl.NumberFormat;
    const numberFormat = vi.spyOn(Intl, 'NumberFormat').mockImplementation(function (...args: ConstructorParameters<typeof Intl.NumberFormat>) {
      return Reflect.construct(nativeNumberFormat, args);
    });

    expect(formatZodiacDegree(132.5, 'ko')).toBe('사자자리 12°30′');
    expect(formatZodiacDegree(132.5, 'en')).toBe('Leo 12°30′');
    expect(houseLabel(1, 'ko')).toBe('1하우스');
    expect(houseLabel(1, 'en')).toBe('House 1');

    expect(numberFormat).toHaveBeenCalledWith('ko-KR', { useGrouping: false });
    expect(numberFormat).toHaveBeenCalledWith('en-US', { useGrouping: false });
    expect(numberFormat).toHaveBeenCalledWith('ko-KR', { useGrouping: false, minimumIntegerDigits: 2 });
    expect(numberFormat).toHaveBeenCalledWith('en-US', { useGrouping: false, minimumIntegerDigits: 2 });
    numberFormat.mockRestore();
  });

  it('formats dates and period labels for the active locale', () => {
    expect(formatLocalDate('2026-08-05', 'ko')).toContain('2026년');
    expect(formatLocalDate('2026-08-05', 'en')).toContain('August');
    expect(formatPeriodLabel('month', '2026-08-05', 'en')).toBe('August 2026');
  });

  it('authors exact short month ticks for a twelve-point yearly chart', () => {
    const dates = Array.from({ length: 12 }, (_, index) => `2026-${String(index + 1).padStart(2, '0')}-15`);

    expect(dates.map((date) => formatPeriodTickLabel('year', date, 'ko'))).toEqual([
      '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월',
    ]);
    expect(dates.map((date) => formatPeriodTickLabel('year', date, 'en'))).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]);
  });
});
