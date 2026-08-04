import type { PlanetId } from '../astrology/types';
import type { AspectType } from './aspects';

export type FortuneCategory = 'overall' | 'love' | 'money' | 'career' | 'health';

export const ASPECT_TONE: Record<AspectType, number> = {
  conjunction: 0.45, sextile: 0.7, trine: 1, square: -0.72, opposition: -0.82,
};

export const PLANET_WEIGHT: Record<PlanetId, number> = {
  sun: 1.25, moon: 1.15, mercury: .85, venus: 1, mars: 1, jupiter: 1.15,
  saturn: 1.15, uranus: .8, neptune: .75, pluto: .9,
};

export const CATEGORY_PLANETS: Record<FortuneCategory, PlanetId[]> = {
  overall: ['sun', 'moon', 'jupiter', 'saturn'],
  love: ['venus', 'moon', 'mars'],
  money: ['venus', 'jupiter', 'saturn'],
  career: ['sun', 'mars', 'jupiter', 'saturn'],
  health: ['sun', 'moon', 'mars', 'saturn'],
};
