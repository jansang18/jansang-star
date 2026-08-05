import chart from '../features/chart/NatalChart.css?raw';
import birthForm from '../features/profile/BirthForm.css?raw';
import results from '../features/results/results.css?raw';
import indexHtml from '../../index.html?raw';
import viteConfig from '../../vite.config.ts?raw';
import global from './global.css?raw';
import tokens from './tokens.css?raw';
import { expect, it } from 'vitest';

const legacyPurples = ['#6f62d4', '#a99bff', '#8171ed', '#7b6ce0', '#ef7697'];

it('uses only the approved atelier foundation and one content rail', () => {
  const css = [tokens, global, birthForm, results, chart].join('\n').toLowerCase();

  ['#f3efe7', '#11100e', '#b79a62', '#d2c29f', '#385a78', '#9c5544'].forEach((color) =>
    expect(css).toContain(color),
  );
  legacyPurples.forEach((color) =>
    expect(css).not.toContain(color),
  );
  expect(tokens).toContain('--content-rail: 1120px');
  expect(tokens).toContain('--page-gutter: clamp(16px, 4vw, 40px)');
});

it('aligns browser chrome metadata with the approved atelier theme', () => {
  const document = new DOMParser().parseFromString(indexHtml, 'text/html');
  const themeColorMetas = [...document.querySelectorAll('meta[name="theme-color"]')];
  const productionPaletteScope = [indexHtml, viteConfig, tokens, global, birthForm, results, chart]
    .join('\n')
    .toLowerCase();

  expect(themeColorMetas).toHaveLength(1);
  expect(themeColorMetas[0]?.getAttribute('content')).toBe('#11100E');
  expect(viteConfig).toContain("theme_color: '#11100E'");
  legacyPurples.forEach((color) => expect(productionPaletteScope).not.toContain(color));
});

function expectRule(css: string, selector: string, declarations: string[]) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'gs'))];
  expect(matches.length, `missing rule for ${selector}`).toBeGreaterThan(0);
  declarations.forEach((declaration) =>
    expect(matches.some((match) => match[1].includes(declaration)), `${selector} lacks ${declaration}`).toBe(true),
  );
}

function tokenColor(name: string): string {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  expect(match, `missing hex token --${name}`).not.toBeNull();
  return match?.[1] ?? '#000000';
}

