import { describe, expect, it } from 'vitest';
import type { BirthProfile } from './types';
import { toUtcBirthInstant } from './time';

const profile: BirthProfile = {
  displayName: '김별', date: '1990-08-05', time: '14:30', timeKnown: true,
  cityId: 'seoul', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul', disambiguation: 'compatible',
};

describe('toUtcBirthInstant', () => {
  it('converts a Seoul birth time to UTC', () => {
    expect(toUtcBirthInstant(profile).toString()).toBe('1990-08-05T05:30:00Z');
  });
});
