import { describe, expect, it } from 'vitest';
import type { NatalChartData } from '../astrology/types';
import { generateDailyFortune } from './generateFortune';
import type { Aspect } from './aspects';
import type { TransitData } from './transits';

const chart = { planets: {}, houses: [], houseSystem: 'P', julianDay: 0, timeKnown: false } as unknown as NatalChartData;
const aspects: Aspect[] = [
  { type: 'trine', from: 'jupiter', to: 'sun', angle: 120, orb: 2.4, maxOrb: 7 },
  { type: 'square', from: 'saturn', to: 'moon', angle: 90, orb: 0.6, maxOrb: 7 },
  { type: 'sextile', from: 'venus', to: 'mars', angle: 60, orb: 1.2, maxOrb: 5 },
  { type: 'opposition', from: 'mars', to: 'venus', angle: 180, orb: 3.1, maxOrb: 8 },
  { type: 'conjunction', from: 'mercury', to: 'jupiter', angle: 0, orb: 0.2, maxOrb: 8 },
];
const transits = { date: '2026-08-05', chart, aspects } as TransitData;

describe('generateDailyFortune', () => {
  it('returns identical fortune for identical chart and date', () => {
    expect(generateDailyFortune(chart, transits, '2026-08-05')).toEqual(generateDailyFortune(chart, transits, '2026-08-05'));
  });

  it('returns a locale-neutral calculated model with bounded scores and evidence', () => {
    const result = generateDailyFortune(chart, transits, '2026-08-05');
    expect(result).not.toHaveProperty('headline');
    expect(result.lucky).toEqual(expect.objectContaining({
      colorIndex: expect.any(Number),
      number: expect.any(Number),
      hour: expect.any(Number),
      adviceBand: expect.stringMatching(/^(high|medium|low)$/),
    }));
    expect(result.lucky).not.toHaveProperty('color');
    expect(result.lucky).not.toHaveProperty('advice');
    Object.values(result.categories).forEach((category) => {
      expect(category.score).toBeGreaterThanOrEqual(0);
      expect(category.score).toBeLessThanOrEqual(100);
      expect(category.band).toMatch(/^(high|medium|low)$/);
      expect(Number.isInteger(category.variant)).toBe(true);
      expect(category.evidence.length).toBeLessThanOrEqual(2);
      expect(category).not.toHaveProperty('label');
      expect(category).not.toHaveProperty('summary');
      expect(category).not.toHaveProperty('paragraphs');
      expect(category).not.toHaveProperty('signals');
    });
    expect(result.categories.overall.evidence).toEqual([aspects[4], aspects[1]]);
    expect(Object.fromEntries(Object.entries(result.categories).map(([key, value]) => [key, value.score]))).toEqual({
      overall: 77,
      love: 62,
      money: 67,
      career: 94,
      health: 71,
    });
    expect(result.lucky).toEqual({ colorIndex: 1, number: 9, hour: 17, adviceBand: 'high' });
  });
});
