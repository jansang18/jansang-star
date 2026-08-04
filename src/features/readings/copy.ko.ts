import { aspectName, houseName, planetName, pointName, zodiacNameByIndex } from '../../i18n/astrologyTerms';
import type { PlanetId } from '../astrology/types';
import type { AspectType } from '../fortune/aspects';
import type { ReadingCopyKey, ReadingParams } from './types';

type PointId = 'sun' | 'moon' | 'ascendant';
type ElementId = 'fire' | 'earth' | 'air' | 'water';
type ModalityId = 'cardinal' | 'fixed' | 'mutable';

export type ReadingCopy = Record<ReadingCopyKey, (params: ReadingParams) => string>;

const PLANET_ROLES: Record<PlanetId, string> = {
  sun: '의지와 삶의 중심을 세우는 방식',
  moon: '감정을 돌보고 안정을 찾는 방식',
  mercury: '정보를 이해하고 말로 잇는 방식',
  venus: '호감과 가치, 관계를 고르는 방식',
  mars: '욕구를 행동과 경계로 옮기는 방식',
  jupiter: '경험을 넓히고 의미를 찾는 방식',
  saturn: '책임을 세우고 꾸준히 완성하는 방식',
  uranus: '관습을 깨고 새 선택을 여는 방식',
  neptune: '상상과 공감으로 경계를 느끼는 방식',
  pluto: '집중과 변화를 통해 힘을 재편하는 방식',
};

const SIGN_EXPRESSIONS = [
  '먼저 시작하되 성급함을 조절하는',
  '꾸준히 쌓되 고집을 느슨하게 하는',
  '빠르게 연결하되 산만함을 정리하는',
  '세심히 돌보되 방어에 숨지 않는',
  '당당히 창조하되 인정에 매이지 않는',
  '정교히 개선하되 완벽주의를 낮추는',
  '균형 있게 조율하되 결정을 미루지 않는',
  '깊이 몰입하되 통제를 내려놓는',
  '넓게 탐험하되 과장을 사실로 점검하는',
  '목표를 쌓되 성취만으로 자신을 재지 않는',
  '새 관점을 나누되 거리를 냉담함으로 만들지 않는',
  '경계를 공감하되 현실의 기준을 놓치지 않는',
] as const;

const SIGN_APPROACHES = [
  '주도권을 잡고 즉흥적 충돌은 줄이는',
  '안전을 다지고 익숙함에 멈추지 않는',
  '여러 답을 묻고 정보 과부하는 거르는',
  '신뢰를 살피고 지나친 경계는 푸는',
  '존재감을 밝히고 과한 자존심은 누그러뜨리는',
  '세부를 정돈하고 흠잡기에 빠지지 않는',
  '상대를 배려하고 우유부단함은 끝내는',
  '본질을 파고들고 의심으로 잠그지 않는',
  '가능성을 넓히고 무리한 낙관은 점검하는',
  '계획을 세우고 경직된 기준은 조정하는',
  '관습을 새롭게 보고 고립은 피하는',
  '직관을 따르되 모호한 약속은 확인하는',
] as const;

const ELEMENT_PATTERNS: Record<ElementId, string> = {
  fire: '불의 추진력과 과열을 식히는 절제',
  earth: '흙의 현실감과 변화를 막지 않는 유연함',
  air: '공기의 사고력과 생각을 행동에 잇는 집중',
  water: '물의 공감력과 감정에 휩쓸리지 않는 경계',
};

const MODALITY_PATTERNS: Record<ModalityId, string> = {
  cardinal: '시작하는 힘과 독주를 막는 협의',
  fixed: '지속하는 힘과 고착을 푸는 전환',
  mutable: '적응하는 힘과 분산을 모으는 기준',
};

