import { PLANETS } from '../astrology/constants';
import type { NatalChartData, PlanetId, PlanetPosition } from '../astrology/types';
import { longitudeToZodiac } from '../astrology/zodiac';
import { natalAspects, type Aspect } from '../fortune/aspects';
import type { TransitData } from '../fortune/transits';
import type {
  DetailedReadingModel,
  ReadingBlock,
  ReadingCopyKey,
  ReadingEvidence,
  ReadingParams,
  ReadingSentence,
} from './types';

const ELEMENTS = ['fire', 'earth', 'air', 'water'] as const;
const MODALITIES = ['cardinal', 'fixed', 'mutable'] as const;

type AspectEvidence = Extract<ReadingEvidence, { kind: 'aspect' }>;

function zodiacFacts(signIndex: number) {
  return {
    signIndex,
    element: ELEMENTS[signIndex % ELEMENTS.length],
    modality: MODALITIES[signIndex % MODALITIES.length],
  };
}

function sentences(keys: ReadingCopyKey[], params: ReadingParams): ReadingSentence[] {
  return keys.map((key) => ({ key, params }));
}

function placementEvidence(
  point: PlanetId | 'ascendant',
  signIndex: number,
  retrograde: boolean,
  house?: number,
): ReadingEvidence {
  return {
    kind: 'placement',
    point,
    signIndex,
    ...(house === undefined ? {} : { house }),
    retrograde,
  };
}

function hasAvailableHouses(chart: NatalChartData): boolean {
  return chart.timeKnown
    && chart.houses.length === 12
    && chart.houses.every((cusp) => Number.isFinite(cusp));
}

function placementHouse(chart: NatalChartData, placement: PlanetPosition): number | undefined {
  return hasAvailableHouses(chart) ? placement.house : undefined;
}

function buildBigThreePlacement(chart: NatalChartData, point: 'sun' | 'moon'): ReadingBlock {
  const placement = chart.planets[point];
  const signIndex = longitudeToZodiac(placement.longitude).signIndex;
  const house = placementHouse(chart, placement);
  const params: ReadingParams = {
    point,
    ...zodiacFacts(signIndex),
    ...(house === undefined ? {} : { house }),
    retrograde: placement.retrograde,
  };

  return {
    id: `bigThree:${point}`,
    section: 'bigThree',
    subject: point,
    evidence: [placementEvidence(point, signIndex, placement.retrograde, house)],
    sentences: sentences([
      'bigThree.role',
      'bigThree.sign',
      house === undefined ? 'bigThree.houseUnknown' : 'bigThree.house',
      'bigThree.pattern',
      'bigThree.action',
    ], params),
  };
}

function buildAscendant(chart: NatalChartData): ReadingBlock | undefined {
  if (!chart.timeKnown || chart.ascendant === undefined) return undefined;

  const point = 'ascendant' as const;
  const signIndex = longitudeToZodiac(chart.ascendant).signIndex;
  const house = hasAvailableHouses(chart) ? 1 : undefined;
  const params: ReadingParams = {
    point,
    ...zodiacFacts(signIndex),
    ...(house === undefined ? {} : { house }),
    retrograde: false,
  };

  return {
    id: 'bigThree:ascendant',
    section: 'bigThree',
    subject: point,
    evidence: [placementEvidence(point, signIndex, false, house)],
    sentences: sentences([
      'bigThree.role',
      'bigThree.sign',
      house === undefined ? 'bigThree.houseUnknown' : 'bigThree.house',
      'bigThree.pattern',
      'bigThree.action',
    ], params),
  };
}

