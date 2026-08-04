import chart from '../features/chart/NatalChart.css?raw';
import birthForm from '../features/profile/BirthForm.css?raw';
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

function expectRule(css: string, selector: string, declarations: string[]) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'gs'))];
  expect(matches.length, `missing rule for ${selector}`).toBeGreaterThan(0);
  declarations.forEach((declaration) =>
    expect(matches.some((match) => match[1].includes(declaration)), `${selector} lacks ${declaration}`).toBe(true),
  );
}

it('guards accessible contrast, metadata sizing, copy rhythm, wrapping, and press feedback', () => {
  expect(chart).toContain('.aspect-underlay');
  expect(chart).toContain('stroke: var(--ink-inverse)');
  expect(chart).toContain('.aspect-line-data');
  expect(chart).toContain('@media (prefers-contrast: more)');
  expectRule(chart, '.chart-legend i', ['box-shadow: 0 0 0 1px var(--ink-inverse)']);
  expectRule(chart, '.house-number', ['font-size: 14px']);
  expectRule(chart, '.retrograde', ['font-size: 14px']);
  expectRule(chart, '.angle-label', ['font-size: 14px']);

  expect(results).toContain('.period-node-ring-backdrop');
  expectRule(results, '.period-node-ring-backdrop', ['stroke: var(--ink-inverse)']);
  expectRule(results, '.period-node-icon', ['paint-order: stroke fill', 'stroke-width: 3px']);
  expectRule(results, '.period-node-label', ['font-size: 14px']);
  expectRule(results, '.period-node-score', ['font-size: 14px']);
  expectRule(results, '.big-three-card p', ['line-height: 1.75']);
  expectRule(results, '.aspect-list p', ['line-height: 1.75']);
  expectRule(results, '.period-windows b', ['line-height: 1.75']);
  expectRule(results, '.reading-notices p', ['line-height: 1.75']);
  expectRule(results, '.legal-notice', ['line-height: 1.75']);
  expectRule(results, '.result-footer', ['color: var(--ink)']);
  expect(results).toMatch(/\.hero-summary h1[^}]*overflow-wrap:\s*anywhere/s);

  expectRule(birthForm, '.time-note', ['line-height: 1.75']);
  expect(birthForm).toMatch(/\.city-options li\.active span,[^{]*\.city-options li:hover span\s*\{[^}]*color:\s*var\(--ink\)/s);
  expect(global).toContain('summary:active');
  expect(global).toContain("input[type='checkbox']:active");
  expect(global).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*summary:active[\s\S]*transform:\s*none/);

  const reducedMotionStart = global.indexOf('@media (prefers-reduced-motion: reduce)');
  const reducedMotionEnd = global.indexOf('@media (prefers-reduced-transparency: reduce)');
  const regularMotion = global.slice(0, reducedMotionStart);
  const reducedMotion = global.slice(reducedMotionStart, reducedMotionEnd);
  [
    "input:not([type]):active",
    "input[type='text']:active",
    "input[type='date']:active",
    "input[type='time']:active",
    "input[type='number']:active",
    "input[type='search']:active",
    "input[role='combobox']:active",
  ].forEach((selector) => {
    expect(regularMotion, `regular active feedback misses ${selector}`).toContain(selector);
    expect(reducedMotion, `reduced-motion reset misses ${selector}`).toContain(selector);
  });
  expect(regularMotion).toMatch(/input\[role='combobox'\]:active,[\s\S]*\{\s*transform:\s*scale\(\.98\)/);
  expect(reducedMotion).toMatch(/input\[role='combobox'\]:active,[\s\S]*\{\s*transform:\s*none/);

  const contrastChart = chart.slice(chart.indexOf('@media (prefers-contrast: more)'));
  expect(contrastChart).toMatch(/\.chart-outer-ring,[\s\S]*\.house-line,[\s\S]*\{\s*stroke:\s*var\(--ink-inverse\)/);
  expectRule(contrastChart, '.aspect-underlay', ['stroke: var(--ink-inverse)', 'opacity: 1']);
});

it('clips decorative horizontal overflow without becoming the sticky scroll container', () => {
  expectRule(results, '.results-page', ['overflow-x: clip']);
  expect(results).not.toMatch(/\.results-page\s*\{[^}]*overflow-x:\s*hidden/s);
  expectRule(results, '.period-selector', ['position: sticky', 'top: 12px']);
  expect(results).toMatch(/@media \(max-width: 800px\)[\s\S]*\.period-selector\s*\{[^}]*top:\s*8px/);
});
