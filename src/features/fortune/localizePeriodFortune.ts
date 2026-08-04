import { categoryName } from '../../i18n/astrologyTerms';
import { formatLocalDate, formatPeriodLabel } from '../../i18n/formatters';
import { formatLocaleNumber } from '../../i18n/numberFormat';
import type { Locale } from '../../i18n/types';
import type { FortuneCategory } from './rules';
import { PERIOD_COPY_EN } from './periodCopy.en';
import { PERIOD_COPY_KO, type PeriodCopy } from './periodCopy.ko';
import type { PeriodFortune, PeriodTone } from './periodFortune';

export type LocalizedPeriodCategory = { label: string; score: number; tone: PeriodTone };
export type LocalizedPeriodPoint = { date: string; label: string; score: number; tone: PeriodTone };
export type LocalizedPeriodDetail = {
  id: string;
  label: string;
  title: string;
  summary: string;
  score: number;
  tone: PeriodTone;
  paragraphs: string[];
  evidenceLabels: string[];
};

export type LocalizedPeriodFortune = {
  period: PeriodFortune['period'];
  label: string;
  headline: string;
  overallScore: number;
  categories: Record<FortuneCategory, LocalizedPeriodCategory>;
  overview: string[];
  categoryStrategies: Record<FortuneCategory, string[]>;
  timeline: LocalizedPeriodPoint[];
  segments: LocalizedPeriodDetail[];
  quarters: LocalizedPeriodDetail[];
  opportunity: string;
  caution: string;
  ui: PeriodCopy['ui'];
};

const CATEGORY_KEYS: FortuneCategory[] = ['overall', 'love', 'money', 'career', 'health'];
const FOCUSED_CATEGORY_KEYS: FortuneCategory[] = ['love', 'money', 'career', 'health'];

function copyFor(locale: Locale): PeriodCopy {
  return locale === 'ko' ? PERIOD_COPY_KO : PERIOD_COPY_EN;
}

function toneFor(score: number): PeriodTone {
  return score >= 74 ? 'flow' : score >= 55 ? 'steady' : 'care';
}

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreText(score: number, locale: Locale): string {
  return formatLocaleNumber(score, locale);
}

function categoryExtreme(model: PeriodFortune, direction: 'strongest' | 'softest'): FortuneCategory {
  return FOCUSED_CATEGORY_KEYS.reduce((selected, category) => {
    const current = model.categories[selected];
    const candidate = model.categories[category];
    return direction === 'strongest' ? candidate > current ? category : selected : candidate < current ? category : selected;
  });
}

function directionFor(first: number, last: number): 'up' | 'down' | 'even' {
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'even';
}

