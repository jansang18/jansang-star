import { categoryName } from '../../i18n/astrologyTerms';
import { formatLocalDate, formatPeriodLabel } from '../../i18n/formatters';
import { formatLocaleNumber } from '../../i18n/numberFormat';
import type { Locale } from '../../i18n/types';
import { safeAuthoredCopy } from '../../i18n/authoredCopy';
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
    const localizedTone = safeAuthoredCopy(locale, copy.toneLabels?.[tone]);
    return [category, [
      safeAuthoredCopy(locale, copy.strategy?.intensity, categoryLabel, scoreText(score, locale), localizedTone),
      safeAuthoredCopy(locale, copy.strategy?.opportunity, categoryLabel, localizedTone),
      safeAuthoredCopy(locale, copy.strategy?.caution, categoryLabel, localizedTone),
      safeAuthoredCopy(locale, copy.strategy?.action, categoryLabel, localizedTone),
    ]];
  })) as Record<FortuneCategory, string[]>;

  const overview = [
    safeAuthoredCopy(locale, copy.overview?.overall, label, scoreText(model.overallScore, locale), safeAuthoredCopy(locale, copy.toneLabels?.[overallTone])),
    safeAuthoredCopy(locale, copy.overview?.strongestCategory, strongestCategoryLabel, scoreText(model.categories[strongestCategory], locale)),
    safeAuthoredCopy(locale, copy.overview?.softestCategory, categoryName(softestCategory, locale), scoreText(model.categories[softestCategory], locale)),
    safeAuthoredCopy(locale, copy.overview?.risingWindow, strongestPoint.label, scoreText(strongestPoint.score, locale)),
    safeAuthoredCopy(locale, copy.overview?.cautionWindow, softestPoint.label, scoreText(softestPoint.score, locale)),
  ];

  if (model.period === 'year') {
    const firstHalfScore = average(model.timeline.slice(0, 6).map((point) => point.score));
    const secondHalfScore = average(model.timeline.slice(6).map((point) => point.score));
    overview.push(
      safeAuthoredCopy(locale, copy.overview?.firstHalf, scoreText(firstHalfScore, locale), safeAuthoredCopy(locale, copy.toneLabels?.[toneFor(firstHalfScore)])),
      safeAuthoredCopy(locale, copy.overview?.secondHalf, scoreText(secondHalfScore, locale), safeAuthoredCopy(locale, copy.toneLabels?.[toneFor(secondHalfScore)])),
    );
  }

  overview.push(
    safeAuthoredCopy(locale, copy.overview?.rhythm, strongestPoint.label, softestPoint.label),
    safeAuthoredCopy(locale, copy.overview?.action, strongestCategoryLabel, strongestPoint.label),
  );

  const segmentCopy = copy.segment?.[model.period];
  const segments = timeline.map((point) => {
    const localizedTone = safeAuthoredCopy(locale, copy.toneLabels?.[point.tone]);
    const score = scoreText(point.score, locale);
    return {
      id: `${model.period}-segment-${point.date}`,
      label: point.label,
      title: safeAuthoredCopy(locale, segmentCopy?.title, point.label),
      summary: safeAuthoredCopy(locale, segmentCopy?.summary, point.label, score, localizedTone),
      score: point.score,
      tone: point.tone,
      paragraphs: [
        safeAuthoredCopy(locale, segmentCopy?.experience, point.label, score, localizedTone),
        safeAuthoredCopy(locale, segmentCopy?.use, point.label, localizedTone),
        safeAuthoredCopy(locale, segmentCopy?.caution, point.label, localizedTone),
      ],
      evidenceLabels: [safeAuthoredCopy(locale, copy.evidence, point.label, score)],
    };
  });

  const quarters = model.period === 'year'
    ? Array.from({ length: 4 }, (_, index): LocalizedPeriodDetail => {
      const points = timeline.slice(index * 3, index * 3 + 3);
      const score = average(points.map((point) => point.score));
      const tone = toneFor(score);
      const quarterLabel = safeAuthoredCopy(locale, copy.quarter?.label, index + 1);
      const localizedTone = safeAuthoredCopy(locale, copy.toneLabels?.[tone]);
      return {
        id: `year-quarter-${index + 1}`,
        label: quarterLabel,
        title: safeAuthoredCopy(locale, copy.quarter?.title, quarterLabel),
        summary: safeAuthoredCopy(locale, copy.quarter?.summary, quarterLabel, scoreText(score, locale), localizedTone),
        score,
        tone,
        paragraphs: [
          safeAuthoredCopy(locale, copy.quarter?.flow, quarterLabel, scoreText(score, locale), localizedTone),
          safeAuthoredCopy(locale, copy.quarter?.focus, quarterLabel, strongestCategoryLabel),
          safeAuthoredCopy(locale, copy.quarter?.turning, quarterLabel, directionFor(points[0].score, points[2].score)),
          safeAuthoredCopy(locale, copy.quarter?.action, quarterLabel, strongestCategoryLabel, localizedTone),
        ],
        evidenceLabels: points.map((point) => safeAuthoredCopy(locale, copy.evidence, point.label, scoreText(point.score, locale))),
      };
    })
    : [];

  return {
    period: model.period,
    label,
    headline: safeAuthoredCopy(locale, copy.headlines?.[model.period]?.[overallTone], label),
    overallScore: model.overallScore,
    categories,
    overview,
    categoryStrategies,
    timeline,
    segments,
    quarters,
    opportunity: safeAuthoredCopy(locale, copy.window?.opportunity, strongestPoint.label, scoreText(strongestPoint.score, locale)),
    caution: safeAuthoredCopy(locale, copy.window?.caution, softestPoint.label, scoreText(softestPoint.score, locale)),
    ui: {
      kicker: {
        month: safeAuthoredCopy(locale, copy.ui?.kicker?.month),
        year: safeAuthoredCopy(locale, copy.ui?.kicker?.year),
      },
      description: {
        month: safeAuthoredCopy(locale, copy.ui?.description?.month),
        year: safeAuthoredCopy(locale, copy.ui?.description?.year),
      },
      overview: safeAuthoredCopy(locale, copy.ui?.overview),
      strategies: safeAuthoredCopy(locale, copy.ui?.strategies),
      segments: {
        month: safeAuthoredCopy(locale, copy.ui?.segments?.month),
        year: safeAuthoredCopy(locale, copy.ui?.segments?.year),
      },
      quarters: safeAuthoredCopy(locale, copy.ui?.quarters),
      opportunity: safeAuthoredCopy(locale, copy.ui?.opportunity),
      caution: safeAuthoredCopy(locale, copy.ui?.caution),
      chartSuffix: safeAuthoredCopy(locale, copy.ui?.chartSuffix),
    },
  };
}
