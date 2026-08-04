import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PeriodFlowChart } from './PeriodFlowChart';

const points = [
  { date: '2026-08-01', label: 'August 1, 2026', tickLabel: 'August 1, 2026', score: 60, tone: 'steady' as const },
  { date: '2026-08-08', label: 'August 8, 2026', tickLabel: 'August 8, 2026', score: 78, tone: 'flow' as const },
  { date: '2026-08-15', label: 'August 15, 2026', tickLabel: 'August 15, 2026', score: 55, tone: 'steady' as const },
  { date: '2026-08-22', label: 'August 22, 2026', tickLabel: 'August 22, 2026', score: 82, tone: 'flow' as const },
  { date: '2026-08-31', label: 'August 31, 2026', tickLabel: 'August 31, 2026', score: 66, tone: 'steady' as const },
];

const yearlyDates = Array.from({ length: 12 }, (_, index) => `2026-${String(index + 1).padStart(2, '0')}-15`);
const englishFullDates = [
  'January 15, 2026', 'February 15, 2026', 'March 15, 2026', 'April 15, 2026',
  'May 15, 2026', 'June 15, 2026', 'July 15, 2026', 'August 15, 2026',
  'September 15, 2026', 'October 15, 2026', 'November 15, 2026', 'December 15, 2026',
];
const englishTickLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const koreanTickLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function yearlyPoints(labels: string[], tickLabels: string[]) {
  return yearlyDates.map((date, index) => ({
    date,
    label: labels[index],
    tickLabel: tickLabels[index],
    score: 50 + index,
    tone: 'steady' as const,
  }));
}

describe('PeriodFlowChart', () => {
  it('renders an accessible pure SVG line and area chart', () => {
    const { container } = render(<PeriodFlowChart points={points} label="August 2026 flow line chart" />);
    const svg = screen.getByRole('img', { name: 'August 2026 flow line chart' });
    const line = container.querySelector('.period-line');
    const area = container.querySelector('.period-area');

    expect(svg).toHaveAttribute('viewBox', '0 0 760 260');
    expect(svg.querySelector('title')).toHaveTextContent('August 2026 flow line chart');
    expect(line).toHaveAttribute('d', expect.stringMatching(/^M /));
    expect(line).toHaveAttribute('stroke-width', '3');
    expect(area).toHaveAttribute('d', expect.stringMatching(/ Z$/));
    expect(area).toHaveAttribute('fill-opacity', '0.08');
    expect(container.querySelectorAll('.period-node')).toHaveLength(5);
  });

  it('marks the strongest and softest points with ten-pixel rings and text icons', () => {
    const { container } = render(<PeriodFlowChart points={points} label="Flow" />);
    const strongest = container.querySelector('.period-node.strongest');
    const softest = container.querySelector('.period-node.softest');

    expect(strongest).toHaveClass('flow');
    expect(strongest?.querySelector('.period-node-ring-backdrop')).toHaveAttribute('r', '10');
    expect(strongest?.querySelector('.period-node-ring')).toHaveAttribute('r', '10');
    expect(strongest?.querySelector('.period-node-icon')).toHaveTextContent('✦');
    expect(softest).toHaveClass('steady');
    expect(softest?.querySelector('.period-node-ring-backdrop')).toHaveAttribute('r', '10');
    expect(softest?.querySelector('.period-node-ring')).toHaveAttribute('r', '10');
    expect(softest?.querySelector('.period-node-icon')).toHaveTextContent('!');
    expect(strongest?.querySelector('title')).toHaveTextContent('August 22, 2026 · 82');
    expect(softest?.querySelector('title')).toHaveTextContent('August 15, 2026 · 55');
  });

  it('renders exact authored yearly ticks while preserving every full date for assistive technology', () => {
    const english = render(<PeriodFlowChart
      points={yearlyPoints(englishFullDates, englishTickLabels)}
      label="2026 flow line chart"
    />);

    expect([...english.container.querySelectorAll('.period-node-label')].map((node) => node.textContent)).toEqual(englishTickLabels);
    expect([...english.container.querySelectorAll('.period-node > title')].map((node) => node.textContent)).toEqual(
      englishFullDates.map((date, index) => `${date} · ${50 + index}`),
    );
    expect(english.container.querySelector('desc')).toHaveTextContent('January 15, 2026 · 50');
    expect(english.container.querySelector('desc')).toHaveTextContent('December 15, 2026 · 61');
    expect(screen.getByRole('img', { name: '2026 flow line chart' })).toHaveAccessibleDescription(
      /January 15, 2026 · 50.*December 15, 2026 · 61/,
    );
    english.unmount();

    const koreanFullDates = Array.from({ length: 12 }, (_, index) => `2026년 ${index + 1}월 15일`);
    const korean = render(<PeriodFlowChart
      points={yearlyPoints(koreanFullDates, koreanTickLabels)}
      label="2026년 흐름 선 그래프"
    />);

    expect([...korean.container.querySelectorAll('.period-node-label')].map((node) => node.textContent)).toEqual(koreanTickLabels);
    expect(korean.container.querySelector('desc')).toHaveTextContent('2026년 1월 15일 · 50');
    expect(korean.container.querySelector('desc')).toHaveTextContent('2026년 12월 15일 · 61');
    expect(screen.getByRole('img', { name: '2026년 흐름 선 그래프' })).toHaveAccessibleDescription(
      /2026년 1월 15일 · 50.*2026년 12월 15일 · 61/,
    );
  });

  it('keeps the five-point monthly labels visible and unchanged', () => {
    const { container } = render(<PeriodFlowChart points={points} label="August 2026 flow line chart" />);

    expect([...container.querySelectorAll('.period-node-label')].map((node) => node.textContent)).toEqual(
      points.map((point) => point.label),
    );
  });
});
