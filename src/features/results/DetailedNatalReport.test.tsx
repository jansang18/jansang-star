import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PLANETS } from '../astrology/constants';
import type { NatalChartData, PlanetId, PlanetPosition } from '../astrology/types';
import { buildDetailedReading } from '../readings/buildDetailedReading';
import { renderDetailedReading } from '../readings/renderDetailedReading';
import type { TransitData } from '../fortune/transits';
import { renderWithI18n } from '../../test/renderWithI18n';
import { DetailedNatalReport } from './DetailedNatalReport';

const planets = Object.fromEntries(PLANETS.map((planet, index) => [planet.id, {
  ...planet,
  longitude: index * 31,
  latitude: 0,
  speed: 1,
  retrograde: false,
  sign: '사자자리',
  signDegree: 12,
  house: (index % 12) + 1,
}])) as unknown as Record<PlanetId, PlanetPosition>;
const chart: NatalChartData = {
  julianDay: 0,
  planets,
  ascendant: 210,
  midheaven: 120,
  houses: Array.from({ length: 12 }, (_, index) => index * 30),
  houseSystem: 'P',
  timeKnown: true,
};
const transits = {
  date: '2026-08-05',
  chart,
  aspects: [{ type: 'trine', from: 'sun', to: 'moon', angle: 120, orb: 1, maxOrb: 7 }],
} as TransitData;
const report = renderDetailedReading(buildDetailedReading(chart, transits), 'en');

describe('DetailedNatalReport', () => {
  it('renders every detailed section and keeps stable block ids while opening a chapter', async () => {
    const user = userEvent.setup();
    renderWithI18n(<DetailedNatalReport report={report} />, 'en');

    ['bigThree', 'planets', 'houses', 'aspects', 'transits'].forEach((id) =>
      expect(screen.getByTestId(`reading-section-${id}`)).toBeInTheDocument());
    const bigThree = screen.getByTestId('reading-section-bigThree');
    const sun = within(bigThree).getByRole('button', { name: /Sun/ });
    expect(sun).toHaveAttribute('id', 'reading-chapter-bigThree:sun-trigger');

    await user.click(sun);

    expect(sun).toHaveAttribute('aria-expanded', 'true');
  });
});
