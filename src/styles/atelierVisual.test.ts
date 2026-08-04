import chart from '../features/chart/NatalChart.css?raw';
import results from '../features/results/results.css?raw';
import global from './global.css?raw';
import tokens from './tokens.css?raw';
import { expect, it } from 'vitest';

it('uses only the approved atelier foundation and one content rail', () => {
  const css = [tokens, global, results, chart].join('\n').toLowerCase();

  ['#f3efe7', '#11100e', '#b79a62', '#d2c29f', '#385a78', '#9c5544'].forEach((color) =>
    expect(css).toContain(color),
  );
  ['#a99bff', '#8171ed', '#7b6ce0', '#ef7697'].forEach((color) =>
    expect(css).not.toContain(color),
  );
  expect(tokens).toContain('--content-rail: 1120px');
  expect(tokens).toContain('--page-gutter: clamp(16px, 4vw, 40px)');
});
