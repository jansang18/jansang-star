import { describe, expect, it } from 'vitest';
import type { NatalChartData, PlanetId, PlanetPosition, ZodiacSign } from '../astrology/types';
import type { Aspect } from '../fortune/aspects';
import type { TransitData } from '../fortune/transits';
import { buildDetailedReading } from './buildDetailedReading';

const signs: ZodiacSign[] = [
  '양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리',
  '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리',
];

function position(id: PlanetId, longitude: number, house: number, retrograde = false): PlanetPosition {
  const signIndex = Math.floor(longitude / 30);
  return {
    id,
    nameKo: signs[signIndex],
    glyph: id,
    longitude,
    latitude: 0,
    speed: retrograde ? -1 : 1,
    retrograde,
    sign: signs[signIndex],
    signDegree: longitude - signIndex * 30,
    house,
  };
}

const planets: Record<PlanetId, PlanetPosition> = {
  sun: position('sun', 0, 1),
  moon: position('moon', 60, 3),
  mercury: position('mercury', 90, 4, true),
  venus: position('venus', 120, 5),
  mars: position('mars', 180, 7),
  jupiter: position('jupiter', 30, 2),
  saturn: position('saturn', 150, 6, true),
  uranus: position('uranus', 210, 8),
  neptune: position('neptune', 240, 9),
  pluto: position('pluto', 300, 11),
};

const chart: NatalChartData = {
  julianDay: 0,
  planets,
  ascendant: 15,
  midheaven: 285,
  houses: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
  houseSystem: 'P',
  timeKnown: true,
};

function aspect(from: PlanetId, to: PlanetId, type: Aspect['type'], orb: number, maxOrb: number): Aspect {
  const angles = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 };
  return { from, to, type, angle: angles[type], orb, maxOrb };
}

const transitAspects: Aspect[] = [
  aspect('sun', 'moon', 'conjunction', 4, 8),
  aspect('mercury', 'venus', 'sextile', 1, 5),
  aspect('mars', 'jupiter', 'square', 3.5, 7),
  aspect('saturn', 'uranus', 'trine', 0.7, 7),
  aspect('neptune', 'pluto', 'opposition', 0.8, 8),
  aspect('venus', 'sun', 'square', 0.7, 7),
  aspect('moon', 'mercury', 'trine', 1.4, 7),
  aspect('jupiter', 'saturn', 'sextile', 2, 5),
  aspect('uranus', 'neptune', 'conjunction', 2.4, 8),
  aspect('pluto', 'mars', 'opposition', 3.2, 8),
  aspect('sun', 'jupiter', 'trine', 4.2, 7),
];

const transits: TransitData = { date: '2026-08-05', chart, aspects: transitAspects };

