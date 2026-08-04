import { describe, expect, it } from 'vitest';
import type { NatalChartData } from '../astrology/types';
import { generateDailyFortune } from './generateFortune';
import type { TransitData } from './transits';

const chart = { planets: {}, houses: [], houseSystem: 'P', julianDay: 0, timeKnown: false } as unknown as NatalChartData;
const transits = { date: '2026-08-05', chart, aspects: [] } as TransitData;

describe('generateDailyFortune', () => {
  it('returns identical fortune for identical chart and date', () => {
    expect(generateDailyFortune(chart, transits, '2026-08-05')).toEqual(generateDailyFortune(chart, transits, '2026-08-05'));
  });

  it('keeps all category scores between 0 and 100', () => {
    const result = generateDailyFortune(chart, transits, '2026-08-05');
    Object.values(result.categories).forEach((category) => {
      expect(category.score).toBeGreaterThanOrEqual(0);
      expect(category.score).toBeLessThanOrEqual(100);
      expect(category.summary.length).toBeGreaterThan(10);
    });
  });
});
