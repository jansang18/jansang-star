import { aspectName, categoryName, planetName } from '../../i18n/astrologyTerms';
import { formatLocaleNumber } from '../../i18n/numberFormat';
import type { Locale } from '../../i18n/types';
import type { Aspect } from './aspects';
import { DAILY_FORTUNE_COPY_EN } from './copy.en';
import { DAILY_FORTUNE_COPY_KO, type DailyFortuneCopy } from './copy.ko';
import type { CategoryFortuneModel, DailyFortune } from './generateFortune';
import type { FortuneCategory } from './rules';

export type LocalizedCategoryFortune = {
  label: string;
  score: number;
  summary: string;
  paragraphs: string[];
  signals: string[];
};

export type LocalizedDailyFortune = {
  date: string;
  overallScore: number;
  headline: string;
  categories: Record<FortuneCategory, LocalizedCategoryFortune>;
  lucky: { color: string; number: number; time: string; advice: string };
  evidenceIds: string[];
};

const CATEGORY_KEYS: FortuneCategory[] = ['overall', 'love', 'money', 'career', 'health'];

function copyFor(locale: Locale): DailyFortuneCopy {
  return locale === 'ko' ? DAILY_FORTUNE_COPY_KO : DAILY_FORTUNE_COPY_EN;
}

function signalFor(aspect: Aspect, locale: Locale): string {
  const orb = formatLocaleNumber(Number(aspect.orb.toFixed(1)), locale);
  const orbLabel = locale === 'ko' ? `오브 ${orb}°` : `orb ${orb}°`;
  return `${planetName(aspect.from, locale)}–${planetName(aspect.to, locale)} · ${aspectName(aspect.type, locale)} · ${orbLabel}`;
}

function evidenceId(category: FortuneCategory, aspect: Aspect): string {
  return `${category}:${aspect.from}:${aspect.to}:${aspect.type}:${aspect.orb}`;
}

function localizedCategory(
  category: FortuneCategory,
  model: CategoryFortuneModel,
  locale: Locale,
  copy: DailyFortuneCopy,
): LocalizedCategoryFortune {
  const label = categoryName(category, locale);
  const signals = model.evidence.map((aspect) => signalFor(aspect, locale));
  const evidence = signals[0]
    ? copy.evidence.withAspect(label, signals[0])
    : copy.evidence.neutral(label);

  if (category === 'overall') {
    const summaryOptions = copy.overall.summaries[model.band];
    const summary = summaryOptions[model.variant % summaryOptions.length];
    const paragraphs = [
      summary,
      evidence,
      copy.overall.experience[model.band],
      copy.overall.morning[model.band],
      copy.overall.afternoon[model.band],
      copy.overall.caution[model.band],
      copy.overall.action[model.band],
    ];
    return { label, score: model.score, summary, paragraphs, signals: signals.length ? signals : [copy.evidence.neutralSignal] };
  }

  const focused = copy.focused[category];
  const summaryOptions = focused.summaries[model.band];
  const summary = summaryOptions[model.variant % summaryOptions.length];
  const paragraphs = [
    summary,
    evidence,
    focused.opportunity[model.band],
    focused.caution[model.band],
    focused.action[model.band],
  ];
  return { label, score: model.score, summary, paragraphs, signals: signals.length ? signals : [copy.evidence.neutralSignal] };
}

function localizedHour(hour: number, locale: Locale): string {
  if (locale === 'ko') return `${hour}:00`;
  const suffix = hour < 12 ? 'AM' : 'PM';
  const twelveHour = hour % 12 || 12;
  return `${twelveHour}:00 ${suffix}`;
}

export function localizeDailyFortune(model: DailyFortune, locale: Locale): LocalizedDailyFortune {
  const copy = copyFor(locale);
  const categories = Object.fromEntries(CATEGORY_KEYS.map((category) => [
    category,
    localizedCategory(category, model.categories[category], locale, copy),
  ])) as Record<FortuneCategory, LocalizedCategoryFortune>;

  return {
    date: model.date,
    overallScore: model.overallScore,
    headline: copy.headlines[model.categories.overall.band],
    categories,
    lucky: {
      color: copy.colors[model.lucky.colorIndex],
      number: model.lucky.number,
      time: localizedHour(model.lucky.hour, locale),
      advice: copy.advice[model.lucky.adviceBand],
    },
    evidenceIds: CATEGORY_KEYS.flatMap((category) => model.categories[category].evidence.map((aspect) => evidenceId(category, aspect))),
  };
}
