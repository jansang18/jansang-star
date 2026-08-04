import { describe, expect, it } from 'vitest';
import type { NatalChartData, PlanetId, PlanetPosition, ZodiacSign } from '../astrology/types';
import type { Aspect } from '../fortune/aspects';
import type { TransitData } from '../fortune/transits';
import { buildDetailedReading } from './buildDetailedReading';
import { renderDetailedReading } from './renderDetailedReading';

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

describe('renderDetailedReading', () => {
  it('renders equivalent evidence in Korean and English and a full Korean report', () => {
    const model = buildDetailedReading(chart, transits);
    const ko = renderDetailedReading(model, 'ko');
    const en = renderDetailedReading(model, 'en');

    expect(ko.sections.map((section) => section.blocks.map((block) => block.id)))
      .toEqual(en.sections.map((section) => section.blocks.map((block) => block.id)));
    expect(ko.evidenceIds).toEqual(en.evidenceIds);
    expect(ko.sections.map((section) => section.id)).toEqual(['bigThree', 'planets', 'houses', 'aspects', 'transits']);
    expect(ko.evidenceIds.every((id) => !/[\uac00-\ud7af]/u.test(id))).toBe(true);

    const modelSentenceCounts = [model.bigThree, model.planets, model.houses, model.aspects, model.transits]
      .flatMap((blocks) => blocks.map((block) => block.sentences.length));
    for (const localized of [ko, en]) {
      const renderedSentenceCounts = localized.sections
        .flatMap((section) => section.blocks)
        .map((block) => 1 + block.paragraphs.length);
      expect(renderedSentenceCounts).toEqual(modelSentenceCounts);
    }

    const length = ko.sections
      .flatMap((section) => section.blocks)
      .flatMap((block) => [block.summary, ...block.paragraphs])
      .join('').length;
    expect(length).toBeGreaterThanOrEqual(4000);
    expect(length).toBeLessThanOrEqual(7000);
  });

  it('uses the first authored sentence as the summary and localizes evidence labels', () => {
    const model = buildDetailedReading(chart, transits);
    const ko = renderDetailedReading(model, 'ko');
    const en = renderDetailedReading(model, 'en');
    const koSun = ko.sections[0].blocks[0];
    const enSun = en.sections[0].blocks[0];

    expect(koSun).toMatchObject({
      id: 'bigThree:sun',
      title: '태양',
      summary: '태양은 삶의 방향을 선택하는 중심 의지입니다.',
      evidenceLabels: ['태양 · 양자리 · 1하우스 · 순행'],
    });
    expect(enSun).toMatchObject({
      id: 'bigThree:sun',
      title: 'Sun',
      summary: 'The Sun describes the central will that chooses a direction for your life.',
      evidenceLabels: ['Sun · Aries · House 1 · Direct'],
    });
    expect(koSun.paragraphs).toHaveLength(4);
    expect(enSun.paragraphs).toHaveLength(4);
    expect(ko.sections[2].blocks[0].evidenceLabels).toEqual(['1하우스 · 양자리 · 태양']);
    expect(en.sections[2].blocks[0].evidenceLabels).toEqual(['House 1 · Aries · Sun']);
    expect(ko.sections[3].blocks[0].evidenceLabels[0]).toContain('오브');
    expect(en.sections[3].blocks[0].evidenceLabels[0]).toContain('orb');
    expect(JSON.stringify(en)).not.toMatch(/[\uac00-\ud7af]/u);
  });

  it('renders explicit notices without inventing time-dependent sections', () => {
    const unknownChart: NatalChartData = { ...chart, timeKnown: false, ascendant: undefined, houses: [] };
    const model = buildDetailedReading(unknownChart, transits);
    const ko = renderDetailedReading(model, 'ko');
    const en = renderDetailedReading(model, 'en');

    expect(ko.sections.map((section) => section.id)).not.toContain('houses');
    expect(ko.sections[0].blocks).toHaveLength(2);
    expect(ko.notices).toHaveLength(2);
    expect(en.notices).toHaveLength(2);
    expect(ko.notices[0]).toContain('상승궁');
    expect(en.notices[0]).toContain('Ascendant');
    expect(ko.evidenceIds).toEqual(en.evidenceIds);
  });
});
