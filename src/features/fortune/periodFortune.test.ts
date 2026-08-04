import { describe, expect, it } from 'vitest';
import type { DailyFortune } from './generateFortune';
import { monthSampleDates, summarizePeriodFortune, yearSampleDates } from './periodFortune';

const fortune = (score: number) => ({ overallScore: score, categories: Object.fromEntries(['overall', 'love', 'money', 'career', 'health'].map((key) => [key, { score }])) }) as unknown as DailyFortune;

describe('period fortunes', () => {
  it('uses five monthly and twelve yearly noon samples', () => {
    expect(monthSampleDates('2026-02-10')).toEqual(['2026-02-01', '2026-02-08', '2026-02-15', '2026-02-22', '2026-02-28']);
    expect(yearSampleDates('2026-08-05')).toHaveLength(12);
  });

  it('stores dates, scores and extrema instead of localized prose', () => {
    const samples = [60, 78, 55, 82, 66].map(fortune);
    const result = summarizePeriodFortune('month', '2026-08-05', samples);

    expect(result.timeline.map((point) => point.date)).toEqual(monthSampleDates('2026-08-05'));
    expect(result.timeline.map((point) => point.tone)).toEqual(['steady', 'flow', 'steady', 'flow', 'steady']);
    expect(result.strongestIndex).toBe(3);
    expect(result.softestIndex).toBe(2);
    expect(result.overallScore).toBe(68);
    expect(result).not.toHaveProperty('label');
    expect(result).not.toHaveProperty('headline');
    expect(result).not.toHaveProperty('narrative');
    expect(result).not.toHaveProperty('opportunity');
    expect(result).not.toHaveProperty('caution');
    expect(Object.keys(result).sort()).toEqual([
      'anchorDate', 'categories', 'overallScore', 'period', 'softestIndex', 'strongestIndex', 'timeline',
    ].sort());
  });

  it('preserves the twelve fifteenth-day samples and rounded category averages', () => {
    const samples = [42, 51, 59, 64, 70, 75, 81, 77, 68, 62, 56, 49].map(fortune);
    const result = summarizePeriodFortune('year', '2026-08-05', samples);

    expect(result.timeline.map((point) => point.date)).toEqual([
      '2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15', '2026-05-15', '2026-06-15',
      '2026-07-15', '2026-08-15', '2026-09-15', '2026-10-15', '2026-11-15', '2026-12-15',
    ]);
    expect(result.overallScore).toBe(63);
    expect(result.categories).toEqual({ overall: 63, love: 63, money: 63, career: 63, health: 63 });
    expect(result.strongestIndex).toBe(6);
    expect(result.softestIndex).toBe(0);
  });
});
