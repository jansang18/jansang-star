export type Point = { x: number; y: number };

export function polarPoint(angle: number, radius: number): Point {
  const radians = angle * Math.PI / 180;
  return { x: Math.sin(radians) * radius, y: -Math.cos(radians) * radius };
}

export function displayAngle(longitude: number, ascendant = 0): number {
  return longitude - ascendant + 270;
}
