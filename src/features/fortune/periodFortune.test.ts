import { describe, expect, it } from 'vitest';
import type { DailyFortune } from './generateFortune';
import { monthSampleDates, summarizePeriodFortune, yearSampleDates } from './periodFortune';

const fortune = (score: number) => ({ overallScore: score, categories: Object.fromEntries(['overall', 'love', 'money', 'career', 'health'].map((key) => [key, { score }])) }) as unknown as DailyFortune;

describe('period fortunes', () => {
  it('uses five monthly and twelve yearly noon samples', () => {
    expect(monthSampleDates('2026-02-10')).toEqual(['2026-02-01', '2026-02-08', '2026-02-15', '2026-02-22', '2026-02-28']);
    expect(yearSampleDates('2026-08-05')).toHaveLength(12);
  });

  it('summarizes scores and exposes the strongest and softest windows', () => {
    const result = summarizePeriodFortune('month', '2026년 8월', [60, 78, 55, 82, 66].map(fortune));
    expect(result.timeline).toHaveLength(5);
    expect(result.opportunity).toContain('4주');
    expect(result.caution).toContain('3주');
    expect(result.narrative.length).toBeGreaterThanOrEqual(4);
  });
});