export function localizePeriodFortune(model: PeriodFortune, locale: Locale): LocalizedPeriodFortune {
  const copy = copyFor(locale);
  const label = formatPeriodLabel(model.period, model.anchorDate, locale);
  const overallTone = toneFor(model.overallScore);
  const timeline: LocalizedPeriodPoint[] = model.timeline.map((point) => ({
    ...point,
    label: formatLocalDate(point.date, locale),
  }));
  const strongestPoint = timeline[model.strongestIndex];
  const softestPoint = timeline[model.softestIndex];
  const strongestCategory = categoryExtreme(model, 'strongest');
  const softestCategory = categoryExtreme(model, 'softest');
  const strongestCategoryLabel = categoryName(strongestCategory, locale);
  const categories = Object.fromEntries(CATEGORY_KEYS.map((category) => {
    const score = model.categories[category];
    return [category, { label: categoryName(category, locale), score, tone: toneFor(score) }];
  })) as Record<FortuneCategory, LocalizedPeriodCategory>;
  const categoryStrategies = Object.fromEntries(CATEGORY_KEYS.map((category) => {
    const { label: categoryLabel, score, tone } = categories[category];
    const localizedTone = copy.toneLabels[tone];
    return [category, [
      copy.strategy.intensity(categoryLabel, scoreText(score, locale), localizedTone),
      copy.strategy.opportunity(categoryLabel, localizedTone),
      copy.strategy.caution(categoryLabel, localizedTone),
      copy.strategy.action(categoryLabel, localizedTone),
    ]];
  })) as Record<FortuneCategory, string[]>;

  const overview = [
    copy.overview.overall(label, scoreText(model.overallScore, locale), copy.toneLabels[overallTone]),
    copy.overview.strongestCategory(strongestCategoryLabel, scoreText(model.categories[strongestCategory], locale)),
    copy.overview.softestCategory(categoryName(softestCategory, locale), scoreText(model.categories[softestCategory], locale)),
    copy.overview.risingWindow(strongestPoint.label, scoreText(strongestPoint.score, locale)),
    copy.overview.cautionWindow(softestPoint.label, scoreText(softestPoint.score, locale)),
  ];

  if (model.period === 'year') {
    const firstHalfScore = average(model.timeline.slice(0, 6).map((point) => point.score));
    const secondHalfScore = average(model.timeline.slice(6).map((point) => point.score));
    overview.push(
      copy.overview.firstHalf(scoreText(firstHalfScore, locale), copy.toneLabels[toneFor(firstHalfScore)]),
      copy.overview.secondHalf(scoreText(secondHalfScore, locale), copy.toneLabels[toneFor(secondHalfScore)]),
    );
  }

  overview.push(
    copy.overview.rhythm(strongestPoint.label, softestPoint.label),
    copy.overview.action(strongestCategoryLabel, strongestPoint.label),
  );

  const segmentCopy = copy.segment[model.period];
  const segments = timeline.map((point) => {
    const localizedTone = copy.toneLabels[point.tone];
    const score = scoreText(point.score, locale);
    return {
      id: `${model.period}-segment-${point.date}`,
      label: point.label,
      title: segmentCopy.title(point.label),
      summary: segmentCopy.summary(point.label, score, localizedTone),
      score: point.score,
      tone: point.tone,
      paragraphs: [
        segmentCopy.experience(point.label, score, localizedTone),
        segmentCopy.use(point.label, localizedTone),
        segmentCopy.caution(point.label, localizedTone),
      ],
      evidenceLabels: [copy.evidence(point.label, score)],
    };
  });

  const quarters = model.period === 'year'
    ? Array.from({ length: 4 }, (_, index): LocalizedPeriodDetail => {
      const points = timeline.slice(index * 3, index * 3 + 3);
      const score = average(points.map((point) => point.score));
      const tone = toneFor(score);
      const quarterLabel = copy.quarter.label(index + 1);
      const localizedTone = copy.toneLabels[tone];
      return {
        id: `year-quarter-${index + 1}`,
        label: quarterLabel,
        title: copy.quarter.title(quarterLabel),
        summary: copy.quarter.summary(quarterLabel, scoreText(score, locale), localizedTone),
        score,
        tone,
        paragraphs: [
          copy.quarter.flow(quarterLabel, scoreText(score, locale), localizedTone),
          copy.quarter.focus(quarterLabel, strongestCategoryLabel),
          copy.quarter.turning(quarterLabel, directionFor(points[0].score, points[2].score)),
          copy.quarter.action(quarterLabel, strongestCategoryLabel, localizedTone),
        ],
        evidenceLabels: points.map((point) => copy.evidence(point.label, scoreText(point.score, locale))),
      };
    })
    : [];

  return {
    period: model.period,
    label,
    headline: copy.headlines[model.period][overallTone](label),
    overallScore: model.overallScore,
    categories,
    overview,
    categoryStrategies,
    timeline,
    segments,
    quarters,
    opportunity: copy.window.opportunity(strongestPoint.label, scoreText(strongestPoint.score, locale)),
    caution: copy.window.caution(softestPoint.label, scoreText(softestPoint.score, locale)),
    ui: copy.ui,
  };
}
