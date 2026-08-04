import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { NatalChartData, PlanetId, PlanetPosition } from '../astrology/types';
import { PLANETS } from '../astrology/constants';
import { NatalChart } from './NatalChart';
import { renderWithI18n } from '../../test/renderWithI18n';

const planets = Object.fromEntries(PLANETS.map((planet, index) => [planet.id, { ...planet, longitude: index * 32, latitude: 0, speed: 1, retrograde: false, sign: '양자리', signDegree: 0, house: 1 }])) as unknown as Record<PlanetId, PlanetPosition>;
const chart: NatalChartData = { julianDay: 0, planets, ascendant: 210, midheaven: 120, houses: Array.from({ length: 12 }, (_, index) => index * 30), houseSystem: 'P', timeKnown: true };

describe('NatalChart', () => {
  it('has an accessible chart title and alternative placement table', () => {
    renderWithI18n(<NatalChart chart={chart} />);
    expect(screen.getByRole('img', { name: '출생 차트 원형 도표' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: '행성 배치표' })).toBeInTheDocument();
    expect(screen.getByLabelText('차트 선 범례')).toHaveTextContent('결합조화긴장ASC·MC');
  });

  it('renders an English chart title and placement table from the same chart', () => {
    renderWithI18n(<NatalChart chart={chart} />, 'en');
    expect(screen.getByRole('img', { name: 'Circular natal chart' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Planetary placements' })).toBeInTheDocument();
    expect(screen.getByText('Aries 0°00′')).toBeInTheDocument();
    expect(screen.getByLabelText('Chart line legend')).toHaveTextContent('ConjunctionHarmonyTensionASC·MC');
  });

  it('backs every sharp semantic aspect line with an unblurred contrast under-stroke', () => {
    const { container } = renderWithI18n(<NatalChart chart={chart} />);
    const underlays = container.querySelectorAll('.aspect-underlays .aspect-underlay');
    const dataLines = container.querySelectorAll('.aspect-lines .aspect-line-data');

    expect(dataLines.length).toBeGreaterThan(0);
    expect(underlays).toHaveLength(dataLines.length);
    underlays.forEach((line) => expect(line).not.toHaveAttribute('filter'));
    dataLines.forEach((line) => {
      expect(line).not.toHaveAttribute('filter');
      expect(line).toHaveAttribute('opacity', '1');
    });
  });
});