describe('buildDetailedReading', () => {
  it('builds every supported chapter with stable IDs and fixed sentence roles', () => {
    const report = buildDetailedReading(chart, transits);

    expect(report.bigThree.map((block) => block.id)).toEqual([
      'bigThree:sun',
      'bigThree:moon',
      'bigThree:ascendant',
    ]);
    expect(report.bigThree.map((block) => block.sentences.map((sentence) => sentence.key))).toEqual([
      ['bigThree.role', 'bigThree.sign', 'bigThree.house', 'bigThree.pattern', 'bigThree.action'],
      ['bigThree.role', 'bigThree.sign', 'bigThree.house', 'bigThree.pattern', 'bigThree.action'],
      ['bigThree.role', 'bigThree.sign', 'bigThree.house', 'bigThree.pattern', 'bigThree.action'],
    ]);
    expect(report.planets.map((block) => block.id)).toEqual([
      'planets:sun', 'planets:moon', 'planets:mercury', 'planets:venus', 'planets:mars',
      'planets:jupiter', 'planets:saturn', 'planets:uranus', 'planets:neptune', 'planets:pluto',
    ]);
    expect(report.planets.every((block) => block.sentences.length === 5)).toBe(true);
    expect(report.houses.map((block) => block.id)).toEqual([
      'houses:1', 'houses:2', 'houses:3', 'houses:4', 'houses:5', 'houses:6',
      'houses:7', 'houses:8', 'houses:9', 'houses:10', 'houses:11', 'houses:12',
    ]);
    expect(report.houses.every((block) => block.sentences.length === 4)).toBe(true);
    expect(report.aspects.length).toBeGreaterThanOrEqual(6);
    expect(report.aspects.length).toBeLessThanOrEqual(10);
    expect(report.aspects.map((block) => block.id)).toEqual([
      'aspects:natal:jupiter:pluto:square',
      'aspects:natal:jupiter:saturn:trine',
      'aspects:natal:jupiter:uranus:opposition',
      'aspects:natal:mars:neptune:sextile',
      'aspects:natal:mars:pluto:trine',
      'aspects:natal:mercury:jupiter:sextile',
      'aspects:natal:mercury:mars:square',
      'aspects:natal:mercury:saturn:sextile',
      'aspects:natal:mercury:uranus:trine',
      'aspects:natal:moon:mars:trine',
    ]);
    expect(report.aspects.every((block) => block.sentences.length === 5)).toBe(true);
    expect(report.transits).toHaveLength(10);
    expect(report.transits.every((block) => block.sentences.length === 5)).toBe(true);
    expect(report).toEqual(buildDetailedReading(chart, transits));
  });

  it('derives complete fact params and keeps house occupants in canonical planet order', () => {
    const occupiedChart: NatalChartData = {
      ...chart,
      planets: {
        ...chart.planets,
        sun: { ...chart.planets.sun, house: 4 },
        mercury: { ...chart.planets.mercury, house: 4 },
        pluto: { ...chart.planets.pluto, house: 4 },
      },
    };

    const report = buildDetailedReading(occupiedChart, transits);

    expect(report.bigThree[0]).toMatchObject({
      subject: 'sun',
      evidence: [{ kind: 'placement', point: 'sun', signIndex: 0, house: 4, retrograde: false }],
    });
    expect(report.bigThree[0].sentences[1].params).toEqual({
      point: 'sun', signIndex: 0, element: 'fire', modality: 'cardinal', house: 4, retrograde: false,
    });
    expect(report.planets[2]).toMatchObject({
      subject: 'mercury',
      evidence: [{ kind: 'placement', point: 'mercury', signIndex: 3, house: 4, retrograde: true }],
    });
    expect(report.planets[2].sentences.map((sentence) => sentence.key)).toEqual([
      'planet.role', 'planet.sign', 'planet.house', 'planet.motion', 'planet.action',
    ]);
    expect(report.planets[2].sentences[0].params).toEqual({
      planet: 'mercury', signIndex: 3, element: 'water', modality: 'cardinal', house: 4, retrograde: true,
    });
    expect(report.houses[3]).toEqual({
      id: 'houses:4',
      section: 'houses',
      subject: '4',
      evidence: [{ kind: 'house', house: 4, cuspSignIndex: 3, occupants: ['sun', 'mercury', 'pluto'] }],
      sentences: [
        { key: 'house.domain', params: { house: 4, signIndex: 3, element: 'water', modality: 'cardinal', occupants: 'sun,mercury,pluto' } },
        { key: 'house.cusp', params: { house: 4, signIndex: 3, element: 'water', modality: 'cardinal', occupants: 'sun,mercury,pluto' } },
        { key: 'house.occupied', params: { house: 4, signIndex: 3, element: 'water', modality: 'cardinal', occupants: 'sun,mercury,pluto' } },
        { key: 'house.action', params: { house: 4, signIndex: 3, element: 'water', modality: 'cardinal', occupants: 'sun,mercury,pluto' } },
      ],
    });
  });

  it('does not invent ascendant or house facts when birth time is unknown', () => {
    const unknownChart: NatalChartData = {
      ...chart,
      timeKnown: false,
      ascendant: undefined,
      houses: [],
    };

    const report = buildDetailedReading(unknownChart, transits);

    expect(report.bigThree.map((block) => block.subject)).toEqual(['sun', 'moon']);
    expect(report.bigThree.map((block) => block.sentences[2].key)).toEqual([
      'bigThree.houseUnknown', 'bigThree.houseUnknown',
    ]);
    expect(report.planets.every((block) => block.sentences[2].key === 'planet.houseUnknown')).toBe(true);
    expect(report.bigThree.flatMap((block) => block.evidence).every((item) => item.kind !== 'placement' || item.house === undefined)).toBe(true);
    expect(report.planets.flatMap((block) => block.evidence).every((item) => item.kind !== 'placement' || item.house === undefined)).toBe(true);
    expect(report.bigThree.flatMap((block) => block.sentences).every((sentence) => !Object.hasOwn(sentence.params, 'house'))).toBe(true);
    expect(report.planets.flatMap((block) => block.sentences).every((sentence) => !Object.hasOwn(sentence.params, 'house'))).toBe(true);
    expect(report.houses).toHaveLength(0);
    expect(report.unavailable).toEqual(['ascendant', 'houses']);
  });

  it('ranks aspects by rounded exactness, uses the canonical tie-break, and never pads missing transits', () => {
    const report = buildDetailedReading(chart, transits);

    expect(report.transits.map((block) => block.id)).toEqual([
      'transits:transit:neptune:pluto:opposition',
      'transits:transit:saturn:uranus:trine',
      'transits:transit:venus:sun:square',
      'transits:transit:mercury:venus:sextile',
      'transits:transit:moon:mercury:trine',
      'transits:transit:uranus:neptune:conjunction',
      'transits:transit:jupiter:saturn:sextile',
      'transits:transit:pluto:mars:opposition',
      'transits:transit:mars:jupiter:square',
      'transits:transit:sun:moon:conjunction',
    ]);
    expect(report.transits[0].evidence).toEqual([
      { kind: 'aspect', scope: 'transit', type: 'opposition', from: 'neptune', to: 'pluto', orb: 0.8, exactness: 0.9 },
    ]);
    expect(report.transits[0].sentences.map((sentence) => sentence.key)).toEqual([
      'transit.dynamic', 'transit.experience', 'transit.opportunity', 'transit.caution', 'transit.action',
    ]);
    expect(report.transits[0].sentences[0].params).toEqual({
      from: 'neptune', to: 'pluto', aspectType: 'opposition', orb: 0.8, exactness: 0.9,
    });

    const sparseTransits: TransitData = { ...transits, aspects: transitAspects.slice(0, 2) };
    expect(buildDetailedReading(chart, sparseTransits).transits).toHaveLength(2);

    const sparseLongitudes = [4.6, 25.52, 124.76, 146.04, 174.31, 193.39, 194.38, 227.61, 334.85, 343.02];
    const sparsePlanets = Object.fromEntries(
      (Object.keys(chart.planets) as PlanetId[]).map((id, index) => [id, position(id, sparseLongitudes[index], index + 1)]),
    ) as Record<PlanetId, PlanetPosition>;
    expect(buildDetailedReading({ ...chart, planets: sparsePlanets }, sparseTransits).aspects).toHaveLength(4);
  });

  it('returns only language-neutral facts and tokens', () => {
    const report = buildDetailedReading(chart, transits);
    expect(report.bigThree).toHaveLength(3);
    const serialized = JSON.stringify(report);
    expect(serialized).not.toMatch(/[\uac00-\ud7af]/u);
  });
});
