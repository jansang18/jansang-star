import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Temporal } from '@js-temporal/polyfill';
import App from './App';
import { EphemerisLoader } from './components/EphemerisLoader';
import * as ResultsPageModule from './features/results/ResultsPage';
import { renderWithI18n } from './test/renderWithI18n';

describe('full app flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('scrollTo', vi.fn());
    vi.spyOn(Temporal.Now, 'plainDateISO').mockReturnValue(Temporal.PlainDate.from('2026-08-05'));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('preserves one real Seoul calculation and its neutral evidence across both languages', async () => {
    const user = userEvent.setup();
    const resultsPageRender = vi.spyOn(ResultsPageModule, 'ResultsPage');
    const { container } = renderWithI18n(<App />);
    await user.click(screen.getByRole('button', { name: '나의 별자리 만세력 보기' }));
    await user.type(screen.getByLabelText('이름 또는 별칭'), '김별');
    await user.type(screen.getByLabelText('생년월일'), '19900805');
    expect(screen.getByLabelText('생년월일')).toHaveValue('1990-08-05');
    await user.clear(screen.getByLabelText('출생시간'));
    await user.type(screen.getByLabelText('출생시간'), '14:30');
    await user.type(screen.getByRole('combobox', { name: '출생지역' }), '서울');
    await user.click(screen.getByRole('option', { name: /서울/ }));
    await user.click(screen.getByRole('button', { name: /별자리 만세력 계산하기/ }));
    expect(await screen.findByRole('heading', { name: '김별님의 코스믹 리포트' }, { timeout: 30_000 })).toBeInTheDocument();
    expect(screen.getAllByText('태양–태양 · 합 · 오브 0.2°').length).toBeGreaterThan(0);
    const koreanFlowScore = container.querySelector('.score-orbit strong')?.textContent;
    expect(koreanFlowScore).toBe('80');
    const koreanResultProps = resultsPageRender.mock.calls.at(-1)?.[0];
    expect(koreanResultProps).toBeDefined();
    expect(koreanResultProps?.profile).toEqual({
      displayName: '김별',
      date: '1990-08-05',
      time: '14:30',
      timeKnown: true,
      cityId: 'seoul',
      latitude: 37.5665,
      longitude: 126.978,
      timeZone: 'Asia/Seoul',
      disambiguation: 'compatible',
    });
    const resultKeys = ['profile', 'chart', 'transits', 'fortune', 'monthFortune', 'yearFortune', 'detailedReading'] as const;
    const koreanRenderCount = resultsPageRender.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('heading', { name: "김별's cosmic report" })).toBeInTheDocument();
    expect(screen.getAllByText('Sun–Sun · Conjunction · orb 0.2°').length).toBeGreaterThan(0);
    expect(container.querySelector('.score-orbit strong')).toHaveTextContent(koreanFlowScore ?? '');
    const englishResultProps = resultsPageRender.mock.calls.at(-1)?.[0];
    expect(englishResultProps).toBeDefined();
    expect(resultsPageRender.mock.calls.length).toBeGreaterThan(koreanRenderCount);
    for (const key of resultKeys) expect(englishResultProps?.[key], key).toBe(koreanResultProps?.[key]);
    const englishRenderCount = resultsPageRender.mock.calls.length;

    await user.click(screen.getByRole('tab', { name: 'This month' }));
    const strongestScore = container.querySelector('.period-node.strongest .period-node-score')?.textContent;
    const softestScore = container.querySelector('.period-node.softest .period-node-score')?.textContent;
    expect(strongestScore).toBe('100');
    expect(softestScore).toBe('82');
    const planetsSection = screen.getByTestId('reading-section-planets');
    await user.click(within(planetsSection).getByRole('button', { name: 'Mercury' }));

    await user.click(screen.getByRole('button', { name: '한국어' }));
    expect(screen.getByRole('tab', { name: '이번 달' })).toHaveAttribute('aria-selected', 'true');
    expect(container.querySelector('.period-node.strongest .period-node-score')).toHaveTextContent(strongestScore ?? '');
    expect(container.querySelector('.period-node.softest .period-node-score')).toHaveTextContent(softestScore ?? '');
    expect(within(screen.getByTestId('reading-section-bigThree')).getByRole('button', { name: '태양' }))
      .toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByTestId('reading-section-planets')).getByRole('button', { name: '수성' }))
      .toHaveAttribute('aria-expanded', 'true');
    const restoredKoreanResultProps = resultsPageRender.mock.calls.at(-1)?.[0];
    expect(restoredKoreanResultProps).toBeDefined();
    expect(resultsPageRender.mock.calls.length).toBeGreaterThan(englishRenderCount);
    for (const key of resultKeys) expect(restoredKoreanResultProps?.[key], key).toBe(koreanResultProps?.[key]);

    await user.click(screen.getAllByRole('button', { name: '출생정보 수정' })[0]);
    expect(screen.getByLabelText('이름 또는 별칭')).toHaveValue('김별');
    expect(screen.getByLabelText('생년월일')).toHaveValue('1990-08-05');
    expect(screen.getByLabelText('출생시간')).toHaveValue('14:30');
    expect(screen.getByRole('combobox', { name: '출생지역' })).toHaveValue('서울');
  }, 40_000);

  it('announces the localized ephemeris loader as a polite live status', () => {
    renderWithI18n(<EphemerisLoader />);
    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-live', 'polite');
    expect(loader).toHaveTextContent('태어난 순간의 하늘을 계산하고 있어요');
  });
});
