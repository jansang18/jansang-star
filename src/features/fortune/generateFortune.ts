import type { NatalChartData } from '../astrology/types';
import { ASPECT_TONE, CATEGORY_PLANETS, PLANET_WEIGHT, type FortuneCategory } from './rules';
import type { TransitData } from './transits';
import type { Aspect } from './aspects';

export type FortuneBand = 'high' | 'medium' | 'low';
export type CategoryFortuneModel = { score: number; band: FortuneBand; variant: number; evidence: Aspect[] };
export type DailyFortune = {
  date: string;
  overallScore: number;
  categories: Record<FortuneCategory, CategoryFortuneModel>;
  lucky: { colorIndex: number; number: number; hour: number; adviceBand: FortuneBand };
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

function bandFor(score: number): FortuneBand {
  return score >= 78 ? 'high' : score >= 55 ? 'medium' : 'low';
}

function relevantAspects(category: FortuneCategory, transits: TransitData): Aspect[] {
  return transits.aspects
    .filter((aspect) => CATEGORY_PLANETS[category].includes(aspect.to))
    .sort((left, right) => left.orb - right.orb)
    .slice(0, 2);
}

export function generateDailyFortune(chart: NatalChartData, transits: TransitData, date: string): DailyFortune {
  const chartSignature = Object.values(chart.planets).map((planet) => Math.round(planet.longitude * 100)).join('-');
  const baseSeed = hashSeed(`${date}:${chartSignature || 'empty'}`);
  const keys: FortuneCategory[] = ['overall', 'love', 'money', 'career', 'health'];
  const categories = {} as Record<FortuneCategory, CategoryFortuneModel>;
  keys.forEach((category, index) => {
    const seed = hashSeed(`${baseSeed}:${category}:${index}`);
    const score = scoreCategory(category, transits, seed);
    categories[category] = {
      score,
      band: bandFor(score),
      variant: seed % 2,
      evidence: relevantAspects(category, transits),
    };
  });
  const overallScore = categories.overall.score;
  const luckySeed = hashSeed(`${baseSeed}:lucky`);
  return {
    date, overallScore, categories,
    lucky: {
      colorIndex: luckySeed % 7,
      number: (luckySeed % 9) + 1,
      hour: 9 + (luckySeed % 12),
      adviceBand: overallScore >= 65 ? 'high' : overallScore >= 55 ? 'medium' : 'low',
    },
  };
}
