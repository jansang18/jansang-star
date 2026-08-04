import { describe, expect, it } from 'vitest';
import type { DailyFortune } from './generateFortune';
import { localizePeriodFortune } from './localizePeriodFortune';
import { summarizePeriodFortune } from './periodFortune';

const categoryScores = (score: number) => ({
  overall: { score },
  love: { score: Math.max(0, score - 2) },
  money: { score: Math.min(100, score + 1) },
  career: { score: Math.min(100, score + 4) },
  health: { score: Math.max(0, score - 5) },
});

const fortune = (score: number) => ({
  overallScore: score,
  categories: categoryScores(score),
}) as unknown as DailyFortune;

const monthModel = summarizePeriodFortune('month', '2026-08-05', [60, 78, 55, 82, 66].map(fortune));
const yearModel = summarizePeriodFortune(
  'year',
  '2026-08-05',
  [42, 51, 59, 64, 70, 75, 81, 77, 68, 62, 56, 49].map(fortune),
);

describe('localizePeriodFortune', () => {
  it('creates the approved monthly and yearly detail in both languages', () => {
    for (const locale of ['ko', 'en'] as const) {
      const month = localizePeriodFortune(monthModel, locale);
      const year = localizePeriodFortune(yearModel, locale);

      expect(month.overview).toHaveLength(7);
      expect(Object.values(month.categoryStrategies)).toHaveLength(5);
      expect(Object.values(month.categoryStrategies).every((items) => items.length === 4)).toBe(true);
      expect(month.segments).toHaveLength(5);
      expect(month.segments.every((segment) => segment.paragraphs.length === 3)).toBe(true);
      expect(month.quarters).toHaveLength(0);
      expect(year.overview).toHaveLength(9);
      expect(year.quarters).toHaveLength(4);
      expect(year.quarters.every((quarter) => quarter.paragraphs.length === 4)).toBe(true);
      expect(year.segments).toHaveLength(12);
      expect(year.segments.every((segment) => segment.paragraphs.length === 3)).toBe(true);
    }
  });

  it('formats every period and sample date through the active locale', () => {
    const ko = localizePeriodFortune(monthModel, 'ko');
    const en = localizePeriodFortune(monthModel, 'en');

    expect(ko.label).toBe('2026년 8월');
    expect(en.label).toBe('August 2026');
    expect(ko.timeline[0].label).toBe('2026년 8월 1일');
    expect(en.timeline[0].label).toBe('August 1, 2026');
    expect(ko.segments.map((segment) => segment.label)).toEqual(ko.timeline.map((point) => point.label));
    expect(en.segments.map((segment) => segment.label)).toEqual(en.timeline.map((point) => point.label));
  });

  it('authors each language separately while preserving score and date evidence', () => {
    const ko = localizePeriodFortune(monthModel, 'ko');
    const en = localizePeriodFortune(monthModel, 'en');

    expect(ko.headline).toMatch(/[가-힣]/);
    expect(en.headline).toMatch(/month/i);
    expect(JSON.stringify(en)).not.toMatch(/[가-힣]/);
    expect(en.categories.career.label).toBe('Career');
    expect(ko.timeline.map(({ date, score, tone }) => ({ date, score, tone }))).toEqual(
      en.timeline.map(({ date, score, tone }) => ({ date, score, tone })),
    );
    expect(ko.opportunity).toContain('2026년 8월 22일');
    expect(en.opportunity).toContain('August 22, 2026');
    expect(ko.opportunity).toContain('82');
    expect(en.opportunity).toContain('82');
    expect(ko.caution).toContain('2026년 8월 15일');
    expect(en.caution).toContain('August 15, 2026');
    expect(ko.segments[3].score).toBe(en.segments[3].score);
  });
});
