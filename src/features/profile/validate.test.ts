import { describe, expect, it } from 'vitest';
import type { BirthProfile } from './types';
import { validateBirthProfile } from './validate';

const validProfile: BirthProfile = {
  displayName: '김별', date: '1990-08-05', time: '14:30', timeKnown: true,
  cityId: 'seoul', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul', disambiguation: 'compatible',
};

describe('validateBirthProfile', () => {
  it('returns locale-neutral validation codes', () => {
    const errors = validateBirthProfile({ ...validProfile, displayName: '', date: '2999-01-01', cityId: '' });
    expect(errors.displayName).toBe('displayNameRequired');
    expect(errors.date).toBe('dateFuture');
    expect(errors.cityId).toBe('cityRequired');
  });

  it('rejects a future birth date and missing city selection', () => {
    const errors = validateBirthProfile({ ...validProfile, date: '2999-01-01', cityId: '' });
    expect(errors.date).toBeDefined();
    expect(errors.cityId).toBeDefined();
  });

  it('allows an unknown birth time', () => {
    expect(validateBirthProfile({ ...validProfile, timeKnown: false, time: '' }).time).toBeUndefined();
  });
});
