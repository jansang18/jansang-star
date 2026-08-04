import type { NatalChartData, PlanetId } from '../astrology/types';

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type Aspect = {
  type: AspectType;
  from: PlanetId;
  to: PlanetId;
  angle: number;
  orb: number;
  maxOrb: number;
};

const DEFINITIONS: Array<{ type: AspectType; angle: number; orb: number }> = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'sextile', angle: 60, orb: 5 },
  { type: 'square', angle: 90, orb: 7 },
  { type: 'trine', angle: 120, orb: 7 },
  { type: 'opposition', angle: 180, orb: 8 },
];

export function angularDistance(a: number, b: number): number {
  const raw = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(raw, 360 - raw);
}

export function findAspect(a: number, b: number): Omit<Aspect, 'from' | 'to'> | undefined {
  const distance = angularDistance(a, b);
  return DEFINITIONS
    .map((definition) => ({ ...definition, difference: Math.abs(distance - definition.angle) }))
    .filter((candidate) => candidate.difference <= candidate.orb)
    .sort((left, right) => left.difference - right.difference)
    .map(({ type, angle, orb: maxOrb, difference: orb }) => ({ type, angle, maxOrb, orb }))[0];
}

export function natalAspects(chart: NatalChartData): Aspect[] {
  const planets = Object.values(chart.planets);
  const result: Aspect[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const match = findAspect(planets[i].longitude, planets[j].longitude);
      if (match) result.push({ ...match, from: planets[i].id, to: planets[j].id });
    }
  }
  return result.sort((a, b) => a.orb - b.orb);
}
