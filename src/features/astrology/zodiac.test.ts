import { describe, expect, it } from 'vitest';
import { longitudeToZodiac, normalizeDegree } from './zodiac';

describe('longitudeToZodiac', () => {
  it('maps exact zodiac boundaries without wrapping errors', () => {
    expect(longitudeToZodiac(0)).toMatchObject({ sign: '양자리', degree: 0 });
    expect(longitudeToZodiac(359.9)).toMatchObject({ sign: '물고기자리' });
    expect(normalizeDegree(-1)).toBe(359);
  });
});
