import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PeriodFlowChart } from './PeriodFlowChart';

const points = [
  { date: '2026-08-01', label: 'August 1, 2026', score: 60, tone: 'steady' as const },
  { date: '2026-08-08', label: 'August 8, 2026', score: 78, tone: 'flow' as const },
  { date: '2026-08-15', label: 'August 15, 2026', score: 55, tone: 'steady' as const },
  { date: '2026-08-22', label: 'August 22, 2026', score: 82, tone: 'flow' as const },
  { date: '2026-08-31', label: 'August 31, 2026', score: 66, tone: 'steady' as const },
];

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
    expect(area).toHaveAttribute('fill-opacity', '0.12');
    expect(container.querySelectorAll('.period-node')).toHaveLength(5);
  });

  it('marks the strongest and softest points with ten-pixel rings and text icons', () => {
    const { container } = render(<PeriodFlowChart points={points} label="Flow" />);
    const strongest = container.querySelector('.period-node.strongest');
    const softest = container.querySelector('.period-node.softest');

    expect(strongest).toHaveClass('flow');
    expect(strongest?.querySelector('.period-node-ring')).toHaveAttribute('r', '10');
    expect(strongest?.querySelector('.period-node-icon')).toHaveTextContent('✦');
    expect(softest).toHaveClass('steady');
    expect(softest?.querySelector('.period-node-ring')).toHaveAttribute('r', '10');
    expect(softest?.querySelector('.period-node-icon')).toHaveTextContent('!');
    expect(strongest?.querySelector('title')).toHaveTextContent('August 22, 2026 · 82');
    expect(softest?.querySelector('title')).toHaveTextContent('August 15, 2026 · 55');
  });
});