const ASPECT_EXPERIENCES: Record<AspectType, string> = {
  conjunction: '두 욕구가 한곳에 몰려 강한 초점으로 느껴집니다.',
  sextile: '작은 시도에 서로 돕는 길이 열리는 연결입니다.',
  square: '마찰이 행동을 재촉해 성장 과제가 또렷해집니다.',
  trine: '두 능력이 자연히 이어져 익숙한 재능이 됩니다.',
  opposition: '서로 다른 욕구가 타인과 선택을 통해 비칩니다.',
};

const ASPECT_CAUTIONS: Record<AspectType, string> = {
  conjunction: '한쪽 목소리가 다른 욕구를 덮지 않는지 살피세요.',
  sextile: '쉬운 가능성을 기다리기만 하면 기회가 멈춥니다.',
  square: '압박을 서두름이나 자기비난으로 바꾸지 마세요.',
  trine: '익숙한 재능을 당연히 여기면 성장이 느려집니다.',
  opposition: '답을 상대에게만 맡기면 같은 갈등이 반복됩니다.',
};

function asPoint(value: ReadingParams[string]): PointId {
  return value === 'sun' || value === 'moon' ? value : 'ascendant';
}

function asPlanet(value: ReadingParams[string]): PlanetId {
  return String(value) as PlanetId;
}

function asAspect(value: ReadingParams[string]): AspectType {
  return String(value) as AspectType;
}

export function planetRole(planet: PlanetId): string {
  return PLANET_ROLES[planet];
}

export function signExpression(signIndex: number): string {
  return SIGN_EXPRESSIONS[((signIndex % 12) + 12) % 12];
}

export function signApproach(signIndex: number): string {
  return SIGN_APPROACHES[((signIndex % 12) + 12) % 12];
}

export function elementPattern(element: string): string {
  return ELEMENT_PATTERNS[element as ElementId];
}

export function modalityPattern(modality: string): string {
  return MODALITY_PATTERNS[modality as ModalityId];
}

export function aspectExperience(aspect: AspectType): string {
  return ASPECT_EXPERIENCES[aspect];
}

export function aspectCaution(aspect: AspectType): string {
  return ASPECT_CAUTIONS[aspect];
}

export function formatPlanetList(occupants: string): string {
  return occupants.split(',').filter(Boolean).map((planet) => planetName(planet as PlanetId, 'ko')).join('·');
}

