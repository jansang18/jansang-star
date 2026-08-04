import { describe, expect, it } from 'vitest';
import {
  aspectCaution as aspectCautionEn,
  aspectExperience as aspectExperienceEn,
  elementPattern as elementPatternEn,
  modalityPattern as modalityPatternEn,
  planetRole as planetRoleEn,
  READING_COPY_EN,
  signApproach as signApproachEn,
  signExpression as signExpressionEn,
} from './copy.en';
import {
  aspectCaution as aspectCautionKo,
  aspectExperience as aspectExperienceKo,
  elementPattern as elementPatternKo,
  modalityPattern as modalityPatternKo,
  planetRole as planetRoleKo,
  READING_COPY_KO,
  signApproach as signApproachKo,
  signExpression as signExpressionKo,
} from './copy.ko';
import type { PlanetId } from '../astrology/types';
import type { AspectType } from '../fortune/aspects';
import { READING_COPY_KEYS } from './types';

describe('detailed reading copy', () => {
  it('authors every reading sentence in both languages without fallback', () => {
    expect(Object.keys(READING_COPY_KO).sort()).toEqual([...READING_COPY_KEYS].sort());
    expect(Object.keys(READING_COPY_EN).sort()).toEqual([...READING_COPY_KEYS].sort());
    expect(Object.values(READING_COPY_KO).every((value) => typeof value === 'function')).toBe(true);
    expect(Object.values(READING_COPY_EN).every((value) => typeof value === 'function')).toBe(true);
  });

  it('gives every supported symbol its own authored meaning in each language', () => {
    const planets: PlanetId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const elements = ['fire', 'earth', 'air', 'water'];
    const modalities = ['cardinal', 'fixed', 'mutable'];
    const aspects: AspectType[] = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

    for (const helper of [signExpressionKo, signApproachKo, signExpressionEn, signApproachEn]) {
      expect(new Set(Array.from({ length: 12 }, (_, index) => helper(index)))).toHaveLength(12);
    }
    for (const helper of [planetRoleKo, planetRoleEn]) {
      expect(new Set(planets.map(helper))).toHaveLength(10);
    }
    for (const helper of [elementPatternKo, elementPatternEn]) {
      expect(new Set(elements.map(helper))).toHaveLength(4);
    }
    for (const helper of [modalityPatternKo, modalityPatternEn]) {
      expect(new Set(modalities.map(helper))).toHaveLength(3);
    }
    for (const helper of [aspectExperienceKo, aspectCautionKo, aspectExperienceEn, aspectCautionEn]) {
      expect(new Set(aspects.map(helper))).toHaveLength(5);
    }
  });

  it('uses a particle-safe sentence for Korean element and modality patterns', () => {
    expect(READING_COPY_KO['bigThree.pattern']({ element: 'fire', modality: 'cardinal' })).toBe(
      '이 배치에는 다음 두 패턴이 함께 나타납니다: 불의 추진력과 과열을 식히는 절제, 시작하는 힘과 독주를 막는 협의.',
    );
  });

  it('uses particle-safe Korean house names', () => {
    expect(READING_COPY_KO['house.action']({ house: 2 })).toBe(
      '재물·가치에서 반복되는 장면을 적어 성장 방향을 살펴보세요.',
    );
    expect(READING_COPY_KO['house.action']({ house: 4 })).toBe(
      '가정·뿌리에서 반복되는 장면을 적어 성장 방향을 살펴보세요.',
    );
  });

  it('uses singular and plural agreement for English house occupants', () => {
    expect(READING_COPY_EN['house.occupied']({ occupants: 'sun' })).toBe(
      'Sun gathers its needs here, increasing the density of events and choices.',
    );
    expect(READING_COPY_EN['house.occupied']({ occupants: 'sun,mercury' })).toBe(
      'Sun and Mercury gather different needs here, increasing the density of events and choices.',
    );
  });
});