function contrastMoreTokenColor(name: string): string {
  const contrastMore = global.slice(global.indexOf('@media (prefers-contrast: more)'));
  const match = contrastMore.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  expect(match, `missing prefers-contrast token --${name}`).not.toBeNull();
  return match?.[1] ?? '#000000';
}

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((pair) => Number.parseInt(pair, 16) / 255) ?? [];
  const linear = channels.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first: string, second: string): number {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort((left, right) => right - left);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

function computedFocusedControl(markup: string): {
  outline: string;
  outlineOffset: string;
  boxShadow: string;
} {
  const style = document.createElement('style');
  style.textContent = [tokens, global, birthForm, results].join('\n');
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.head.append(style);
  document.body.append(host);
  const control = host.querySelector('button');
  expect(control, 'missing focus test control').not.toBeNull();
  control?.focus();
  const computed = getComputedStyle(control!);
  const snapshot = {
    outline: computed.outline,
    outlineOffset: computed.outlineOffset,
    boxShadow: computed.boxShadow,
  };
  host.remove();
  style.remove();
  return snapshot;
}

it('uses dual-color focus indicators on light and dark surfaces and fully opaque accessible placeholders', () => {
  const focusRule = global.match(/:where\(([^)]*)\):focus-visible\s*\{([^}]*)\}/s);
  expect(focusRule, 'missing shared focus-visible rule').not.toBeNull();
  expect(focusRule?.[1]).toContain('a');
  expect(focusRule?.[1]).toContain('button');
  expect(focusRule?.[1]).toContain('input');
  expect(focusRule?.[1]).toContain('summary');
  expect(focusRule?.[2]).toContain('outline: 2px solid var(--ink-inverse)');
  expect(focusRule?.[2]).toContain('outline-offset: 3px');
  expect(focusRule?.[2]).toContain('box-shadow: 0 0 0 2px var(--obsidian)');
  expectRule(birthForm, '.input-wrap', [
    'align-items: center',
    'min-height: 52px',
    'border-radius: 14px',
  ]);
  expectRule(birthForm, '.input-wrap:focus-within', [
    'border-color: var(--input-focus-border)',
    'background: var(--input-focus-bg)',
    'box-shadow: 0 0 0 3px var(--input-focus-ring)',
  ]);
  const inputFocusRule = birthForm.match(/\.input-wrap:focus-within\s*\{([^}]*)\}/s)?.[1] ?? '';
  expect(inputFocusRule).not.toContain('var(--obsidian)');
  expectRule(birthForm, '.input-wrap input:focus-visible', ['outline: 0', 'box-shadow: none']);
  expectRule(birthForm, '.field > input:focus-visible', [
    'border-color: var(--input-focus-border)',
    'background: var(--input-focus-bg)',
    'box-shadow: 0 0 0 3px var(--input-focus-ring)',
  ]);
  expectRule(birthForm, '.field input::placeholder', ['color: var(--muted)', 'opacity: 1']);

  const css = [global, birthForm, results, chart].join('\n');
  expect(css).not.toMatch(/outline:\s*2px solid var\(--brass\)/);
  expect(contrastRatio(tokenColor('obsidian'), tokenColor('paper'))).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(tokenColor('ink-inverse'), tokenColor('obsidian'))).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(tokenColor('muted'), tokenColor('paper-elevated'))).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(tokenColor('input-focus-border'), tokenColor('input-focus-bg'))).toBeGreaterThanOrEqual(3);
});

it('preserves the dual focus ring in the computed cascade for every shadowed interactive control', () => {
  const controls = [
    {
      name: 'primary CTA',
      markup: '<button class="primary-button">Start</button>',
      existingShadow: '0 12px 28px rgba(17, 16, 14, .18)',
    },
    {
      name: 'calculate button',
      markup: '<button class="calculate-button">Calculate</button>',
      existingShadow: '0 14px 30px rgba(17, 16, 14, .16)',
    },
    {
      name: 'active period tab',
      markup: '<div class="period-selector"><button class="active">Today</button></div>',
      existingShadow: 'inset 0 1px rgba(255, 255, 255, .42)',
    },
  ];

  controls.forEach(({ name, markup, existingShadow }) => {
    const computed = computedFocusedControl(markup);
    expect(computed.outline, `${name} loses the light focus boundary`).toBe('2px solid var(--ink-inverse)');
    expect(computed.outlineOffset, `${name} loses the focus separation`).toBe('3px');
    expect(computed.boxShadow, `${name} loses the dark focus boundary`).toContain('0 0 0 2px var(--obsidian)');
    expect(computed.boxShadow, `${name} loses its component shadow`).toContain(existingShadow);
  });

  expect(contrastRatio(tokenColor('obsidian'), tokenColor('paper-elevated'))).toBeGreaterThanOrEqual(3);
  expect(contrastRatio(tokenColor('ink-inverse'), tokenColor('obsidian'))).toBeGreaterThanOrEqual(3);
});

it('keeps placeholder contrast at 4.5:1 in base and simulated prefers-contrast-more states', () => {
  expectRule(birthForm, '.field input::placeholder', ['color: var(--muted)', 'opacity: 1']);
  const background = tokenColor('paper-elevated');
  const states = [
    ['base', tokenColor('muted')],
    ['prefers-contrast: more', contrastMoreTokenColor('muted')],
  ] as const;

  states.forEach(([state, foreground]) => {
    expect(contrastRatio(foreground, background), `${state} placeholder contrast`).toBeGreaterThanOrEqual(4.5);
  });
});

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
