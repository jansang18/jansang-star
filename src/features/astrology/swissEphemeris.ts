import SwissEph from 'swisseph-wasm';
import type { BirthProfile } from '../profile/types';
import { toUtcBirthInstant } from '../profile/time';
import { PLANETS } from './constants';
import type { NatalChartData, PlanetId, PlanetPosition } from './types';
import { longitudeToZodiac, normalizeDegree } from './zodiac';

let engine: SwissEph | null = null;
let initialization: Promise<SwissEph> | null = null;

export class EphemerisInitializationError extends Error {
  constructor(cause: unknown) {
    super('천체 계산 자료를 불러오지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.', { cause });
    this.name = 'EphemerisInitializationError';
  }
}

async function getEngine(): Promise<SwissEph> {
  if (engine) return engine;
  if (!initialization) {
    initialization = (async () => {
      try {
        const instance = new SwissEph();
        await instance.initSwissEph();
        engine = instance;
        return instance;
      } catch (error) {
        initialization = null;
        throw new EphemerisInitializationError(error);
      }
    })();
  }
  return initialization;
}

export async function initializeEphemeris(): Promise<void> { await getEngine(); }

function instantToJulianDay(swe: SwissEph, profile: BirthProfile): number {
  const date = new Date(toUtcBirthInstant(profile).epochMilliseconds);
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return swe.julday(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), hour);
}

export function houseForLongitude(longitude: number, cusps: number[]): number | undefined {
  if (cusps.length !== 12) return undefined;
  const value = normalizeDegree(longitude);
  for (let index = 0; index < 12; index += 1) {
    const start = normalizeDegree(cusps[index]);
    const end = normalizeDegree(cusps[(index + 1) % 12]);
    const span = normalizeDegree(end - start);
    const offset = normalizeDegree(value - start);
    if (offset < span || (index === 11 && offset === span)) return index + 1;
  }
  return undefined;
}

export async function calculateNatalChart(profile: BirthProfile): Promise<NatalChartData> {
  const swe = await getEngine();
  const julianDay = instantToJulianDay(swe, profile);
  let houses: number[] = [];
  let ascendant: number | undefined;
  let midheaven: number | undefined;
  if (profile.timeKnown) {
    const houseResult = swe.houses(julianDay, profile.latitude, profile.longitude, 'P');
    houses = Array.from(houseResult.cusps.slice(1, 13));
    ascendant = houseResult.ascmc[0];
    midheaven = houseResult.ascmc[1];
  }

  const positions = {} as Record<PlanetId, PlanetPosition>;
  for (const planet of PLANETS) {
    const result = swe.calc_ut(julianDay, planet.sweId, swe.SEFLG_SWIEPH | swe.SEFLG_SPEED);
    const zodiac = longitudeToZodiac(result[0]);
    positions[planet.id] = {
      id: planet.id, nameKo: planet.nameKo, glyph: planet.glyph,
      longitude: normalizeDegree(result[0]), latitude: result[1], speed: result[3], retrograde: result[3] < 0,
      sign: zodiac.sign, signDegree: zodiac.degree + zodiac.minute / 60,
      house: houseForLongitude(result[0], houses),
    };
  }
  return { julianDay, planets: positions, ascendant, midheaven, houses, houseSystem: 'P', timeKnown: profile.timeKnown };
}

export async function calculatePlanetPositionsAt(profile: BirthProfile): Promise<NatalChartData> {
  return calculateNatalChart(profile);
}
