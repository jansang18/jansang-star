import type { NatalChartData } from '../astrology/types';
import { CATEGORY_LABELS, FORTUNE_COPY, LUCKY_COLORS } from './copy.ko';
import { ASPECT_TONE, CATEGORY_PLANETS, PLANET_WEIGHT, type FortuneCategory } from './rules';
import type { TransitData } from './transits';

export type CategoryFortune = { label: string; score: number; summary: string };
export type DailyFortune = {
  date: string;
  overallScore: number;
  headline: string;
  categories: Record<FortuneCategory, CategoryFortune>;
  lucky: { color: string; number: number; time: string; advice: string };
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function clamp(value: number): number { return Math.max(0, Math.min(100, Math.round(value))); }

function scoreCategory(category: FortuneCategory, transits: TransitData, seed: number): number {
  let score = 68 + ((seed % 9) - 4);
  for (const aspect of transits.aspects) {
    if (!CATEGORY_PLANETS[category].includes(aspect.to)) continue;
    const exactness = 1 - aspect.orb / aspect.maxOrb;
    score += ASPECT_TONE[aspect.type] * PLANET_WEIGHT[aspect.from] * exactness * 14;
  }
  return clamp(score);
}

function copyFor(category: FortuneCategory, score: number, seed: number): string {
  const band = score >= 78 ? 'high' : score >= 55 ? 'medium' : 'low';
  const options = FORTUNE_COPY[category][band];
  return options[seed % options.length];
}

export function generateDailyFortune(chart: NatalChartData, transits: TransitData, date: string): DailyFortune {
  const chartSignature = Object.values(chart.planets).map((planet) => Math.round(planet.longitude * 100)).join('-');
  const baseSeed = hashSeed(`${date}:${chartSignature || 'empty'}`);
  const keys: FortuneCategory[] = ['overall', 'love', 'money', 'career', 'health'];
  const categories = {} as Record<FortuneCategory, CategoryFortune>;
  keys.forEach((category, index) => {
    const seed = hashSeed(`${baseSeed}:${category}:${index}`);
    const score = scoreCategory(category, transits, seed);
    categories[category] = { label: CATEGORY_LABELS[category], score, summary: copyFor(category, score, seed) };
  });
  const overallScore = categories.overall.score;
  const headline = overallScore >= 78 ? '자신의 빛을 감추지 않아도 되는 날' : overallScore >= 55 ? '천천히 살피면 길이 선명해지는 날' : '속도를 낮추고 내면의 리듬을 지킬 날';
  const luckySeed = hashSeed(`${baseSeed}:lucky`);
  return {
    date, overallScore, headline, categories,
    lucky: {
      color: LUCKY_COLORS[luckySeed % LUCKY_COLORS.length],
      number: (luckySeed % 9) + 1,
      time: `${9 + (luckySeed % 12)}:00`,
      advice: overallScore >= 65 ? '마음이 끌리는 제안에 한 번 더 귀 기울여 보세요.' : '중요한 결정 전에 열 번 천천히 호흡해 보세요.',
    },
  };
}
