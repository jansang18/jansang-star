import { describe, expect, it } from 'vitest';
import {
  PLANET_NODE_MIN_DISTANCE,
  PLANET_NODE_RADIUS,
  RETROGRADE_BADGE_RADIUS,
  RETROGRADE_MARKER_RADIUS,
  layoutPlanetNodes,
  polarPoint,
} from './geometry';

const SEOUL_ASCENDANT = 239.00923505443635;
const SEOUL_PLANETS = [
  { id: 'sun', longitude: 132.55556322694795, retrograde: false },
  { id: 'moon', longitude: 296.41608513099123, retrograde: false },
  { id: 'mercury', longitude: 159.04632617232895, retrograde: false },
  { id: 'venus', longitude: 109.42365499244683, retrograde: false },
  { id: 'mars', longitude: 45.273033438489364, retrograde: false },
  { id: 'jupiter', longitude: 117.16812463732316, retrograde: false },
  { id: 'saturn', longitude: 290.4892275105176, retrograde: true },
  { id: 'uranus', longitude: 276.2470766215381, retrograde: true },
  { id: 'neptune', longitude: 282.4067155659204, retrograde: true },
  { id: 'pluto', longitude: 224.99828023307848, retrograde: false },
] as const;

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceToSegment(point: { x: number; y: number }, start: { x: number; y: number }, end: { x: number; y: number }) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx ** 2 + dy ** 2;
  const projection = lengthSquared === 0
    ? 0
    : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return distance(point, { x: start.x + projection * dx, y: start.y + projection * dy });
}

function normalized(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function isRotation<T>(actual: T[], expected: T[]) {
  return actual.length === expected.length
    && expected.some((_, offset) => actual.every((value, index) => value === expected[(index + offset) % expected.length]));
}

describe('layoutPlanetNodes', () => {
  it('separates the exact Seoul chart while preserving deterministic longitude guides and cyclic order', () => {
    expect(RETROGRADE_MARKER_RADIUS - RETROGRADE_BADGE_RADIUS).toBeGreaterThanOrEqual(3);
    const layout = layoutPlanetNodes(SEOUL_PLANETS, SEOUL_ASCENDANT);
    const reversed = layoutPlanetNodes([...SEOUL_PLANETS].reverse(), SEOUL_ASCENDANT);

    const byId = Object.fromEntries(layout.map((item) => [item.id, item]));
    const reversedById = Object.fromEntries(reversed.map((item) => [item.id, item]));
    expect(reversedById).toEqual(byId);

    for (let index = 0; index < layout.length; index += 1) {
      const item = layout[index];
      expect(item.anchor.x).toBeCloseTo(polarPoint(item.trueAngle, 122).x, 9);
      expect(item.anchor.y).toBeCloseTo(polarPoint(item.trueAngle, 122).y, 9);
      expect(item.truePoint.x).toBeCloseTo(polarPoint(item.trueAngle, 100).x, 9);
      expect(item.truePoint.y).toBeCloseTo(polarPoint(item.trueAngle, 100).y, 9);
      expect(distance(item.leader.end, item.node)).toBeCloseTo(PLANET_NODE_RADIUS, 9);

      for (let otherIndex = index + 1; otherIndex < layout.length; otherIndex += 1) {
        expect(distance(item.node, layout[otherIndex].node)).toBeGreaterThanOrEqual(PLANET_NODE_MIN_DISTANCE - 1e-9);
      }
    }

    const trueOrder = [...layout].sort((a, b) => normalized(a.trueAngle) - normalized(b.trueAngle)).map(({ id }) => id);
    const labelOrder = [...layout].sort((a, b) => normalized(a.labelAngle) - normalized(b.labelAngle)).map(({ id }) => id);
    expect(isRotation(labelOrder, trueOrder)).toBe(true);

    const retrograde = layout.filter((item) => item.retrogradeMarker);
    for (const item of retrograde) {
      const marker = item.retrogradeMarker!;
      for (const other of layout) {
        expect(distance(marker, other.node)).toBeGreaterThanOrEqual(
          RETROGRADE_MARKER_RADIUS + PLANET_NODE_RADIUS + 2 - 1e-9,
        );
        expect(distance(marker, other.anchor)).toBeGreaterThanOrEqual(RETROGRADE_MARKER_RADIUS + 1.8 + 2 - 1e-9);
        expect(distanceToSegment(marker, other.leader.start, other.leader.end)).toBeGreaterThanOrEqual(
          RETROGRADE_MARKER_RADIUS + 2 - 1e-9,
        );
      }
      for (const other of retrograde.filter(({ id }) => id !== item.id)) {
        expect(distance(marker, other.retrogradeMarker!)).toBeGreaterThanOrEqual(RETROGRADE_MARKER_RADIUS * 2 + 2 - 1e-9);
      }
    }
  });

  it('resolves a three-node cluster across the 0/360 degree seam', () => {
    const layout = layoutPlanetNodes([
      { id: 'before', longitude: 359, retrograde: false },
      { id: 'after', longitude: 1, retrograde: true },
      { id: 'next', longitude: 3, retrograde: false },
    ], 270);

    for (let index = 0; index < layout.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < layout.length; otherIndex += 1) {
        expect(distance(layout[index].node, layout[otherIndex].node)).toBeGreaterThanOrEqual(
          PLANET_NODE_MIN_DISTANCE - 1e-9,
        );
      }
    }
  });

  it('separates planets that share the same longitude', () => {
    const layout = layoutPlanetNodes([
      { id: 'alpha', longitude: 42, retrograde: false },
      { id: 'beta', longitude: 42, retrograde: true },
      { id: 'gamma', longitude: 42, retrograde: false },
    ]);

    expect(layout).toHaveLength(3);
    expect(distance(layout[0].node, layout[1].node)).toBeGreaterThanOrEqual(PLANET_NODE_MIN_DISTANCE - 1e-9);
    expect(distance(layout[1].node, layout[2].node)).toBeGreaterThanOrEqual(PLANET_NODE_MIN_DISTANCE - 1e-9);
    expect(distance(layout[0].node, layout[2].node)).toBeGreaterThanOrEqual(PLANET_NODE_MIN_DISTANCE - 1e-9);
  });
});
