import { describe, expect, it } from 'vitest';
import { buildPeriodFlowGeometry } from './periodFlowGeometry';

describe('buildPeriodFlowGeometry', () => {
  it('maps the score range to a readable line and closed area', () => {
    const geometry = buildPeriodFlowGeometry([60, 78, 55, 82, 66], 760, 260, 36);

    expect(geometry.points).toHaveLength(5);
    expect(geometry.linePath).toMatch(/^M /);
    expect(geometry.areaPath).toMatch(/ Z$/);
    expect(geometry.domain).toEqual({ min: 47, max: 90 });
    expect(Math.min(...geometry.points.map((point) => point.y))).toBeGreaterThanOrEqual(36);
    expect(Math.max(...geometry.points.map((point) => point.y))).toBeLessThanOrEqual(224);
  });

  it('uses the fixed 40 to 100 domain for a flat series', () => {
    const geometry = buildPeriodFlowGeometry([70, 70, 70], 760, 260, 36);

    expect(geometry.domain).toEqual({ min: 40, max: 100 });
    expect(geometry.points.map((point) => point.y)).toEqual([116, 116, 116]);
  });

  it('keeps boundary and single-point data inside the plot while reserving separate score and tick bands', () => {
    const boundary = buildPeriodFlowGeometry([0, 100], 760, 260, 36);
    const single = buildPeriodFlowGeometry([50], 760, 260, 36);

    expect(boundary.points).toEqual([
      { x: 36, y: 196, score: 0 },
      { x: 724, y: 36, score: 100 },
    ]);
    const scoreTextBaseline = boundary.points[0].y + 26;
    const tickTextBaseline = 260 - 8;
    expect(tickTextBaseline - scoreTextBaseline).toBeGreaterThanOrEqual(24);
    expect(single.points[0].x).toBe(380);
    expect(single.points[0].y).toBeGreaterThanOrEqual(36);
    expect(single.points[0].y).toBeLessThanOrEqual(224);
    expect(single.areaPath).toMatch(/ Z$/);
  });

  it('returns empty paths for an empty series', () => {
    expect(buildPeriodFlowGeometry([], 760, 260, 36)).toEqual({
      points: [],
      linePath: '',
      areaPath: '',
      baselineY: 196,
      domain: { min: 40, max: 100 },
    });
  });

  it('keeps conservative yearly tick bounds disjoint at desktop and mobile chart widths', () => {
    const geometry = buildPeriodFlowGeometry(
      [42, 51, 59, 64, 70, 75, 81, 77, 68, 62, 56, 49],
      760,
      260,
      36,
    );
    const ticks = {
      ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };
    // Chromium measured every authored tick below 30 viewBox units at the production 14px font.
    // A 42-unit envelope leaves extra font-substitution headroom while coupling this check to chart geometry.
    const conservativeTickWidth = (label: string) => Math.max(42, [...label].reduce((width, character) => (
      width + (character === ' ' ? 5 : /[A-Za-z0-9]/.test(character) ? 10 : 14)
    ), 0));

    for (const renderedWidth of [660, 1034]) {
      const scale = renderedWidth / 760;
      for (const locale of ['ko', 'en'] as const) {
        const bounds = geometry.points.map((point, index) => {
          const label = ticks[locale][index];
          expect(label).toBeTruthy();
          const center = point.x * scale;
          const width = conservativeTickWidth(label) * scale;
          return { left: center - width / 2, right: center + width / 2 };
        });
        const adjacentGaps = bounds.slice(0, -1).map((bound, index) => bounds[index + 1].left - bound.right);

        expect(adjacentGaps.filter((gap) => gap < 0), `${locale} at ${renderedWidth}px`).toEqual([]);
        expect(Math.min(...adjacentGaps), `${locale} at ${renderedWidth}px`).toBeGreaterThan(4);
        expect(bounds[0].left).toBeGreaterThanOrEqual(0);
        expect(bounds.at(-1)?.right).toBeLessThanOrEqual(renderedWidth);
      }
    }
  });
});
