import { ZODIAC_SIGNS } from './constants';
import type { ZodiacPosition } from './types';

export function normalizeDegree(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function longitudeToZodiac(longitude: number): ZodiacPosition {
  const normalized = normalizeDegree(longitude);
  const signIndex = Math.floor(normalized / 30);
  const within = normalized - signIndex * 30;
  return { sign: ZODIAC_SIGNS[signIndex], signIndex, degree: Math.floor(within), minute: Math.floor((within % 1) * 60) };
}

export function degreeLabel(longitude: number): string {
  const position = longitudeToZodiac(longitude);
  return `${position.sign} ${position.degree}° ${position.minute}′`;
}
