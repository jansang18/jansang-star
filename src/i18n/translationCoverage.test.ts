import { describe, expect, expectTypeOf, it } from 'vitest';
import { DAILY_FORTUNE_COPY_EN } from '../features/fortune/copy.en';
import { DAILY_FORTUNE_COPY_KO } from '../features/fortune/copy.ko';
import type { DailyFortune } from '../features/fortune/generateFortune';
import { localizeDailyFortune } from '../features/fortune/localizeDailyFortune';
import { localizePeriodFortune } from '../features/fortune/localizePeriodFortune';
import { PERIOD_COPY_EN } from '../features/fortune/periodCopy.en';
import { PERIOD_COPY_KO } from '../features/fortune/periodCopy.ko';
import type { PeriodFortune } from '../features/fortune/periodFortune';
import { READING_COPY_EN } from '../features/readings/copy.en';
import { READING_COPY_KO } from '../features/readings/copy.ko';
import { renderDetailedReading } from '../features/readings/renderDetailedReading';
import type { DetailedReadingModel } from '../features/readings/types';
import { safeAuthoredCopy } from './authoredCopy';
import { TRANSLATIONS, translate, type TranslationKey } from './translations';

type Leaf = { path: string; value: unknown };

function copyLeaves(value: unknown, path = ''): Leaf[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => copyLeaves(entry, `${path}[${index}]`));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) => copyLeaves(entry, path ? `${path}.${key}` : key));
  }
  return [{ path, value }];
}

function expectAuthoredParity(korean: unknown, english: unknown): void {
  const koLeaves = copyLeaves(korean).sort((left, right) => left.path.localeCompare(right.path));
  const enLeaves = copyLeaves(english).sort((left, right) => left.path.localeCompare(right.path));

  expect(koLeaves.map(({ path }) => path)).toEqual(enLeaves.map(({ path }) => path));
  for (const { path, value } of koLeaves) {
    const englishValue = enLeaves.find((entry) => entry.path === path)?.value;
    expect(typeof value, `ko:${path}`).toBe(typeof englishValue);
    if (typeof value === 'string') {
      expect(value.trim(), `ko:${path}`).not.toBe('');
      expect((englishValue as string).trim(), `en:${path}`).not.toBe('');
    } else {
      expect(typeof value, `ko:${path}`).toBe('function');
      expect(typeof englishValue, `en:${path}`).toBe('function');
    }
  }
}

const category = { score: 60, band: 'medium' as const, variant: 0, evidence: [] };
const dailyModel: DailyFortune = {
  date: '2026-08-05',
  overallScore: 60,
  categories: { overall: category, love: category, money: category, career: category, health: category },
  lucky: { colorIndex: 0, number: 1, hour: 9, adviceBand: 'medium' },
};
const periodModel: PeriodFortune = {
  period: 'month',
  anchorDate: '2026-08-05',
  overallScore: 60,
  categories: { overall: 60, love: 60, money: 60, career: 60, health: 60 },
  timeline: [
    { date: '2026-08-01', score: 60, tone: 'steady' },
    { date: '2026-08-08', score: 62, tone: 'steady' },
  ],
  strongestIndex: 1,
  softestIndex: 0,
};
const detailedModel: DetailedReadingModel = {
  bigThree: [{
    id: 'bigThree:sun',
    section: 'bigThree',
    subject: 'sun',
    evidence: [],
    sentences: [{ key: 'bigThree.role', params: { point: 'sun' } }],
  }],
  planets: [],
  houses: [],
  aspects: [],
  transits: [],
  unavailable: [],
};
const localeCases = [
  { locale: 'ko' as const, generic: '이 내용을 표시할 수 없습니다.' },
  { locale: 'en' as const, generic: 'Content is unavailable.' },
];

