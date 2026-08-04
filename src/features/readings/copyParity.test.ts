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
});
