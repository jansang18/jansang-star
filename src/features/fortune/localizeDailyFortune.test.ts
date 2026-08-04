import { describe, expect, it } from 'vitest';
import type { NatalChartData } from '../astrology/types';
import type { Aspect } from './aspects';
import { generateDailyFortune } from './generateFortune';
import { localizeDailyFortune } from './localizeDailyFortune';
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

describe('localizeDailyFortune', () => {
  it('keeps the calculated model independent from display language', () => {
    const model = generateDailyFortune(chart, transits, '2026-08-05');
    const ko = localizeDailyFortune(model, 'ko');
    const en = localizeDailyFortune(model, 'en');

    expect(model).not.toHaveProperty('headline');
    expect(model.categories.overall).not.toHaveProperty('summary');
    expect(ko.overallScore).toBe(en.overallScore);
    expect(ko.evidenceIds).toEqual(en.evidenceIds);
    expect(ko.categories.overall.score).toBe(en.categories.overall.score);
  });

  it('writes seven overall sentences and five sentences for every focused area', () => {
    for (const locale of ['ko', 'en'] as const) {
      const view = localizeDailyFortune(generateDailyFortune(chart, transits, '2026-08-05'), locale);
      expect(view.categories.overall.paragraphs).toHaveLength(7);
      for (const key of ['love', 'money', 'career', 'health'] as const) {
        expect(view.categories[key].paragraphs).toHaveLength(5);
      }
      Object.values(view.categories).forEach((category) => {
        expect(category.summary).toBe(category.paragraphs[0]);
        expect(category.paragraphs.flatMap((paragraph) => paragraph.match(/[.!?](?:\s|$)/g) ?? [])).toHaveLength(category.paragraphs.length);
      });
    }
  });

  it('uses authored English copy and localizes signals without changing their evidence', () => {
    const model = generateDailyFortune(chart, transits, '2026-08-05');
    const ko = localizeDailyFortune(model, 'ko');
    const en = localizeDailyFortune(model, 'en');

    expect(en.categories.overall.label).toBe('Overall');
    expect(en.categories.overall.paragraphs.join(' ')).toMatch(/today/i);
    expect(en.categories.overall.paragraphs.join(' ')).not.toMatch(/[가-힣]/);
    expect(ko.categories.overall.signals[0]).toBe('수성–목성 · 합 · 오브 0.2°');
    expect(en.categories.overall.signals[0]).toBe('Mercury–Jupiter · Conjunction · orb 0.2°');
    expect(ko.evidenceIds).toEqual(en.evidenceIds);
  });

  it('uses the specified neutral evidence only when no relevant aspect exists', () => {
    const emptyTransits = { ...transits, aspects: [] };
    const model = generateDailyFortune(chart, emptyTransits, '2026-08-05');

    expect(localizeDailyFortune(model, 'ko').categories.overall.paragraphs[1]).toContain('주요 흐름이 비교적 고르다');
    expect(localizeDailyFortune(model, 'en').categories.overall.paragraphs[1]).toContain('major influences are comparatively even');
  });

  it('maps lucky colors to the required shared index and formats the hour per locale', () => {
    const model = generateDailyFortune(chart, transits, '2026-08-05');
    const ko = localizeDailyFortune(model, 'ko');
    const en = localizeDailyFortune(model, 'en');
    const koColors = ['본 아이보리', '샴페인 골드', '딥 코발트', '코퍼', '세이지', '스모크 블루', '펄 그레이'];
    const enColors = ['Bone ivory', 'Champagne gold', 'Deep cobalt', 'Copper', 'Sage', 'Smoke blue', 'Pearl gray'];

    expect(ko.lucky.color).toBe(koColors[model.lucky.colorIndex]);
    expect(en.lucky.color).toBe(enColors[model.lucky.colorIndex]);
    expect(ko.lucky.time).toBe(`${model.lucky.hour}:00`);
    expect(en.lucky.time).toMatch(/^(9|10|11|12|1|2|3|4|5|6|7|8):00 (AM|PM)$/);
  });
});
