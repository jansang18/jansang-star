import type { PlanetId, ZodiacSign } from '../features/astrology/types';
import type { AspectType } from '../features/fortune/aspects';
import type { FortuneCategory } from '../features/fortune/rules';
import { formatLocaleNumber } from './numberFormat';
import type { Locale } from './types';

type PointId = 'sun' | 'moon' | 'ascendant';
type Motion = 'direct' | 'retrograde';
type ChartTextKey = 'chartTitle' | 'legend' | 'conjunction' | 'harmony' | 'tension' | 'axis' | 'placementSummary' | 'placements' | 'planet' | 'zodiacPosition' | 'house' | 'status' | 'unknownTime' | 'ascendantAbbreviation' | 'midheavenAbbreviation';

const TERMS: Record<Locale, {
  planets: Record<PlanetId, string>;
  points: Record<PointId, string>;
  zodiac: Record<ZodiacSign, string>;
  aspects: Record<AspectType, string>;
  houses: readonly string[];
  categories: Record<FortuneCategory, string>;
  motion: Record<Motion, string>;
  chart: Record<ChartTextKey, string>;
}> = {
  ko: {
    planets: { sun: '태양', moon: '달', mercury: '수성', venus: '금성', mars: '화성', jupiter: '목성', saturn: '토성', uranus: '천왕성', neptune: '해왕성', pluto: '명왕성' },
    points: { sun: '태양', moon: '달', ascendant: '상승궁' },
    zodiac: { 양자리: '양자리', 황소자리: '황소자리', 쌍둥이자리: '쌍둥이자리', 게자리: '게자리', 사자자리: '사자자리', 처녀자리: '처녀자리', 천칭자리: '천칭자리', 전갈자리: '전갈자리', 사수자리: '사수자리', 염소자리: '염소자리', 물병자리: '물병자리', 물고기자리: '물고기자리' },
    aspects: { conjunction: '합', sextile: '육분', square: '사각', trine: '삼분', opposition: '충' },
    houses: ['자아·첫인상', '재물·가치', '소통·학습', '가정·뿌리', '창조·연애', '일상·건강', '관계·파트너', '공유·변화', '신념·여행', '직업·명예', '친구·미래', '내면·회복'],
    categories: { overall: '종합운', love: '연애운', money: '재물운', career: '직업운', health: '건강운' },
    motion: { direct: '순행', retrograde: '역행' },
    chart: { chartTitle: '출생 차트 원형 도표', legend: '차트 선 범례', conjunction: '결합', harmony: '조화', tension: '긴장', axis: 'ASC·MC', placementSummary: '행성 배치표 열기', placements: '행성 배치표', planet: '행성', zodiacPosition: '별자리 위치', house: '하우스', status: '상태', unknownTime: '시간 미상', ascendantAbbreviation: 'ASC', midheavenAbbreviation: 'MC' },
  },
  en: {
    planets: { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' },
    points: { sun: 'Sun', moon: 'Moon', ascendant: 'Ascendant' },
    zodiac: { 양자리: 'Aries', 황소자리: 'Taurus', 쌍둥이자리: 'Gemini', 게자리: 'Cancer', 사자자리: 'Leo', 처녀자리: 'Virgo', 천칭자리: 'Libra', 전갈자리: 'Scorpio', 사수자리: 'Sagittarius', 염소자리: 'Capricorn', 물병자리: 'Aquarius', 물고기자리: 'Pisces' },
    aspects: { conjunction: 'Conjunction', sextile: 'Sextile', square: 'Square', trine: 'Trine', opposition: 'Opposition' },
    houses: ['Self & approach', 'Resources & values', 'Communication & learning', 'Home & roots', 'Creativity & romance', 'Routine & wellbeing', 'Relationships & partnership', 'Shared resources & transformation', 'Beliefs & travel', 'Career & reputation', 'Community & future', 'Inner life & restoration'],
    categories: { overall: 'Overall', love: 'Love', money: 'Money', career: 'Career', health: 'Health' },
    motion: { direct: 'Direct', retrograde: 'Retrograde' },
    chart: { chartTitle: 'Circular natal chart', legend: 'Chart line legend', conjunction: 'Conjunction', harmony: 'Harmony', tension: 'Tension', axis: 'ASC·MC', placementSummary: 'Open planetary placements', placements: 'Planetary placements', planet: 'Planet', zodiacPosition: 'Zodiac position', house: 'House', status: 'Status', unknownTime: 'Time unknown', ascendantAbbreviation: 'ASC', midheavenAbbreviation: 'MC' },
  },
};

const ZODIAC_BY_INDEX: ZodiacSign[] = ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리'];

export function planetName(planet: PlanetId, locale: Locale): string { return TERMS[locale].planets[planet]; }
export function pointName(point: PointId, locale: Locale): string { return TERMS[locale].points[point]; }
export function zodiacName(sign: ZodiacSign, locale: Locale): string { return TERMS[locale].zodiac[sign]; }
export function zodiacNameByIndex(index: number, locale: Locale): string { return zodiacName(ZODIAC_BY_INDEX[((index % 12) + 12) % 12], locale); }
export function aspectName(aspect: AspectType, locale: Locale): string { return TERMS[locale].aspects[aspect]; }
export function houseName(house: number, locale: Locale): string { return TERMS[locale].houses[house - 1] ?? formatLocaleNumber(house, locale); }
export function houseLabel(house: number, locale: Locale): string { return locale === 'ko' ? `${formatLocaleNumber(house, locale)}하우스` : `House ${formatLocaleNumber(house, locale)}`; }
export function categoryName(category: FortuneCategory, locale: Locale): string { return TERMS[locale].categories[category]; }
export function motionName(motion: Motion, locale: Locale): string { return TERMS[locale].motion[motion]; }
export function chartText(key: ChartTextKey, locale: Locale): string { return TERMS[locale].chart[key]; }
