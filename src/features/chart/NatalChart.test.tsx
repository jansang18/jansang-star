import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { NatalChartData, PlanetId, PlanetPosition } from '../astrology/types';
import { PLANETS } from '../astrology/constants';
import { NatalChart } from './NatalChart';

const planets = Object.fromEntries(PLANETS.map((planet, index) => [planet.id, { ...planet, longitude: index * 32, latitude: 0, speed: 1, retrograde: false, sign: '양자리', signDegree: 0, house: 1 }])) as unknown as Record<PlanetId, PlanetPosition>;
const chart: NatalChartData = { julianDay: 0, planets, ascendant: 210, midheaven: 120, houses: Array.from({ length: 12 }, (_, index) => index * 30), houseSystem: 'P', timeKnown: true };

describe('NatalChart', () => {
  it('has an accessible chart title and alternative placement table', () => {
    render(<NatalChart chart={chart} />);
    expect(screen.getByRole('img', { name: '출생 차트 원형 도표' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: '행성 배치표' })).toBeInTheDocument();
  });
});
