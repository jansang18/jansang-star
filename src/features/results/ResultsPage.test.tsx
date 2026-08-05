import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { PLANETS } from '../astrology/constants';
import type { NatalChartData, PlanetId, PlanetPosition } from '../astrology/types';
import type { BirthProfile } from '../profile/types';
import { generateDailyFortune } from '../fortune/generateFortune';
import type { TransitData } from '../fortune/transits';
import { ResultsPage } from './ResultsPage';
import { renderWithI18n } from '../../test/renderWithI18n';
import { summarizePeriodFortune } from '../fortune/periodFortune';
import { buildDetailedReading } from '../readings/buildDetailedReading';

const planets = Object.fromEntries(PLANETS.map((planet, index) => [planet.id, { ...planet, longitude: index * 31, latitude: 0, speed: 1, retrograde: false, sign: '사자자리', signDegree: 12, house: (index % 12) + 1 }])) as unknown as Record<PlanetId, PlanetPosition>;
const chart: NatalChartData = { julianDay: 0, planets, ascendant: 210, midheaven: 120, houses: Array.from({ length: 12 }, (_, index) => index * 30), houseSystem: 'P', timeKnown: true };
const profile: BirthProfile = { displayName: '김별', date: '1990-08-05', time: '14:30', timeKnown: true, cityId: 'seoul', latitude: 37.56, longitude: 126.97, timeZone: 'Asia/Seoul', disambiguation: 'compatible' };
const transits = { date: '2026-08-05', chart, aspects: [] } as TransitData;
const detailedReading = buildDetailedReading(chart, {
  ...transits,
  aspects: [{ type: 'trine', from: 'sun', to: 'moon', angle: 120, orb: 1, maxOrb: 7 }],
});
const fortune = generateDailyFortune(chart, transits, transits.date);
const periodSample = (score: number) => ({
  ...fortune,
  overallScore: score,
  categories: Object.fromEntries(Object.entries(fortune.categories).map(([key, category]) => [
    key,
    { ...category, score },
  ])) as typeof fortune.categories,
});
const monthFortune = summarizePeriodFortune('month', transits.date, [60, 78, 55, 82, 66].map(periodSample));
const yearFortune = summarizePeriodFortune(
  'year',
  transits.date,
  [42, 51, 59, 64, 70, 75, 81, 77, 68, 62, 56, 49].map(periodSample),
);

afterEach(cleanup);