export const READING_COPY_KO: ReadingCopy = {
  'bigThree.role': ({ point }) => point === 'sun'
    ? '태양은 삶의 방향을 선택하는 중심 의지입니다.'
    : point === 'moon'
      ? '달은 감정의 반응과 마음이 쉬는 조건입니다.'
      : '상승궁은 낯선 곳에서 먼저 보이는 태도입니다.',
  'bigThree.sign': ({ point, signIndex }) => `${pointName(asPoint(point), 'ko')}이 ${zodiacNameByIndex(Number(signIndex), 'ko')}에서 ${signExpression(Number(signIndex))} 방식으로 드러납니다.`,
  'bigThree.house': ({ house }) => `${Number(house)}하우스에서 이 성향이 사건과 선택으로 자주 드러납니다.`,
  'bigThree.houseUnknown': () => '출생시간이 없어 이 성향의 주된 삶의 영역은 단정하지 않습니다.',
  'bigThree.pattern': ({ element, modality }) => `이 배치에는 다음 두 패턴이 함께 나타납니다: ${elementPattern(String(element))}, ${modalityPattern(String(modality))}.`,
  'bigThree.action': ({ point }) => `${pointName(asPoint(point), 'ko')}의 욕구를 한 줄로 적고 작은 행동 하나를 골라 보세요.`,
  'planet.role': ({ planet }) => `${planetName(asPlanet(planet), 'ko')}은 ${planetRole(asPlanet(planet))}을 보여줍니다.`,
  'planet.sign': ({ planet, signIndex }) => `${planetName(asPlanet(planet), 'ko')}은 ${zodiacNameByIndex(Number(signIndex), 'ko')}답게 ${signExpression(Number(signIndex))} 식으로 표현됩니다.`,
  'planet.house': ({ house }) => `${Number(house)}하우스에서 이 성향이 관계와 일로 드러납니다.`,
  'planet.houseUnknown': () => '출생시간이 없어 별자리 성향만 읽고 특정 영역은 정하지 않습니다.',
  'planet.motion': ({ planet, retrograde }) => retrograde
    ? `${planetName(asPlanet(planet), 'ko')} 역행은 내면에서 숙성한 뒤 표현해 시작이 늦을 수 있습니다.`
    : `${planetName(asPlanet(planet), 'ko')} 순행은 경험 속에서 직접 표현하고 빠르게 조정합니다.`,
  'planet.action': ({ planet }) => `${planetName(asPlanet(planet), 'ko')}의 자동반응을 보고 의식적 선택 하나로 바꿔 보세요.`,
  'house.domain': ({ house }) => `${Number(house)}하우스의 주제는 ${houseName(Number(house), 'ko')}입니다.`,
  'house.cusp': ({ house, signIndex }) => `${Number(house)}하우스는 ${zodiacNameByIndex(Number(signIndex), 'ko')}에서 시작해 ${signApproach(Number(signIndex))} 태도로 접근합니다.`,
  'house.occupied': ({ occupants }) => `${formatPlanetList(String(occupants))}이 이 영역의 사건과 선택을 더 자주 강조합니다.`,
  'house.empty': ({ house }) => `${Number(house)}하우스는 행성이 없어도 별자리와 주인 행성으로 작동합니다.`,
  'house.action': ({ house }) => `${houseName(Number(house), 'ko')}에서 반복되는 장면을 적어 성장 방향을 살펴보세요.`,
  'aspect.dynamic': ({ from, to, aspectType }) => `${planetName(asPlanet(from), 'ko')}과 ${planetName(asPlanet(to), 'ko')}의 ${aspectName(asAspect(aspectType), 'ko')}은 두 기능을 잇는 틀입니다.`,
  'aspect.experience': ({ aspectType }) => aspectExperience(asAspect(aspectType)),
  'aspect.strength': ({ exactness }) => `정확도 ${Math.round(Number(exactness) * 100)}%의 연결은 집중력과 고유한 해결법이 될 수 있습니다.`,
  'aspect.caution': ({ aspectType }) => aspectCaution(asAspect(aspectType)),
  'aspect.integration': ({ from, to }) => `${planetName(asPlanet(from), 'ko')}의 요구를 인정하고 ${planetName(asPlanet(to), 'ko')}의 속도로 실행해 보세요.`,
  'transit.dynamic': ({ from, to, aspectType }) => `현재 ${planetName(asPlanet(from), 'ko')}과 출생 ${planetName(asPlanet(to), 'ko')}의 ${aspectName(asAspect(aspectType), 'ko')}이 잠시 리듬을 강조합니다.`,
  'transit.experience': ({ to }) => `${planetName(asPlanet(to), 'ko')} 영역에서 반응이 빨라지거나 미룬 일이 보일 수 있습니다.`,
  'transit.opportunity': ({ exactness }) => `정확도 ${Math.round(Number(exactness) * 100)}%인 지금은 작은 실험과 솔직한 관찰에 유리합니다.`,
  'transit.caution': ({ aspectType }) => `${aspectCaution(asAspect(aspectType))} 현실 조건도 확인하세요.`,
  'transit.action': ({ to }) => `${planetName(asPlanet(to), 'ko')} 관련 일을 준비·실행·기록으로 마쳐 보세요.`,
  'unavailable.ascendant': () => '출생시간이 없어 상승궁은 계산하지 않았습니다. 시간을 알면 첫인상 풀이가 더해집니다.',
  'unavailable.houses': () => '출생시간이 없어 12하우스는 만들지 않았습니다. 별자리는 읽되 삶의 영역은 단정하지 않습니다.',
};
