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
    expect(geometry.points.map((point) => point.y)).toEqual([130, 130, 130]);
  });

  it('keeps boundary and single-point data inside the padded plot', () => {
    const boundary = buildPeriodFlowGeometry([0, 100], 760, 260, 36);
    const single = buildPeriodFlowGeometry([50], 760, 260, 36);

    expect(boundary.points).toEqual([
      { x: 36, y: 224, score: 0 },
      { x: 724, y: 36, score: 100 },
    ]);
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
      baselineY: 224,
      domain: { min: 40, max: 100 },
    });
  });
});