describe('ResultsPage', () => {
  it('shows the full approved vertical result order', () => {
    renderWithI18n(<ResultsPage profile={profile} chart={chart} transits={transits} fortune={fortune} detailedReading={detailedReading} onEdit={() => {}} />);
    const headings = ['태양·달·상승궁', '오늘의 코스믹 웨더', '출생 차트 상세 풀이', '행성 배치', '12하우스', '주요 애스펙트', '오늘의 트랜짓', '분야별 오늘 운세', '오늘의 행운']
      .map((title) => screen.getByRole('heading', { name: title }));
    headings.slice(1).forEach((heading, index) => {
      expect(headings[index].compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    expect(screen.getAllByText('주요 흐름이 비교적 고르다').length).toBeGreaterThan(0);
    expect(screen.getByText(/본 아이보리|샴페인 골드|딥 코발트|코퍼|세이지|스모크 블루|펄 그레이/)).toBeInTheDocument();
  });

  it('localizes neutral monthly and yearly models into detailed Korean disclosures', async () => {
    const user = userEvent.setup();
    const { container } = renderWithI18n(<ResultsPage
      profile={profile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      monthFortune={monthFortune}
      yearFortune={yearFortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />);
    const page = within(container);

    await user.click(page.getByRole('tab', { name: '이번 달' }));
    expect(page.getByRole('img', { name: '2026년 8월 흐름 선 그래프' })).toBeInTheDocument();
    expect(container.querySelectorAll('.period-overview > p')).toHaveLength(7);
    expect(page.getByRole('heading', { name: '분야별 전략' })).toBeInTheDocument();
    const monthChapter = page.getByRole('button', { name: /2026년 8월 22일 전후 흐름/ });
    expect(monthChapter).toHaveAttribute('aria-expanded', 'false');
    await user.click(monthChapter);
    expect(monthChapter).toHaveAttribute('aria-expanded', 'true');
    expect(page.getByText('2026년 8월 22일 · 흐름 점수 82점')).toBeVisible();

    await user.click(page.getByRole('tab', { name: '올해' }));
    expect(page.getByRole('img', { name: '2026년 흐름 선 그래프' })).toBeInTheDocument();
    expect(container.querySelectorAll('.period-overview > p')).toHaveLength(9);
    expect(page.getByRole('heading', { name: '분기별 큰 흐름' })).toBeInTheDocument();
    expect(page.getAllByRole('button', { name: /분기 큰 흐름/ })).toHaveLength(4);
    expect(page.getAllByRole('button', { name: /의 월간 흐름/ })).toHaveLength(12);
  });

  it('renders all specified English result section titles', () => {
    const { container } = renderWithI18n(<ResultsPage
      profile={profile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      monthFortune={monthFortune}
      yearFortune={yearFortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />, 'en');
    const page = within(container);

    [
      'Sun, Moon & Rising',
      'Detailed natal reading',
      'Planetary placements',
      'The twelve houses',
      'Major natal aspects',
      'Transits to natal',
      'Five areas today',
      "Today's lucky guide",
    ].forEach((title) => expect(page.getByRole('heading', { name: title })).toBeInTheDocument());
    expect(page.getByRole('button', { name: 'Edit birth information' })).toBeInTheDocument();
  });

  it('shows a persisted global city name instead of reducing it to coordinates', () => {
    const globalProfile: BirthProfile = {
      ...profile,
      cityId: 'geonames-3448439',
      cityNameKo: '상파울루',
      cityNameEn: 'Sao Paulo',
      countryCode: 'BR',
      countryKo: '브라질',
      countryEn: 'Brazil',
      latitude: -23.5475,
      longitude: -46.63611,
      timeZone: 'America/Sao_Paulo',
    };
    const { container } = renderWithI18n(<ResultsPage
      profile={globalProfile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />, 'en');

    expect(within(container).getByText(/Sao Paulo/)).toBeInTheDocument();
    expect(within(container).queryByText(/-23\.55, -46\.64/)).not.toBeInTheDocument();
  });

  it('preserves selected period and expanded chapter when locale changes', async () => {
    const user = userEvent.setup();
    const { container } = renderWithI18n(<ResultsPage
      profile={profile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      monthFortune={monthFortune}
      yearFortune={yearFortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />);
    const page = within(container);

    await user.click(page.getByRole('tab', { name: '이번 달' }));
    const koreanPlanets = page.getByTestId('reading-section-planets');
    await user.click(within(koreanPlanets).getByRole('button', { name: '수성' }));
    await user.click(page.getByRole('button', { name: 'English' }));

    expect(page.getByRole('tab', { name: 'This month' })).toHaveAttribute('aria-selected', 'true');
    const englishBigThree = page.getByTestId('reading-section-bigThree');
    expect(within(englishBigThree).getByRole('button', { name: /Sun/ })).toHaveAttribute('aria-expanded', 'true');
    const englishPlanets = page.getByTestId('reading-section-planets');
    expect(within(englishPlanets).getByRole('button', { name: 'Mercury' })).toHaveAttribute('aria-expanded', 'true');
    expect(page.getByText('김별')).toBeInTheDocument();
  });

  it('implements roving period tabs with wrapped arrow, Home, End, and matching panel relationships', async () => {
    const user = userEvent.setup();
    const { container } = renderWithI18n(<ResultsPage
      profile={profile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      monthFortune={monthFortune}
      yearFortune={yearFortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />);
    const page = within(container);
    const tablist = page.getByRole('tablist', { name: '운세 기간' });
    const todayTab = within(tablist).getByRole('tab', { name: '오늘' });
    const monthTab = page.getByRole('tab', { name: '이번 달' });
    const yearTab = page.getByRole('tab', { name: '올해' });

    expect(todayTab).toHaveAttribute('id', 'period-tab-today');
    expect(todayTab).toHaveAttribute('aria-controls', 'period-panel-today');
    expect(todayTab).toHaveAttribute('tabindex', '0');
    expect(monthTab).toHaveAttribute('tabindex', '-1');
    expect(yearTab).toHaveAttribute('tabindex', '-1');
    const initialPanel = page.getByRole('tabpanel');
    expect(initialPanel).toHaveAttribute('id', 'period-panel-today');
    expect(initialPanel).toHaveAttribute('aria-labelledby', 'period-tab-today');

    todayTab.focus();
    await user.keyboard('{ArrowLeft}');
    expect(yearTab).toHaveFocus();
    expect(yearTab).toHaveAttribute('aria-selected', 'true');
    expect(yearTab).toHaveAttribute('tabindex', '0');
    expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'period-panel-year');
    expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'period-tab-year');

    await user.keyboard('{ArrowRight}');
    expect(todayTab).toHaveFocus();
    expect(todayTab).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(yearTab).toHaveFocus();
    expect(yearTab).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(todayTab).toHaveFocus();
    expect(todayTab).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    expect(monthTab).toHaveFocus();
    expect(monthTab).toHaveAttribute('aria-selected', 'true');
    expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'period-panel-month');
  });

  it('toggles a default-open Big Three chapter from the keyboard', async () => {
    const user = userEvent.setup();
    const { container } = renderWithI18n(<ResultsPage
      profile={profile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      monthFortune={monthFortune}
      yearFortune={yearFortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />);
    const page = within(container);
    const firstChapter = within(page.getByTestId('reading-section-bigThree')).getByRole('button', { name: '태양' });
    expect(firstChapter).toHaveAttribute('aria-expanded', 'true');
    firstChapter.focus();
    await user.keyboard(' ');
    expect(firstChapter).toHaveAttribute('aria-expanded', 'false');
  });

  it('labels the chart SVG and its alternative table with a caption and column headers', () => {
    const { container } = renderWithI18n(<ResultsPage
      profile={profile}
      chart={chart}
      transits={transits}
      fortune={fortune}
      detailedReading={detailedReading}
      onEdit={() => {}}
    />);
    const page = within(container);
    const chartImage = page.getByRole('img', { name: '출생 차트 원형 도표' });
    expect(chartImage.querySelector('title')).toHaveTextContent('출생 차트 원형 도표');

    const table = page.getByRole('table', { name: '행성 배치표' });
    expect(table.querySelector('caption')).toHaveTextContent('행성 배치표');
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent))
      .toEqual(['행성', '별자리 위치', '하우스', '상태']);
    expect(within(table).getAllByRole('rowheader')).toHaveLength(10);
  });
});
