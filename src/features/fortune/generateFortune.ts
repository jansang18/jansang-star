import type { NatalChartData } from '../astrology/types';
import { CATEGORY_LABELS, FORTUNE_COPY, LUCKY_COLORS } from './copy.ko';
import { ASPECT_TONE, CATEGORY_PLANETS, PLANET_WEIGHT, type FortuneCategory } from './rules';
import type { TransitData } from './transits';
import type { Aspect } from './aspects';

export type CategoryFortune = { label: string; score: number; summary: string; paragraphs: string[]; signals: string[] };
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

const PLANET_NAMES = { sun: '태양', moon: '달', mercury: '수성', venus: '금성', mars: '화성', jupiter: '목성', saturn: '토성', uranus: '천왕성', neptune: '해왕성', pluto: '명왕성' } as const;
const ASPECT_NAMES = { conjunction: '합', sextile: '육각', square: '사각', trine: '삼각', opposition: '대립' } as const;

function relevantAspects(category: FortuneCategory, transits: TransitData): Aspect[] {
  return transits.aspects
    .filter((aspect) => CATEGORY_PLANETS[category].includes(aspect.to))
    .sort((left, right) => left.orb - right.orb)
    .slice(0, 2);
}

function signalCopy(aspects: Aspect[]): string[] {
  if (!aspects.length) return ['주요 행성 흐름이 비교적 고른 날'];
  return aspects.map((aspect) => `${PLANET_NAMES[aspect.from]}–${PLANET_NAMES[aspect.to]} ${ASPECT_NAMES[aspect.type]} · 오브 ${aspect.orb.toFixed(1)}°`);
}

function detailCopy(category: FortuneCategory, score: number, summary: string, aspects: Aspect[]): string[] {
  const positive = score >= 65;
  const evidence = aspects.length
    ? `${PLANET_NAMES[aspects[0].from]}과 ${PLANET_NAMES[aspects[0].to]}의 ${ASPECT_NAMES[aspects[0].type]} 흐름이 오늘의 ${CATEGORY_LABELS[category]}에 가장 선명하게 닿습니다.`
    : `강하게 치우친 각보다 고른 행성 리듬이 오늘의 ${CATEGORY_LABELS[category]}를 받치고 있습니다.`;
  const experience = positive
    ? '평소보다 판단의 중심이 또렷해져, 작은 선택에서도 자신다운 기준을 세우기 쉽습니다.'
    : '마음이 먼저 달리거나 반대로 결정을 미루고 싶을 수 있으니, 그 반응 자체를 나쁜 신호로 단정하지 마세요.';
  const opportunity = positive
    ? '오전에는 방향을 정하고 오후에는 한 가지 행동으로 옮길 때 흐름을 가장 효율적으로 사용할 수 있습니다.'
    : '새로운 일을 벌이기보다 이미 가진 일정과 관계를 정돈하면 뜻밖의 여유와 해결책이 보입니다.';
  const caution = score >= 78
    ? '다만 자신감이 충분한 날일수록 상대의 속도와 현실적인 조건을 한 번 더 확인해야 성과가 오래갑니다.'
    : score >= 55
      ? '애매한 약속이나 즉흥적인 결론은 피하고, 중요한 내용은 짧게라도 기록으로 남겨두는 편이 좋습니다.'
      : '피로한 상태에서 내린 결론은 필요 이상으로 단호해질 수 있으므로 큰 결정은 하루 정도 유예해도 좋습니다.';
  const action = `오늘의 실천은 ‘${positive ? '가장 중요한 한 가지를 먼저 끝내기' : '해야 할 일을 세 가지 이하로 줄이기'}’입니다.`;
  if (category === 'overall') return [summary, evidence, experience, opportunity, caution, action];
  return [summary, evidence, `${opportunity} ${caution}`, action];
}

export function generateDailyFortune(chart: NatalChartData, transits: TransitData, date: string): DailyFortune {
  const chartSignature = Object.values(chart.planets).map((planet) => Math.round(planet.longitude * 100)).join('-');
  const baseSeed = hashSeed(`${date}:${chartSignature || 'empty'}`);
  const keys: FortuneCategory[] = ['overall', 'love', 'money', 'career', 'health'];
  const categories = {} as Record<FortuneCategory, CategoryFortune>;
  keys.forEach((category, index) => {
    const seed = hashSeed(`${baseSeed}:${category}:${index}`);
    const score = scoreCategory(category, transits, seed);
    const summary = copyFor(category, score, seed);
    const aspects = relevantAspects(category, transits);
    categories[category] = {
      label: CATEGORY_LABELS[category], score, summary,
      paragraphs: detailCopy(category, score, summary, aspects),
      signals: signalCopy(aspects),
    };
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
