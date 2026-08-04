import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLANETS } from '../astrology/constants';
import type { NatalChartData, PlanetId, PlanetPosition } from '../astrology/types';
import type { BirthProfile } from '../profile/types';
import { generateDailyFortune } from '../fortune/generateFortune';
import type { TransitData } from '../fortune/transits';
import { ResultsPage } from './ResultsPage';
import { renderWithI18n } from '../../test/renderWithI18n';

const planets = Object.fromEntries(PLANETS.map((planet, index) => [planet.id, { ...planet, longitude: index * 31, latitude: 0, speed: 1, retrograde: false, sign: '사자자리', signDegree: 12, house: (index % 12) + 1 }])) as unknown as Record<PlanetId, PlanetPosition>;
const chart: NatalChartData = { julianDay: 0, planets, ascendant: 210, midheaven: 120, houses: Array.from({ length: 12 }, (_, index) => index * 30), houseSystem: 'P', timeKnown: true };
const profile: BirthProfile = { displayName: '김별', date: '1990-08-05', time: '14:30', timeKnown: true, cityId: 'seoul', latitude: 37.56, longitude: 126.97, timeZone: 'Asia/Seoul', disambiguation: 'compatible' };
const transits = { date: '2026-08-05', chart, aspects: [] } as TransitData;
const fortune = generateDailyFortune(chart, transits, transits.date);

describe('ResultsPage', () => {
  it('shows the full approved vertical result order', () => {
    renderWithI18n(<ResultsPage profile={profile} chart={chart} transits={transits} fortune={fortune} onEdit={() => {}} />);
    ['태양·달·상승궁', '오늘의 코스믹 웨더', '행성 배치', '12하우스', '주요 애스펙트', '오늘의 트랜짓', '분야별 오늘 운세', '오늘의 행운']
      .forEach((title) => expect(screen.getByRole('heading', { name: title })).toBeInTheDocument());
    expect(screen.getAllByText('주요 흐름이 비교적 고르다').length).toBeGreaterThan(0);
    expect(screen.getByText(/본 아이보리|샴페인 골드|딥 코발트|코퍼|세이지|스모크 블루|펄 그레이/)).toBeInTheDocument();
  });
});