describe('translation coverage', () => {
  it('has a non-empty authored value for every UI key in both languages', () => {
    const keys = Object.keys(TRANSLATIONS.ko) as TranslationKey[];
    expect(keys.sort()).toEqual(Object.keys(TRANSLATIONS.en).sort());
    for (const key of keys) {
      expect(TRANSLATIONS.ko[key].trim(), `ko:${key}`).not.toBe('');
      expect(TRANSLATIONS.en[key].trim(), `en:${key}`).not.toBe('');
    }
  });

  it('keeps the complete detailed natal copy map authored in both languages', () => {
    expectAuthoredParity(READING_COPY_KO, READING_COPY_EN);
  });

  it('keeps the complete daily copy map authored in both languages', () => {
    expectAuthoredParity(DAILY_FORTUNE_COPY_KO, DAILY_FORTUNE_COPY_EN);
  });

  it('keeps the complete period copy map authored in both languages', () => {
    expectAuthoredParity(PERIOD_COPY_KO, PERIOD_COPY_EN);
  });

  it('uses the current locale generic UI message when an authored UI value is missing', () => {
    for (const [locale, expected, opposite] of [
      ['ko', '이 내용을 표시할 수 없습니다.', TRANSLATIONS.en['brand.name']],
      ['en', 'Content is unavailable.', TRANSLATIONS.ko['brand.name']],
    ] as const) {
      const mutable = TRANSLATIONS[locale] as unknown as Record<string, string | undefined>;
      const saved = mutable['brand.name'];
      delete mutable['brand.name'];
      try {
        expect(translate(locale, 'brand.name')).toBe(expected);
        expect(translate(locale, 'brand.name')).not.toBe(opposite);
      } finally {
        mutable['brand.name'] = saved;
      }
    }
  });

  it.each(localeCases)('uses the $locale generic detail message when authored detailed copy is missing', ({ locale, generic }) => {
    const current = locale === 'ko' ? READING_COPY_KO : READING_COPY_EN;
    const opposite = locale === 'ko' ? READING_COPY_EN : READING_COPY_KO;
    const mutable = current as unknown as Record<string, ((params: unknown) => string) | undefined>;
    const saved = mutable['bigThree.role'];
    delete mutable['bigThree.role'];
    try {
      const summary = renderDetailedReading(detailedModel, locale).sections[0].blocks[0].summary;
      expect(summary).toBe(generic);
      expect(summary).not.toBe(opposite['bigThree.role']({ point: 'sun' }));
    } finally {
      mutable['bigThree.role'] = saved;
    }
  });

  it.each(localeCases)('uses the $locale generic daily message when authored daily copy is missing', ({ locale, generic }) => {
    const current = locale === 'ko' ? DAILY_FORTUNE_COPY_KO : DAILY_FORTUNE_COPY_EN;
    const opposite = locale === 'ko' ? DAILY_FORTUNE_COPY_EN : DAILY_FORTUNE_COPY_KO;
    const summaries = current.overall.summaries.medium as unknown as Array<string | undefined>;
    const saved = summaries[0];
    delete summaries[0];
    try {
      const summary = localizeDailyFortune(dailyModel, locale).categories.overall.summary;
      expect(summary).toBe(generic);
      expect(summary).not.toBe(opposite.overall.summaries.medium[0]);
    } finally {
      summaries[0] = saved;
    }
  });

  it.each(localeCases)('uses the $locale generic period message when authored period copy is missing', ({ locale, generic }) => {
    const current = locale === 'ko' ? PERIOD_COPY_KO : PERIOD_COPY_EN;
    const opposite = locale === 'ko' ? PERIOD_COPY_EN : PERIOD_COPY_KO;
    const headlines = current.headlines.month as unknown as Record<string, ((label: string) => string) | undefined>;
    const saved = headlines.steady;
    delete headlines.steady;
    try {
      const headline = localizePeriodFortune(periodModel, locale).headline;
      expect(headline).toBe(generic);
      expect(headline).not.toBe(opposite.headlines.month.steady('opposite locale'));
    } finally {
      headlines.steady = saved;
    }
  });

  it('preserves authored function parameter tuples and a string return type', () => {
    const rendered = safeAuthoredCopy('en', (score: number, tone: 'flow' | 'care') => `${score}:${tone}`, 72, 'flow');
    expect(rendered).toBe('72:flow');
    expectTypeOf(rendered).toEqualTypeOf<string>();

    if (false) {
      // @ts-expect-error Authored copy must retain the exact score parameter type.
      safeAuthoredCopy('en', (score: number) => String(score), '72');
      // @ts-expect-error Authored copy must retain the exact function arity.
      safeAuthoredCopy('en', (score: number, tone: string) => `${score}:${tone}`, 72);
    }
  });
});
