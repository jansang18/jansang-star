import { Temporal } from '@js-temporal/polyfill';
import type { DailyFortune } from './generateFortune';
import type { FortuneCategory } from './rules';

export type FortunePeriod = 'month' | 'year';
export type PeriodFortune = {
  period: FortunePeriod;
  label: string;
  overallScore: number;
  headline: string;
  narrative: string[];
  categories: Record<FortuneCategory, number>;
  timeline: Array<{ label: string; score: number; tone: 'flow' | 'steady' | 'care' }>;
  opportunity: string;
  caution: string;
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
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

export function summarizePeriodFortune(period: FortunePeriod, label: string, samples: DailyFortune[]): PeriodFortune {
  if (!samples.length) throw new Error('기간 운세를 만들 표본이 없습니다.');
  const categories = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, average(samples.map((sample) => sample.categories[key].score))])) as Record<FortuneCategory, number>;
  const timeline = samples.map((sample, index) => ({
    label: period === 'month' ? `${index + 1}주` : `${index + 1}월`,
    score: sample.overallScore,
    tone: sample.overallScore >= 74 ? 'flow' as const : sample.overallScore >= 55 ? 'steady' as const : 'care' as const,
  }));
  const strongest = [...timeline].sort((a, b) => b.score - a.score)[0];
  const softest = [...timeline].sort((a, b) => a.score - b.score)[0];
  const span = period === 'month' ? '이번 달' : '올해';
  const headline = categories.overall >= 74 ? `${span}, 확장의 파동을 타는 시기` : categories.overall >= 55 ? `${span}, 리듬을 다듬으며 전진하는 시기` : `${span}, 기반을 지키며 다음 흐름을 준비할 시기`;
  return {
    period, label, overallScore: categories.overall, headline, categories, timeline,
    narrative: [
      `${label}의 전체 흐름은 ${categories.overall}점으로, 한 번의 큰 사건보다 시기별 강약을 읽는 것이 중요합니다.`,
      `연애 ${categories.love}점, 재물 ${categories.money}점, 직업 ${categories.career}점, 건강 ${categories.health}점의 균형을 보이며 가장 높은 분야를 우선 활용할수록 체감 운이 좋아집니다.`,
      `${strongest.label}에는 미뤄둔 제안과 결정을 앞으로 당기고, ${softest.label}에는 일정과 지출을 여유 있게 잡아 변수를 흡수하세요.`,
      `좋은 흐름은 준비된 선택에서 커지고 낮은 흐름은 속도를 조절하라는 신호이므로, 점수 자체보다 행동의 타이밍에 집중하는 편이 좋습니다.`,
    ],
    opportunity: `${strongest.label} · 흐름 점수 ${strongest.score} — 시작, 제안, 중요한 만남을 배치하기 좋은 구간`,
    caution: `${softest.label} · 흐름 점수 ${softest.score} — 과로, 충동 지출, 성급한 결론을 줄일 구간`,
  };
}
