// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { BirthProfile } from '../profile/types';
import { calculateNatalChart, houseForLongitude } from './swissEphemeris';

const seoulReferenceProfile: BirthProfile = {
  displayName: '김별', date: '1990-08-05', time: '14:30', timeKnown: true,
  cityId: 'seoul', latitude: 37.5665, longitude: 126.978, timeZone: 'Asia/Seoul', disambiguation: 'compatible',
};

describe('Swiss Ephemeris adapter', () => {
  it('assigns a longitude to a house across zero degrees', () => {
    expect(houseForLongitude(355, [350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320])).toBe(1);
  });

  it('calculates the Sun in Leo for the reference birth', async () => {
    const chart = await calculateNatalChart(seoulReferenceProfile);
    expect(chart.planets.sun.sign).toBe('사자자리');
    expect(chart.houseSystem).toBe('P');
    expect(chart.houses).toHaveLength(12);
    expect(chart.ascendant).toBeTypeOf('number');
  }, 30_000);
});