function buildPlanet(chart: NatalChartData, planet: PlanetId): ReadingBlock {
  const placement = chart.planets[planet];
  const signIndex = longitudeToZodiac(placement.longitude).signIndex;
  const house = placementHouse(chart, placement);
  const params: ReadingParams = {
    planet,
    ...zodiacFacts(signIndex),
    ...(house === undefined ? {} : { house }),
    retrograde: placement.retrograde,
  };

  return {
    id: `planets:${planet}`,
    section: 'planets',
    subject: planet,
    evidence: [placementEvidence(planet, signIndex, placement.retrograde, house)],
    sentences: sentences([
      'planet.role',
      'planet.sign',
      house === undefined ? 'planet.houseUnknown' : 'planet.house',
      'planet.motion',
      'planet.action',
    ], params),
  };
}

function buildHouse(chart: NatalChartData, cusp: number, index: number): ReadingBlock {
  const house = index + 1;
  const signIndex = longitudeToZodiac(cusp).signIndex;
  const occupants = PLANETS
    .map(({ id }) => id)
    .filter((planet) => chart.planets[planet].house === house);
  const params: ReadingParams = {
    house,
    ...zodiacFacts(signIndex),
    occupants: occupants.join(','),
  };

  return {
    id: `houses:${house}`,
    section: 'houses',
    subject: String(house),
    evidence: [{ kind: 'house', house, cuspSignIndex: signIndex, occupants }],
    sentences: sentences([
      'house.domain',
      'house.cusp',
      occupants.length === 0 ? 'house.empty' : 'house.occupied',
      'house.action',
    ], params),
  };
}

function exactness(aspect: Aspect): number {
  return Number((1 - aspect.orb / aspect.maxOrb).toFixed(6));
}

function selectStrongest(aspects: Aspect[], scope: 'natal' | 'transit'): AspectEvidence[] {
  return [...aspects]
    .sort((a, b) => exactness(b) - exactness(a)
      || `${a.from}:${a.to}:${a.type}`.localeCompare(`${b.from}:${b.to}:${b.type}`))
    .slice(0, 10)
    .map((aspect) => ({
      kind: 'aspect',
      scope,
      type: aspect.type,
      from: aspect.from,
      to: aspect.to,
      orb: aspect.orb,
      exactness: exactness(aspect),
    }));
}

function buildAspectBlock(evidence: AspectEvidence): ReadingBlock {
  const isTransit = evidence.scope === 'transit';
  const section = isTransit ? 'transits' : 'aspects';
  const prefix = isTransit ? 'transit' : 'aspect';
  const params: ReadingParams = {
    from: evidence.from,
    to: evidence.to,
    aspectType: evidence.type,
    orb: evidence.orb,
    exactness: evidence.exactness,
  };
  const keys: ReadingCopyKey[] = isTransit
    ? ['transit.dynamic', 'transit.experience', 'transit.opportunity', 'transit.caution', 'transit.action']
    : ['aspect.dynamic', 'aspect.experience', 'aspect.strength', 'aspect.caution', 'aspect.integration'];

  return {
    id: `${section}:${evidence.scope}:${evidence.from}:${evidence.to}:${evidence.type}`,
    section,
    subject: `${evidence.from}:${evidence.to}:${evidence.type}`,
    evidence: [evidence],
    sentences: sentences(keys, params),
  };
}

export function buildDetailedReading(chart: NatalChartData, transits: TransitData): DetailedReadingModel {
  const ascendant = buildAscendant(chart);
  const hasHouses = hasAvailableHouses(chart);
  const unavailable: DetailedReadingModel['unavailable'] = [];
  if (!ascendant) unavailable.push('ascendant');
  if (!hasHouses) unavailable.push('houses');

  return {
    bigThree: [buildBigThreePlacement(chart, 'sun'), buildBigThreePlacement(chart, 'moon'), ...(ascendant ? [ascendant] : [])],
    planets: PLANETS.map(({ id }) => buildPlanet(chart, id)),
    houses: hasHouses ? chart.houses.slice(0, 12).map((cusp, index) => buildHouse(chart, cusp, index)) : [],
    aspects: selectStrongest(natalAspects(chart), 'natal').map(buildAspectBlock),
    transits: selectStrongest(transits.aspects, 'transit').map(buildAspectBlock),
    unavailable,
  };
}
