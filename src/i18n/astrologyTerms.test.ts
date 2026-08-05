import { describe, expect, it } from 'vitest';
import { aspectName, categoryName, houseName, planetName, pointName, zodiacName, zodiacNameByIndex } from './astrologyTerms';

describe('astrologyTerms', () => {
  it('localizes one neutral astronomical value without changing it', () => {
    expect(planetName('saturn', 'ko')).toBe('토성');
    expect(planetName('saturn', 'en')).toBe('Saturn');
    expect(zodiacName('사자자리', 'en')).toBe('Leo');
  });

  it('provides localized terms for every chart-facing terminology group', () => {
    expect(pointName('ascendant', 'ko')).toBe('상승궁');
    expect(zodiacNameByIndex(0, 'en')).toBe('Aries');
    expect(aspectName('trine', 'en')).toBe('Trine');
    expect(houseName(1, 'en')).toBe('Self & approach');
    expect(categoryName('career', 'en')).toBe('Career');
  });

  it('uses the canonical Korean names for all five western aspects', () => {
    expect({
      conjunction: aspectName('conjunction', 'ko'),
      sextile: aspectName('sextile', 'ko'),
      trine: aspectName('trine', 'ko'),
      square: aspectName('square', 'ko'),
      opposition: aspectName('opposition', 'ko'),
    }).toEqual({
      conjunction: '합',
      sextile: '육분',
      trine: '삼분',
      square: '사각',
      opposition: '충',
    });
  });
});
