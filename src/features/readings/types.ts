import type { PlanetId } from '../astrology/types';
import type { AspectType } from '../fortune/aspects';

export const READING_COPY_KEYS = [
  'bigThree.role', 'bigThree.sign', 'bigThree.house', 'bigThree.houseUnknown', 'bigThree.pattern', 'bigThree.action',
  'planet.role', 'planet.sign', 'planet.house', 'planet.houseUnknown', 'planet.motion', 'planet.action',
  'house.domain', 'house.cusp', 'house.occupied', 'house.empty', 'house.action',
  'aspect.dynamic', 'aspect.experience', 'aspect.strength', 'aspect.caution', 'aspect.integration',
  'transit.dynamic', 'transit.experience', 'transit.opportunity', 'transit.caution', 'transit.action',
  'unavailable.ascendant', 'unavailable.houses',
] as const;

export type ReadingCopyKey = typeof READING_COPY_KEYS[number];
export type ReadingParams = Record<string, string | number | boolean>;
export type ReadingSentence = { key: ReadingCopyKey; params: ReadingParams };
export type ReadingEvidence =
  | { kind: 'placement'; point: PlanetId | 'ascendant'; signIndex: number; house?: number; retrograde: boolean }
  | { kind: 'house'; house: number; cuspSignIndex: number; occupants: PlanetId[] }
  | { kind: 'aspect'; scope: 'natal' | 'transit'; type: AspectType; from: PlanetId; to: PlanetId; orb: number; exactness: number };
export type ReadingBlock = {
  id: string;
  section: 'bigThree' | 'planets' | 'houses' | 'aspects' | 'transits';
  subject: string;
  evidence: ReadingEvidence[];
  sentences: ReadingSentence[];
};
export type DetailedReadingModel = {
  bigThree: ReadingBlock[];
  planets: ReadingBlock[];
  houses: ReadingBlock[];
  aspects: ReadingBlock[];
  transits: ReadingBlock[];
  unavailable: Array<'ascendant' | 'houses'>;
};
