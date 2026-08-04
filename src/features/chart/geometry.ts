export type Point = { x: number; y: number };

export const PLANET_NODE_ORBIT_RADIUS = 100;
export const PLANET_LONGITUDE_ANCHOR_RADIUS = 122;
export const PLANET_NODE_RADIUS = 16;
export const PLANET_NODE_MIN_DISTANCE = 42;
export const RETROGRADE_MARKER_ORBIT_RADIUS = 68;
export const RETROGRADE_BADGE_RADIUS = 10;
export const RETROGRADE_MARKER_RADIUS = 13;

export type PlanetNodeInput<Id extends string = string> = {
  id: Id;
  longitude: number;
  retrograde: boolean;
};

export type PlanetNodeLayout<Id extends string = string> = {
  id: Id;
  trueAngle: number;
  labelAngle: number;
  truePoint: Point;
  anchor: Point;
  node: Point;
  leader: { start: Point; end: Point };
  retrogradeMarker?: Point;
};

export function polarPoint(angle: number, radius: number): Point {
  const radians = angle * Math.PI / 180;
  return { x: Math.sin(radians) * radius, y: -Math.cos(radians) * radius };
}

export function displayAngle(longitude: number, ascendant = 0): number {
  return longitude - ascendant + 270;
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function compareIds(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function isotonicRegression(values: number[]) {
  const blocks: Array<{ start: number; end: number; count: number; sum: number }> = [];

  values.forEach((value, index) => {
    blocks.push({ start: index, end: index, count: 1, sum: value });
    while (blocks.length > 1) {
      const right = blocks[blocks.length - 1];
      const left = blocks[blocks.length - 2];
      if (left.sum / left.count <= right.sum / right.count) break;
      blocks.splice(blocks.length - 2, 2, {
        start: left.start,
        end: right.end,
        count: left.count + right.count,
        sum: left.sum + right.sum,
      });
    }
  });

  const fitted = Array<number>(values.length);
  blocks.forEach((block) => {
    const mean = block.sum / block.count;
    for (let index = block.start; index <= block.end; index += 1) fitted[index] = mean;
  });
  return fitted;
}

function pointOnCircleBoundary(center: Point, toward: Point, radius: number): Point {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const distance = Math.hypot(dx, dy);
  return {
    x: center.x + dx / distance * radius,
    y: center.y + dy / distance * radius,
  };
}

/**
 * Keeps every longitude exact for aspects and guide anchors while spreading only
 * the planet labels around a fixed orbit. The circular cut search makes dense
 * clusters at 0/360 degrees behave the same as clusters anywhere else.
 */
export function layoutPlanetNodes<const Id extends string>(
  inputs: readonly PlanetNodeInput<Id>[],
  ascendant = 0,
): PlanetNodeLayout<Id>[] {
  if (inputs.length === 0) return [];

  const minimumAngle = 2 * Math.asin(
    PLANET_NODE_MIN_DISTANCE / (2 * PLANET_NODE_ORBIT_RADIUS),
  ) * 180 / Math.PI;
  if (inputs.length * minimumAngle > 360 + 1e-9) {
    throw new Error('Too many planet nodes to place on the chart orbit without overlap');
  }

  const sorted = inputs.map((input) => ({
    ...input,
    trueAngle: normalizeAngle(displayAngle(input.longitude, ascendant)),
  })).sort((a, b) => a.trueAngle - b.trueAngle || compareIds(a.id, b.id));

  type Candidate = {
    angles: Map<Id, number>;
    score: number;
    maxDisplacement: number;
    cut: number;
  };
  let best: Candidate | undefined;

  for (let cut = 0; cut < sorted.length; cut += 1) {
    const sequence = Array.from({ length: sorted.length }, (_, offset) => sorted[(cut + offset) % sorted.length]);
    const unwrapped: number[] = [];
    sequence.forEach((item, index) => {
      let angle = item.trueAngle;
      if (index > 0) {
        while (angle < unwrapped[index - 1] - 1e-9) angle += 360;
      }
      unwrapped.push(angle);
    });
    const transformed = unwrapped.map((angle, index) => angle - index * minimumAngle);
    const fitted = isotonicRegression(transformed);
    const resolved = fitted.map((value, index) => value + index * minimumAngle);
    const closingGap = resolved[0] + 360 - resolved[resolved.length - 1];
    if (closingGap < minimumAngle - 1e-8) continue;

    const displacements = resolved.map((angle, index) => angle - unwrapped[index]);
    const candidate: Candidate = {
      angles: new Map(sequence.map((item, index) => [item.id, normalizeAngle(resolved[index])])),
      score: displacements.reduce((sum, displacement) => sum + displacement ** 2, 0),
      maxDisplacement: Math.max(...displacements.map(Math.abs)),
      cut,
    };
    if (!best
      || candidate.score < best.score - 1e-8
      || (Math.abs(candidate.score - best.score) <= 1e-8
        && (candidate.maxDisplacement < best.maxDisplacement - 1e-8
          || (Math.abs(candidate.maxDisplacement - best.maxDisplacement) <= 1e-8 && candidate.cut < best.cut)))) {
      best = candidate;
    }
  }

  if (!best) throw new Error('Could not resolve a collision-free circular planet layout');

  return [...sorted].sort((a, b) => compareIds(a.id, b.id)).map((item) => {
    const labelAngle = best!.angles.get(item.id)!;
    const truePoint = polarPoint(item.trueAngle, PLANET_NODE_ORBIT_RADIUS);
    const anchor = polarPoint(item.trueAngle, PLANET_LONGITUDE_ANCHOR_RADIUS);
    const node = polarPoint(labelAngle, PLANET_NODE_ORBIT_RADIUS);
    return {
      id: item.id,
      trueAngle: item.trueAngle,
      labelAngle,
      truePoint,
      anchor,
      node,
      leader: {
        start: anchor,
        end: pointOnCircleBoundary(node, anchor, PLANET_NODE_RADIUS),
      },
      retrogradeMarker: item.retrograde
        ? polarPoint(labelAngle, RETROGRADE_MARKER_ORBIT_RADIUS)
        : undefined,
    };
  });
}
