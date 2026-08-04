import { Temporal } from '@js-temporal/polyfill';
import type { DailyFortune } from './generateFortune';
import type { FortuneCategory } from './rules';

export type FortunePeriod = 'month' | 'year';
export type PeriodTone = 'flow' | 'steady' | 'care';
export type PeriodFortune = {
  period: FortunePeriod;
  anchorDate: string;
  overallScore: number;
  categories: Record<FortuneCategory, number>;
  timeline: Array<{ date: string; score: number; tone: PeriodTone }>;
  strongestIndex: number;
  softestIndex: number;
};

const CATEGORY_KEYS: FortuneCategory[] = ['overall', 'love', 'money', 'career', 'health'];

export function monthSampleDates(date: string): string[] {
  const current = Temporal.PlainDate.from(date);
  const lastDay = current.daysInMonth;
  return [1, 8, 15, 22, lastDay].map((day) => current.with({ day }).toString());
}

export function yearSampleDates(date: string): string[] {
  const current = Temporal.PlainDate.from(date);
  return Array.from({ length: 12 }, (_, month) => current.with({ month: month + 1, day: 15 }).toString());
}

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function toneFor(score: number): PeriodTone {
  return score >= 74 ? 'flow' : score >= 55 ? 'steady' : 'care';
}

function extremeIndex(scores: number[], compare: (candidate: number, current: number) => boolean): number {
  return scores.reduce((selected, score, index) => compare(score, scores[selected]) ? index : selected, 0);
}

export function summarizePeriodFortune(period: FortunePeriod, anchorDate: string, samples: DailyFortune[]): PeriodFortune {
  const dates = period === 'month' ? monthSampleDates(anchorDate) : yearSampleDates(anchorDate);
  if (samples.length !== dates.length) {
    throw new Error(`Expected ${dates.length} daily samples for a ${period} period, received ${samples.length}.`);
  }

  const categories = Object.fromEntries(CATEGORY_KEYS.map((key) => [
    key,
    average(samples.map((sample) => sample.categories[key].score)),
  ])) as Record<FortuneCategory, number>;
  const scores = samples.map((sample) => sample.overallScore);

  return {
    period,
    anchorDate,
    overallScore: categories.overall,
    categories,
    timeline: samples.map((sample, index) => ({
      date: dates[index],
      score: sample.overallScore,
      tone: toneFor(sample.overallScore),
    })),
    strongestIndex: extremeIndex(scores, (candidate, current) => candidate > current),
    softestIndex: extremeIndex(scores, (candidate, current) => candidate < current),
  };
}
